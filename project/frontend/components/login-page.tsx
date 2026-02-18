"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, user: authUser } = useAuth()
  const router = useRouter()
  const [loginSuccess, setLoginSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const data = await login(username, password)
      setLoginSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1E293B] rounded-full mix-blend-multiply filter blur-[128px] opacity-5 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#334155] rounded-full mix-blend-multiply filter blur-[128px] opacity-5 animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-[500px] relative z-10 animate-in fade-in zoom-in-95 duration-1000 ease-out">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-5 md:p-10 border border-slate-100/50 backdrop-blur-xl">
          <div className="mb-4 md:mb-10 text-center space-y-1.5 md:space-y-2">
            <div className="flex justify-center mb-6 animate-in slide-in-from-top-8 duration-1000 delay-200 fill-mode-backwards">
              <div className="relative w-44 h-20 md:w-64 md:h-28">
                <Image
                  src="/Engilog-logov2.png"
                  alt="EngiLog Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-[#1E293B] tracking-tight animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-backwards">
              Selamat Datang Kembali
            </h1>
            <p className="text-slate-500 text-[10px] md:text-sm animate-in slide-in-from-bottom-4 duration-1000 delay-400 fill-mode-backwards">
              Akses dasbor teknik Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-6">
            <div className="space-y-4 md:space-y-4 animate-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-backwards">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Pengguna</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 md:px-5 md:py-4 rounded-xl border border-slate-200 bg-slate-50/50 text-[#1E293B] placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-[#1E293B]/10 focus:border-[#1E293B] focus:bg-white hover:bg-white hover:shadow-md hover:border-[#1E293B]/30 transition-all duration-300 transform motion-safe:hover:scale-[1.01] motion-safe:focus:scale-[1.01]"
                    placeholder="Nama Pengguna"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kata Sandi</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 md:px-5 md:py-4 rounded-xl border border-slate-200 bg-slate-50/50 text-[#1E293B] placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-[#1E293B]/10 focus:border-[#1E293B] focus:bg-white hover:bg-white hover:shadow-md hover:border-[#1E293B]/30 transition-all duration-300 transform motion-safe:hover:scale-[1.01] motion-safe:focus:scale-[1.01]"
                    placeholder="Kata Sandi"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {loginSuccess && authUser && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-300 text-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-emerald-600 font-bold">Login Berhasil!</p>
                </div>
                <div className="text-xs text-slate-500">
                  Masuk sebagai: <span className="font-bold text-[#1E293B] uppercase">{authUser.role}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">Mengalihkan ke dasbor...</p>
              </div>
            )}

            {!loginSuccess && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1E293B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0F172A] hover:shadow-lg hover:shadow-[#1E293B]/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-6 animate-in slide-in-from-bottom-8 duration-1000 delay-700 fill-mode-backwards"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sedang Masuk...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            )}
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in duration-1000 delay-1000 fill-mode-backwards">
            <button
              type="button"
              onClick={() => {
                const defaultUsers = [
                  {
                    id: "1",
                    name: "admin",
                    password: "password",
                    role: "admin",
                    passwordPlaintext: "password",
                    createdAt: new Date().toISOString(),
                  },
                  {
                    id: "2",
                    name: "superadmin",
                    password: "password",
                    role: "superadmin",
                    passwordPlaintext: "password",
                    createdAt: new Date().toISOString(),
                  },
                  {
                    id: "3",
                    name: "peminjam",
                    password: "peminjam",
                    role: "peminjam",
                    passwordPlaintext: "peminjam",
                    createdAt: new Date().toISOString(),
                  },
                  {
                    id: "4",
                    name: "teknisi",
                    password: "teknisi",
                    role: "teknisi",
                    passwordPlaintext: "teknisi",
                    createdAt: new Date().toISOString(),
                  },
                ]

                const defaultItems = [
                  // Pentacity Items
                  {
                    id: "1",
                    name: "Chiller 01",
                    description: "Chiller utama Pentacity untuk pendinginan area mall utama.",
                    category: "HVAC",
                    quantity: 1,
                    location: "Pentacity Mall - Lantai Dasar",
                    latitude: -1.274373808475422,
                    longitude: 116.85697235129511,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "AC-CH-01",
                    machineName: "Water Cooled Chiller",
                    brand: "York",
                    model: "YK Centrifugal",
                    serialNumber: "YK-2023-001",
                    assetTag: "AST-PENTA-HVAC-001",
                    statusMesin: "Normal",
                    tingkatPrioritas: "Critical",
                    kondisiFisik: "Bagus",
                    jamOperasional: "1250 Jam",
                  },
                  {
                    id: "2",
                    name: "Genset Utama",
                    description: "Genset backup Pentacity kapasitas 2000 kVA.",
                    category: "Power",
                    quantity: 1,
                    location: "Pentacity Mall - Basement",
                    latitude: -1.274383808475422,
                    longitude: 116.85698235129511,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "PW-GN-01",
                    machineName: "Diesel Generator Set",
                    brand: "Caterpillar",
                    model: "C175-16",
                    serialNumber: "CAT-2022-552",
                    assetTag: "AST-PENTA-PWR-001",
                    statusMesin: "Standby",
                    tingkatPrioritas: "High",
                    kondisiFisik: "Bagus",
                    jamOperasional: "150 Jam",
                  },
                  {
                    id: "3",
                    name: "Lift Penumpang 1",
                    description: "Lift pengunjung utama area atrium.",
                    category: "Transport",
                    quantity: 1,
                    location: "Pentacity Mall - Lt 1",
                    latitude: -1.274363808475422,
                    longitude: 116.85696235129511,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "TR-LF-01",
                    machineName: "Passenger Elevator",
                    brand: "Schindler",
                    model: "5500",
                    serialNumber: "SCH-2023-112",
                    assetTag: "AST-PENTA-TRN-001",
                    statusMesin: "Normal",
                    tingkatPrioritas: "High",
                    kondisiFisik: "Bagus",
                    jamOperasional: "3400 Jam",
                  },
                  {
                    id: "4",
                    name: "Pompa Transfer 1",
                    description: "Pompa air bersih transfer ke roof tank.",
                    category: "Plumbing",
                    quantity: 1,
                    location: "Pentacity Mall - Roof",
                    latitude: -1.274393808475422,
                    longitude: 116.85699235129511,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "PL-PM-01",
                    machineName: "Centrifugal Pump",
                    brand: "Grundfos",
                    model: "CR 45",
                    serialNumber: "GRU-2023-882",
                    assetTag: "AST-PENTA-PLB-001",
                    statusMesin: "Normal",
                    tingkatPrioritas: "Medium",
                    kondisiFisik: "Sedang",
                    jamOperasional: "5000 Jam",
                  },
                  {
                    id: "5",
                    name: "CCTV Lobby",
                    description: "Kamera pengawas lobby utama view entrance.",
                    category: "Security",
                    quantity: 1,
                    location: "Pentacity Mall - Lobby",
                    latitude: -1.274353808475422,
                    longitude: 116.85695235129511,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "SC-CC-01",
                    machineName: "IP Camera Dome",
                    brand: "Hikvision",
                    model: "DS-2CD2143G0-I",
                    serialNumber: "HIK-2023-991",
                    assetTag: "AST-PENTA-SEC-001",
                    statusMesin: "Normal",
                    tingkatPrioritas: "Medium",
                    kondisiFisik: "Bagus",
                    jamOperasional: "8760 Jam",
                  },
                  // Ewalk Items
                  {
                    id: "6",
                    name: "Chiller 02",
                    description: "Chiller utama Ewalk kapasitas 500 TR.",
                    category: "HVAC",
                    quantity: 1,
                    location: "Ewalk Mall - Lantai Dasar",
                    latitude: -1.273477250525186,
                    longitude: 116.85904186348648,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "AC-CH-02",
                    machineName: "Air Cooled Chiller",
                    brand: "Trane",
                    model: "RTAF",
                    serialNumber: "TRN-2021-443",
                    assetTag: "AST-EWALK-HVAC-002",
                    statusMesin: "Maintenance",
                    tingkatPrioritas: "Critical",
                    kondisiFisik: "Sedang",
                    jamOperasional: "12000 Jam",
                  },
                  {
                    id: "7",
                    name: "Panel LVMDP",
                    description: "Panel distribusi utama Ewalk supply tenant.",
                    category: "Power",
                    quantity: 1,
                    location: "Ewalk Mall - Basement",
                    latitude: -1.273487250525186,
                    longitude: 116.85905186348648,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "PW-PN-01",
                    machineName: "Main Distribution Panel",
                    brand: "Schneider",
                    model: "Prisma iPM",
                    serialNumber: "SCH-2020-112",
                    assetTag: "AST-EWALK-PWR-001",
                    statusMesin: "Normal",
                    tingkatPrioritas: "Critical",
                    kondisiFisik: "Bagus",
                    jamOperasional: "24000 Jam",
                  },
                  {
                    id: "8",
                    name: "Escalator Lt. 1",
                    description: "Eskalator naik ke Lt 1 area food court.",
                    category: "Transport",
                    quantity: 1,
                    location: "Ewalk Mall - Lt Dasar",
                    latitude: -1.273467250525186,
                    longitude: 116.85903186348648,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "TR-ES-01",
                    machineName: "Escalator",
                    brand: "Otis",
                    model: "Link",
                    serialNumber: "OT-2021-665",
                    assetTag: "AST-EWALK-TRN-001",
                    statusMesin: "Rusak",
                    tingkatPrioritas: "High",
                    kondisiFisik: "Buruk",
                    jamOperasional: "15000 Jam",
                  },
                  {
                    id: "9",
                    name: "Hydrant Pump",
                    description: "Pompa pemadam kebakaran electric main pump.",
                    category: "Safety",
                    quantity: 1,
                    location: "Ewalk Mall - Pump Room",
                    latitude: -1.273497250525186,
                    longitude: 116.85906186348648,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "SF-HP-01",
                    machineName: "Fire Hydrant Pump",
                    brand: "Ebara",
                    model: "FSHA",
                    serialNumber: "EBA-2022-331",
                    assetTag: "AST-EWALK-SFT-001",
                    statusMesin: "Standby",
                    tingkatPrioritas: "Critical",
                    kondisiFisik: "Bagus",
                    jamOperasional: "50 Jam",
                  },
                  {
                    id: "10",
                    name: "Sound System",
                    description: "Sistem audio atrium untuk event.",
                    category: "Audio",
                    quantity: 1,
                    location: "Ewalk Mall - Atrium",
                    latitude: -1.273457250525186,
                    longitude: 116.85902186348648,
                    status: "aktif",
                    createdBy: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    assetId: "AU-SY-01",
                    machineName: "PA System",
                    brand: "TOA",
                    model: "VX-2000",
                    serialNumber: "TOA-2023-111",
                    assetTag: "AST-EWALK-AUD-001",
                    statusMesin: "Normal",
                    tingkatPrioritas: "Low",
                    kondisiFisik: "Bagus",
                    jamOperasional: "2000 Jam",
                  },
                ]

                localStorage.setItem("users", JSON.stringify(defaultUsers))
                localStorage.setItem("items", JSON.stringify(defaultItems))
                localStorage.removeItem("currentUser")
                alert("Pengguna demo divalidasi!")
              }}
              className="w-full text-slate-400 text-xs font-medium hover:text-[#1E293B] transition-colors flex items-center justify-center gap-2 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              Muat Ulang Data Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
