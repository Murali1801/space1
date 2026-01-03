"use client"

import { User, Mail, CreditCard, Shield, Clock, HardDrive, Settings, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { doc, getDoc, collection, query, where, onSnapshot, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { updateProfile } from "firebase/auth"

export default function ProfilePage() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalImage: 0,
        totalVideo: 0,
        storageUsed: "0 MB"
    })
    const [displayName, setDisplayName] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle')

    useEffect(() => {
        if (!user) return
        setDisplayName(user.displayName || "")

        const q = query(collection(db, "generations"), where("userId", "==", user.uid))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const images = snapshot.docs.filter(d => d.data().type === 'image').length
            const videos = snapshot.docs.filter(d => d.data().type === 'video').length
            setStats({
                totalImage: images,
                totalVideo: videos,
                storageUsed: `${((images * 0.5 + videos * 2.5)).toFixed(1)} MB` // Estimated
            })
        }, (e) => {
            console.error("Stats subscription error:", e)
        })

        return () => unsubscribe()
    }, [user])

    const handleUpdate = async () => {
        if (!user || isUpdating) return
        setIsUpdating(true)
        setUpdateStatus('idle')

        try {
            // Update Auth Profile
            await updateProfile(user, { displayName })

            // Sync with Firestore user doc
            await setDoc(doc(db, "users", user.uid), {
                displayName: displayName,
                lastUpdated: new Date()
            }, { merge: true })

            setUpdateStatus('success')
            setTimeout(() => setUpdateStatus('idle'), 3000)
        } catch (error) {
            console.error("Update error:", error)
            setUpdateStatus('error')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="w-full space-y-10 pb-20 px-4 md:px-8">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-display font-medium text-white tracking-tight">Account Profile</h2>
                <p className="text-zinc-500 mt-1">Manage your identity and subscription details.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="p-8 rounded-[32px] bg-zinc-900/40 border border-zinc-800 flex flex-col items-center text-center space-y-6">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center text-zinc-600 text-4xl font-bold overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || <User size={40} />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2.5 rounded-full bg-white text-zinc-950 shadow-xl hover:scale-110 transition-transform border-4 border-zinc-900">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white">{user?.displayName || 'Creative User'}</h3>
                            <p className="text-zinc-500 text-sm">{user?.email}</p>
                        </div>

                        <div className="pt-4 w-full flex gap-2">
                            <span className="flex-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider border border-zinc-700/50">
                                {user ? 'Verified' : 'Guest'}
                            </span>
                            <span className="flex-1 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">
                                Pro Member
                            </span>
                        </div>
                    </div>

                    <div className="p-6 rounded-[32px] bg-zinc-900/40 border border-zinc-800 space-y-6">
                        <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-widest pl-1">Resources</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/50">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-zinc-500" />
                                    <span className="text-sm text-zinc-400">Time Saved</span>
                                </div>
                                <span className="text-sm font-bold text-white">~12.4h</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/50">
                                <div className="flex items-center gap-3">
                                    <HardDrive className="w-4 h-4 text-zinc-500" />
                                    <span className="text-sm text-zinc-400">Cloud Storage</span>
                                </div>
                                <span className="text-sm font-bold text-white">{stats.storageUsed}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form & Detailed Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Details Form */}
                    <div className="p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800 space-y-10">
                        <h3 className="text-xl font-medium text-white">Personal Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Display Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full h-14 px-6 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        readOnly
                                        defaultValue={user?.email || ""}
                                        className="w-full h-14 px-6 rounded-2xl bg-zinc-800/20 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Shield className="w-4 h-4 text-zinc-700" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-zinc-800 flex justify-end items-center gap-4">
                            {updateStatus === 'success' && (
                                <span className="text-emerald-500 text-sm font-medium flex items-center gap-1.5">
                                    <CheckCircle2 size={16} />
                                    Profile updated successfully
                                </span>
                            )}
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="h-12 px-10 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdating && <Loader2 size={18} className="animate-spin" />}
                                {isUpdating ? 'Updating...' : 'Update Account'}
                            </button>
                        </div>
                    </div>

                    {/* Quick Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[32px] bg-zinc-900/40 border border-zinc-800 space-y-4">
                            <div className="p-3 w-fit rounded-2xl bg-indigo-500/10 text-indigo-400">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h4 className="text-zinc-100 font-bold text-lg">Billing Cycle</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">Your next billing date is Nov 24, 2026. You are on the Pro Monthly plan.</p>
                            <button className="text-indigo-400 text-sm font-bold hover:underline">Manage methods →</button>
                        </div>

                        <div className="p-8 rounded-[32px] bg-zinc-900/40 border border-zinc-800 space-y-4">
                            <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 text-emerald-400">
                                <HardDrive className="w-6 h-6" />
                            </div>
                            <h4 className="text-zinc-100 font-bold text-lg">Work Analysis</h4>
                            <div className="flex gap-4">
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold text-white">{stats.totalImage}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Images</p>
                                </div>
                                <div className="w-px h-10 bg-zinc-800" />
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold text-white">{stats.totalVideo}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Videos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
