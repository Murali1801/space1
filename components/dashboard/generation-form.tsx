"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Sparkles, Loader2, ChevronDown, Paperclip, Mic, MicOff, Shield } from "lucide-react"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"
import * as Select from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
// Firebase & Firestore Imports
import { auth, db } from "@/lib/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { useActivation } from "@/components/activation-provider"
import { useAuth } from "@/components/auth-provider"

interface GenerationFormProps {
    type: "image" | "video"
    defaultModel: string
    initialPrompt?: string
    onSubmit: (prompt: string, model: string, resultUrl: string) => void
}

// Image Models from Vertex AI Docs
const imageModels = [
    "imagen-3.0-generate-001",
    "imagen-3.0-fast-generate-001",
    "imagen-3.0-generate-002",
    "imagen-4.0-generate-001",
    "imagen-4.0-fast-generate-001",
    "imagen-4.0-ultra-generate-001"
]

// Video Models from Vertex AI Docs
const videoModels = [
    "veo-3.0-generate-001",
    "veo-3.0-fast-generate-001",
    "veo-3.1-generate-001",
    "veo-3.1-fast-generate-001",
    "veo-2.0-generate-001"
]

const resolutions = ["Standard (1K)", "2k", "4k"]
const durations = ["4 seconds", "6 seconds", "8 seconds"]

