"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Map, Box, Wrench, ClipboardList, ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function MobileBottomNav() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(true)

    const navItems = [
        { label: "Home", href: "/dashboard", icon: Home, exact: true },
        { label: "Peta", href: "/dashboard/map", icon: Map, exact: false },
        { href: "/dashboard/items", label: "Item", icon: Box, exact: false },
        { label: "Maint", href: "/dashboard/maintenance", icon: Wrench, exact: false },
        { label: "Pinjam", href: "/dashboard/peminjaman", icon: ClipboardList, exact: false }
    ]

    return (
        <>
            {/* Spacer */}
            <div className={cn("transition-all duration-500 md:hidden", isOpen ? "h-24" : "h-0")} />

            {/* Floating Toggle Button - INDEPENDENT of the sliding nav */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "md:hidden fixed left-1/2 -translate-x-1/2 z-[60] w-12 h-12 rounded-full border border-slate-100 shadow-lg flex items-center justify-center transition-all duration-500 ease-in-out",
                    isOpen
                        ? "bottom-[75px] bg-white text-indigo-600 border-indigo-50" // Floating nicely above the bar
                        : "bottom-4 bg-white/90 backdrop-blur text-slate-600 border-slate-200" // Floating at bottom when menu is gone
                )}
                style={{
                    boxShadow: isOpen
                        ? '0 -5px 20px -5px rgba(79, 70, 229, 0.15)'
                        : '0 4px 12px rgba(0,0,0,0.1)'
                }}
                aria-label={isOpen ? "Minimize Menu" : "Opening Menu"}
            >
                {isOpen ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6 animate-bounce" />}
            </button>

            {/* Sliding Nav Container */}
            <div
                className={cn(
                    "md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]",
                    isOpen ? "translate-y-0" : "translate-y-[110%]"
                )}
            >
                <div className="flex items-center justify-around h-[80px] pb-2 px-2">
                    {navItems.map((item, index) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-1/5 h-full transition-all duration-300 relative group active:scale-95",
                                    isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <div className={cn(
                                    "relative p-1.5 rounded-xl transition-all duration-300",
                                    isActive ? "bg-indigo-50 -translate-y-1" : ""
                                )}>
                                    <item.icon className={cn("w-5 h-5", isActive ? "fill-indigo-600/20 stroke-indigo-600" : "")} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium transition-all duration-300 leading-none",
                                    isActive ? "font-bold translate-y-0" : "font-medium"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
