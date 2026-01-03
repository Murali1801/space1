"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { validateActivationCode } from "@/app/actions/activate-user"

interface ActivationContextType {
    isActivated: boolean
    isLoading: boolean
    activate: (code: string) => Promise<boolean>
    activationError: string | null
}

const ActivationContext = createContext<ActivationContextType | undefined>(undefined)

export function ActivationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [isActivated, setIsActivated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [activationError, setActivationError] = useState<string | null>(null)

    useEffect(() => {
        const checkActivation = async () => {
            if (!user) {
                setIsActivated(false)
                setIsLoading(false)
                return
            }

            try {
                const locallyActivated = localStorage.getItem(`activated_${user.uid}`) === "true"
                if (locallyActivated) {
                    setIsActivated(true)
                }

                const userDoc = await getDoc(doc(db, "users", user.uid))
                const userData = userDoc.data()

                if (userData?.isActivated) {
                    setIsActivated(true)
                    localStorage.setItem(`activated_${user.uid}`, "true")
                } else {
                    setIsActivated(false)
                    localStorage.removeItem(`activated_${user.uid}`)
                }
            } catch (error) {
                console.error("Error checking activation:", error)
            } finally {
                setIsLoading(false)
            }
        }

        checkActivation()
    }, [user])

    const activate = async (code: string) => {
        if (!user) return false
        setActivationError(null)

        try {
            // 1. Validate on server (checks .env list)
            const result = await validateActivationCode(code, user.uid)

            if (result.success) {
                // 2. Save on client (authenticated write)
                await setDoc(doc(db, "users", user.uid), {
                    isActivated: true,
                    activatedAt: serverTimestamp(),
                    activationCode: code.trim().toUpperCase()
                }, { merge: true })

                setIsActivated(true)
                localStorage.setItem(`activated_${user.uid}`, "true")
                return true
            } else {
                setActivationError(result.error || "Activation failed")
                return false
            }
        } catch (error: any) {
            console.error("Client Activation error:", error)
            setActivationError("Connection error. Please try again.")
            return false
        }
    }

    return (
        <ActivationContext.Provider value={{ isActivated, isLoading, activate, activationError }}>
            {children}
        </ActivationContext.Provider>
    )
}

export function useActivation() {
    const context = useContext(ActivationContext)
    if (context === undefined) {
        throw new Error("useActivation must be used within an ActivationProvider")
    }
    return context
}
