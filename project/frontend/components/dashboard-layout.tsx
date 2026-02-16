"use client"

import React, { useState, useEffect } from "react"
import DashboardHeader from "@/components/dashboard-header"
import MobileBottomNav from "@/components/mobile-bottom-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
  }, [])

  return (
    <div className={`min-h-screen bg-slate-50/50 transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <DashboardHeader />

      {/* Main Content Area - padded to account for fixed header and mobile bottom nav */}
      <div className="pt-24 pb-24 md:pb-12 min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          {children}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}
