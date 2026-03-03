'use client'
import { useState, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import RightPanel from '@/components/layout/RightPanel'
import BottomNav from '@/components/layout/BottomNav'
import NotificationPoller from '@/components/ui/NotificationPoller'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="min-h-screen bg-[#f0f6ff] dark:bg-[#030d1a]">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className="md:ml-64 xl:mr-72 min-h-screen pb-20 md:pb-0">
        <div className="hidden md:block" />
        <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-[#0a1628] border-b border-blue-100 dark:border-[#162033]">
          <div className="flex items-center justify-between px-3 py-3 gap-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 active:scale-95"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-bold text-slate-900 dark:text-white text-center flex-1">Blue<span className="text-blue-500">Crab</span></span>
            <div className="w-10" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
          {children}
        </div>
      </main>
      <RightPanel />
      <BottomNav hidden={sidebarOpen} />
      <NotificationPoller />
    </div>
  )
}
