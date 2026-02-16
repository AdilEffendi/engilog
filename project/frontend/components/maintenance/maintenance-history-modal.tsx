import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface MaintenanceHistoryModalProps {
    records: any[]
    onClose: () => void
    onEditRecord: (record: any) => void
    onZoomPhoto: (photo: string, photos: string[]) => void
}

export function MaintenanceHistoryModal({ records, onClose, onEditRecord, onZoomPhoto }: MaintenanceHistoryModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        document.body.style.overflow = "hidden"
        return () => {
            setMounted(false)
            document.body.style.overflow = "unset"
        }
    }, [])

    if (!mounted) return null

    // Reverse records for chronological timeline (newest on top)
    const sortedRecords = [...records].reverse()

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-full sm:h-[85vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Riwayat Perbaikan</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Total {records.length} Aktivitas</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                    {sortedRecords.length > 0 ? (
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-200 before:to-transparent">
                            {sortedRecords.map((record, idx) => {
                                // Photo Parsing Logic
                                let photos: string[] = []
                                try {
                                    if (record.foto) {
                                        if (typeof record.foto === "string") {
                                            if (record.foto.trim().startsWith("[") || record.foto.trim().startsWith("{")) {
                                                const parsed = JSON.parse(record.foto)
                                                photos = Array.isArray(parsed) ? parsed : [parsed]
                                            } else {
                                                photos = [record.foto]
                                            }
                                        } else if (Array.isArray(record.foto)) {
                                            photos = record.foto
                                        }
                                    }
                                } catch (e) {
                                    photos = []
                                }
                                const validPhotos = photos.filter((p: any) => typeof p === "string" && p.trim().length > 2)

                                const isNormal = (record.kondisiAkhir || "").includes("Normal")
                                const isRusak = (record.kondisiAkhir || "").includes("Rusak")
                                const isMaintenance = (record.kondisiAkhir || "").includes("Maintenance")

                                return (
                                    <div key={idx} className="relative pl-10 md:pl-12 group">
                                        {/* Timeline Node */}
                                        <div
                                            className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-110 z-10 flex items-center justify-center
                      ${isNormal ? "bg-emerald-500" : isRusak ? "bg-red-500" : isMaintenance ? "bg-orange-500" : "bg-slate-400"}`}
                                        >
                                            {isNormal ? (
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                            )}
                                        </div>

                                        {/* Content Card */}
                                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-100">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                                <div className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                                                    {record.penyebab || "Aktivitas Perbaikan"}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider
                            ${isNormal ? "bg-emerald-50 text-emerald-600" : isRusak ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
                                                        {record.kondisiAkhir || "Unknown"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                                                </svg>
                                                {record.tanggalKerusakan
                                                    ? new Date(record.tanggalKerusakan).toLocaleString("id-ID", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : "-"}
                                            </div>

                                            {record.tindakan && (
                                                <div className="bg-slate-50/80 rounded-xl p-4 text-xs md:text-sm text-slate-600 mb-4 border border-slate-100/50">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tindakan Diambil</div>
                                                    {record.tindakan}
                                                </div>
                                            )}

                                            {/* Photo Grid */}
                                            {validPhotos.length > 0 && (
                                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                                                    {validPhotos.map((photo, pIdx) => (
                                                        <div
                                                            key={pIdx}
                                                            onClick={() => onZoomPhoto(photo, validPhotos)}
                                                            className="aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all shadow-sm"
                                                        >
                                                            <img
                                                                src={
                                                                    photo.startsWith("http") || photo.startsWith("data:")
                                                                        ? photo
                                                                        : `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:5000${photo.startsWith("/") ? "" : "/"}${photo}`
                                                                }
                                                                alt="Maintenance proof"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                                                <div className="text-[10px] text-slate-400 italic">
                                                    Teknisi: <span className="font-bold text-slate-500 not-italic">{record.teknisi || "Internal"}</span>
                                                </div>
                                                <button
                                                    onClick={() => onEditRecord(record)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                                    </svg>
                                                    Edit Data
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 mb-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <p className="font-bold text-lg">Belum Ada Riwayat</p>
                            <p>Belum ada aktivitas perbaikan yang tercatat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
