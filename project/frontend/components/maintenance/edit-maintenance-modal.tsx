import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import { toast } from "sonner"

interface EditMaintenanceModalProps {
    record: any
    users: any[] // For technician selection if needed
    onClose: () => void
    onSubmit: (data: any) => Promise<void>
}

export function EditMaintenanceModal({ record, users, onClose, onSubmit }: EditMaintenanceModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        tanggalKerusakan: record.tanggalKerusakan ? new Date(record.tanggalKerusakan).toISOString().slice(0, 16) : "",
        penyebab: record.penyebab || "",
        tindakan: record.tindakan || "",
        teknisi: record.teknisi || "",
        kondisiAkhir: record.kondisiAkhir || "Maintenance",
        statusMesin: record.kondisiAkhir || "Maintenance" // Sync with condition initially
    });

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Memperbarui riwayat...");
        try {
            await onSubmit(formData);
            toast.success("Riwayat berhasil diperbarui!", { id: toastId });
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Gagal memperbarui riwayat.", { id: toastId });
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] h-auto">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Edit Riwayat Perbaikan</h3>
                    <button onClick={onClose} disabled={isSubmitting} className="p-1 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-500">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal & Jam</label>
                        <input
                            type="datetime-local"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.tanggalKerusakan}
                            onChange={e => handleChange('tanggalKerusakan', e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Penyebab / Masalah</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                            value={formData.penyebab}
                            onChange={e => handleChange('penyebab', e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tindakan Perbaikan</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                            value={formData.tindakan}
                            onChange={e => handleChange('tindakan', e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teknisi</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.teknisi}
                                onChange={e => handleChange('teknisi', e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kondisi Akhir</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.kondisiAkhir}
                                onChange={e => handleChange('kondisiAkhir', e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="Normal">Normal</option>
                                <option value="Standby">Standby</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Rusak">Rusak</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-semibold disabled:opacity-50">Batal</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
