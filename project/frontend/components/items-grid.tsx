"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/components/ui/alert-dialog"
import ItemForm from "./item-form"
import ItemCard from "./item-card"

export default function ItemsGrid() {
  // State
  const [fade, setFade] = useState(true)
  const { items, deleteItem, user } = useAuth()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState("semua")
  const [search, setSearch] = useState("")
  const [viewType, setViewType] = useState<'card' | 'table'>('card')

  // Filter status berdasarkan statusMesin
  let filteredItems = filter === "semua"
    ? items
    : items.filter((item) => item.statusMesin === filter)
  // Filter pencarian nama
  if (search.trim() !== "") {
    filteredItems = filteredItems.filter((item) =>
      item.name.toLowerCase().includes(search.trim().toLowerCase())
    )
  }

  // Trigger fade animation on change
  useEffect(() => {
    setFade(false)
    const timeout = setTimeout(() => setFade(true), 150)
    return () => clearTimeout(timeout)
  }, [viewType, filter, search])

  return (
    <div className="space-y-6 md:space-y-8 relative min-h-screen pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen Item</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Kelola seluruh inventaris mesin dan item Anda.</p>
        </div>
        {(user?.role === "superadmin" || user?.role === "admin") && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all font-semibold active:scale-95 w-full md:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            {showForm ? "Tutup Form" : "Tambah Item Baru"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
          <ItemForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Controls & Filters Bar */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-sm p-4 rounded-2xl flex flex-col gap-4 transition-all hover:shadow-md duration-300">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center w-full">
          {/* Search */}
          <div className="relative w-full xl:w-96 group order-2 xl:order-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama item, kode, atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* View Toggle (Desktop preferred position) */}
          <div className="hidden xl:flex bg-slate-100/50 p-1 rounded-xl order-1 xl:order-2">
            <button
              onClick={() => setViewType('card')}
              className={`p-2 rounded-lg transition-all ${viewType === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
              title="Card View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`p-2 rounded-lg transition-all ${viewType === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
              title="Table View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v11.5A2.25 2.25 0 0115.75 18H4.25A2.25 2.25 0 012 15.75V4.25zm4.25-.75a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V4.25a.75.75 0 00-.75-.75h-.75zm3 0a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V4.25a.75.75 0 00-.75-.75h-.75zm3 0a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V4.25a.75.75 0 00-.75-.75h-.75z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters - Wrapped on mobile for full visibility without scroll */}
        <div className="flex flex-col md:flex-row gap-4 w-full items-center justify-between">
          {/* Mobile View Toggle */}
          <div className="flex xl:hidden bg-slate-100/50 p-1 rounded-xl w-full md:w-auto justify-center">
            <button
              onClick={() => setViewType('card')}
              className={`flex-1 md:flex-none py-1.5 px-4 rounded-lg transition-all text-sm font-medium ${viewType === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`flex-1 md:flex-none py-1.5 px-4 rounded-lg transition-all text-sm font-medium ${viewType === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Table
            </button>
          </div>

          {/* Filter Buttons - Grid on mobile for alignment */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 w-full md:w-auto">
            {[
              { label: "Semua", value: "semua" },
              { label: "Normal", value: "Normal" },
              { label: "Maintenance", value: "Maintenance" },
              { label: "Critical", value: "Rusak" },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs font-semibold md:whitespace-nowrap transition-all border text-center ${filter === btn.value
                  ? btn.value === "Normal" ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm" :
                    btn.value === "Maintenance" ? "bg-orange-50 text-orange-600 border-orange-200 shadow-sm" :
                      btn.value === "Rusak" ? "bg-red-50 text-red-600 border-red-200 shadow-sm" :
                        "bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {
        filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-slate-900 font-semibold text-lg">Tidak ada item ditemukan</p>
            <p className="text-slate-500 text-sm mt-1">Coba ubah filter atau kata kunci percarian Anda.</p>
            {filter !== "semua" && (
              <button
                onClick={() => setFilter("semua")}
                className="mt-4 text-indigo-600 text-sm font-semibold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : viewType === 'card' ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6`}>
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  transitionDelay: fade ? `${idx * 75}ms` : '0ms',
                  transform: fade ? 'translateY(0)' : 'translateY(20px)',
                  opacity: fade ? 1 : 0,
                }}
                className="transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl rounded-xl"
              >
                <ItemCard item={item} onDelete={() => deleteItem(item.id)} />
              </div>
            ))}
          </div>
        ) : (
          <div className={`overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 transition-all duration-500 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-3 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nama & ID</th>
                    <th className="px-3 py-3 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Kategori</th>
                    <th className="px-3 py-3 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-3 py-3 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Stok</th>
                    <th className="px-3 py-3 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Lokasi</th>
                    <th className="px-3 py-3 text-right text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/30 transition-colors group cursor-default"
                      style={{
                        animation: `fadeInUp 0.5s ease-out forwards ${idx * 0.05}s`,
                        opacity: 0 // Start invisible for animation
                      }}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm group-hover:scale-110 transition-transform
                            ${item.statusMesin === "Normal" ? "bg-emerald-100 text-emerald-600" :
                              item.statusMesin === "Maintenance" ? "bg-orange-100 text-orange-600" :
                                "bg-red-100 text-red-600"
                            }
                        `}>
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <div
                              className="font-bold text-xs md:text-sm text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors"
                              onClick={() => router.push(`/dashboard/items/${item.id}`)}
                            >
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.assetId || "No ID"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold capitalize border ${item.statusMesin === "Normal" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          item.statusMesin === "Maintenance" ? "bg-orange-50 text-orange-600 border-orange-100" :
                            item.statusMesin === "Rusak" ? "bg-red-50 text-red-600 border-red-100" :
                              "bg-slate-50 text-slate-600 border-slate-100"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.statusMesin === "Normal" ? "bg-emerald-500" :
                            item.statusMesin === "Maintenance" ? "bg-orange-500" :
                              "bg-red-500"
                            }`}></span>
                          {item.statusMesin || "-"}
                        </span>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-[10px] md:text-xs font-semibold text-slate-700">{item.quantity} Unit</td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 opacity-70">
                            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.055 19.055 0 005.335 2.308zM7 9a3 3 0 116 0 3 3 0 01-6 0z" clipRule="evenodd" />
                          </svg>
                          {item.location}
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        {(user?.role === "superadmin" || user?.role === "admin") && (
                          <div className="flex justify-end gap-1 opacity-100">
                            <button
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              onClick={() => router.push(`/dashboard/items/${item.id}`)}
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                              </svg>
                            </button>
                            <AlertDialog open={deleteDialogOpen && itemToDelete?.id === item.id} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setItemToDelete(null); }}>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                  onClick={() => { setDeleteDialogOpen(true); setItemToDelete(item); }}
                                  title="Hapus"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <div className="space-y-4">
                                  <h3 className="text-lg font-bold text-foreground">Yakin ingin menghapus item <span className="text-primary">{item.name}</span>?</h3>
                                  <div className="flex gap-3 justify-end">
                                    <button
                                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200"
                                      onClick={() => { setDeleteDialogOpen(false); setItemToDelete(null); }}
                                    >Batal</button>
                                    <button
                                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                                      onClick={() => { deleteItem(item.id); setDeleteDialogOpen(false); setItemToDelete(null); }}
                                    >Hapus</button>
                                  </div>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div >
  )
}
