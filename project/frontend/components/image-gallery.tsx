"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

// Helper to construct full image URL
export const getImageUrl = (path: string, apiUrl: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("data:")) return path; // Base64

    // Normalize path: remove leading slash if present, replace backslashes
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

    return `${apiUrl}/${cleanPath}`;
}

// Modal zoom foto
// Modal zoom foto
export function PhotoModal({ src, images = [], onClose }: { src?: string, images?: string[], onClose: () => void }) {
    // Combine src and images to ensure we have a list to navigate
    const photoList = images.length > 0 ? images : (src ? [src] : []);
    const initialIndex = src ? photoList.indexOf(src) : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

    // Navigation handlers
    const nextPhoto = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex < photoList.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevPhoto = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, photoList.length, onClose]); // Added dependencies

    // Swipe handlers
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentIndex < photoList.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
        if (isRightSwipe && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }

    if (photoList.length === 0) return null;

    const currentSrc = photoList[currentIndex];

    if (typeof window === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
                <img
                    src={currentSrc}
                    alt={`Zoom Foto ${currentIndex + 1}`}
                    className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl select-none object-contain"
                    onClick={e => e.stopPropagation()}
                />

                {/* Navigation Buttons (Desktop) */}
                {photoList.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <button
                                onClick={prevPhoto}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors hidden sm:flex items-center justify-center backdrop-blur-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        {currentIndex < photoList.length - 1 && (
                            <button
                                onClick={nextPhoto}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors hidden sm:flex items-center justify-center backdrop-blur-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all backdrop-blur-sm z-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Counter */}
                {photoList.length > 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {currentIndex + 1} / {photoList.length}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}

// Make sure to export useEffect for use in component loops if needed? No, just inside component. Note imports.
// We need to ensure useEffect is imported. It is in the file header.


export function ImageGallery({ images }: { images: string[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

    const API_URL = typeof window !== 'undefined'
        ? `http://${window.location.hostname}:5000`
        : "http://localhost:5000";

    // Track if a drag occurred to prevent clicking after dragging
    const dragOccurred = useRef(false);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        dragOccurred.current = false;
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast

        if (Math.abs(walk) > 5) {
            dragOccurred.current = true;
        }

        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const onImageClick = (src: string) => {
        if (!dragOccurred.current) {
            setZoomPhoto(getImageUrl(src, API_URL));
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.clientWidth : current.clientWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
            </div>
        );
    }

    return (
        <>
            <div className="relative group">
                <div
                    ref={scrollRef}
                    className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-hide select-none rounded-xl bg-slate-100 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                >
                    {images.map((src, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-full aspect-square snap-center p-1 cursor-pointer"
                            onClick={() => onImageClick(src)}
                        >
                            <img
                                src={getImageUrl(src, API_URL)}
                                className="w-full h-full object-cover rounded-lg pointer-events-none"
                                alt={`Item ${idx}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows for PC */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Zoom Button Overlay */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setZoomPhoto(getImageUrl(images[0], API_URL))}
                        className="bg-black/50 text-white p-1.5 rounded-lg backdrop-blur-sm hover:bg-black/70"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                    {images.map((src, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
                            <img
                                src={getImageUrl(src, API_URL)}
                                className="w-full h-full object-cover"
                                alt={`Thumb ${idx}`}
                                onClick={() => {
                                    if (scrollRef.current) {
                                        scrollRef.current.scrollTo({ left: idx * (scrollRef.current.clientWidth + 8), behavior: 'smooth' });
                                        // +8 for gap approximation if using gap, or just width
                                    }
                                    // Optionally immediately zoom on click? Or just scroll to it.
                                    // User wanted "click to enlarge".
                                    setZoomPhoto(getImageUrl(src, API_URL));
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {zoomPhoto && <PhotoModal src={zoomPhoto} images={images.map(img => getImageUrl(img, API_URL))} onClose={() => setZoomPhoto(null)} />}
        </>
    );
}
