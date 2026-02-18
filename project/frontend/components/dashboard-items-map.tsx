"use client"

import { useAuth } from "@/context/auth-context"
import { useMemo, useState, useRef, useEffect } from "react"
import Map, { Marker, Popup, NavigationControl, FullscreenControl, Source, Layer } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import type { MapRef } from "react-map-gl/maplibre"
import maplibregl from "maplibre-gl"
import type { Feature, LineString } from "geojson"
import { toast } from "sonner"
import { getFloorLabel, FLOOR_MAPPING } from "@/lib/floor-utils"

export default function DashboardItemsMap() {

  const { items } = useAuth()
  const mapRef = useRef<MapRef>(null)
  const [popupInfo, setPopupInfo] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [navTarget, setNavTarget] = useState<any | null>(null)
  const [routeEnd, setRouteEnd] = useState<{ lat: number, lng: number } | null>(null)

  // Search & Floor State
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeFloor, setActiveFloor] = useState<number>(1)
  const [isFloorMenuOpen, setIsFloorMenuOpen] = useState(false)

  const markers = useMemo(() => {
    if (!items || !Array.isArray(items)) return []
    return items.filter((i) => i && i.latitude && i.longitude && (Number(i.floor || 1) === activeFloor))
  }, [items, activeFloor])

  // Filter items for search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return []
    return markers.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assetId && item.assetId.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, markers])

  // Initial View State (default POV)
  const initialViewState = useMemo(() => {
    return {
      longitude: 116.856972,
      latitude: -1.274373,
      zoom: 16,
      pitch: 50,
      bearing: -10,
    }
  }, [])

  // Get User Location & Watch Position
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error watching location:", error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  // Mobile Detection State
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [animProgress, setAnimProgress] = useState(0)

  // Auto-update navigation
  useEffect(() => {
    if (navTarget) {
      console.log("Navigating to:", navTarget)
      setRouteEnd({
        lat: Number(navTarget.latitude),
        lng: Number(navTarget.longitude)
      })
      // Reset animation
      setAnimProgress(0)

      // Animation Loop
      let start: number | null = null
      const duration = 4000 // 4 seconds animation

      const animate = (timestamp: number) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)

        setAnimProgress(progress)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)

    } else {
      setRouteEnd(null)
      setAnimProgress(0)
    }
  }, [navTarget])

  // Route GeoJSON
  const routeData = useMemo(() => {
    if (!userLocation || !routeEnd) return null

    // Calculate interpolated position for "growing" effect
    const startLng = Number(userLocation.lng)
    const startLat = Number(userLocation.lat)
    const endLng = Number(routeEnd.lng)
    const endLat = Number(routeEnd.lat)

    const currentLng = startLng + (endLng - startLng) * animProgress
    const currentLat = startLat + (endLat - startLat) * animProgress

    console.log("Generating Route:", { startLng, startLat, currentLng, currentLat, progress: animProgress })

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [startLng, startLat],
          [currentLng, currentLat]
        ]
      }
    } as Feature<LineString>
  }, [userLocation, routeEnd, animProgress])

  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        ...initialViewState,
        padding: { bottom: 0, top: 0, left: 0, right: 0 },
        duration: 3000,
        essential: true
      })
    }
  }

  const handleStopNavigation = () => {
    setNavTarget(null)
    setRouteEnd(null)
    setPopupInfo(null) // Also clear popup if open
    resetMapView()
  }

  // Handle "Navigate Here" click
  const handleNavigate = (target: any) => {
    setNavTarget(target)
    setPopupInfo(null)

    if (!userLocation) {
      // Just notify vaguely, don't block. We set navTarget, so once location arrives (via watchPosition), it will auto-route.
      console.log("Waiting for location to start navigation...")
      return
    }
    // Fly to fit bounds
    if (mapRef.current) {
      const bounds = new maplibregl.LngLatBounds()
        .extend([userLocation.lng, userLocation.lat])
        .extend([target.longitude, target.latitude])

      mapRef.current.fitBounds(bounds, {
        padding: isMobile ? 40 : 60,
        duration: 4000,
        pitch: 0,
        bearing: 0,
        essential: true
      })
    }
  }

  // Handle "Locate Me" click
  const handleLocateMe = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Browser Anda tidak mendukung geolokasi.")
      return
    }

    toast.info("Mencari lokasi Anda...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 17,
            pitch: 0,
            bearing: 0,
            duration: 2000,
            essential: true
          })
        }
        toast.success("Lokasi ditemukan!")
      },
      (error) => {
        console.error("Geolocation error:", error)
        let message = "Gagal mengambil lokasi."
        if (error.code === 1) message = "Akses lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda."
        if (error.code === 2) message = "Lokasi tidak tersedia (matikan VPN atau coba di luar ruangan)."
        if (error.code === 3) message = "Waktu pencarian lokasi habis."

        toast.error(message, {
          description: "Jika Anda menggunakan HP, pastikan website ini diakses melalui HTTPS."
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Handle Item Selection (from Search or Click)
  const handleSelectItem = (item: any) => {
    setPopupInfo(null) // Close existing popup first for re-animation effect
    setSearchQuery("") // Clear search
    setIsSearchOpen(false) // Close dropdown

    if (mapRef.current) {
      // Use dynamic padding based on current mobile state
      mapRef.current.flyTo({
        center: [item.longitude, item.latitude],
        zoom: 18,
        pitch: 60,
        bearing: 0,
        duration: 2500,
        padding: isMobile ? { bottom: 200, top: 0, left: 0, right: 0 } : { bottom: 0, top: 0, left: 0, right: 0 },
        essential: true
      })
    }

    // Small delay to allow map to start moving before showing popup
    setTimeout(() => {
      setPopupInfo(item)
    }, 500)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden mt-6 md:mt-8 flex flex-col h-[450px] md:h-[700px]">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50/50 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B]">Peta Sebaran Item (3D View)</h2>
          <p className="text-slate-500 text-sm mt-1">
            {navTarget ? "Navigasi aktif..." : "Cari barang atau jelajahi peta."}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group z-50">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm shadow-sm transition-all duration-300"
            placeholder="Cari Item (Contoh: Generator)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsSearchOpen(true)
            }}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)} // Delay to allow click
          />

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-100 max-h-60 overflow-auto z-50 animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="px-4 py-3 hover:bg-violet-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group/item"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-700 group-hover/item:text-violet-700">{item.name}</div>
                      <div className={`text-[10px] px-2 py-0.5 rounded-full ${item.statusMesin === "Rusak" ? "bg-red-100 text-red-600" :
                        item.statusMesin === "Maintenance" ? "bg-orange-100 text-orange-600" :
                          "bg-emerald-100 text-emerald-600"
                        }`}>
                        {item.statusMesin || "Normal"}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">{item.location}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                  Tidak ada barang ditemukan.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          attributionControl={false}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />

          {/* Custom Locate Me Button - Top Right below controls */}
          <div className="absolute top-28 right-2.5 z-10 flex flex-col gap-2">
            <button
              onClick={handleLocateMe}
              className="w-[29px] h-[29px] bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center justify-center shadow-sm transition-colors group"
              title="Cari Lokasi Saya"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0V5zM5 9.25a.75.75 0 000 1.5h.75a.75.75 0 000-1.5H5zM14.25 10a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zM10 14.25a.75.75 0 00-.75.75v.75a.75.75 0 001.5 0v-.75a.75.75 0 00-.75-.75z" clipRule="evenodd" />
                <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            </button>
          </div>

          {/* Route Source & Layer */}
          {routeData && (
            <Source id="route-source" type="geojson" data={routeData}>
              {/* Background Line (Halo) */}
              <Layer
                id="route-halo"
                type="line"
                paint={{
                  'line-color': '#ffffff',
                  'line-width': 6,
                  'line-opacity': 0.8
                }}
              />
              {/* Animated Foreground Line */}
              <Layer
                id="route-anim"
                type="line"
                layout={{
                  'line-join': 'miter',
                  'line-cap': 'butt'
                }}
                paint={{
                  'line-color': '#6366f1',
                  'line-width': 5,
                  'line-dasharray': [3, 3], // Tighter, consistent dashes
                }}
              />
            </Source>
          )}

          {/* User Location Marker */}
          {userLocation && (
            <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
              <div className="relative group/user">
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>
                <div className="relative w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                {/* Floating Label */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-xl whitespace-nowrap opacity-0 group-hover/user:opacity-100 md:opacity-100 transition-opacity pointer-events-none">
                  Lokasi Anda
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-blue-600"></div>
                </div>
              </div>
            </Marker>
          )}

          {markers.map((item) => (
            <Marker
              key={item.id}
              longitude={item.longitude}
              latitude={item.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                handleSelectItem(item) // Use the new smooth selection handler
              }}
            >
              <div
                className={`group relative cursor-pointer transform transition-transform duration-500 hover:scale-125 ${popupInfo?.id === item.id ? "scale-150 z-10" : "z-0"
                  }`}
              >
                {/* Ping Animation */}
                <div
                  className={`absolute -inset-2 rounded-full opacity-30 animate-ping ${item.statusMesin === "Rusak" || item.tingkatPrioritas === "Critical"
                    ? "bg-red-500"
                    : item.statusMesin === "Maintenance"
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                    }`}
                />

                {/* Marker Body */}
                <div
                  className={`relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${item.statusMesin === "Rusak" || item.tingkatPrioritas === "Critical"
                    ? "bg-red-500"
                    : item.statusMesin === "Maintenance"
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Stem for "floating" effect in 3D */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-400/50"></div>
                <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 rounded-full blur-[1px]"></div>
              </div>
            </Marker>
          ))}

          {/* Animated Floor Switcher Control - Bottom Left */}
          {/* Floor Switcher Control - Vertical Bottom Left */}
          <div className="absolute bottom-3 left-3 z-20 flex flex-col-reverse items-start gap-1">
            {/* Main Toggle Button */}
            <button
              onClick={() => setIsFloorMenuOpen(!isFloorMenuOpen)}
              className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg border-2 z-30
                ${isFloorMenuOpen
                  ? "bg-slate-800 border-slate-700 text-white rotate-180"
                  : "bg-indigo-600 border-indigo-500 text-white hover:scale-110"
                }`}
            >
              {isFloorMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 md:w-6 md:h-6">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              ) : (
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[6px] md:text-[9px] opacity-80 mb-px">Lantai</span>
                  <span className="text-[8px] md:text-xs">{getFloorLabel(activeFloor)}</span>
                </span>
              )}
            </button>

            {/* Expandable Menu - Vertical Stack */}
            {isFloorMenuOpen && (
              <div className="flex flex-col-reverse gap-1 animate-in slide-in-from-bottom-2 fade-in duration-300 mb-0.5">
                {Object.entries(FLOOR_MAPPING).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => {
                      setActiveFloor(parseInt(val))
                      setIsFloorMenuOpen(false)
                    }}
                    className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-[8px] md:text-[10px] transition-all shadow-md border-2 hover:scale-110
                      ${activeFloor === parseInt(val)
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-200/50"
                        : "bg-white/90 backdrop-blur-sm border-white text-slate-600 hover:bg-white"
                      }`}
                    title={`Lantai ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {navTarget && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={handleStopNavigation}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/30 transition-all font-bold text-sm hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
                Stop Navigasi
              </button>
            </div>
          )}

          {popupInfo && (
            <>
              {/* Desktop Popup - Hidden on Mobile via JS Check */}
              {!isMobile && (
                <Popup
                  anchor="top"
                  longitude={popupInfo.longitude}
                  latitude={popupInfo.latitude}
                  onClose={() => setPopupInfo(null)}
                  closeButton={false}
                  className="custom-map-popup"
                  maxWidth="240px"
                  offset={24}
                >
                  <div className="p-1 animate-in zoom-in-95 fade-in duration-300 origin-top">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {popupInfo.assetId || "NO ID"}
                      </span>
                      <button
                        onClick={() => setPopupInfo(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm mb-1">{popupInfo.name}</h3>
                    <p className="text-xs text-slate-500 mb-3 truncate">{popupInfo.location}</p>

                    <button
                      onClick={() => handleNavigate(popupInfo)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors shadow-sm mb-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.055 19.055 0 005.335 2.308z" clipRule="evenodd" />
                      </svg>
                      Arahkan ke Sini
                    </button>

                    <a
                      href={`/dashboard/items/${popupInfo.id}`}
                      className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg transition-colors"
                    >
                      Lihat Detail
                    </a>
                  </div>
                </Popup>
              )}

              {/* Mobile Floating Card - "Capsule" Style - Floats above bottom, margin on sides */}
              {isMobile && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-40 animate-in slide-in-from-bottom-10 fade-in duration-300 border border-slate-100/50">
                  {/* Handle bar removed - floating look doesn't need it as much, cleaner */}

                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${popupInfo.statusMesin === 'Rusak' ? 'bg-red-100 text-red-600' :
                          popupInfo.statusMesin === 'Maintenance' ? 'bg-orange-100 text-orange-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                          {popupInfo.statusMesin || "Normal"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">#{popupInfo.assetId}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{popupInfo.name}</h3>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{popupInfo.location}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopupInfo(null);
                        resetMapView(); // Reset zoom/padding when closing
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors shrink-0 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavigate(popupInfo)}
                      className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.055 19.055 0 005.335 2.308z" clipRule="evenodd" />
                      </svg>
                      Arahkan
                    </button>

                    <a
                      href={`/dashboard/items/${popupInfo.id}`}
                      className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                      Detail
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </Map>
      </div>
    </div >
  )
}