export function GenerationForm({ type, defaultModel, initialPrompt = "", onSubmit }: GenerationFormProps) {
    const { user } = useAuth()
    const { isActivated, activate, activationError, isLoading: isActivationLoading } = useActivation()
    const [activationCode, setActivationCode] = useState("")
    const [isActivating, setIsActivating] = useState(false)

    const [prompt, setPrompt] = useState(initialPrompt)
    const [isGenerating, setIsGenerating] = useState(false)
    const [selectedModel, setSelectedModel] = useState(type === 'image' ? imageModels[0] : videoModels[0])

    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // New State for Options
    const [resolution, setResolution] = useState(resolutions[0])
    const [duration, setDuration] = useState(durations[2]) // Default 8s
    const [withAudio, setWithAudio] = useState(true)
    const [aspectRatio, setAspectRatio] = useState("16:9")
    const [imageAspectRatio, setImageAspectRatio] = useState("1:1")

    const models = type === "image" ? imageModels : videoModels

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles])

            // Create previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => {
            // Revoke the old URL to avoid memory leaks
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isActivated) {
            alert("Activation required to use this feature.")
            return
        }

        setIsGenerating(true)

        try {
            // Convert images to base64 if needed for the server action
            const base64Images = await Promise.all(files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(file)
                })
            }))

            let result;
            if (type === "image") {
                const { generateImage } = await import("@/app/actions/generate-image")
                // Pass new options
                result = await generateImage(prompt, selectedModel, {
                    sampleImageSize: resolution.includes("2k") ? "2K" : "1K",
                    aspectRatio: imageAspectRatio,
                    userId: user?.uid
                })
            } else {
                const { generateVideo } = await import("@/app/actions/generate-video")
                // Parse duration string to number
                const durationSeconds = parseInt(duration.split(" ")[0]) || 8
                // Pass new advanced options
                result = await generateVideo(prompt, durationSeconds, withAudio, selectedModel, {
                    aspectRatio,
                    userId: user?.uid
                })
            }

            if (result && result.success) {
                // Determine the URL based on type
                const url = type === 'image' ? (result as any).imageUrl : (result as any).videoUrl
                const isCloudinary = (result as any).isCloudinary
                const storeInHistory = (result as any).storeInHistory !== false // Default true for images unless specified

                // 1. Show Result Immediately
                onSubmit(prompt, selectedModel, url)
                setIsGenerating(false)

                // 2. Save to History (if allowed and safe)
                if (storeInHistory && url.length < 2000) {
                    const user = auth.currentUser
                    if (user) {
                        try {
                            await addDoc(collection(db, "generations"), {
                                userId: user.uid,
                                prompt,
                                type,
                                modelId: selectedModel,
                                url,
                                isCloudinary: !!isCloudinary,
                                createdAt: serverTimestamp(),
                                settings: type === 'image' ? { resolution } : { duration, withAudio },
                                referenceImageCount: files.length
                            })
                        } catch (saveError) {
                            console.error("Failed to save history:", saveError)
                        }
                    }
                } else if (!storeInHistory) {
                    console.warn("Result marked as transient (not saved to history). Likely due to missing Cloudinary storage.")
                    alert("Note: Video generated in Preview Mode. It will NOT be saved to history because Cloudinary storage is not configured/failed. To enable history, check your Cloudinary API keys.")
                }
            } else {
                // Handle success=false
                console.error("Generation returned unsuccessful:", result)
                alert("Generation failed. Please try again.") // Simple alert for now
            }
        } catch (error) {
            console.error("Generation failed:", error)
            alert("An error occurred during generation.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="h-full relative overflow-hidden group/form">
            {!isActivated && !isActivationLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
                    {/* Dark Solid Overlay */}
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-0" />

                    {/* Modern Activation Card */}
                    <div className="relative z-10 w-full max-w-md p-10 rounded-[40px] border border-zinc-800 bg-zinc-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] space-y-10 text-center animate-in zoom-in-95 fade-in duration-500">
                        <div className="mx-auto w-16 h-16 rounded-[20px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-white tracking-tight">Enterprise Activation</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                                Enter your unique license key to unlock the full potential of {type === 'image' ? 'Neural Imagery' : 'Cinematic Video'} generation.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">License Key</label>
                                <input
                                    type="text"
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    value={activationCode}
                                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                                    className="w-full h-14 px-6 rounded-2xl bg-black border border-zinc-800 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-center font-mono text-lg tracking-wider"
                                />
                            </div>

                            {activationError && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 text-xs font-medium">{activationError}</p>
                                </div>
                            )}

                            <button
                                onClick={async () => {
                                    setIsActivating(true)
                                    await activate(activationCode)
                                    setIsActivating(false)
                                }}
                                disabled={isActivating || !activationCode}
                                className="w-full h-14 flex items-center justify-center rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white text-zinc-950 font-bold transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
                            >
                                {isActivating ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    "Initialize Access"
                                )}
                            </button>
                        </div>

                        <div className="pt-4 border-t border-zinc-800/50">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                                <Shield className="w-3 h-3" />
                                Secured by Space Cloud
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className={cn(
                "h-full rounded-3xl border border-zinc-800/50 bg-zinc-900/20 p-6 flex flex-col gap-6 transition-all duration-500",
                !isActivated && "blur-[2px] pointer-events-none opacity-50 grayscale-[0.5]"
            )}>

                {/* Options Row */}
                <div className="flex flex-wrap items-center gap-4 flex-none">

                    {/* Model Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Model:</span>
                        <Select.Root value={selectedModel} onValueChange={setSelectedModel}>
                            <Select.Trigger className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                <Select.Value />
                                <Select.Icon>
                                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                                </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Content className="overflow-hidden bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
                                    <Select.Viewport className="p-1">
                                        {models.map((model) => (
                                            <Select.Item key={model} value={model} className={cn("relative flex items-center px-6 py-2 text-sm text-zinc-200 rounded-md select-none outline-none cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800", model === selectedModel && "text-indigo-400")}>
                                                <Select.ItemText>{model}</Select.ItemText>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    </div>

                    {/* Image Options: Resolution */}
                    {type === "image" && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-400">Resolution:</span>
                                <Select.Root value={resolution} onValueChange={setResolution}>
                                    <Select.Trigger className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        <Select.Value />
                                        <Select.Icon>
                                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                                        </Select.Icon>
                                    </Select.Trigger>
                                    <Select.Portal>
                                        <Select.Content className="overflow-hidden bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
                                            <Select.Viewport className="p-1">
                                                {resolutions.map((res) => (
                                                    <Select.Item key={res} value={res} className={cn("relative flex items-center px-6 py-2 text-sm text-zinc-200 rounded-md select-none outline-none cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800", res === resolution && "text-indigo-400")}>
                                                        <Select.ItemText>{res}</Select.ItemText>
                                                    </Select.Item>
                                                ))}
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-400">Ratio:</span>
                                <Select.Root value={imageAspectRatio} onValueChange={setImageAspectRatio}>
                                    <Select.Trigger className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        <Select.Value />
                                        <Select.Icon>
                                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                                        </Select.Icon>
                                    </Select.Trigger>
                                    <Select.Portal>
                                        <Select.Content className="overflow-hidden bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
                                            <Select.Viewport className="p-1">
                                                {["1:1", "4:3", "3:4", "16:9", "9:16"].map((r) => (
                                                    <Select.Item key={r} value={r} className={cn("relative flex items-center px-6 py-2 text-sm text-zinc-200 rounded-md select-none outline-none cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800", r === imageAspectRatio && "text-indigo-400")}>
                                                        <Select.ItemText>{r}</Select.ItemText>
                                                    </Select.Item>
                                                ))}
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            </div>
                        </>
                    )}

                    {/* Video Options: Duration & Audio & Aspect Ratio */}
                    {type === "video" && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-400">Duration:</span>
                                <Select.Root value={duration} onValueChange={setDuration}>
                                    <Select.Trigger className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        <Select.Value />
                                        <Select.Icon>
                                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                                        </Select.Icon>
                                    </Select.Trigger>
                                    <Select.Portal>
                                        <Select.Content className="overflow-hidden bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
                                            <Select.Viewport className="p-1">
                                                {durations.map((dur) => (
                                                    <Select.Item key={dur} value={dur} className={cn("relative flex items-center px-6 py-2 text-sm text-zinc-200 rounded-md select-none outline-none cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800", dur === duration && "text-indigo-400")}>
                                                        <Select.ItemText>{dur}</Select.ItemText>
                                                    </Select.Item>
                                                ))}
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            </div>

                            <div className="flex items-center gap-2 ml-2">
                                <button
                                    type="button"
                                    onClick={() => setWithAudio(!withAudio)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                                        withAudio
                                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                            : "bg-zinc-800 border-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    )}
                                >
                                    {withAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                    <span>Audio {withAudio ? 'On' : 'Off'}</span>
                                </button>
                            </div>

                            {/* Aspect Ratio */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-400">Ratio:</span>
                                <Select.Root value={aspectRatio} onValueChange={setAspectRatio}>
                                    <Select.Trigger className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        <Select.Value />
                                        <Select.Icon>
                                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                                        </Select.Icon>
                                    </Select.Trigger>
                                    <Select.Portal>
                                        <Select.Content className="overflow-hidden bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
                                            <Select.Viewport className="p-1">
                                                {["16:9", "9:16"].map((r) => (
                                                    <Select.Item key={r} value={r} className={cn("relative flex items-center px-6 py-2 text-sm text-zinc-200 rounded-md select-none outline-none cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800", r === aspectRatio && "text-indigo-400")}>
                                                        <Select.ItemText>{r}</Select.ItemText>
                                                    </Select.Item>
                                                ))}
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            </div>
                        </>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 min-h-0">
                    <div className="relative group flex-1 flex flex-col min-h-0">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-50 transition duration-500 blur-sm pointer-events-none" />
                        <label htmlFor="prompt" className="sr-only">Prompt</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={`Describe the ${type} you want to generate...`}
                            className="w-full flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 pr-12 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 relative z-10 resize-none transition-all duration-300"
                        />
                        {/* File Input */}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <div className="absolute bottom-3 right-3 z-20">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                                title="Add Reference Image"
                            >
                                <Paperclip className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Image Previews */}
                    {previews.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide flex-none">
                            {previews.map((src, index) => (
                                <div key={index} className="relative flex-shrink-0 group">
                                    <img
                                        src={src}
                                        alt={`Reference ${index + 1}`}
                                        className="h-20 w-20 rounded-lg object-cover border border-zinc-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-end flex-none">
                        <div className="flex items-center gap-4">
                            <div onClick={handleSubmit}>
                                <LiquidCtaButton className="!py-2 !px-4">
                                    {isGenerating ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Generate
                                        </span>
                                    )}
                                </LiquidCtaButton>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div >
    )
}
