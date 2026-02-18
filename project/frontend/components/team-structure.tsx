"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import axios from "axios"
import { toast } from "sonner"
import { getImageUrl } from "@/components/image-gallery"

interface TeamMember {
    id: string; // Add ID for easier tracking
    name: string
    role: string
    photo?: string
    children?: TeamMember[]
}

const DEFAULT_TEAM: TeamMember = {
    id: "root",
    name: "Bapak Budi Santoso",
    role: "Chief Engineering",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
    children: [],
}

const API_URL = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' ? "http://localhost:5000" : "https://api.engilog.site")
    : "http://localhost:5000";

const TeamNode = ({
    member,
    isRoot,
    isFirst,
    isLast,
    isSole,
    isEditMode,
    onEdit,
    onAddChild,
    onDelete,
    onZoom
}: {
    member: TeamMember,
    isRoot?: boolean,
    isFirst?: boolean,
    isLast?: boolean,
    isSole?: boolean,
    isEditMode: boolean,
    onEdit: (member: TeamMember) => void,
    onAddChild: (parentId: string) => void,
    onDelete: (id: string) => void,
    onZoom: (member: TeamMember) => void
}) => {
    return (
        <div className="flex flex-col items-center relative">
            {/* Connector Lines (Upwards) */}
            {!isRoot && (
                <div className="h-4 w-full relative">
                    {/* Vertical Line Up - connects to the bus line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-t from-indigo-200 to-indigo-300"></div>

                    {/* Horizontal Bus Line Segments */}
                    {!isSole && (
                        <>
                            {/* Right Segment (for First & Middle) */}
                            {!isLast && (
                                <div className="absolute top-0 right-0 w-1/2 h-0.5 bg-indigo-300"></div>
                            )}
                            {/* Left Segment (for Last & Middle) */}
                            {!isFirst && (
                                <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-indigo-300"></div>
                            )}
                        </>
                    )}
                </div>
            )}

            <div
                className={`group relative cursor-pointer z-10`}
                onClick={() => !isEditMode && onZoom(member)}
            >
                <div className="bg-white/90 backdrop-blur-md border border-white/50 p-2 md:p-5 rounded-xl md:rounded-2xl shadow-xl shadow-indigo-100/40 flex flex-col items-center text-center w-28 md:w-56 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/50 group-hover:bg-white overflow-hidden">
                    <div className="relative mb-2 md:mb-4">
                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity blur-sm"></div>
                        <img
                            src={getImageUrl(member.photo || "", API_URL) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "User")}&background=random&size=200`}
                            alt={member.name || "Team Member"}
                            className="relative w-12 h-12 md:w-32 md:h-32 rounded-lg md:rounded-xl object-cover border-2 border-white ring-2 md:ring-4 ring-indigo-50 shadow-md group-hover:scale-105 transition-transform duration-500 font-bold"
                        />
                    </div>
                    <div className="space-y-0.5 md:space-y-1 w-full">
                        <h4 className="font-extrabold text-slate-800 text-[10px] md:text-base leading-tight tracking-tight w-full px-1 md:px-2 break-words whitespace-normal line-clamp-2 min-h-[1.5em]">{member.name}</h4>
                        <div className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1 break-words whitespace-normal line-clamp-2 max-w-full">
                            {member.role}
                        </div>
                    </div>

                    {/* Desktop Hover Edit Controls */}
                    {isEditMode && (
                        <div className="hidden md:flex absolute inset-0 bg-black/60 items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                            <button
                                onClick={() => onEdit(member)}
                                className="p-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                                title="Edit Member"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onAddChild(member.id)}
                                className="p-2 bg-white text-green-600 rounded-full hover:bg-green-50 transition-colors"
                                title="Add Subordinate"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                            </button>
                            {!isRoot && (
                                <button
                                    onClick={() => onDelete(member.id)}
                                    className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                    title="Delete Member"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4H3a.75.75 0 000 1.5h.254l.846 12.58A2.75 2.75 0 006.844 21h6.312a2.75 2.75 0 002.744-2.67l.846-12.58H17a.75.75 0 000-1.5h-3v-.25A2.75 2.75 0 0011.25 1h-2.5zM8 4h4v-.25C12 2.784 11.216 2 10.25 2h-1.5C7.784 2 7 2.784 7 3.75V4z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="absolute -inset-4 bg-indigo-400/10 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>

            {/* Mobile Edit Controls (Always Visible in Edit Mode, Below Card) */}
            {isEditMode && (
                <div className="flex md:hidden gap-2 mt-2 z-10">
                    <button
                        onClick={() => onEdit(member)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-full shadow-sm active:scale-95 transition-transform"
                        title="Edit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onAddChild(member.id)}
                        className="p-2 bg-green-100 text-green-600 rounded-full shadow-sm active:scale-95 transition-transform"
                        title="Add Child"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </button>
                    {!isRoot && (
                        <button
                            onClick={() => onDelete(member.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-full shadow-sm active:scale-95 transition-transform"
                            title="Delete"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4H3a.75.75 0 000 1.5h.254l.846 12.58A2.75 2.75 0 006.844 21h6.312a2.75 2.75 0 002.744-2.67l.846-12.58H17a.75.75 0 000-1.5h-3v-.25A2.75 2.75 0 0011.25 1h-2.5zM8 4h4v-.25C12 2.784 11.216 2 10.25 2h-1.5C7.784 2 7 2.784 7 3.75V4z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {member.children && member.children.length > 0 && (
                <>
                    {/* Vertical Line Down (from Parent) */}
                    <div className="w-0.5 h-4 md:h-6 bg-indigo-300"></div>

                    {/* Children Container (Bus starts at top of this) */}
                    <div className="flex gap-1 md:gap-8">
                        {member.children.map((child, idx) => (
                            <TeamNode
                                key={child.id}
                                member={child}
                                isFirst={idx === 0}
                                isLast={idx === (member.children?.length || 0) - 1}
                                isSole={(member.children?.length || 0) === 1}
                                isEditMode={isEditMode}
                                onEdit={onEdit}
                                onAddChild={onAddChild}
                                onDelete={onDelete}
                                onZoom={onZoom}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// Infinite Canvas Team Structure
const InfiniteCanvas = ({
    children,
    onZoomChange,
    initialScale = 0.5
}: {
    children: React.ReactNode,
    onZoomChange?: (scale: number) => void,
    initialScale?: number
}) => {
    const [scale, setScale] = useState(initialScale);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isLocked, setIsLocked] = useState(true); // Default locked
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [showLockUI, setShowLockUI] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const uiTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Dynamic Centering Logic
    const centerView = React.useCallback(() => {
        if (containerRef.current && contentRef.current) {
            const { clientWidth: containerW } = containerRef.current;
            const { scrollWidth: contentW } = contentRef.current;

            // Target scale 0.5 as requested
            // If the content is REALLY wide, we might need adjustments, but user asked for strictly 50%
            const targetScale = 0.5;

            // Center based on target scale
            const x = (containerW - contentW * targetScale) / 2;
            const y = 80;

            setPosition({ x, y });
            setScale(targetScale);
        }
    }, []);

    // Center initial view with a slight delay
    useEffect(() => {
        const timer = setTimeout(() => {
            centerView();
        }, 100);
        return () => clearTimeout(timer);
    }, [centerView]);

    const handleLockedInteraction = () => {
        if (!isLocked) return;

        // Show toast for 0.5s
        setShowToast(true);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setShowToast(false), 500);

        // Show lock button
        setShowLockUI(true);
        if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
        // Hide lock UI after 3s of inactivity if they don't unlock
        uiTimeoutRef.current = setTimeout(() => setShowLockUI(false), 3000);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (isLocked) {
            handleLockedInteraction();
            return;
        }
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(0.2, scale * delta), 2);
        setScale(newScale);
        if (onZoomChange) onZoomChange(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isLocked) {
            if ((e.target as HTMLElement).tagName !== 'BUTTON') handleLockedInteraction();
            return;
        }
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        setIsDragging(true);
        setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isLocked || !isDragging) return;
        setPosition({
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const [lastTouch, setLastTouch] = useState<{ x: number, y: number } | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isLocked) {
            if ((e.target as HTMLElement).tagName !== 'BUTTON') handleLockedInteraction();
            return;
        }
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        if (e.touches.length === 1) {
            setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isLocked) {
            handleLockedInteraction();
            return;
        }
        if (e.touches.length === 1 && lastTouch) {
            const dx = e.touches[0].clientX - lastTouch.x;
            const dy = e.touches[0].clientY - lastTouch.y;
            setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
    };

    const handleTouchEnd = () => {
        setLastTouch(null);
    };

    return (
        <div
            ref={containerRef}
            className={`w-full h-[80vh] bg-slate-50 relative overflow-hidden rounded-3xl border border-slate-200 shadow-inner select-none ${isLocked ? 'touch-pan-y' : 'touch-none cursor-grab active:cursor-grabbing'}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}
        >
            {/* Lock Status Indicator - Only shows when showToast is true */}
            <div
                className={`absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-500 border border-slate-100 shadow-sm pointer-events-none z-40 flex items-center gap-2 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-400">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                Posisi Terkunci
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30">
                {/* Lock Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const newLockedState = !isLocked;
                        setIsLocked(newLockedState);
                        // If unlocking, show UI. If locking, hide UI (logic handled by effect/interaction)
                        if (!newLockedState) setShowLockUI(true);
                        else setShowLockUI(false);
                    }}
                    className={`p-3 shadow-lg rounded-full font-bold border active:scale-95 transition-all duration-300 transform 
                        ${isLocked && !showLockUI ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}
                        ${isLocked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-100 hover:text-indigo-600'}
                    `}
                    title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
                >
                    {isLocked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M14.5 9h-5V5.5a4.5 4.5 0 00-9 0V9H.5a.5.5 0 000 1h14a.5.5 0 000-1zM10 3a2.5 2.5 0 00-2.5 2.5V9h5V5.5A2.5 2.5 0 0010 3z" clipRule="evenodd" />
                            <path d="M5 11v6a2 2 0 002 2h6a2 2 0 002-2v-6H5z" />
                        </svg>
                    )}
                </button>

                {/* Zoom & Fit Controls - Visible ONLY when NOT locked */}
                <div className={`flex flex-col gap-2 transition-all duration-300 ${isLocked ? 'opacity-0 translate-y-10 pointer-events-none scale-0 h-0' : 'opacity-100 translate-y-0 scale-100'}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setScale(Math.min(2, scale + 0.1)); }}
                        className="p-3 bg-white shadow-lg rounded-full text-slate-600 font-bold border border-slate-100 active:scale-95 transition-transform hover:text-indigo-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setScale(Math.max(0.2, scale - 0.1)); }}
                        className="p-3 bg-white shadow-lg rounded-full text-slate-600 font-bold border border-slate-100 active:scale-95 transition-transform hover:text-indigo-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); centerView(); }}
                        className="p-3 bg-white shadow-lg rounded-full text-slate-600 hover:text-indigo-600 font-bold border border-slate-100 active:scale-95 transition-transform"
                        title="Fit to Screen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M3.25 3.25a.75.75 0 01.75.75v1.5a.75.75 0 101.5 0V4A2.25 2.25 0 003.25 1.75h2.25a.75.75 0 000-1.5h-2.25A2.25 2.25 0 001 2.5v2.25a.75.75 0 001.5 0v-1.5zm11.25-.75a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5A2.25 2.25 0 0016.75 1.75h-2.25zm.75 11.25a.75.75 0 011.5 0v2.25A2.25 2.25 0 0116.75 18.25h-2.25a.75.75 0 010-1.5h2.25v-1.5.75a.75.75 0 01.75-.75v-1.5a.75.75 0 011.5 0v1.5A2.25 2.25 0 011.75 18.25h2.25a.75.75 0 010-1.5h-2.25v-1.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                            <path d="M10 7a3 3 0 110 6 3 3 0 010-6z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Canvas Content */}
            <div
                ref={contentRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
                className="absolute top-0 left-0 w-max h-max p-20"
            >
                {/* Ensure content has some intrinsic width for measurement */}
                <div className="inline-block">
                    {children}
                </div>
            </div>

            {/* Scale Indicator */}
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-100 pointer-events-none">
                {Math.round(scale * 100)}%
            </div>
        </div>
    );
};

