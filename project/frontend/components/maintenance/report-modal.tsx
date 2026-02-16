import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import { toast } from "sonner"

interface ReportModalProps {
    items: any[]
    users: any[]
    onClose: () => void
    onSubmit: (data: any, files: FileList | null) => Promise<void>
}

export function ReportModal({ items, users, onClose, onSubmit }: ReportModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string>("");
    const [itemSearch, setItemSearch] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);

    const [formData, setFormData] = useState({
        tanggalKerusakan: (() => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            return now.toISOString().slice(0, 16);
        })(),
        penyebab: "",
        tindakan: "Investigasi awal",
        teknisi: "",
        statusAwal: "Maintenance",
    });

    const selectedItemData = items.find(i => i.id === selectedItem);

    // Filter items based on search
    const filteredItems = items.filter((i: any) =>
        i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        (i.assetId || "").toLowerCase().includes(itemSearch.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd-MM-yy HH:mm')
        } catch { return dateString }
    }


    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Sedang mengirim laporan...");
        try {
            await onSubmit({ itemId: selectedItem, ...formData }, files);
            toast.success("Laporan berhasil terkirim!", { id: toastId });
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Gagal mengirim laporan. Silakan coba lagi.", { id: toastId });
            setIsSubmitting(false); // Only allow retry if it failed
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {step === 1 ? "Pilih Item Bermasalah" : step === 2 ? "Detail Laporan" : "Konfirmasi Laporan"}
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
                            <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-red-600' : 'w-2 bg-slate-200'}`} />
                        ))}
                    </div>

                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                <p className="text-sm text-slate-500 mb-2">Silakan pilih item yang ingin dilaporkan kerusakannya.</p>
                            </div>

                            <div className="relative">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase block">Daftar Item</label>
                                    <input
                                        type="text"
                                        placeholder="Cari item..."
                                        className="text-xs p-1 px-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={itemSearch}
                                        onChange={(e) => setItemSearch(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                                    {filteredItems.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-400">Item tidak ditemukan.</div>
                                    ) : (
                                        filteredItems.map((item: any) => (
                                            <div
                                                key={item.id}
                                                onClick={() => !isSubmitting && setSelectedItem(item.id)}
                                                className={`p-3 border-b border-slate-100 last:border-0 cursor-pointer transition-colors flex items-center justify-between group ${selectedItem === item.id ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${selectedItem === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className={`font-semibold text-sm ${selectedItem === item.id ? 'text-indigo-900' : 'text-slate-700'}`}>{item.name}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{item.assetId} • {item.location}</div>
                                                    </div>
                                                </div>
                                                {selectedItem === item.id && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-600">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-4">
                            {/* Selected Item Summary */}
                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg font-bold text-indigo-600 border border-indigo-100">
                                        {selectedItemData?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-indigo-900 text-sm">{selectedItemData?.name}</p>
                                        <p className="text-xs text-indigo-600">{selectedItemData?.assetId}</p>
                                    </div>
                                </div>
                                <button onClick={() => !isSubmitting && setStep(1)} disabled={isSubmitting} className="text-xs text-indigo-500 underline font-semibold hover:text-indigo-700 disabled:opacity-50">Ubah</button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul / Penyebab Masalah</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    placeholder="Contoh: Mesin mati total, Bunyi bising..."
                                    value={formData.penyebab}
                                    onChange={e => setFormData({ ...formData, penyebab: e.target.value })}
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal & Jam Kejadian</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.tanggalKerusakan}
                                        onChange={e => setFormData({ ...formData, tanggalKerusakan: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Item (Wajib)</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.statusAwal}
                                        onChange={e => setFormData({ ...formData, statusAwal: e.target.value })}
                                        disabled={isSubmitting}
                                    >
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Rusak">Rusak</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Foto (Opsional)</label>
                                <div className={`relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors ${isSubmitting ? 'opacity-50' : ''}`}>
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        accept="image/*"
                                        multiple // Allow multiple files
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
                                            <span className="text-sm">Klik untuk upload foto (Bisa banyak)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        // Step 3: Confirmation
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>

                            <h4 className="text-xl font-bold text-slate-800">Konfirmasi Pelaporan</h4>
                            <p className="text-slate-500 text-sm">Apakah Anda yakin data berikut sudah benar?</p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                    <span className="text-slate-500 text-sm">Item:</span>
                                    <span className="font-bold text-slate-700 text-sm">{selectedItemData?.name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-sm block mb-1">Masalah:</span>
                                    <p className="text-red-600 font-bold text-md break-words">
                                        {formData.penyebab}
                                    </p>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Ubah Status Jadi:</span>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                                        {formData.statusAwal}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Tanggal:</span>
                                    <span className="text-slate-700 text-sm font-medium">{formatDate(formData.tanggalKerusakan)}</span>
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
                            disabled={step === 1 ? !selectedItem : !formData.penyebab || isSubmitting}
                            onClick={() => setStep(step + 1)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                            Lanjut
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg shadow-red-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                <span>Kirim Laporan</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
        , document.body)
}

