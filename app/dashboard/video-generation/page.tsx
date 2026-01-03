"use client"

import { useState, useEffect } from "react"
import { GenerationForm } from "@/components/dashboard/generation-form"
import { Download } from "lucide-react"
import { downloadMedia } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

export default function VideoGenerationPage() {
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const searchParams = useSearchParams()

    // Check for pre-filled data (from History)
    const initialPrompt = searchParams.get("prompt") || ""
    const initialResult = searchParams.get("result")

    useEffect(() => {
        if (initialResult) {
            setGeneratedVideo(initialResult)
        }
    }, [initialResult])

    const handleGenerate = (prompt: string, model: string, resultUrl: string) => {
        setGeneratedVideo(resultUrl)
    }

    const handleDownload = async () => {
        if (!generatedVideo) return
        setIsDownloading(true)
        await downloadMedia(generatedVideo, `generated-video-${Date.now()}.mp4`)
        setIsDownloading(false)
    }

    return (
        <div className="w-full min-h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] flex flex-col gap-8">
            <div className="flex-none">
                <h2 className="text-3xl font-display font-bold text-zinc-100">Video Generation</h2>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-y-auto lg:overflow-hidden">
                {/* Left Side: Form (25%) */}
                <div className="lg:h-full lg:overflow-y-auto pr-2 scrollbar-hide lg:col-span-1">
                    <GenerationForm
                        type="video"
                        defaultModel="Veo 3"
                        initialPrompt={initialPrompt}
                        onSubmit={handleGenerate}
                    />
                </div>

                {/* Right Side: Result (75%) */}
                <div className="min-h-[400px] lg:h-full bg-zinc-900/20 rounded-3xl border border-zinc-800/50 p-6 flex flex-col items-center justify-center relative overflow-hidden lg:col-span-3">
                    {generatedVideo ? (
                        <div className="w-full h-full flex flex-col justify-center gap-4 animate-in fade-in zoom-in duration-500">
                            <div className="relative aspect-video max-h-full max-w-full mx-auto rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex-shrink-1 flex items-center justify-center">
                                <video
                                    src={generatedVideo || ""}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex justify-center flex-none">
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" />
                                    {isDownloading ? "Downloading..." : "Download Video"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-zinc-500 space-y-4">
                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
                                <Download className="w-8 h-8 opacity-40" />
                            </div>
                            <p>Your creation will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
