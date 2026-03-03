import Sidebar from '@/components/layout/Sidebar'
import RightPanel from '@/components/layout/RightPanel'
import BottomNav from '@/components/layout/BottomNav'
import NotificationPoller from '@/components/ui/NotificationPoller'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f6ff] dark:bg-[#030d1a]">
      <Sidebar />
      <main className="md:ml-64 xl:mr-72 min-h-screen pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6">
          {children}
        </div>
      </main>
      <RightPanel />
      <BottomNav />
      <NotificationPoller />
    </div>
  )
}
