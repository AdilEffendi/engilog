"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Loader2 } from "lucide-react"
import { useNotification } from "@/context/notification-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

export default function NotificationDropdown() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleMarkAllRead = async () => {
        setLoading(true)
        await markAllAsRead()
        setLoading(false)
    }

    const handleNotificationClick = async (notif: any) => {
        await markAsRead(notif.id)
        setIsOpen(false)

        // Navigate based on relatedType
        if (notif.relatedType === 'item' && notif.relatedId) {
            router.push(`/dashboard/items/${notif.relatedId}`)
        } else if (notif.relatedType === 'loan') {
            router.push(`/dashboard/loans`)
        } else if (notif.relatedType === 'maintenance') {
            router.push(`/dashboard/maintenance`)
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-slate-100 rounded-full">
                    <Bell className="w-5 h-5 md:w-6 md:h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96 p-0 max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-semibold text-sm text-slate-800">Notifikasi</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            onClick={handleMarkAllRead}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 p-4">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">Belum ada notifikasi</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-slate-50">
                            {notifications.map((notif) => (
                                <DropdownMenuItem
                                    key={notif.id}
                                    className={`flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-slate-50 ${!notif.isRead ? 'bg-purple-50/40' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <div className="flex w-full gap-3">
                                        <div className="mt-1">
                                            {notif.type === 'success' && <span className="text-lg">✅</span>}
                                            {notif.type === 'warning' && <span className="text-lg">⚠️</span>}
                                            {notif.type === 'error' && <span className="text-lg">❌</span>}
                                            {notif.type === 'info' && <span className="text-lg">ℹ️</span>}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            {notif.sender && (
                                                <p className="text-xs font-semibold text-slate-500">
                                                    {notif.sender.name}
                                                </p>
                                            )}
                                            <p className={`text-sm ${!notif.isRead ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: id })}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
