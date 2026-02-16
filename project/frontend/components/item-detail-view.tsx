"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import ItemForm from "./item-form"
import ItemDetailMap from "./item-detail-map"
import { ImageGallery, PhotoModal, getImageUrl } from "@/components/image-gallery"
import { EditMaintenanceModal } from "@/components/maintenance/edit-maintenance-modal"
import { MaintenanceHistoryModal } from "@/components/maintenance/maintenance-history-modal"
import { LoanHistoryModal } from "./loan-history-modal"

interface ItemDetailViewProps {
  item: any
}

export default function ItemDetailView({ item }: ItemDetailViewProps) {
  const router = useRouter()
  const { updateItem, users, user } = useAuth()

  // Safely parse photos
  const itemPhotos: string[] = typeof item.photos === 'string'
    ? (tryParse(item.photos) || [])
    : (Array.isArray(item.photos) ? item.photos : []);

  // Helper for safe parsing
  function tryParse(str: string) {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // Helper untuk ambil nama user pembuat item
  const getCreatorName = (userId: string) => {
    const creator = users.find((u) => u.id === userId)
    return creator?.name || "Tidak diketahui"
  }

  const [historyZoomPhoto, setHistoryZoomPhoto] = useState<string | null>(null)
  const [historyZoomList, setHistoryZoomList] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isLoanHistoryModalOpen, setIsLoanHistoryModalOpen] = useState(false)

  // Record Editing State
  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false)
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<any>(null)

  const handleUpdate = async (id: string, data: any) => {
    await updateItem(id, data)
    setIsEditing(false)
  }

  const handleEditRecord = (rec: any) => {
    setSelectedRecordForEdit(rec);
    setIsEditRecordOpen(true);
  }

  const handleUpdateRecord = async (data: any) => {
    if (!selectedRecordForEdit) return;
    try {
      const API_URL = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? "http://localhost:5000" : "https://api.engilog.site") : "http://localhost:5000";
      const res = await fetch(`${API_URL}/items/${item.id}/maintenance/${selectedRecordForEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Gagal update data");
      }
    } catch (e) {
      console.error("Update failed", e);
    }
    setIsEditRecordOpen(false);
  }

  // Status Badge Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal": return "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20";
      case "Maintenance": return "bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/20";
      case "Rusak": return "bg-red-50 text-red-600 border-red-100 ring-red-500/20";
      case "Standby": return "bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/20";
      default: return "bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/20";
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-red-600 bg-red-50 border-red-100";
      case "High": return "text-orange-600 bg-orange-50 border-orange-100";
      case "Medium": return "text-yellow-600 bg-yellow-50 border-yellow-100";
      case "Low": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  }

  if (isEditing) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">Edit {item.name}</h1>
            <p className="text-slate-500">Perbarui informasi item ini.</p>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all font-semibold flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
              <path d="M4.25 4.25a.75.75 0 00-1.06 1.06L10 10.61l6.81-5.32a.75.75 0 10-1.06-1.06L10 8.49 4.25 4.25z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
            </svg>
            Batal Edit
          </button>
        </div>
        <ItemForm editingItem={item} onUpdate={handleUpdate} onClose={() => setIsEditing(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto space-y-3 md:space-y-4 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 bg-white/50 backdrop-blur-xl border border-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl sticky top-[60px] md:top-20 z-30 shadow-sm -mt-2 md:mt-0">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 md:p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            title="Kembali"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none line-clamp-1">{item.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-xs md:text-sm text-slate-500 font-mono">
              <span>{item.assetId || "NO ID"}</span>
              <span className="text-slate-300">•</span>
              <span>{item.category}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold ring-1 ring-inset ${getStatusColor(item.statusMesin)}`}>
            {item.statusMesin || "Unknown"}
          </span>
          {(user?.role === "superadmin" || user?.role === "admin") && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all font-semibold active:scale-95 text-xs md:text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4">
                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
              </svg>
              <span className="hidden md:inline">Edit Item</span>
              <span className="md:hidden">Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-12 gap-3 md:gap-6">

        {/* Left Column: Photos & Primary Stats (3 Spans) */}
        <div className="col-span-12 lg:col-span-3 space-y-3 md:space-y-6">
          {/* Photo Card */}
          <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
            <ImageGallery images={itemPhotos} />
          </div>

          {/* Quick Actions / Stats */}
          <div className="bg-slate-900 text-white p-4 md:p-5 rounded-xl md:rounded-2xl shadow-xl shadow-slate-200">
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-center">
              <div className="p-2 md:p-3 bg-white/10 rounded-lg md:rounded-xl backdrop-blur-sm">
                <div className="text-[10px] md:text-xs text-slate-300 uppercase tracking-wider font-bold mb-1">Kuantitas</div>
                <div className="text-xl md:text-2xl font-black">{item.quantity}</div>
                <div className="text-[9px] md:text-[10px] text-slate-400">Unit tersedia</div>
              </div>
              <div className="p-2 md:p-3 bg-white/10 rounded-lg md:rounded-xl backdrop-blur-sm">
                <div className="text-[10px] md:text-xs text-slate-300 uppercase tracking-wider font-bold mb-1">Total Jam</div>
                <div className="text-xl md:text-1xl font-black truncate">{item.jamOperasional || "0"}</div>
                <div className="text-[9px] md:text-[10px] text-slate-400">Jam Operasi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Detailed Specs (5 Spans) */}
        <div className="col-span-12 lg:col-span-5 space-y-3 md:space-y-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Spesifikasi Teknis</h3>
              <span className="text-[10px] md:text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-md">Detail Item</span>
            </div>
            <div className="p-0">
              <table className="w-full text-xs md:text-sm text-left">
                <tbody className="divide-y divide-slate-50">
                  {[
                    { l: "Nama Mesin", v: item.machineName },
                    { l: "Brand / Merk", v: item.brand },
                    { l: "Model / Tipe", v: item.model },
                    { l: "Serial Number", v: item.serialNumber, mono: true },
                    { l: "Asset Tag", v: item.assetTag, mono: true },
                    { l: "Lokasi Lantai", v: `Lantai ${item.floor || 1}` },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 md:px-6 md:py-3.5 text-slate-500 font-medium w-1/3">{row.l}</td>
                      <td className={`px-4 py-3 md:px-6 md:py-3.5 text-slate-800 font-semibold ${row.mono ? 'font-mono text-[10px] md:text-xs' : ''}`}>{row.v || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Kondisi & Status</h3>
            </div>
            <div className="p-4 md:p-6 grid grid-cols-2 gap-y-4 md:gap-y-6 gap-x-3 md:gap-x-4">
              <div>
                <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mb-1 md:mb-1.5">Priotitas</div>
                <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-xs font-bold border ${getPriorityColor(item.tingkatPrioritas)}`}>
                  {item.tingkatPrioritas || "Unset"}
                </span>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mb-1 md:mb-1.5">Kondisi Fisik</div>
                <div className="font-semibold text-slate-700 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${item.kondisiFisik === 'Bagus' ? 'bg-emerald-500' : item.kondisiFisik === 'Sedang' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                  {item.kondisiFisik || "-"}
                </div>
              </div>

              {/* Riwayat Peminjaman Section */}
              <div className="col-span-2 pt-4 border-t border-slate-100">
                <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mb-1 md:mb-1.5 flex items-center justify-between">
                  <span>Riwayat Peminjaman</span>
                  {item.loanRecords && item.loanRecords.length > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${item.loanRecords.some((r: any) => !r.returnDate) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      {item.loanRecords.some((r: any) => !r.returnDate) ? 'Sedang Dipinjam' : 'Tersedia'}
                    </span>
                  )}
                </div>
                {item.loanRecords && item.loanRecords.length > 0 ? (
                  <div className="space-y-3">
                    {[...item.loanRecords].reverse().slice(0, 2).map((record: any, idx: number) => (
                      <div key={idx} className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-slate-700 text-[11px] md:text-xs leading-tight">{record.borrowerName}</div>
                          <span className={`text-[8px] md:text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${record.returnDate ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600 animate-pulse'}`}>
                            {record.returnDate ? 'Kembali' : 'Dipinjam'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>{new Date(record.borrowDate).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{record.department}</span>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => setIsLoanHistoryModalOpen(true)}
                      className="w-full text-center text-xs text-blue-600 font-semibold hover:underline bg-blue-50/50 py-2 rounded-lg transition-colors hover:bg-blue-50"
                    >
                      Lihat Semua Peminjaman ({item.loanRecords.length})
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    Belum ada riwayat peminjaman.
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mb-1 md:mb-1.5">Riwayat Perbaikan</div>
                {item.maintenanceRecords && item.maintenanceRecords.length > 0 ? (
                  <div className="space-y-3">
                    {[...item.maintenanceRecords].reverse().slice(0, 3).map((record: any, idx: number) => {
                      // Parse and validate photos
                      let photos: string[] = [];
                      try {
                        if (record.foto) {
                          if (typeof record.foto === 'string') {
                            if (record.foto.trim().startsWith('[') || record.foto.trim().startsWith('{')) {
                              const parsed = JSON.parse(record.foto);
                              photos = Array.isArray(parsed) ? parsed : [parsed];
                            } else {
                              photos = [record.foto];
                            }
                          } else if (Array.isArray(record.foto)) {
                            photos = record.foto;
                          }
                        }
                      } catch (e) {
                        photos = [];
                      }

                      // Filter out empty strings or weird values and DEDUPLICATE
                      const validPhotos = Array.from(new Set(photos.filter((p: any) => typeof p === 'string' && p.trim().length > 2)));

                      return (
                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {record.tanggalKerusakan ? new Date(record.tanggalKerusakan).toLocaleString('id-ID', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${(record.kondisiAkhir || "").includes('Normal') ? 'bg-emerald-100 text-emerald-600' :
                              (record.kondisiAkhir || "").includes('Rusak') ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                              }`}>
                              {record.kondisiAkhir || 'Unknown'}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mb-0.5">{record.penyebab}</div>
                          {record.tindakan && (
                            <div className="text-[10px] text-slate-500 italic border-t border-slate-200 mt-1 pt-1">
                              <span className="font-semibold text-slate-400 mr-1">Tindakan:</span>
                              {record.tindakan}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {(user?.role === "superadmin" || user?.role === "admin" || user?.role === "teknisi") && (
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditRecord(record); }}
                                className="text-[10px] text-indigo-600 font-semibold hover:underline"
                              >
                                Edit Riwayat
                              </button>
                            </div>
                          )}

                          {/* Display Photos using Horizontal Scroll on Mobile */}
                          {validPhotos.length > 0 && (
                            <div className="mt-2 flex overflow-x-auto gap-2 pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent -mx-3 px-3 md:mx-0 md:px-0">
                              {validPhotos.slice(0, 5).map((src: any, pIdx: number) => (
                                <div key={pIdx} className="flex-shrink-0 snap-center w-16 h-16 md:w-12 md:h-12 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all relative group">
                                  <img
                                    src={src.startsWith('http') || src.startsWith('data:') ? src : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5000${src.startsWith('/') ? '' : '/'}${src}`}
                                    alt="Bukti"
                                    className="w-full h-full object-cover"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHistoryZoomList(validPhotos as string[]); // Set the full list for navigation
                                      setHistoryZoomPhoto(src);
                                    }}
                                  />
                                </div>
                              ))}
                              {validPhotos.length > 5 && (
                                <div className="flex-shrink-0 snap-center w-12 h-16 md:h-12 flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200">
                                    +{validPhotos.length - 5}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {item.maintenanceRecords.length > 3 && (
                      <button
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="w-full text-center text-xs text-indigo-600 font-semibold hover:underline bg-indigo-50/50 py-2 rounded-lg transition-colors hover:bg-indigo-50"
                      >
                        Lihat Semua Riwayat ({item.maintenanceRecords.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    Belum ada riwayat perbaikan.
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mb-1 md:mb-1.5">Deskripsi / Catatan</div>
                <div className="text-xs md:text-sm text-slate-600 bg-slate-50 p-3 rounded-lg md:rounded-xl border border-slate-100 min-h-[60px] md:min-h-[80px]">
                  {item.description || "Tidak ada deskripsi tambahan."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Location & History (4 Spans) */}
        <div className="col-span-12 lg:col-span-4 space-y-3 md:space-y-6">
          {/* Map Card */}
          <div className="bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 h-[280px] md:h-[400px] overflow-hidden">
            <ItemDetailMap item={item} />
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 md:px-5 md:py-3 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Informasi Penyimpanan</h3>
            </div>
            <div className="p-4 md:p-5 space-y-3 md:space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-50 text-indigo-600 p-1.5 md:p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.055 19.055 0 005.335 2.308z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Lokasi Saat Ini</div>
                  <div className="font-semibold text-slate-800 text-xs md:text-base">{item.location}</div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 flex items-start gap-3">
                <div className="bg-slate-100 text-slate-500 p-1.5 md:p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Terakhir Diupdate</div>
                    <div className="text-[9px] md:text-[10px] text-slate-400">{new Date(item.updatedAt).toLocaleTimeString()}</div>
                  </div>
                  <div className="font-semibold text-slate-800 text-xs md:text-sm">
                    {new Date(item.updatedAt).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-1">
                    Oleh: <span className="font-medium text-indigo-600">{getCreatorName(item.createdBy)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {historyZoomPhoto && (
        <PhotoModal
          src={historyZoomPhoto.startsWith('http') || historyZoomPhoto.startsWith('data:') ? historyZoomPhoto : getImageUrl(historyZoomPhoto, typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : "http://localhost:5000")}
          images={historyZoomList.map(p => p.startsWith('http') || p.startsWith('data:') ? p : getImageUrl(p, typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : "http://localhost:5000"))}
          onClose={() => setHistoryZoomPhoto(null)}
        />
      )}

      {isEditRecordOpen && selectedRecordForEdit && (
        <EditMaintenanceModal
          record={selectedRecordForEdit}
          users={users}
          onClose={() => setIsEditRecordOpen(false)}
          onSubmit={handleUpdateRecord}
        />
      )}

      {isHistoryModalOpen && (
        <MaintenanceHistoryModal
          records={item.maintenanceRecords}
          onClose={() => setIsHistoryModalOpen(false)}
          onEditRecord={(rec) => {
            setIsHistoryModalOpen(false);
            handleEditRecord(rec);
          }}
          onZoomPhoto={(photo, photos) => {
            setHistoryZoomList(photos);
            setHistoryZoomPhoto(photo);
          }}
        />
      )}

      {isLoanHistoryModalOpen && (
        <LoanHistoryModal
          records={item.loanRecords || []}
          onClose={() => setIsLoanHistoryModalOpen(false)}
        />
      )}
    </div>
  )
}
