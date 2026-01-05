"use client"

import React, { useState, useRef, useEffect } from 'react';
import {
    Menu,
    Plus,
    MessageSquare,
    MoreVertical,
    Settings,
    HelpCircle,
    Image as ImageIcon,
    Mic,
    Send,
    Sparkles,
    SquarePen,
    X,
    Bot,
    ChevronDown,
    History,
    MapPin,
    Globe,
    Video,
    Search,
    GraduationCap,
    Hammer,
    Wrench,
    Camera,
    LogOut,
    Clapperboard,
    StickyNote,
    BookOpen,
    LayoutDashboard,
    Check,
    Cloud,
    Undo,
    Redo,
    Share2,
    Code2,
    Eye,
    RotateCcw,
    Keyboard,
    Terminal,
    SlidersHorizontal,
    Download,
    Trash2,
    Copy,
} from 'lucide-react';
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/components/auth-provider"
import { generateImage } from "@/app/actions/generate-image";
import { generateVideo } from "@/app/actions/generate-video";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    getDoc,
    Timestamp,
    deleteDoc
} from "firebase/firestore";


// --- Styles for Custom Animations ---
const CustomStyles = () => (
    <style>{`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #444746;
        border-radius: 20px;
    }
    .typing-cursor::after {
        content: '|';
        animation: blink 1s step-start infinite;
    }
    @keyframes blink {
        50% { opacity: 0; }
    }
    .hide-media img, .hide-media video {
        display: none !important;
    }
  `}</style>
);