export default function TeamStructure() {
    const { user } = useAuth();
    const [isEditMode, setIsEditMode] = useState(false)
    const [team, setTeam] = useState<TeamMember | null>(null)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [zoomedMember, setZoomedMember] = useState<TeamMember | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const isSuperAdmin = user?.role === 'superadmin'

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await axios.get(`${API_URL}/settings/team_structure`);
                if (res.data) {
                    let data = res.data;
                    if (typeof data === 'string') {
                        try { data = JSON.parse(data); } catch (e) { console.error(e); }
                    }
                    setTeam(data);
                } else {
                    setTeam(DEFAULT_TEAM);
                }
            } catch (error) {
                console.error("Failed to fetch team:", error);
                if (!team) setTeam(DEFAULT_TEAM);
            }
        };
        fetchTeam();
    }, []);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingMember) return;

        const formData = new FormData();
        formData.append('photo', file);
        const toastId = toast.loading("Mengunggah foto...");
        try {
            const res = await axios.post(`${API_URL}/settings/upload-photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newPhotoUrl = res.data.photoUrl.startsWith('http')
                ? res.data.photoUrl
                : `${API_URL}${res.data.photoUrl.startsWith('/') ? '' : '/'}${res.data.photoUrl}`;
            setEditingMember({ ...editingMember, photo: newPhotoUrl });
            toast.success("Foto berhasil diunggah!", { id: toastId });
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Gagal mengunggah foto.", { id: toastId });
        }
    };

    const handleSave = async () => {
        if (!team) return;
        setIsSaving(true);
        const toastId = toast.loading("Menyimpan struktur tim...");
        try {
            await axios.post(`${API_URL}/settings/team_structure`, { value: team });
            toast.success("Struktur tim berhasil disimpan!", { id: toastId });
            setIsEditMode(false);
        } catch (error) {
            toast.error("Gagal menyimpan struktur tim.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    // Helper functions (update, add, delete) - kept same
    const updateMemberInTree = (node: TeamMember, id: string, data: Partial<TeamMember>): TeamMember => {
        if (node.id === id) return { ...node, ...data };
        if (node.children) return { ...node, children: node.children.map(child => updateMemberInTree(child, id, data)) };
        return node;
    };

    const addChildToTree = (node: TeamMember, parentId: string, newChild: TeamMember): TeamMember => {
        if (node.id === parentId) return { ...node, children: [...(node.children || []), newChild] };
        if (node.children) return { ...node, children: node.children.map(child => addChildToTree(child, parentId, newChild)) };
        return node;
    };

    const deleteFromTree = (node: TeamMember, id: string): TeamMember | null => {
        if (node.id === id) return null;
        if (node.children) {
            const filtered = node.children.map(child => deleteFromTree(child, id)).filter(Boolean) as TeamMember[];
            return { ...node, children: filtered };
        }
        return node;
    };

    const onEdit = (member: TeamMember) => setEditingMember(member);
    const onDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus anggota ini beserta bawahannya?")) {
            setTeam(prev => prev ? deleteFromTree(prev, id) : null);
        }
    };
    const onAddChild = (parentId: string) => {
        const newId = `member_${Date.now()}`;
        const newChild: TeamMember = {
            id: newId,
            name: "Anggota Baru",
            role: "Jabatan Baru",
            photo: "",
            children: []
        };
        setTeam(prev => prev ? addChildToTree(prev, parentId, newChild) : null);
        setEditingMember(newChild);
    };

    if (!team) return null;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-8">
                <div>
                    <h3 className="font-bold text-slate-800 text-xl md:text-2xl tracking-tight leading-none">Struktur Tim Engineering</h3>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">Canvas Interaktif: Geser dan zoom untuk navigasi.</p>
                </div>

                <div className="flex items-center gap-3">
                    {isSuperAdmin && (
                        <>
                            {!isEditMode ? (
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                    </svg>
                                    Edit Struktur
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100 disabled:opacity-50"
                                    >
                                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditMode(false);
                                            window.location.reload();
                                        }}
                                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <InfiniteCanvas initialScale={0.6}>
                <TeamNode
                    member={team}
                    isRoot={true}
                    isEditMode={isEditMode}
                    onEdit={onEdit}
                    onAddChild={onAddChild}
                    onDelete={onDelete}
                    onZoom={setZoomedMember}
                />
            </InfiniteCanvas>

            {/* Zoomed Card Overlay (Pokemon Style) */}
            {zoomedMember && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
                    onClick={() => setZoomedMember(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20 z-[101]"
                        onClick={(e) => { e.stopPropagation(); setZoomedMember(null); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>

                    <div
                        className="relative group transition-all duration-500 animate-in zoom-in-90 ease-out-expo max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Shadow & Shine Effects */}
                        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 rounded-[2.5rem] opacity-40 blur-xl group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                        <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/50 flex flex-col items-center p-8 text-center ring-1 ring-black/5">
                            {/* Card Shine Mask */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                            <div className="relative mb-8 group/img">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full opacity-10 blur-2xl"></div>
                                <img
                                    src={getImageUrl(zoomedMember.photo || "", API_URL) || `https://ui-avatars.com/api/?name=${encodeURIComponent(zoomedMember.name || "User")}&background=random&size=400`}
                                    alt={zoomedMember.name}
                                    className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl object-cover border-4 border-white shadow-2xl transform transition-transform duration-700 group-hover/img:scale-110"
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none px-4">
                                    {zoomedMember.name}
                                </h3>
                                <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200">
                                    {zoomedMember.role}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 w-full flex justify-center items-center gap-6">
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Active
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-slate-100"></div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Division</div>
                                    <div className="text-xs font-bold text-slate-700">Engineering</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-5 md:p-8 w-full max-w-sm md:max-w-md shadow-2xl border border-white max-h-[85vh] overflow-y-auto">
                        <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.905 9.905 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.9.41-1.412C15.827 12.519 13.095 11 10 11s-5.827 1.519-6.535 3.493z" />
                                </svg>
                            </span>
                            Edit Profil Tim
                        </h4>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={editingMember.name || ""}
                                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800"
                                    placeholder="Nama Anggota..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Jabatan / Role</label>
                                <input
                                    type="text"
                                    value={editingMember.role || ""}
                                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-indigo-600"
                                    placeholder="Contoh: Lead Technician"
                                />
                            </div>
                            <div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Foto Anggota</label>
                                    <div className="flex flex-col gap-3">
                                        {editingMember.photo && (
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm">
                                                <img src={editingMember.photo} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 block w-full cursor-pointer"
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="h-px bg-slate-100 flex-1"></span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Atau Gunakan URL</span>
                                                <span className="h-px bg-slate-100 flex-1"></span>
                                            </div>
                                            <input
                                                type="text"
                                                value={editingMember.photo || ""}
                                                onChange={(e) => setEditingMember({ ...editingMember, photo: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-600 text-[10px]"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 md:mt-8">
                            <button
                                onClick={() => {
                                    setTeam(prev => prev ? updateMemberInTree(prev, editingMember.id, editingMember) : null);
                                    setEditingMember(null);
                                }}
                                className="flex-1 bg-indigo-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 text-sm md:text-base"
                            >
                                Terapkan
                            </button>
                            <button
                                onClick={() => setEditingMember(null)}
                                className="flex-1 bg-slate-50 text-slate-500 py-3 md:py-4 rounded-xl md:rounded-2xl hover:bg-slate-100 transition-all font-bold text-sm md:text-base border border-slate-100"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
