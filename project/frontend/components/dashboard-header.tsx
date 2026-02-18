"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import NotificationDropdown from "./notification-dropdown"

export default function DashboardHeader() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    // Static header, no scroll effect needed

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const navLinks = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/map", label: "Lokasi Item" },
        { href: "/dashboard/items", label: "Manajemen Item" },
        { href: "/dashboard/maintenance", label: "Detail Maintenance" },
        { href: "/dashboard/peminjaman", label: "Peminjaman" },
    ]

    if (user?.role === "superadmin") {
        navLinks.push({ href: "/dashboard/users", label: "Pengguna" })
    }

    return (
        <header
            className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200/50 py-2 md:py-3 shadow-sm transition-all duration-300"
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo & Mobile Menu Trigger */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Mobile Menu Trigger - HIDDEN for new Bottom Nav design */}
                    <div className="hidden">
                        {/* Fix for Hydration Mismatch: Only render Sheet on client */}
                        {true && ( // Always true since we removed scrolled state logic for now, or use isMounted
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>

                                <SheetTrigger asChild>
                                    <button className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                        <Menu className="w-6 h-6" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                    <div className="flex flex-col gap-6 mt-6">
                                        <div className="flex items-center gap-3 px-2">
                                            {/* Logo Image for Mobile Menu */}
                                            <div className="relative w-32 h-12">
                                                <Image
                                                    src="/Engilog-logov2.png"
                                                    alt="EngiLog Logo"
                                                    fill
                                                    className="object-contain object-left"
                                                    priority
                                                />
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-100" />
                                        <nav className="flex flex-col gap-2">
                                            {navLinks.map((link) => {
                                                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                                                return (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                            ? "bg-purple-50 text-purple-700 font-semibold"
                                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                            }`}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                )
                                            })}
                                        </nav>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-left">
                        {/* Logo Image for Desktop Header */}
                        <div className="relative w-14 h-4 md:w-16 md:h-5">
                            <Image
                                src="/Engilog-logov2.png"
                                alt="EngiLog Logo"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-spring ${isActive
                                    ? "bg-white text-purple-600 shadow-sm scale-100"
                                    : "text-slate-600 hover:text-purple-600 hover:bg-white/80 hover:shadow-sm hover:scale-110 active:scale-95"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Notification Bell */}
                    <NotificationDropdown />

                    <div className="hidden md:block text-right">
                        <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 transition-colors text-xs md:text-base">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 hidden md:block">
                                <DropdownMenuLabel>
                                    My Account
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="md:hidden p-1.5 md:p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
