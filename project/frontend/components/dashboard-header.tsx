"use client"

import Link from "next/link"
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

export default function DashboardHeader() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 py-3" : "bg-white border-b border-slate-200 py-4"
                }`}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo & Mobile Menu Trigger */}
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Trigger - HIDDEN for new Bottom Nav design */}
                    <div className="hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <button className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                    <Menu className="w-6 h-6" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <div className="flex flex-col gap-6 mt-6">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                                            E
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                                EngiLog
                                            </h1>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Facility Management</p>
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
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shadow-purple-500/20">
                            E
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                EngiLog
                            </h1>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Facility Management</p>
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
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="hidden md:block text-right">
                        <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 transition-colors">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col gap-1 md:hidden">
                                    <span className="font-semibold">{user?.name}</span>
                                    <span className="text-xs font-normal text-slate-500 capitalize">{user?.role}</span>
                                </div>
                                <span className="hidden md:block">My Account</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                                Profile Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
