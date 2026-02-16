"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import { toast } from "sonner"

interface ResolveModalProps {
    item: any
    users: any[]
    onClose: () => void
    onSubmit: (data: any, files: FileList | null) => Promise<void>
}

export function ResolveModal({ item, users, onClose, onSubmit }: ResolveModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);

    const [formData, setFormData] = useState({
        tindakan: "",
        kondisiAkhir: "Normal", // Default to normal
        teknisi: "",
        tanggalSelesai: (() => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            return now.toISOString().slice(0, 16);
        })()
    });

    const lastIssue = item.maintenanceRecords && item.maintenanceRecords.length > 0
        ? item.maintenanceRecords[item.maintenanceRecords.length - 1]
        : { penyebab: "Tidak ada data", tanggalKerusakan: null };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Normal": return "bg-emerald-100 text-emerald-700";
            case "Standby": return "bg-blue-100 text-blue-700";
            case "Rusak": return "bg-red-100 text-red-700";
            case "Maintenance": return "bg-orange-100 text-orange-700";
            default: return "bg-slate-100 text-slate-700";
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        try {
            return format(new Date(dateString), 'dd-MM-yy HH:mm')
        } catch { return dateString }
    }


    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Sedang menyimpan penyelesaian...");
        try {
            await onSubmit(formData, files);
            toast.success("Perbaikan berhasil disimpan!", { id: toastId });
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Gagal menyimpan data. Silakan coba lagi.", { id: toastId });
            setIsSubmitting(false); // Only allow retry if it failed
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {step === 1 ? "Detail Barang & Masalah" : step === 2 ? "Form Perbaikan" : "Konfirmasi Penyelesaian"}
                    </h3>
                    <button onClick={onClose} disabled={isSubmitting} className="p-1 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-500">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mb-6 justify-center">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} />
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 shadow-sm">
                                        {item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{item.name}</h4>
                                        <p className="text-sm text-slate-500 font-mono">{item.assetId}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-slate-500">Lokasi:</span>
                                            <span className="text-xs font-semibold text-slate-700">{item.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h5 className="text-sm font-bold text-slate-500 uppercase">Keluhan / Masalah Awal</h5>
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-900">
                                    <p className="font-medium text-lg leading-relaxed">{lastIssue.penyebab}</p>
                                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                                        </svg>
                                        Dilaporkan: {formatDate(lastIssue.tanggalKerusakan)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600 shrink-0 mt-0.5">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-blue-800">
                                    Pastikan Anda sudah memeriksa barang secara fisik sebelum melanjutkan ke form perbaikan.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Perbaikan yang Dilakukan</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Jelaskan detail perbaikan, sparepart yang diganti, dll..."
                                    rows={4}
                                    value={formData.tindakan}
                                    onChange={e => setFormData({ ...formData, tindakan: e.target.value })}
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kondisi Akhir Barang</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Normal", "Standby", "Rusak", "Maintenance"].map((status) => (
                                            <div
                                                key={status}
                                                onClick={() => !isSubmitting && setFormData({ ...formData, kondisiAkhir: status })}
                                                className={`p-2 rounded-lg border cursor-pointer text-center transition-all ${formData.kondisiAkhir === status
                                                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                                    : 'border-slate-200 hover:bg-slate-50'
                                                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className={`text-xs font-bold ${formData.kondisiAkhir === status ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    {status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teknisi</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Nama Teknisi..."
                                        value={formData.teknisi}
                                        onChange={e => setFormData({ ...formData, teknisi: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Selesai</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.tanggalSelesai}
                                    onChange={e => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Bukti Perbaikan (Opsional)</label>
                                <div className={`relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors ${isSubmitting ? 'opacity-50' : ''}`}>
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        accept="image/*"
                                        multiple // Allow multi-file
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setFiles(e.target.files);
                                            }
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    {files && files.length > 0 ? (
                                        <div className="flex flex-col items-center justify-center gap-1 text-indigo-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-semibold text-sm">{files.length} Foto Dipilih</span>
                                            <span className="text-xs text-slate-400 max-w-[200px] truncate">{Array.from(files).map(f => f.name).join(', ')}</span>
                                        </div>
                                    ) : (
                                        <div className="text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                            <span className="text-sm">Klik untuk upload bukti foto</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h4 className="text-xl font-bold text-slate-800">Konfirmasi Penyelesaian</h4>
                            <p className="text-slate-500">Pastikan data berikut sudah benar sebelum menyimpan laporan ini.</p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Status Baru:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(formData.kondisiAkhir)}`}>
                                        {formData.kondisiAkhir}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Teknisi:</span>
                                    <span className="font-semibold text-slate-700 text-sm">{formData.teknisi || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-sm block mb-1">Tindakan Perbaikan:</span>
                                    <p className="text-slate-800 font-medium text-sm bg-white p-2 border border-slate-100 rounded-lg">
                                        {formData.tindakan}
                                    </p>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Tanggal Selesai:</span>
                                    <span className="font-semibold text-slate-700 text-sm">{formatDate(formData.tanggalSelesai)}</span>
                                </div>
                                {files && files.length > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-sm">Foto:</span>
                                        <span className="text-slate-700 text-sm font-medium italic">{files.length} file</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-semibold disabled:opacity-50"
                        >
                            Kembali
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 2 && (!formData.tindakan || !formData.teknisi || isSubmitting)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                            Lanjut
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Menunggu...</span>
                                </>
                            ) : (
                                <span>Simpan & Selesai</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
        , document.body)
}

