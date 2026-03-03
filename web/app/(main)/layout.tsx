'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import Sidebar from '@/components/layout/Sidebar'
import RightPanel from '@/components/layout/RightPanel'
import BottomNav from '@/components/layout/BottomNav'
import NotificationPoller from '@/components/ui/NotificationPoller'
import { isLoggedIn } from '@/lib/auth'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const loggedIn = isLoggedIn()

  return (
    <div className="min-h-screen bg-[#f0f6ff] dark:bg-[#030d1a]">
      {loggedIn && (
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} width="300px" durationMs={100} overlay={true} />
      )}
      <main className={`${loggedIn ? 'lg:pl-72' : ''} min-h-screen pb-20 md:pb-6 transition-transform duration-150`}>
        <div className="sticky top-0 z-[70] bg-white dark:bg-[#0a1628] border-b border-blue-100 dark:border-[#162033]">
          <div className="flex items-center justify-between px-3 py-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {loggedIn && !sidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 active:scale-95 lg:hidden"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <Image
                src="/bluecrablogo.png"
                alt="BlueCrab"
                width={30}
                height={30}
                className="rounded-lg object-contain"
              />
              <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">Blue<span className="text-blue-500">Crab</span></span>
            </div>
            <div className="w-10 lg:hidden" />
          </div>
        </div>
        <div className={`${loggedIn ? 'xl:mr-72' : ''}`}>
          <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            {children}
          </div>
        </div>
      </main>
      {loggedIn && !sidebarOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="fixed left-3 top-1/2 transform -translate-y-1/2 z-[80] rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-md p-2 lg:hidden"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      <RightPanel />
      <BottomNav hidden={sidebarOpen || !loggedIn} />
      <NotificationPoller />
    </div>
  )
}
