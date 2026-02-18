"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

export default function UsersManagement() {
  const { users, addUser, deleteUser } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "peminjam" as "superadmin" | "admin" | "peminjam" | "teknisi",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const toastId = toast.loading("Menambahkan pengguna...")

    try {
      await addUser({
        name: formData.name,
        password: formData.password,
        role: formData.role,
      })
      toast.success("Pengguna berhasil ditambahkan!", { id: toastId })
      setFormData({ name: "", password: "", role: "peminjam" })
      setShowForm(false)
    } catch (error) {
      console.error("Failed to add user:", error)
      toast.error("Gagal menambahkan pengguna.", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Total {users.length} pengguna terdaftar</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
        >
          {showForm ? "Tutup Form" : "Tambah Pengguna"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-border">
          <h3 className="text-xl font-bold text-foreground mb-6">Tambah Pengguna Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nama Pengguna</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Kata Sandi</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="peminjam">Peminjam</option>
                  <option value="teknisi">Teknisi</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? "Menyimpan..." : "Tambah Pengguna"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
                className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 transition-colors font-semibold disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nama Pengguna</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Password</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Bergabung</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-bold">{user.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-indigo-600 bg-indigo-50/30">{user.passwordPlaintext || user.password || "********"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={async () => {
                        if (confirm("Yakin ingin menghapus pengguna ini?")) {
                          const tid = toast.loading("Menghapus pengguna...");
                          try {
                            await deleteUser(user.id);
                            toast.success("Pengguna berhasil dihapus", { id: tid });
                          } catch (e) {
                            toast.error("Gagal menghapus pengguna", { id: tid });
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-700 transition-colors font-semibold text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Users View */}
        <div className="md:hidden space-y-4 p-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{user.name}</h4>
                    <p className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                      {user.passwordPlaintext || user.password || "********"}
                    </p>
                  </div>
                </div>
                <span className="inline-block px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary capitalize">
                  {user.role}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <p className="text-xs text-slate-400">
                  Joined: {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </p>
                <button
                  onClick={async () => {
                    if (confirm("Yakin ingin menghapus pengguna ini?")) {
                      const tid = toast.loading("Menghapus pengguna...");
                      try {
                        await deleteUser(user.id);
                        toast.success("Pengguna berhasil dihapus", { id: tid });
                      } catch (e) {
                        toast.error("Gagal menghapus pengguna", { id: tid });
                      }
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  Hapus User
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
