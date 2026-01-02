"use client"

import { useState } from "react"
import { GenerationForm } from "@/components/dashboard/generation-form"
import { Download } from "lucide-react"
import { downloadMedia } from "@/lib/utils"

export default function ImageGenerationPage() {
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    const handleGenerate = (prompt: string, model: string, resultUrl: string) => {
        setGeneratedImage(resultUrl)
    }

    const handleDownload = async () => {
        if (!generatedImage) return
        setIsDownloading(true)
        await downloadMedia(generatedImage, `generated-image-${Date.now()}.png`)
        setIsDownloading(false)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-display font-bold text-zinc-100">Image Generation</h2>
            </div>

            <GenerationForm type="image" defaultModel="Nano Banana" onSubmit={handleGenerate} />

            {generatedImage && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-semibold text-zinc-100">Result</h3>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2">
                        <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 relative">
                            <img
                                src={generatedImage}
                                alt="Generated content"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-4 flex justify-end gap-2">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                {isDownloading ? "Downloading..." : "Download"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
