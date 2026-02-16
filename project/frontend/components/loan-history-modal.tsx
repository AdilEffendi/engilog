import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface LoanHistoryModalProps {
    records: any[]
    onClose: () => void
}

export function LoanHistoryModal({ records, onClose }: LoanHistoryModalProps) {
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
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shadow-sm">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Riwayat Peminjaman</h2>
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
                <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar bg-slate-50/30">
                    {sortedRecords.length > 0 ? (
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-slate-200 before:to-transparent">
                            {sortedRecords.map((record, idx) => {
                                const isReturned = !!record.returnDate

                                return (
                                    <div key={idx} className="relative pl-10 md:pl-12 group">
                                        {/* Timeline Node */}
                                        <div
                                            className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-110 z-10 flex items-center justify-center
                      ${isReturned ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`}
                                        >
                                            {isReturned ? (
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Content Card */}
                                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group-hover:border-blue-100">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                                <div className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                                                    {record.borrowerName}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider
                            ${isReturned ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                                        {isReturned ? "Sudah Kembali" : "Sedang Dipinjam"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departemen</div>
                                                    <div className="text-xs font-semibold text-slate-600">{record.department || "-"}</div>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kondisi</div>
                                                    <div className="text-xs font-semibold text-slate-600">{record.condition || "-"}</div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50/80 rounded-xl p-4 space-y-3 border border-slate-100/50">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500 font-medium">Tanggal Pinjam:</span>
                                                    <span className="font-bold text-slate-700">
                                                        {new Date(record.borrowDate).toLocaleString("id-ID", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                                                    <span className="text-slate-500 font-medium">Tanggal Kembali:</span>
                                                    <span className={`${isReturned ? 'font-bold text-slate-700' : 'italic text-slate-400'}`}>
                                                        {isReturned
                                                            ? new Date(record.returnDate).toLocaleString("id-ID", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })
                                                            : "Belum kembali"}
                                                    </span>
                                                </div>
                                            </div>

                                            {record.notes && (
                                                <div className="mt-4 px-3 py-2 bg-indigo-50/30 rounded-lg text-xs md:text-sm text-slate-600 italic border-l-2 border-indigo-200">
                                                    "{record.notes}"
                                                </div>
                                            )}

                                            {record.returnedBy && isReturned && (
                                                <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-50">
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        Diterima oleh: <span className="text-slate-600 font-bold">{record.returnedBy}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 mb-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            <p className="font-bold text-lg">Belum Ada Riwayat Pinjam</p>
                            <p>Belum ada aktivitas peminjaman untuk item ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
