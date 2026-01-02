"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Sparkles, Loader2, ChevronDown, Paperclip, Mic, MicOff } from "lucide-react"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"
import * as Select from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
// Firebase & Firestore Imports
import { auth, db } from "@/lib/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

interface GenerationFormProps {
    type: "image" | "video"
    defaultModel: string
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

export function GenerationForm({ type, defaultModel, onSubmit }: GenerationFormProps) {
    const [prompt, setPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [selectedModel, setSelectedModel] = useState(type === 'image' ? imageModels[0] : videoModels[0])

    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // New State for Options
    const [resolution, setResolution] = useState(resolutions[0])
    const [duration, setDuration] = useState(durations[2]) // Default 8s
    const [withAudio, setWithAudio] = useState(true)

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
                // Pass resolution (quality) and images (if strict logic allows)
                // Note: Updating generateImage signature might be needed to accept images
                result = await generateImage(prompt, selectedModel, resolution)
            } else {
                const { generateVideo } = await import("@/app/actions/generate-video")
                // Parse duration string to number
                const durationSeconds = parseInt(duration.split(" ")[0]) || 8
                // Pass selectedModel as the 4th argument
                result = await generateVideo(prompt, durationSeconds, withAudio, selectedModel)
            }

            if (result && result.success) {
                // Determine the URL based on type
                const url = type === 'image' ? (result as any).imageUrl : (result as any).videoUrl
                const isCloudinary = (result as any).isCloudinary

                onSubmit(prompt, selectedModel, url)

                // Save to History (Firestore)
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
                            referenceImageCount: files.length // Track usage
                        })
                    } catch (saveError) {
                        console.error("Failed to save history:", saveError)
                    }
                }
            }
        } catch (error) {
            console.error("Generation failed:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-black p-6">

                {/* Options Row */}
                <div className="flex flex-wrap items-center gap-4 mb-4">

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
                    )}

                    {/* Video Options: Duration */}
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
                        </>
                    )}

                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-50 transition duration-500 blur-sm pointer-events-none" />
                        <label htmlFor="prompt" className="sr-only">Prompt</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={`Describe the ${type} you want to generate...`}
                            className="w-full h-32 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 pr-12 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 relative z-10 resize-none transition-all duration-300"
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
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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

                    <div className="flex items-center justify-end">
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
        </div>
    )
}
