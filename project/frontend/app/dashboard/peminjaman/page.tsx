"use client"
import React, { useState, useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { toast } from "sonner"

// Helper for consistent date formatting
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-"
    try {
        return format(new Date(dateString), 'dd-MM-yy HH:mm')
    } catch (e) {
        return dateString
    }
}

export default function PeminjamanPage() {
    const { items, users, updateItem } = useAuth()
    const router = useRouter()
    const { user, isLoading } = useAuth()

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push("/")
        }
    }, [user, isLoading, router])

    // State for Modals
    const [isLoanOpen, setIsLoanOpen] = useState(false)
    const [isReturnOpen, setIsReturnOpen] = useState(false)
    const [selectedItemForReturn, setSelectedItemForReturn] = useState<any>(null)

    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        recordId: string;
        itemId: string;
        originalIdx: number;
        details?: {
            item: any;
            record: any;
        }
    }>({
        isOpen: false,
        recordId: "",
        itemId: "",
        originalIdx: -1
    })

    // Filtered Logic for Active Loans
    const activeLoans = useMemo(() => {
        return items.filter(item => item.statusMesin === "Dipinjam")
    }, [items])

    // Aggregated History Logic
    const loanHistory = useMemo(() => {
        const allRecords: any[] = []
        items.forEach(item => {
            if (item.loanRecords && item.loanRecords.length > 0) {
                item.loanRecords.forEach((rec: any, idx: number) => {
                    allRecords.push({
                        ...rec,
                        itemId: item.id,
                        itemName: item.name,
                        assetId: item.assetId,
                        id: `${item.id}-${idx}`, // Virtual ID
                        originalIdx: idx
                    })
                })
            }
        })
        // Sort by date (newest first)
        return allRecords.sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
    }, [items])

    const [searchTerm, setSearchTerm] = useState("")
    const filteredHistory = loanHistory.filter(rec =>
        (rec.itemName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.borrowerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.department || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleReturnItem = (item: any) => {
        setSelectedItemForReturn(item)
        setIsReturnOpen(true)
    }

    const handleDeleteRecord = (recordId: string, itemId: string, originalIdx: number) => {
        const item = items.find(i => i.id === itemId)
        const record = item?.loanRecords?.[originalIdx]

        if (item && record) {
            setDeleteConfirmation({
                isOpen: true,
                recordId,
                itemId,
                originalIdx,
                details: { item, record }
            })
        }
    }

    const confirmDelete = async () => {
        const { itemId, originalIdx } = deleteConfirmation;
        const item = items.find(i => i.id === itemId)

        if (item && item.loanRecords) {
            const newRecords = [...item.loanRecords]
            if (originalIdx >= 0 && originalIdx < newRecords.length) {
                newRecords.splice(originalIdx, 1)
                await updateItem(itemId, { loanRecords: newRecords })
            }
        }
        setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))
    }

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Peminjaman Item</h1>
                        <p className="text-slate-500 mt-1">Kelola peminjaman dan pengembalian item perusahaan.</p>
                    </div>
                    {(user?.role === "superadmin" || user?.role === "admin" || user?.role === "teknisi") && (
                        <button
                            onClick={() => setIsLoanOpen(true)}
                            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all font-semibold active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            Pinjam Item Baru
                        </button>
                    )}
                </div>

                {/* Active Loans Section */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        Sedang Dipinjam ({activeLoans.length})
                    </h2>

                    {activeLoans.length === 0 ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-blue-800">Semua item tersedia!</p>
                            <p className="text-blue-600 text-sm">Tidak ada item yang sedang dipinjam saat ini.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeLoans.map(item => {
                                const lastLoan = item.loanRecords?.[item.loanRecords.length - 1]
                                return (
                                    <div key={item.id} className="bg-white border border-blue-100 shadow-xl shadow-blue-50 rounded-2xl p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600">
                                                Dipinjam
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl font-bold text-slate-600">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => router.push(`/dashboard/items/${item.id}`)}>{item.name}</h3>
                                                <p className="text-xs text-slate-500 font-mono">{item.assetId || "No ID"}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Peminjam</p>
                                                <p className="text-slate-800 font-semibold">{lastLoan?.borrowerName || "-"}</p>
                                                <p className="text-xs text-slate-500">{lastLoan?.department || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Waktu Pinjam</p>
                                                <p className="text-slate-700 text-sm flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-400">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                                                    </svg>
                                                    {formatDate(lastLoan?.borrowDate)}
                                                </p>
                                            </div>
                                        </div>

                                        {(user?.role === "superadmin" || user?.role === "admin" || user?.role === "teknisi") && (
                                            <button
                                                onClick={() => handleReturnItem(item)}
                                                className="w-full py-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-sm flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h12.5A2.25 2.25 0 0118.5 6v12.5H1.5V6zM4.5 9.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm11.25-4.496v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 011.5 0z" />
                                                </svg>
                                                Proses Pengembalian
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* History Section */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Riwayat Peminjaman</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari peminjam, item..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-3 text-slate-400">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Peminjam</th>
                                    <th className="px-6 py-4">Departemen</th>
                                    <th className="px-6 py-4">Waktu Pinjam</th>
                                    <th className="px-6 py-4">Waktu Kembali</th>
                                    <th className="px-6 py-4">Diterima Oleh</th>
                                    <th className="px-6 py-4">Kondisi</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-slate-500 italic">
                                            Belum ada data riwayat peminjaman.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{rec.itemName}</div>
                                                <div className="text-xs text-slate-400">{rec.assetId}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{rec.borrowerName}</td>
                                            <td className="px-6 py-4 text-slate-700">{rec.department}</td>
                                            <td className="px-6 py-4 text-slate-600">{formatDate(rec.borrowDate)}</td>
                                            <td className="px-6 py-4 text-slate-600">{formatDate(rec.returnDate)}</td>
                                            <td className="px-6 py-4 text-slate-600">{rec.returnedBy || "-"}</td>
                                            <td className="px-6 py-4">
                                                {rec.condition ? (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${rec.condition === "Normal" ? "bg-emerald-100 text-emerald-700" :
                                                        rec.condition === "Rusak" ? "bg-red-100 text-red-700" :
                                                            "bg-slate-100 text-slate-700"
                                                        }`}>
                                                        {rec.condition}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-blue-500 italic">Sedang Dipinjam</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {(user?.role === "superadmin" || user?.role === "admin" || user?.role === "teknisi") && (
                                                    <button
                                                        onClick={() => handleDeleteRecord(rec.id, rec.itemId, rec.originalIdx)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Riwayat"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Loan Modal */}
            {isLoanOpen && (
                <LoanModal
                    items={items.filter(i => i.statusMesin !== "Dipinjam" && i.statusMesin !== "Rusak")} // Only available items
                    onClose={() => setIsLoanOpen(false)}
                    onSubmit={async (data) => {
                        const item = items.find(i => i.id === data.itemId)
                        if (item) {
                            const newRecords = [...(item.loanRecords || []), data.record]
                            await updateItem(item.id, {
                                statusMesin: "Dipinjam",
                                loanRecords: newRecords
                            })
                        }
                        setIsLoanOpen(false)
                    }}
                />
            )}

            {/* Return Modal */}
            {isReturnOpen && selectedItemForReturn && (
                <ReturnModal
                    item={selectedItemForReturn}
                    onClose={() => setIsReturnOpen(false)}
                    onSubmit={async (data) => {
                        if (selectedItemForReturn.loanRecords && selectedItemForReturn.loanRecords.length > 0) {
                            const newRecords = [...selectedItemForReturn.loanRecords]
                            const lastIdx = newRecords.length - 1
                            newRecords[lastIdx] = {
                                ...newRecords[lastIdx],
                                ...data
                            }
                            await updateItem(selectedItemForReturn.id, {
                                statusMesin: data.condition,
                                loanRecords: newRecords
                            })
                        }
                        setIsReturnOpen(false)
                    }}
                />
            )}
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                title="Hapus Riwayat Peminjaman"
                message={
                    deleteConfirmation.details ? (
                        <div className="space-y-3">
                            <p>Apakah Anda yakin ingin menghapus data ini?</p>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                                <p><span className="font-semibold">Item:</span> {deleteConfirmation.details.item.name}</p>
                                <p><span className="font-semibold">Peminjam:</span> {deleteConfirmation.details.record.borrowerName}</p>
                                <p><span className="font-semibold">Tanggal:</span> {formatDate(deleteConfirmation.details.record.borrowDate)}</p>
                            </div>
                            <p className="text-red-500 font-semibold text-xs">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    ) : "Konfirmasi penghapusan data?"
                }
                confirmText="Hapus"
                variant="danger"
                doubleConfirm={true}
            />

        </>
    )
}

function LoanModal({ items, onClose, onSubmit }: { items: any[], onClose: () => void, onSubmit: (data: any) => Promise<void> }) {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedItemId, setSelectedItemId] = useState("")
    const [itemSearch, setItemSearch] = useState("")
    const [formData, setFormData] = useState({
        borrowerName: "",
        department: "",
        borrowDate: new Date().toISOString(),
        notes: ""
    })

    const selectedItem = items.find(i => i.id === selectedItemId)
    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        (i.assetId || "").toLowerCase().includes(itemSearch.toLowerCase())
    )

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Memproses peminjaman...");
        try {
            await onSubmit({ itemId: selectedItemId, record: formData });
            toast.success("Peminjaman berhasil dikonfirmasi!", { id: toastId });
        } catch (error) {
            console.error("Loan error:", error);
            toast.error("Gagal memproses peminjaman.", { id: toastId });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {step === 1 ? "Pilih Item" : "Data Peminjam"}
                    </h3>
                    <button onClick={onClose} disabled={isSubmitting} className="p-1 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-500">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Cari item tersedia..."
                                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                autoFocus
                                disabled={isSubmitting}
                            />
                            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                                {filteredItems.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-400">Tidak ada item tersedia.</div>
                                ) : (
                                    filteredItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => !isSubmitting && setSelectedItemId(item.id)}
                                            className={`p-3 border-b border-slate-100 flex items-center gap-3 ${selectedItemId === item.id ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50'} ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        >
                                            <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-600">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{item.name}</div>
                                                <div className="text-xs text-slate-400">{item.assetId}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg font-bold text-indigo-600 border border-indigo-100">
                                        {selectedItem?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-indigo-900 text-sm">{selectedItem?.name}</p>
                                        <p className="text-xs text-indigo-600">{selectedItem?.assetId}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Peminjam</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                    value={formData.borrowerName}
                                    onChange={e => setFormData({ ...formData, borrowerName: e.target.value })}
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waktu Pinjam</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                    value={formData.borrowDate.slice(0, 16)}
                                    onChange={e => setFormData({ ...formData, borrowDate: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departemen / Divisi</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan (Opsional)</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    {step === 2 && (
                        <button onClick={() => setStep(1)} disabled={isSubmitting} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold disabled:opacity-50">Kembali</button>
                    )}
                    {step === 1 ? (
                        <button
                            disabled={!selectedItemId || isSubmitting}
                            onClick={() => setStep(2)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            Lanjut
                        </button>
                    ) : (
                        <button
                            disabled={!formData.borrowerName || !formData.department || isSubmitting}
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isSubmitting ? "Memproses..." : "Konfirmasi Peminjaman"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function ReturnModal({ item, onClose, onSubmit }: { item: any, onClose: () => void, onSubmit: (data: any) => Promise<void> }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        returnedBy: "",
        returnDate: new Date().toISOString(),
        condition: "Normal",
        notes: ""
    })

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Memproses pengembalian...");
        try {
            await onSubmit(formData);
            toast.success("Item berhasil dikembalikan!", { id: toastId });
        } catch (error) {
            console.error("Return error:", error);
            toast.error("Gagal memproses pengembalian.", { id: toastId });
            setIsSubmitting(false);
        }
    };

    // Get last loan details
    const lastLoan = item.loanRecords?.[item.loanRecords.length - 1]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Pengembalian Item</h3>
                    <button onClick={onClose} disabled={isSubmitting} className="p-1 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-500">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg font-bold text-blue-600 border border-blue-100">
                                {item.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-blue-900 text-sm">{item.name}</p>
                                <p className="text-xs text-blue-600">{item.assetId}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-blue-400 block mb-1">Peminjam</span>
                                <span className="text-blue-800 font-semibold">{lastLoan?.borrowerName}</span>
                            </div>
                            <div>
                                <span className="text-blue-400 block mb-1">Tgl Pinjam</span>
                                <span className="text-blue-800 font-semibold">{formatDate(lastLoan?.borrowDate)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diterima / Dikembalikan Oleh</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                            value={formData.returnedBy}
                            onChange={e => setFormData({ ...formData, returnedBy: e.target.value })}
                            autoFocus
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kondisi Item</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                                value={formData.condition}
                                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                disabled={isSubmitting}
                            >
                                <option value="Normal">Normal</option>
                                <option value="Rusak">Rusak</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tgl Kembali</label>
                            <input
                                type="datetime-local"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                                value={formData.returnDate.slice(0, 16)} // Format for datetime-local
                                onChange={e => setFormData({ ...formData, returnDate: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Tambahan</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                            rows={2}
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        disabled={!formData.returnedBy || isSubmitting}
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-emerald-200 flex items-center gap-2"
                    >
                        {isSubmitting && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSubmitting ? "Memproses..." : "Selesaikan"}
                    </button>
                </div>
            </div>
        </div>
    )
}
