"use client"

import { useState } from "react"
import { ImageGallery, getImageUrl, PhotoModal } from "@/components/image-gallery"

interface TableImagePreviewProps {
    images: string[]
}

export function TableImagePreview({ images }: TableImagePreviewProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Safety check for empty images
    if (!images || images.length === 0) {
        return <span className="text-xs text-slate-300">-</span>;
    }

    const firstImage = images[0];
    const imageCount = images.length;

    const API_URL = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? "http://localhost:5000" : "https://api.engilog.site")
        : "http://localhost:5000";

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="relative w-10 h-10 min-w-[40px] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all border border-slate-200 bg-slate-50 group"
            >
                <img
                    src={getImageUrl(firstImage, API_URL)}
                    alt="Preview"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {imageCount > 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="text-white text-[10px] font-bold">+{imageCount - 1}</span>
                    </div>
                )}
            </div>

            {isOpen && (
                <PhotoModal
                    images={images.map(img => getImageUrl(img, API_URL))}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
