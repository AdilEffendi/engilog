"use client"
import React, { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ConfirmationModal } from "@/components/confirmation-modal"

import { ReportModal } from "@/components/maintenance/report-modal"
import { ResolveModal } from "@/components/maintenance/resolve-modal"
import { EditMaintenanceModal } from "@/components/maintenance/edit-maintenance-modal"
import { TableImagePreview } from "@/components/table-image-preview"

// Helper for consistent date formatting
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-"
  try {
    return format(new Date(dateString), 'dd-MM-yy HH:mm')
  } catch (e) {
    return dateString
  }
}

export default function MaintenancePage() {
  const { items, users, updateItem, addMaintenanceRecord, user } = useAuth()
  const router = useRouter()

  const [filterStatus, setFilterStatus] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;


  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isResolveOpen, setIsResolveOpen] = useState(false)
  const [selectedItemForResolve, setSelectedItemForResolve] = useState<any>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<any>(null)

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    details: any | null;
  }>({
    isOpen: false,
    details: null
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeIssues = items.filter(i =>
      i.statusMesin === "Rusak" || i.statusMesin === "Maintenance"
    ).length
    const critical = items.filter(i => i.statusMesin === "Rusak").length
    const maintenance = items.filter(i => i.statusMesin === "Maintenance").length
    return { activeIssues, critical, maintenance }
  }, [items])

  // Get active maintenance items
  const activeMaintenanceItems = useMemo(() => {
    return items.filter(i =>
      i.statusMesin === "Rusak" || i.statusMesin === "Maintenance"
    ).sort((a, b) => {
      const dateA = a.maintenanceRecords?.length ? new Date(a.maintenanceRecords[a.maintenanceRecords.length - 1].tanggalKerusakan).getTime() : 0
      const dateB = b.maintenanceRecords?.length ? new Date(b.maintenanceRecords[b.maintenanceRecords.length - 1].tanggalKerusakan).getTime() : 0
      return dateB - dateA
    })
  }, [items])

  // Get maintenance history (flattened)
  const maintenanceHistory = useMemo(() => {
    const history: any[] = []
    items.forEach(item => {
      if (item.maintenanceRecords) {
        item.maintenanceRecords.forEach((rec: any) => {
          if (rec.kondisiAkhir && rec.kondisiAkhir !== "Belum Selesai") { // Only completed or historical records
            history.push({
              ...rec,
              itemId: item.id,
              itemName: item.name,
              assetId: item.assetId
            })
          }
        })
      }
    })
    return history.sort((a, b) => new Date(b.tanggalKerusakan).getTime() - new Date(a.tanggalKerusakan).getTime())
  }, [items])

  const filteredHistory = maintenanceHistory.filter(rec => {
    const matchesStatus = filterStatus === "All" || (rec.kondisiAkhir || "").includes(filterStatus)
    const matchesSearch =
      rec.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.assetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.penyebab?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Pagination Logic
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const currentItems = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResolveIssue = (item: any) => {
    setSelectedItemForResolve(item)
    setIsResolveOpen(true)
  }

  const handleDeleteRecord = (details: any) => {
    setDeleteConfirmation({
      isOpen: true,
      details: details
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.details) {
      const { item, record } = deleteConfirmation.details;
      try {
        const updatedRecordsFiltered = item.maintenanceRecords.filter((r: any) => r !== record);
        await updateItem(item.id, { maintenanceRecords: updatedRecordsFiltered });
      } catch (e) {
        console.error("Failed to delete", e);
      }
      setDeleteConfirmation({ isOpen: false, details: null });
    }
  };

  const handleEditRecord = (rec: any) => {
    setSelectedRecordForEdit(rec);
    setIsEditOpen(true);
  }

  const handleUpdateRecord = async (data: any) => {
    if (!selectedRecordForEdit) return;
    try {
      const API_URL = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? "http://localhost:5000" : "https://api.engilog.site") : "http://localhost:5000";
      const res = await fetch(`${API_URL}/items/${selectedRecordForEdit.itemId}/maintenance/${selectedRecordForEdit.id}`, {
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
    setIsEditOpen(false);
  }


  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Maintenance & Perbaikan</h1>
          <p className="text-slate-500 mt-1">Monitor status mesin dan riwayat perbaikan</p>
        </div>
        {(user?.role === "superadmin" || user?.role === "admin" || user?.role === "teknisi") && (
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Lapor Kerusakan</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <p className="text-slate-500 font-medium text-sm z-10 relative">Mesin Rusak</p>
          <p className="text-3xl font-bold text-slate-800 mt-2 z-10 relative">{stats.critical}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <p className="text-slate-500 font-medium text-sm z-10 relative">Dalam Perbaikan</p>
          <p className="text-3xl font-bold text-slate-800 mt-2 z-10 relative">{stats.maintenance}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <p className="text-slate-500 font-medium text-sm z-10 relative">Total Masalah Aktif</p>
          <p className="text-3xl font-bold text-slate-800 mt-2 z-10 relative">{stats.activeIssues}</p>
        </div>
      </div>

      {/* Active Issues Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Masalah Aktif
        </h2>

        {activeMaintenanceItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center py-12">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-800 font-semibold">Semua sistem normal</p>
            <p className="text-slate-500 text-sm mt-1">Tidak ada laporan kerusakan atau maintenance aktif saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeMaintenanceItems.map((item) => {
              const lastRecord = item.maintenanceRecords && item.maintenanceRecords.length > 0
                ? item.maintenanceRecords[item.maintenanceRecords.length - 1]
                : null;

              return (
                <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg font-bold text-slate-600">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{item.assetId} • {item.location}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.statusMesin === 'Rusak' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {item.statusMesin}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <p className="text-sm text-slate-500 mb-1">Masalah:</p>
                    <p className="font-semibold text-slate-800">{lastRecord ? lastRecord.penyebab : "Belum ada detail kerusakan"}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                        </svg>
                        {lastRecord ? formatDate(lastRecord.tanggalKerusakan) : "-"}
                      </span>
                    </div>
                  </div>

                  {(user?.role === "superadmin" || user?.role === "admin" || user?.role === "teknisi") && (
                    <button
                      onClick={() => handleResolveIssue(item)}
                      className="w-full py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                    >
                      Tindak Lanjuti
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800">Riwayat Perbaikan ({filteredHistory.length})</h2>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari riwayat..."
              className="p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Semua Status</option>
              <option value="Normal">Normal</option>
              <option value="Standby">Standby</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-2 py-2 md:px-4 md:py-3">Tanggal Lapor</th>
                <th className="px-2 py-2 md:px-4 md:py-3">Item</th>
                <th className="px-2 py-2 md:px-4 md:py-3">Masalah Awal</th>
                <th className="px-2 py-2 md:px-4 md:py-3">Perbaikan</th>
                <th className="px-2 py-2 md:px-4 md:py-3 text-center">Foto</th>
                <th className="px-2 py-2 md:px-4 md:py-3">Kondisi Akhir</th>
                <th className="px-2 py-2 md:px-4 md:py-3">Teknisi</th>
                <th className="px-2 py-2 md:px-4 md:py-3">Selesai</th>
                <th className="px-2 py-2 md:px-4 md:py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-2 py-4 md:px-4 md:py-6 text-center text-slate-500 italic">
                    Belum ada data riwayat yang cocok.
                  </td>
                </tr>
              ) : (
                currentItems.map((rec, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors group animate-in slide-in-from-bottom-2 fade-in duration-300"
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    <td className="px-2 py-2 md:px-4 md:py-3 font-mono text-slate-600 whitespace-nowrap">{formatDate(rec.tanggalKerusakan)}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3 min-w-[120px]">
                      <div className="font-bold text-slate-800 line-clamp-1">{rec.itemName}</div>
                      <div className="text-[10px] md:text-xs text-slate-400 line-clamp-1">{rec.assetId}</div>
                    </td>
                    <td className="px-2 py-2 md:px-4 md:py-3 text-slate-700 max-w-[100px] md:max-w-xs truncate" title={rec.penyebab}>{rec.penyebab}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3 text-slate-700 max-w-[100px] md:max-w-xs truncate" title={rec.tindakan}>{rec.tindakan || "-"}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3 flex justify-center">
                      {(() => {
                        // Parse photos safely
                        let photos = [];
                        try {
                          if (rec.foto) {
                            if (typeof rec.foto === 'string' && (rec.foto.startsWith('[') || rec.foto.startsWith('{'))) {
                              photos = JSON.parse(rec.foto);
                            } else {
                              photos = [rec.foto];
                            }
                          }
                        } catch (e) {
                          photos = rec.foto ? [rec.foto] : [];
                        }

                        if (!Array.isArray(photos)) photos = photos ? [photos] : [];
                        // Filter valid strings
                        photos = photos.filter((p: any) => typeof p === 'string' && p.length > 0);

                        return <TableImagePreview images={photos} />
                      })()}
                    </td>
                    <td className="px-2 py-2 md:px-4 md:py-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] md:text-xs font-medium ${(rec.kondisiAkhir || "").includes("Normal") ? "bg-emerald-100 text-emerald-700" :
                        (rec.kondisiAkhir || "").includes("Standby") ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                        {rec.kondisiAkhir}
                      </span>
                    </td>
                    <td className="px-2 py-2 md:px-4 md:py-3 text-slate-600 whitespace-nowrap">{rec.teknisi || "-"}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3 font-mono text-slate-600 text-[10px] whitespace-nowrap">{formatDate(rec.tanggalSelesai)}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3 text-center">
                      {(user?.role === "superadmin" || user?.role === "admin" || user?.role === "teknisi") && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditRecord(rec)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                            title="Edit Riwayat"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteRecord({ item: items.find(i => i.id === rec.itemId), record: rec })}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Hapus Riwayat"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {currentItems.length === 0 ? (
            <div className="text-center text-slate-500 italic py-8">
              Belum ada data riwayat yang cocok.
            </div>
          ) : (
            currentItems.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all animate-in slide-in-from-bottom-2 fade-in duration-300"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
                      {rec.itemName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{rec.itemName}</h4>
                      <p className="text-xs text-slate-500">{rec.assetId}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${(rec.kondisiAkhir || "").includes("Normal") ? "bg-emerald-100 text-emerald-700" :
                    (rec.kondisiAkhir || "").includes("Standby") ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                    {rec.kondisiAkhir}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Masalah</p>
                    <p className="text-sm text-slate-700 font-medium">{rec.penyebab}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Perbaikan</p>
                    <p className="text-sm text-slate-700">{rec.tindakan || "-"}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Teknisi</p>
                      <p className="text-sm text-slate-700">{rec.teknisi || "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Tanggal</p>
                      <p className="text-sm text-slate-700 font-mono">{formatDate(rec.tanggalKerusakan)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                  <div className="flex items-center gap-2">
                    {/* Photos */}
                    {(() => {
                      let photos = [];
                      try {
                        if (rec.foto) {
                          if (typeof rec.foto === 'string' && (rec.foto.startsWith('[') || rec.foto.startsWith('{'))) {
                            photos = JSON.parse(rec.foto);
                          } else {
                            photos = [rec.foto];
                          }
                        }
                      } catch (e) {
                        photos = rec.foto ? [rec.foto] : [];
                      }
                      if (!Array.isArray(photos)) photos = photos ? [photos] : [];
                      photos = photos.filter((p: any) => typeof p === 'string' && p.length > 0);
                      return <TableImagePreview images={photos} />
                    })()}
                  </div>
                  {(user?.role === "superadmin" || user?.role === "admin" || user?.role === "teknisi") && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditRecord(rec)}
                        className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <span className="text-xs font-semibold">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRecord({ item: items.find(i => i.id === rec.itemId), record: rec })}
                        className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

      </div>

      {isReportOpen && (
        <ReportModal
          items={items}
          users={users}
          onClose={() => setIsReportOpen(false)}
          onSubmit={async (data, files) => {
            const item = items.find(i => i.id === data.itemId);
            if (item) {
              const formData = new FormData();
              formData.append('tanggalKerusakan', data.tanggalKerusakan);
              formData.append('penyebab', data.penyebab);
              formData.append('statusMesin', data.statusAwal);
              formData.append('tindakan', data.tindakan || "");
              formData.append('teknisi', data.teknisi || "");
              formData.append('kondisiAkhir', data.statusAwal);

              if (files && files.length > 0) {
                Array.from(files).forEach((file: any) => {
                  formData.append('photos', file);
                });
              }

              try {
                await addMaintenanceRecord(item.id, formData);
              } catch (e) {
                console.error("Failed to report", e);
              }
            }
            setIsReportOpen(false)
          }}
        />
      )}

      {isResolveOpen && selectedItemForResolve && (
        <ResolveModal
          item={selectedItemForResolve}
          users={users}
          onClose={() => setIsResolveOpen(false)}
          onSubmit={async (resolveData, files) => {
            const formData = new FormData();

            // Determine previous status for transition arrow
            const records = selectedItemForResolve.maintenanceRecords || [];
            const lastRecord = records.length > 0 ? records[records.length - 1] : null;
            const lastStatus = selectedItemForResolve.statusMesin ||
              (lastRecord ? (lastRecord.kondisiAkhir || "Unknown") : "Unknown");

            const transitionString = lastStatus !== resolveData.kondisiAkhir
              ? `${lastStatus} ➔ ${resolveData.kondisiAkhir}`
              : resolveData.kondisiAkhir;

            formData.append('tanggalKerusakan', new Date().toISOString());
            formData.append('penyebab', "Penyelesaian Maintenance");
            formData.append('tindakan', resolveData.tindakan);
            formData.append('kondisiAkhir', transitionString);
            formData.append('teknisi', resolveData.teknisi);
            formData.append('tanggalSelesai', resolveData.tanggalSelesai);
            formData.append('statusMesin', resolveData.kondisiAkhir);

            if (files && files.length > 0) {
              Array.from(files).forEach((file: any) => {
                formData.append('photos', file);
              });
            }

            try {
              await addMaintenanceRecord(selectedItemForResolve.id, formData);
            } catch (e) {
              console.error("Failed to resolve", e);
            }
            setIsResolveOpen(false)
          }}
        />
      )}

      {/* Edit Maintenance Modal - Restored */}
      {isEditOpen && selectedRecordForEdit && (
        <EditMaintenanceModal
          record={selectedRecordForEdit}
          users={users}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleUpdateRecord}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus Riwayat Perbaikan"
        message={
          deleteConfirmation.details ? (
            <div className="space-y-3">
              <p>Apakah Anda yakin ingin menghapus data ini?</p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <p><span className="font-semibold">Barang:</span> {deleteConfirmation.details.item.name}</p>
                <p><span className="font-semibold">Masalah:</span> {deleteConfirmation.details.record.penyebab}</p>
                <p><span className="font-semibold">Tanggal:</span> {formatDate(deleteConfirmation.details.record.tanggalKerusakan)}</p>
              </div>
              <p className="text-red-500 font-semibold text-xs">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          ) : "Konfirmasi penghapusan data?"
        }
        confirmText="Hapus"
        variant="danger"
        doubleConfirm={true}
      />
    </div>
  )
}
