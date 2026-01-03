"use server"

import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function validateActivationCode(code: string, userId: string) {
    try {
        // 1. Get valid codes from .env
        const validCodesStr = process.env.VALID_ACTIVATION_CODES || ""
        const validCodes = validCodesStr.split(",").map(c => c.trim().toUpperCase()).filter(Boolean)

        const normalizedInput = code.trim().toUpperCase()

        // Debug info (Server side only)
        console.log("Validation Request:", {
            userId,
            codeSnippet: normalizedInput.substring(0, 8),
            envCount: validCodes.length
        })

        if (validCodes.length === 0) {
            return { success: false, error: "System configuration error (No codes found in server environment)." }
        }

        if (!validCodes.includes(normalizedInput)) {
            return { success: false, error: "Invalid activation code." }
        }

        // 2. Best-effort check for code usage in Firestore
        // Note: This might fail on server due to unauthenticated Firestore Read if rules are strict.
        try {
            const usersRef = collection(db, "users")
            const q = query(usersRef, where("activationCode", "==", normalizedInput))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const alreadyAssigned = querySnapshot.docs.find(doc => doc.id === userId)
                // If the code is already assigned to THIS user, it's fine
                if (alreadyAssigned) return { success: true }
                // Otherwise it's used by someone else
                return { success: false, error: "This code has already been used." }
            }
        } catch (e) {
            // If firestore read fails on server, we continue to allow client-side write attempt
            console.warn("Firestore check skipped on server (likely unauth):", e)
        }

        return { success: true }
    } catch (error: any) {
        console.error("Critical activation error:", error)
        return { success: false, error: "Activation failed. Please try again." }
    }
}
