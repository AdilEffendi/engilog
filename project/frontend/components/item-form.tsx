"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { FLOOR_OPTIONS } from "@/lib/floor-utils"

interface ItemFormProps {
  onClose: () => void
  editingItem?: any
  onUpdate?: (id: string, data: any) => Promise<void>
}

export default function ItemForm({ onClose, editingItem, onUpdate }: ItemFormProps) {
  const { addItem, updateItem, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Safe parsing helper inside the component if needed, or just inline
  const parsePhotos = (photos: any): string[] => {
    if (!photos) return [];
    if (Array.isArray(photos)) return photos;
    if (typeof photos === 'string') {
      try {
        const parsed = JSON.parse(photos);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const [formData, setFormData] = useState({
    assetId: editingItem?.assetId || "",
    name: editingItem?.name || "",
    machineName: editingItem?.machineName || "",
    category: editingItem?.category || "Mesin",
    brand: editingItem?.brand || "",
    model: editingItem?.model || "",
    serialNumber: editingItem?.serialNumber || "",
    assetTag: editingItem?.assetTag || "",
    quantity: editingItem?.quantity || 1,
    location: editingItem?.location || "",
    description: editingItem?.description || "",
    latitude: editingItem?.latitude ?? -6.2088,
    longitude: editingItem?.longitude ?? 106.8456,
    statusMesin: editingItem?.statusMesin || "Normal",
    tingkatPrioritas: editingItem?.tingkatPrioritas || "Medium",
    kondisiFisik: editingItem?.kondisiFisik || "Bagus",
    jamOperasional: editingItem?.jamOperasional || "",
    floor: editingItem?.floor || 1,
    photos: parsePhotos(editingItem?.photos),
  })

  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])

  // Handler upload foto
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)

    // We add to newPhotoFiles state
    setNewPhotoFiles((prev) => [...prev, ...fileArray])

    // Create previews sequentially to maintain order mapping with newPhotoFiles
    const newPreviews: string[] = []
    for (const file of fileArray) {
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target?.result as string)
        reader.readAsDataURL(file)
      })
      newPreviews.push(preview)
    }

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPreviews],
    }))
  }

  const handleRemovePhoto = (index: number) => {
    const photoToRemove = formData.photos[index]
    const isNewPhoto = photoToRemove.startsWith("data:") || photoToRemove.startsWith("blob:")

    if (isNewPhoto) {
      // Find the index in newPhotoFiles
      // We count how many new photos were added before this index
      let newPhotoIdx = 0
      for (let i = 0; i < index; i++) {
        if (formData.photos[i].startsWith("data:") || formData.photos[i].startsWith("blob:")) {
          newPhotoIdx++
        }
      }
      setNewPhotoFiles((prev) => prev.filter((_, i) => i !== newPhotoIdx))
    }

    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const toastId = toast.loading(editingItem ? "Memperbarui item..." : "Menyimpan item...")

    const data = new FormData();
    // Append Text Fields
    Object.keys(formData).forEach(key => {
      if (key !== 'photos' && key !== 'latitude' && key !== 'longitude') {
        // @ts-ignore
        data.append(key, formData[key]);
      }
    });

    // Handle Numbers explicitly
    data.append('latitude', formData.latitude.toString());
    data.append('longitude', formData.longitude.toString());
    data.append('quantity', formData.quantity.toString());

    // Handle Existing Photos
    const existingPhotos = formData.photos.filter((p: string) => !p.startsWith("data:") && !p.startsWith("blob:"))
    if (editingItem) {
      data.append("existingPhotos", JSON.stringify(existingPhotos))
    } else if (existingPhotos.length > 0) {
      data.append("existingPhotos", JSON.stringify(existingPhotos))
    }

    // Handle New Photo Files
    newPhotoFiles.forEach(file => {
      data.append('photos', file);
    });

    // Add Creator ID if new
    if (!editingItem) {
      data.append('createdBy', user?.id || "");
    }

    try {
      if (editingItem) {
        if (onUpdate) {
          await onUpdate(editingItem.id, data)
        } else {
          await updateItem(editingItem.id, data)
        }
        toast.success("Item berhasil diperbarui!", { id: toastId })
      } else {
        await addItem(data)
        toast.success("Item berhasil ditambahkan!", { id: toastId })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save item:", error)
      toast.error("Gagal menyimpan item.", { id: toastId })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">{editingItem ? "Edit Item" : "Form Tambah Item"}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identitas Item */}
        <h2 className="text-lg font-bold text-foreground mb-2">Identitas Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">ID Item / Kode Item</label>
            <input
              type="text"
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nama Barang / Nama Mesin</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nama Mesin (Opsional)</label>
            <input
              type="text"
              value={formData.machineName}
              onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <option value="Mesin">Mesin</option>
              <option value="Tools">Tools</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Safety Equipment">Safety Equipment</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Brand / Merk</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Model / Tipe</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nomor Seri (Serial Number)</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nomor Inventaris / Item Tag</label>
            <input
              type="text"
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Kuantitas</label>
            <input
              type="number"
              value={formData.quantity === undefined || Number.isNaN(formData.quantity) ? "" : formData.quantity}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  quantity: value === "" ? "" : Number.parseInt(value)
                });
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              min="1"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Upload Foto */}
        <h2 className="text-lg font-bold text-foreground mb-2">Foto Item</h2>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          />
          {formData.photos.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {formData.photos.map((photo: string, idx: number) => (
                <div key={idx} className="relative group w-24 h-24">
                  <img
                    src={photo}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-border shadow-sm group-hover:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors hover:scale-110 active:scale-95"
                    title="Hapus Foto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[8px] text-center rounded-b-xl py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.startsWith("data:") ? "Baru" : "Tersimpan"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kondisi Item */}
        <h2 className="text-lg font-bold text-foreground mb-2">Kondisi Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status Mesin</label>
            <select
              value={formData.statusMesin}
              onChange={(e) => setFormData({ ...formData, statusMesin: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <option value="Normal">Normal</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rusak">Rusak</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Standby">Standby</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tingkat Prioritas</label>
            <select
              value={formData.tingkatPrioritas}
              onChange={(e) => setFormData({ ...formData, tingkatPrioritas: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Lantai</label>
            <select
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {FLOOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Kondisi Fisik</label>
            <select
              value={formData.kondisiFisik}
              onChange={(e) => setFormData({ ...formData, kondisiFisik: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <option value="Bagus">Bagus</option>
              <option value="Sedang">Sedang</option>
              <option value="Buruk">Buruk</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Jam Operasional Total (opsional)</label>
            <input
              type="number"
              value={formData.jamOperasional}
              onChange={(e) => setFormData({ ...formData, jamOperasional: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              min="0"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Lokasi</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Latitude</label>
            <input
              type="number"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: Number.parseFloat(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              step="0.0001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Longitude</label>
            <input
              type="number"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: Number.parseFloat(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              step="0.0001"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.assetId || !formData.name || !formData.location}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2 rounded-lg hover:shadow-lg hover:shadow-indigo-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? "Memproses..." : (editingItem ? "Perbarui" : "Simpan")}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