const highlightSyntax = (code: string) => {
    if (!code) return null;
    return code.split(/(\b(?:import|from|const|return|export|default|function|var|let|if|else|React)\b|'.*?'|".*?"|\/\/.*$|[{}()[\],])/gm).map((token, i) => {
        if (/^(import|from|return|export|default|if|else)$/.test(token)) return <span key={i} className="text-[#ff7b72]">{token}</span>; // Pink
        if (/^(const|var|let|function)$/.test(token)) return <span key={i} className="text-[#79c0ff]">{token}</span>; // Blue
        if (/^(React)$/.test(token)) return <span key={i} className="text-[#d2a8ff]">{token}</span>; // Purple
        if (/^(['"]).*\1$/.test(token)) return <span key={i} className="text-[#a5d6ff]">{token}</span>; // String
        if (/^\/\/.*$/.test(token)) return <span key={i} className="text-[#8b949e]">{token}</span>; // Comment
        return <span key={i} className="text-[#e6edf3]">{token}</span>;
    });
};

const handleDownload = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Download failed:", error);
    }
};

const renderMixedContent = (text: string, isCanvas: boolean = false, onUseData?: (url: string) => void) => {
    // Regex for Image Markdown
    const imageRegex = /!\[Generated Image\]\((.*?)\)/;
    // Regex for Video HTML
    const videoRegex = /<video src="(.*?)" controls class="max-w-full rounded-xl" \/>/;

    const imageMatch = text.match(imageRegex);
    const videoMatch = text.match(videoRegex);

    if (imageMatch) {
        const [fullMatch, imageUrl] = imageMatch;
        const parts = text.split(fullMatch);
        return (
            <div className="flex flex-col gap-4">
                {parts[0] && <div className={isCanvas ? "whitespace-pre-wrap" : "whitespace-pre-wrap mb-1"}>{isCanvas && parts[0].trim() ? highlightSyntax(parts[0]) : parts[0]}</div>}
                <div className="relative group self-start">
                    <img
                        src={imageUrl}
                        alt="Generated"
                        draggable={true} // Allow dragging
                        className={`rounded-xl shadow-lg border border-[#303134] ${isCanvas ? 'max-h-full object-contain' : 'max-w-full'}`}
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onUseData && !isCanvas && (
                            <button
                                onClick={() => onUseData(imageUrl)}
                                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                                title="Add to Prompt"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                        <button
                            onClick={() => handleDownload(imageUrl, `generated-${isCanvas ? 'canvas-' : ''}image-${Date.now()}.png`)}
                            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                            title="Download Image"
                        >
                            <Download size={isCanvas ? 20 : 16} />
                        </button>
                    </div>
                </div>
                {parts[1] && <div className={isCanvas ? "whitespace-pre-wrap" : "whitespace-pre-wrap mt-1"}>{isCanvas && parts[1].trim() ? highlightSyntax(parts[1]) : parts[1]}</div>}
            </div>
        );
    }

    if (videoMatch) {
        const [fullMatch, videoUrl] = videoMatch;
        const parts = text.split(fullMatch);
        return (
            <div className="flex flex-col gap-4">
                {parts[0] && <div className="whitespace-pre-wrap mb-1">{isCanvas && parts[0].trim() ? highlightSyntax(parts[0]) : parts[0]}</div>}
                <div className="relative group self-start">
                    <video src={videoUrl} controls className={`max-w-full rounded-xl shadow-lg border border-[#303134] ${isCanvas ? 'max-h-full' : ''}`} />
                    <button
                        onClick={() => handleDownload(videoUrl, `generated-${isCanvas ? 'canvas-' : ''}video-${Date.now()}.mp4`)}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
                        title="Download Video"
                    >
                        <Download size={isCanvas ? 20 : 16} />
                    </button>
                </div>
                {parts[1] && <div className={isCanvas ? "whitespace-pre-wrap" : "whitespace-pre-wrap mt-1"}>{isCanvas && parts[1].trim() ? highlightSyntax(parts[1]) : parts[1]}</div>}
            </div>
        );
    }

    // Default Text
    return isCanvas ? (
        <div className="whitespace-pre-wrap">{highlightSyntax(text)}</div>
    ) : (
        <div className="whitespace-pre-wrap">{text}</div>
    );
};

// --- Constants ---
const GEMINI_GRADIENT_TEXT = "bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] text-transparent bg-clip-text";

const ACTION_PILLS = [
    { label: "Create Image", icon: <Sparkles size={16} className="text-[#ffa726]" /> },
    { label: "Write", icon: null },
    { label: "Build", icon: null },
    { label: "Deep Research", icon: null },
    { label: "Create Video", icon: null },
    { label: "Learn", icon: null },
];



// Placeholder removed in favor of real data
const TOOLS_ITEMS = [
    { label: 'Create videos (Veo 3.1)', shortLabel: 'Video', icon: <Clapperboard size={20} className="text-[#e3e3e3]" /> },
    { label: 'Create images', shortLabel: 'Image', icon: <ImageIcon size={20} className="text-[#e3e3e3]" /> },
];



// --- Sub-Components ---

const Sidebar = ({ isOpen, setIsOpen, startNewChat, chatHistory, loadChat, currentChatId, deleteChat }: {
    isOpen: boolean,
    setIsOpen: (v: boolean) => void,
    startNewChat: () => void,
    chatHistory: any[],
    loadChat: (id: string) => void,
    currentChatId: string | null,
    deleteChat: (id: string) => void
}) => {
    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0b0b0b] transition-all duration-300 ease-in-out lg:translate-x-0 overflow-hidden ${isOpen ? 'w-[280px] translate-x-0' : 'hidden lg:flex lg:w-[72px] -translate-x-full lg:translate-x-0'
                }`}
        >
            <div className="flex flex-col h-full">
                <div className="flex flex-col gap-4 p-3 pt-4">
                    <div className="flex items-center pl-1">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-3 rounded-full hover:bg-[#1f1f1f] text-[#e3e3e3] transition-colors">
                            <Menu size={20} />
                        </button>
                    </div>

                    <button
                        onClick={startNewChat}
                        className={`flex items-center gap-3 rounded-full hover:bg-[#1f1f1f] text-[#e3e3e3] transition-all duration-200 group ${isOpen ? 'px-4 py-3 mx-0 w-[140px]' : 'p-3 justify-center'
                            }`}
                        title="New chat"
                    >
                        <SquarePen size={20} className="text-[#8e918f] group-hover:text-[#e3e3e3] transition-colors" />
                        {isOpen && <span className={`text-sm font-medium text-[#8e918f] group-hover:text-[#e3e3e3] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>New chat</span>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 scrollbar-hide mt-4">
                    {isOpen ? (
                        <div className="flex flex-col animate-fade-in">
                            <h3 className="text-xs font-medium text-[#e3e3e3] mb-3 px-4 mt-2">Recent</h3>
                            {chatHistory.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => loadChat(item.id)}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-full hover:bg-[#161616] group text-left text-sm truncate w-full transition-colors relative h-[40px] cursor-pointer ${currentChatId === item.id ? 'bg-[#161616] text-[#e3e3e3]' : 'text-[#e3e3e3]'}`}
                                >
                                    <MessageSquare size={16} className="text-[#e3e3e3] min-w-[16px]" />
                                    <span className="truncate flex-1 font-normal">{item.title}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChat(item.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#303134] rounded-md transition-all text-[#8e918f] hover:text-[#ff9898]"
                                        title="Delete chat"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 mt-2">
                            {chatHistory.slice(0, 4).map(i => (
                                <button key={i.id} onClick={() => loadChat(i.id)} className={`p-2 rounded-full hover:bg-[#161616] text-[#e3e3e3] ${currentChatId === i.id ? 'bg-[#161616]' : ''}`} title={i.title}>
                                    <MessageSquare size={18} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-1 p-2 pb-4">

                    <NavButton icon={<Settings size={18} />} label="Settings" isOpen={isOpen} />

                </div>
            </div>
        </div>
    );
};

const NavButton = ({ icon, label, isOpen }: { icon: React.ReactNode, label: string, isOpen: boolean }) => (
    <button className={`flex items-center gap-3 p-3 rounded-full hover:bg-[#161616] text-[#e3e3e3] transition-colors ${!isOpen ? 'justify-center' : 'px-4'}`}>
        <span className="text-[#e3e3e3]">{icon}</span>
        {isOpen && <span className="text-sm font-medium">{label}</span>}
    </button>
);

const CustomDropdown = ({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 bg-[#1e1f20] hover:bg-[#303134] text-[#e3e3e3] text-xs rounded-lg px-3 py-2 transition-colors border border-transparent focus:border-[#444746]"
            >
                <span>{value}</span>
                <ChevronDown size={12} className={`text-[#c4c7c5] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-max min-w-[100px] bg-[#1e1f20] border border-[#303134] rounded-xl shadow-xl overflow-hidden z-30 flex flex-col py-1 animate-fade-in origin-top-left">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`text-left px-4 py-2 text-xs hover:bg-[#303134] transition-colors ${value === opt ? 'text-[#a8c7fa] bg-[#004a77]/30' : 'text-[#e3e3e3]'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const InputArea = ({
    input,
    setInput,
    handleSend,
    canvasOpen,
    toggleCanvas,
    setCanvasOpen,
    showTools,
    setShowTools,
    centered = false,
    // Hoisted State Props
    activeTool, setActiveTool,
    showSettings, setShowSettings,
    imageAspectRatio, setImageAspectRatio,
    imageResolution, setImageResolution,
    videoAudio, setVideoAudio,
    videoAspectRatio, setVideoAspectRatio,
    videoDuration, setVideoDuration,
    referenceImages, setReferenceImages,
    fileInputRef, handleFileSelect
}: {
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    handleSend: (model: string) => void,
    canvasOpen: boolean,
    toggleCanvas: () => void,
    setCanvasOpen: (v: boolean) => void,
    showTools: boolean,
    setShowTools: (v: boolean) => void,
    centered?: boolean,
    // Hoisted State Types
    activeTool: string | null, setActiveTool: (v: string | null) => void,
    showSettings: boolean, setShowSettings: (v: boolean) => void,
    imageAspectRatio: string, setImageAspectRatio: (v: string) => void,
    imageResolution: string, setImageResolution: (v: string) => void,
    videoAudio: string, setVideoAudio: (v: string) => void,
    videoAspectRatio: string, setVideoAspectRatio: (v: string) => void,
    videoDuration: string, setVideoDuration: (v: string) => void,
    referenceImages: string[], setReferenceImages: React.Dispatch<React.SetStateAction<string[]>>,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const [showModelSelector, setShowModelSelector] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Initialize sidebar state based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCanvasOpen(false); // Default to sidebar only
            }
        };

        // Initial check
        if (window.innerWidth < 1024) {
            setCanvasOpen(false); // Ensure logic consistent
            // We can't setSidebarOpen here easily without lifting state or passing setter differently if not hoisted?
            // Wait, sidebarOpen is passed as prop 'isOpen' to Sidebar, but state is in GeminiClone (parent).
            // This is InputArea component. I need to edit GeminiClone.
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') {
                console.log('Mic: No speech detected (timeout). Stopping.');
            } else {
                console.error('Mic error:', event.error);
            }
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let newTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    newTranscript += event.results[i][0].transcript;
                }
            }
            if (newTranscript) {
                console.log('Mic result:', newTranscript);
                setInput((prev: string) => prev + (prev ? ' ' : '') + newTranscript);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 1. Handle Files
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            Array.from(e.dataTransfer.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        setReferenceImages(prev => [...prev, result]);
                    };
                    reader.readAsDataURL(file);
                }
            });
            return;
        }

        // 2. Handle HTML Elements (dragging image from chat)
        const html = e.dataTransfer.getData('text/html');
        if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const img = doc.querySelector('img');
            if (img && img.src) {
                setReferenceImages(prev => [...prev, img.src]);
            }
        }
    };

    return (
        <div className={`w-full ${centered ? '' : 'bg-black px-2 pb-0 pt-2 md:px-4 md:pb-4'}`}>
            <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                className={`max-w-3xl mx-auto relative bg-[#0b0b0b] rounded-[24px] transition-all duration-200 border ${input ? 'border-[#e3e3e3]/20' : 'border-transparent'}`}
            >

                {/* Text Input Area (Top) */}
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend('imagen-3.0-generate-001'))}
                    placeholder="Ask Space"
                    rows={1}
                    className="w-full bg-transparent text-[#e3e3e3] placeholder-[#8e918f] text-[16px] resize-none focus:outline-none py-4 px-5 min-h-[56px] max-h-[200px]"
                />

                {/* Reference Image Preview */}
                {referenceImages.length > 0 && (
                    <div className="px-5 pb-4 flex gap-2 overflow-x-auto">
                        {referenceImages.map((img, idx) => (
                            <div key={idx} className="relative inline-block group flex-shrink-0">
                                <img src={img} alt={`Reference ${idx}`} className="h-16 w-16 object-cover rounded-lg border border-[#303134]" />
                                <button
                                    onClick={() => {
                                        const newImages = [...referenceImages];
                                        newImages.splice(idx, 1);
                                        setReferenceImages(newImages);
                                    }}
                                    className="absolute -top-1 -right-1 bg-[#1e1f20] rounded-full p-0.5 text-[#c4c7c5] hover:text-[#ff9898] border border-[#303134]"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Toolbar (Bottom) */}
                <div className="flex items-center justify-between px-2 pb-2">

                    {/* Left Side: Plus & Tools */}
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.click();
                                }
                            }}
                            className={`p-2 rounded-full hover:bg-[#1f1f1f] transition-colors ${referenceImages.length > 0 ? 'text-[#a8c7fa] bg-[#004a77]/30' : 'text-[#e3e3e3]'}`}
                        >
                            <span className="material-symbols-outlined text-[#c4c7c5]">add</span>
                        </button>

                        <div className="relative flex items-center gap-2">
                            {/* Tools Control */}
                            {activeTool ? (() => {
                                const activeItem = TOOLS_ITEMS.find(t => t.label === activeTool);
                                if (!activeItem) return null;
                                return (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b0b0b] border border-[#303134] text-[#a8c7fa] transition-colors cursor-default select-none animate-fade-in shadow-sm">
                                        {React.cloneElement(activeItem.icon as any, { size: 18, className: "text-[#a8c7fa]" })}
                                        <span className="text-sm font-medium">{activeItem.shortLabel}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveTool(null); }}
                                            className="hover:text-white ml-1 p-0.5 rounded-full hover:bg-[#303134] transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                );
                            })() : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowTools(!showTools); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#1f1f1f] transition-colors ${showTools ? 'bg-[#1f1f1f]' : ''}`}
                                >
                                    <span className="material-symbols-outlined text-[#c4c7c5]" style={{ fontSize: '20px' }}>page_info</span>
                                    <span className="text-sm font-medium text-[#c4c7c5] hidden md:inline">Tools</span>
                                </button>
                            )}

                            {/* Tools Menu */}
                            {showTools && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setShowTools(false)}></div>
                                    <div className={`absolute ${centered ? 'top-full mt-3 origin-top-left' : 'bottom-full mb-3 origin-bottom-left'} left-0 w-72 bg-[#0b0b0b] rounded-[24px] shadow-2xl border border-[#303134] overflow-hidden py-3 z-40 animate-fade-in ring-1 ring-white/10`}>
                                        <div className="flex flex-col">
                                            {TOOLS_ITEMS.map((tool, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setActiveTool(tool.label);
                                                        setShowTools(false);
                                                    }}
                                                    className="w-full text-left px-5 py-3 hover:bg-[#303134] flex items-center gap-4 text-[#e3e3e3] transition-colors group"
                                                >
                                                    <div className="text-[#c4c7c5] group-hover:text-[#e3e3e3] transition-colors">{tool.icon}</div>
                                                    <div className="flex-1 flex items-center justify-between">
                                                        <span className="text-[15px] font-medium">{tool.label}</span>
                                                        {tool.label === activeTool && (
                                                            <div className="text-[#a8c7fa] bg-[#004a77] rounded-full p-0.5">
                                                                <Check size={12} strokeWidth={4} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Pro, Mic, Send */}
                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={handleMicClick}
                            className={`p-2.5 rounded-full hover:bg-[#1f1f1f] transition-colors ${isListening ? 'bg-[#4285f4]/20 text-[#4285f4] animate-pulse' : 'text-[#e3e3e3]'}`}
                        >
                            <Mic size={20} />
                        </button>

                        {input && (
                            <button onClick={() => handleSend('imagen-3.0-generate-001')} className="p-2.5 rounded-full bg-[#e3e3e3] text-black hover:opacity-90 transition-opacity animate-fade-in">
                                <Send size={18} className="ml-0.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Advanced Settings for Image Generation */}
                {activeTool === 'Create images' && showSettings && (
                    <div className="px-5 pb-4 pt-2 animate-fade-in border-t border-[#303134]/50 mt-1">

                        <div className="flex items-center gap-4">
                            {/* Aspect Ratio */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#8e918f]">Aspect Ratio</span>
                                <CustomDropdown
                                    options={['16:9', '4:3', '1:1', '3:4', '9:16']}
                                    value={imageAspectRatio}
                                    onChange={setImageAspectRatio}
                                />
                            </div>

                            {/* Resolution */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#8e918f]">Resolution</span>
                                <CustomDropdown
                                    options={['Standard (1K)', '2k', '4k']}
                                    value={imageResolution}
                                    onChange={setImageResolution}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Settings for Video Generation */}
                {activeTool === 'Create videos (Veo 3.1)' && showSettings && (
                    <div className="px-5 pb-4 pt-2 animate-fade-in border-t border-[#303134]/50 mt-1">

                        <div className="flex items-center gap-4">
                            {/* Audio */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#8e918f]">Audio</span>
                                <CustomDropdown
                                    options={['On', 'Off']}
                                    value={videoAudio}
                                    onChange={setVideoAudio}
                                />
                            </div>

                            {/* Aspect Ratio */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#8e918f]">Aspect Ratio</span>
                                <CustomDropdown
                                    options={['16:9', '9:16', '1:1', '21:9']}
                                    value={videoAspectRatio}
                                    onChange={setVideoAspectRatio}
                                />
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#8e918f]">Duration</span>
                                <CustomDropdown
                                    options={['4 seconds', '6 seconds', '8 seconds']}
                                    value={videoDuration}
                                    onChange={setVideoDuration}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Footer Disclaimer - Removed */}
        </div>
    );
};


// --- Main App ---

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    isLoading?: boolean;
}

export default function GeminiClone() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false); // Kept for standard chat simulation if needed
    const [streamedText, setStreamedText] = useState('');

    // Canvas State
    const [canvasOpen, setCanvasOpen] = useState(false);
    const [canvasContent, setCanvasContent] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [showTools, setShowTools] = useState(false);

    // Hoisted Tool State
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(true);

    // Advanced Settings State (Hoisted)
    const [imageAspectRatio, setImageAspectRatio] = useState('16:9');
    const [imageResolution, setImageResolution] = useState('Standard (1K)');
    const [videoAudio, setVideoAudio] = useState('On');
    const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
    const [videoDuration, setVideoDuration] = useState('4 seconds');

    // Reference Image State
    const [referenceImages, setReferenceImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setReferenceImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Chat Persistence State
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<any[]>([]);

    // Load Chat History (Real-time)
    useEffect(() => {
        // Initialize sidebar state based on screen size
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setSidebarOpen(false);
        }

        if (!user) {
            setChatHistory([]);
            return;
        }

        const q = query(
            collection(db, "users", user.uid, "chats"),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setChatHistory(chats);
        });

        return () => unsubscribe();
    }, [user]);

    // Save Chat Function
    const saveChat = async (newMessages: Message[], chatIdOverride?: string | null) => {
        if (!user || newMessages.length === 0) return;

        const targetChatId = chatIdOverride || currentChatId;

        try {
            if (targetChatId) {
                // Update existing chat
                await updateDoc(doc(db, "users", user.uid, "chats", targetChatId), {
                    messages: newMessages,
                    updatedAt: serverTimestamp() // Use serverTimestamp for consistency
                });
                return targetChatId;
            } else {
                // Create new chat
                const title = newMessages[0].text.slice(0, 30) + (newMessages[0].text.length > 30 ? "..." : "");
                const docRef = await addDoc(collection(db, "users", user.uid, "chats"), {
                    title,
                    messages: newMessages,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                setCurrentChatId(docRef.id);
                return docRef.id;
            }
        } catch (error) {
            console.error("Error saving chat:", error);
            return null;
        }
    };

    // Load a specific chat
    const loadChat = async (chatId: string) => {
        if (!user) return;
        setCurrentChatId(chatId);
        try {
            const chatDoc = await getDoc(doc(db, "users", user.uid, "chats", chatId));
            if (chatDoc.exists()) {
                const data = chatDoc.data();
                setMessages(data.messages || []);
                setCanvasContent('');
                if (window.innerWidth < 1024) setSidebarOpen(false);
            }
        } catch (error) {
            console.error("Error loading chat:", error);
        }
    };

    const deleteChat = async (chatId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "chats", chatId));
            if (currentChatId === chatId) {
                startNewChat();
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, streamedText]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleSend = async (selectedModel: string) => {
        if (!input.trim() && referenceImages.length === 0) return;
        const userText = input;
        setInput('');

        // Process references: Ensure all are Base64
        const processedReferences = await Promise.all(referenceImages.map(async (img) => {
            if (img.startsWith('http')) {
                return await urlToBase64(img);
            }
            return img;
        }));

        const currentReferenceImages = processedReferences;
        setReferenceImages([]); // Clear after sending

        // Add User Message
        const userMsgId = crypto.randomUUID();
        const newUserMsg: Message = {
            id: userMsgId,
            role: 'user',
            text: userText + (currentReferenceImages.length > 0 ? `\n[Attached ${currentReferenceImages.length} Image(s)]` : "")
        };
        const updatedMessagesWithUser = [...messages, newUserMsg];
        setMessages(updatedMessagesWithUser);

        // Optimistic Save for User Message
        const savedChatId = await saveChat(updatedMessagesWithUser);

        // Tool Generation Logic
        if (activeTool) {
            const botMsgId = crypto.randomUUID();
            // Add Bot Placeholder
            const placeholderMsg: Message = { id: botMsgId, role: 'bot', text: '', isLoading: true };
            const messagesWithPlaceholder = [...updatedMessagesWithUser, placeholderMsg];
            setMessages(messagesWithPlaceholder);

            // Helper to update specific message
            const updateMessage = (text: string, isLoading: boolean) => {
                setMessages(prev => {
                    const newMsgs = prev.map(msg => msg.id === botMsgId ? { ...msg, text, isLoading } : msg);
                    saveChat(newMsgs, savedChatId); // Save on update using savedChatId
                    return newMsgs;
                });
            };

            try {
                if (activeTool === 'Create images') {
                    // Non-blocking async call
                    generateImage(userText, 'imagen-3.0-generate-001', {
                        sampleImageSize: imageResolution.includes('2k') ? '2K' : (imageResolution.includes('4k') ? '4K' : '1K'),
                        aspectRatio: imageAspectRatio,
                        userId: user?.uid,
                        referenceImages: currentReferenceImages
                    }).then(res => {
                        if (res.success && (res as any).imageUrl) {
                            const imageUrl = (res as any).imageUrl;
                            const textPrefix = `Here is your generated image based on: "${userText}"\n\n`;
                            const markdown = `${textPrefix}![Generated Image](${imageUrl})`;
                            updateMessage(markdown, false);
                            setCanvasContent(`![Generated Image](${imageUrl})`);
                        } else {
                            updateMessage("Sorry, image generation failed.", false);
                        }
                    }).catch(err => {
                        console.error(err);
                        updateMessage("An unexpected error occurred during image generation.", false);
                    });

                } else if (activeTool === 'Create videos (Veo 3.1)') {
                    const durationSec = parseInt(videoDuration.split(" ")[0]) || 4;
                    // Non-blocking async call
                    generateVideo(userText, durationSec, videoAudio === 'On', 'veo-3.1-generate-001', {
                        aspectRatio: videoAspectRatio,
                        userId: user?.uid
                    }).then(res => {
                        if (res.success && (res as any).videoUrl) {
                            const videoUrl = (res as any).videoUrl;
                            const textPrefix = `Here is your generated video based on: "${userText}"\n\n`;
                            const html = `${textPrefix}<video src="${videoUrl}" controls class="max-w-full rounded-xl" />`;
                            updateMessage(html, false);
                            setCanvasContent(`<video src="${videoUrl}" controls class="max-w-full rounded-xl" />`);
                        } else {
                            updateMessage("Sorry, video generation failed or timed out.", false);
                        }
                    }).catch(err => {
                        console.error(err);
                        updateMessage("An unexpected error occurred during video generation.", false);
                    });
                }
            } catch (error) {
                console.error("Trigger error:", error);
                updateMessage("Failed to start generation.", false);
            }
            return; // Return early for tools
        }

        // Standard Chat Logic (Simulation) - Keeps Global isTyping for now or could migrate
        setIsTyping(true);
        setStreamedText('');

        // If canvas is open, we simulate writing to canvas
        if (canvasOpen) {
            setTimeout(() => {
                setIsTyping(false);
                const canvasText = "## Project Plan: Kyoto Trip\n\n**Day 1: Arrival & Downtown**\n- Arrive at Kyoto Station\n- Check into hotel near Gion\n- Evening walk through Pontocho Alley\n\n**Day 2: Northern Kyoto**\n- Kinkaku-ji (Golden Pavilion)\n- Ryoan-ji Rock Garden\n- Arashiyama Bamboo Grove\n\n**Day 3: Eastern Kyoto**\n- Fushimi Inari Taisha (Morning hike)\n- Kiyomizu-dera Temple\n- Higashiyama District shopping";
                setCanvasContent(canvasText);
                const botMsgId = crypto.randomUUID();
                const botMsg: Message = { id: botMsgId, role: 'bot', text: "I've drafted a travel plan for you in the canvas. Let me know if you'd like to adjust any dates." };
                const finalMessages = [...updatedMessagesWithUser, botMsg];
                setMessages(finalMessages);
                saveChat(finalMessages, savedChatId);
            }, 1500);
        } else {
            // Standard chat response
            setTimeout(() => {
                setIsTyping(false);
                const fullResponse = "Here is some information about that. I can help you code, write, plan, and learn. \n\nWould you like to try the Canvas feature for editing longer documents?";
                const botMsgId = crypto.randomUUID();
                const botMsg: Message = { id: botMsgId, role: 'bot', text: fullResponse };
                const finalMessages = [...updatedMessagesWithUser, botMsg];
                setMessages(finalMessages);
                saveChat(finalMessages, savedChatId);
            }, 1000);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setInput('');
        setCanvasOpen(false);
        setCanvasContent('');
        setCurrentChatId(null);
        setActiveTool(null);
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    const toggleCanvas = () => {
        setCanvasOpen(true);
        // Find the last bot message content to populate canvas
        // This ensures generated images/videos are shown in canvas when opened manually
        const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot');
        if (lastBotMsg) {
            // Extract media (Image or Video) to show only the media in Canvas
            const mediaMatch = lastBotMsg.text.match(/(!\[.*?\]\(.*?\)|<video[\s\S]*?<\/video>|<video[\s\S]*?\/>)/);
            if (mediaMatch) {
                setCanvasContent(mediaMatch[0]);
            } else {
                setCanvasContent(lastBotMsg.text);
            }
        } else {
            setCanvasContent('');
        }
        setShowTools(false);
    };

    const initialView = messages.length === 0 && !streamedText;

    // Base64 helper
    const urlToBase64 = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting URL to base64:", error);
            return url;
        }
    };

    const handleSetReference = async (urlOrBase64: string) => {
        if (urlOrBase64.startsWith('http')) {
            const base64 = await urlToBase64(urlOrBase64);
            setReferenceImages(prev => [...prev, base64]);
        } else {
            setReferenceImages(prev => [...prev, urlOrBase64]);
        }
    };

    return (
        <div className="flex h-screen bg-black text-[#e3e3e3] font-sans overflow-hidden">
            <CustomStyles />

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                startNewChat={startNewChat}
                chatHistory={chatHistory}
                loadChat={loadChat}
                currentChatId={currentChatId}
                deleteChat={deleteChat}
            />

            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main Container */}
            <div className={`flex-1 flex flex-col h-full relative transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0,1)] lg:ml-0 ${sidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-[72px]'}`}>

                {/* Header */}
                <header className="flex items-center justify-between px-5 py-4 w-full z-10 sticky top-0 bg-black">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-full hover:bg-[#1f1f1f] text-[#c4c7c5] lg:hidden transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="px-3 py-2 text-[#e3e3e3] font-medium text-lg select-none">Space</div>
                    </div>
                    <div className="flex items-center gap-3 relative">
                        <div
                            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-red-400 p-[2px] cursor-pointer"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-medium text-white">
                                {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                            </div>
                        </div>

                        {/* Profile Popup */}
                        {showProfile && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)}></div>
                                <div className="absolute top-12 right-0 w-[90vw] max-w-[400px] bg-[#0b0b0b] rounded-[28px] shadow-2xl p-4 z-50 flex flex-col animate-fade-in ring-1 ring-white/10 md:w-[400px] origin-top-right">
                                    {/* Header: Email & Close */}
                                    <div className="flex items-center justify-center relative mb-6">
                                        <span className="text-sm font-medium text-[#e3e3e3]">{user?.email}</span>
                                        <button
                                            onClick={() => setShowProfile(false)}
                                            className="absolute right-0 p-2 text-[#e3e3e3] hover:bg-[#3c4043] rounded-full transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Hero: Avatar & Greeting */}
                                    <div className="flex flex-col items-center gap-4 mb-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-red-400 p-[2px]">
                                                <div className="w-full h-full rounded-full bg-[#0b0b0b] flex items-center justify-center text-3xl font-medium text-white">
                                                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 right-0 bg-[#303134] p-1.5 rounded-full ring-4 ring-[#0b0b0b]">
                                                <Camera size={14} className="text-[#e3e3e3]" />
                                            </div>
                                        </div>
                                        <div className="text-xl text-[#e3e3e3]">Hi, {user?.displayName || 'User'}!</div>

                                        <button className="px-6 py-2 rounded-full border border-[#5f6368] text-[#e3e3e3] text-sm font-medium hover:bg-[#303134] transition-colors">
                                            Manage your Account
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex bg-[#0b0b0b] rounded-b-[28px]">
                                        <button className="flex-1 flex items-center justify-center gap-3 py-4 hover:bg-[#28292a] transition-colors rounded-bl-[28px] group">
                                            <div className="p-2 rounded-full bg-[#303134] group-hover:bg-[#3c3d3f] transition-colors">
                                                <Settings size={20} className="text-[#e3e3e3]" />
                                            </div>
                                            <span className="text-sm text-[#e3e3e3] font-medium">Settings</span>
                                        </button>
                                        <div className="w-[1px] bg-[#5f6368]/30 my-3"></div>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex-1 flex items-center justify-center gap-3 py-4 hover:bg-[#28292a] transition-colors rounded-br-[28px] group"
                                        >
                                            <LogOut size={20} className="text-[#e3e3e3]" />
                                            <span className="text-sm text-[#e3e3e3] font-medium">Sign out</span>
                                        </button>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#e3e3e3]/70">
                                        <a href="#" className="hover:text-[#e3e3e3]">Privacy Policy</a>
                                        <span>•</span>
                                        <a href="#" className="hover:text-[#e3e3e3]">Terms of Service</a>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Content Split: Chat + Canvas */}
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative overflow-hidden">

                    {/* Chat Area */}
                    <div className="flex flex-col h-full bg-black transition-all duration-300 w-full">
                        {initialView ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <div className="text-44xl md:text-5xl font-medium text-[#444746] mb-8 text-center tracking-tight">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 animate-gradient-x">Hello, {user?.displayName ? user.displayName.split(' ')[0] : 'User'}</span>
                                </div>
                                <InputArea
                                    input={input}
                                    setInput={setInput}
                                    handleSend={handleSend}
                                    canvasOpen={canvasOpen}
                                    toggleCanvas={toggleCanvas}
                                    setCanvasOpen={setCanvasOpen}
                                    showTools={showTools}
                                    setShowTools={setShowTools}
                                    centered={true}
                                    // Pass Hoisted Props
                                    activeTool={activeTool} setActiveTool={setActiveTool}
                                    showSettings={showSettings} setShowSettings={setShowSettings}
                                    imageAspectRatio={imageAspectRatio} setImageAspectRatio={setImageAspectRatio}
                                    imageResolution={imageResolution} setImageResolution={setImageResolution}
                                    videoAudio={videoAudio} setVideoAudio={setVideoAudio}
                                    videoAspectRatio={videoAspectRatio} setVideoAspectRatio={setVideoAspectRatio}
                                    videoDuration={videoDuration} setVideoDuration={setVideoDuration}
                                    referenceImages={referenceImages} setReferenceImages={setReferenceImages}
                                    fileInputRef={fileInputRef} handleFileSelect={handleFileSelect}
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full">
                                <div className="flex-1 overflow-y-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6 scrollbar-hidden max-w-3xl mx-auto w-full">
                                    {messages.map((msg, idx) => (
                                        <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                            <div className={`max-w-[95%] md:max-w-[85%] rounded-2xl px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                                ? 'bg-[#28292a] text-[#e3e3e3]'
                                                : 'bg-transparent text-[#e3e3e3] pl-0'
                                                } ${canvasOpen ? 'hide-media' : ''}`}>
                                                {msg.role === 'bot' && (
                                                    <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-red-400 p-[1.5px] flex-shrink-0 mt-1 self-start">
                                                            <div className="w-full h-full rounded-full bg-[#0b0b0b] flex items-center justify-center">
                                                                <Sparkles size={14} className="text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-2 overflow-hidden min-w-0">
                                                            {msg.isLoading ? (
                                                                <div className="flex items-center gap-1.5 h-6">
                                                                    <div className="w-1.5 h-1.5 bg-[#e3e3e3]/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                                    <div className="w-1.5 h-1.5 bg-[#e3e3e3]/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                                    <div className="w-1.5 h-1.5 bg-[#e3e3e3]/60 rounded-full animate-bounce"></div>
                                                                    <span className="text-xs text-[#8e918f] ml-2 font-medium">Generating...</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {/* Render Mixed Content with Use Callback */}
                                                                    {renderMixedContent(msg.text, false, handleSetReference)}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.role === 'user' && (
                                                    <div className="group relative">
                                                        <div className="pr-8">{msg.text}</div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(msg.text);
                                                            }}
                                                            className="absolute -top-1 -right-2 p-1.5 text-[#c4c7c5] hover:text-white bg-[#303134]/50 hover:bg-[#303134] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                            title="Copy Prompt"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex justify-start animate-fade-in">
                                            <div className="flex gap-4 max-w-[85%]">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-red-400 p-[1.5px] flex-shrink-0 mt-1">
                                                    <div className="w-full h-full rounded-full bg-[#0b0b0b] flex items-center justify-center">
                                                        <Sparkles size={14} className="text-white animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 h-10 mt-1">
                                                    <div className="w-1.5 h-1.5 bg-[#e3e3e3]/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-1.5 h-1.5 bg-[#e3e3e3]/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-1.5 h-1.5 bg-[#e3e3e3]/60 rounded-full animate-bounce"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {streamedText && (
                                        <div className="flex justify-start animate-fade-in">
                                            <div className="flex gap-4 max-w-[85%]">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-red-400 p-[1.5px] flex-shrink-0 mt-1">
                                                    <div className="w-full h-full rounded-full bg-[#0b0b0b] flex items-center justify-center">
                                                        <Sparkles size={14} className="text-white" />
                                                    </div>
                                                </div>
                                                <div className="whitespace-pre-wrap text-[#e3e3e3] pl-0 py-3.5 leading-relaxed">{streamedText}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>
                                <div className="w-full max-w-3xl mx-auto px-4 pb-6">
                                    <InputArea
                                        input={input}
                                        setInput={setInput}
                                        handleSend={handleSend}
                                        canvasOpen={canvasOpen}
                                        toggleCanvas={toggleCanvas}
                                        setCanvasOpen={setCanvasOpen}
                                        showTools={showTools}
                                        setShowTools={setShowTools}
                                        // Pass Hoisted Props
                                        activeTool={activeTool} setActiveTool={setActiveTool}
                                        showSettings={showSettings} setShowSettings={setShowSettings}
                                        imageAspectRatio={imageAspectRatio} setImageAspectRatio={setImageAspectRatio}
                                        imageResolution={imageResolution} setImageResolution={setImageResolution}
                                        videoAudio={videoAudio} setVideoAudio={setVideoAudio}
                                        videoAspectRatio={videoAspectRatio} setVideoAspectRatio={setVideoAspectRatio}
                                        videoDuration={videoDuration} setVideoDuration={setVideoDuration}
                                        referenceImages={referenceImages} setReferenceImages={setReferenceImages}
                                        fileInputRef={fileInputRef} handleFileSelect={handleFileSelect}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
