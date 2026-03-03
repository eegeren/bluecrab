'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth, notifications as notifApi, messages as msgApi } from '@/lib/api'
import { removeToken, isLoggedIn } from '@/lib/auth'
import Avatar from '@/components/user/Avatar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import type { UserProfile } from '@/types'

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Explore',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    badge: 'msg' as const,
  },
  {
    href: '/friends',
    label: 'Friends',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H2v-2a4 4 0 014-4h3m4-6a4 4 0 11-8 0 4 4 0 018 0zm6 2a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/groups',
    label: 'Groups',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10m-7 5h7M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    href: '/forum',
    label: 'Forum',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.818L3 20l1.376-3.673C3.512 15.14 3 13.61 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/bookmarks',
    label: 'Bookmarks',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    badge: 'notif' as const,
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onToggle?: () => void
  width?: string // e.g. '300px' or '50vw'
  durationMs?: number
  overlay?: boolean
}

export default function Sidebar({ isOpen = false, onClose, onToggle, width = '72vw', durationMs = 300, overlay = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [unread, setUnread] = useState(0)
  const [unreadMsg, setUnreadMsg] = useState(0)
  const [logoSrc, setLogoSrc] = useState('/bluecrablogo.png?v=20260302')

  // Uncontrolled fallback: if parent doesn't pass isOpen/onToggle, we manage open state here
  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen

  useEffect(() => {
    if (!isLoggedIn()) return
    auth.me().then(setUser).catch(() => {})
    notifApi.unreadCount().then(r => setUnread(r.count)).catch(() => {})
    msgApi.unreadCount().then(r => setUnreadMsg(r.count)).catch(() => {})
  }, [])

  useEffect(() => {
    if (open) closeMenu()
  }, [pathname]) 

  useEffect(() => {

    return () => {}
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const closeMenu = () => {
    onClose?.()
    setInternalOpen(false)
  }

  const toggle = () => {
    if (onToggle) return onToggle()
    // uncontrolled fallback
    setInternalOpen(v => !v)
  }

  const logout = () => {
    removeToken()
    closeMenu()
    router.push('/login')
  }

  return (
    <>
      {/* Floating toggle button (bottom-left) */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="fixed bottom-4 left-4 z-[95] inline-flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow w-12 h-12"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Optional overlay */}
      {open && overlay && (
        <div
          className="fixed inset-0 z-[85] bg-black/40 cursor-pointer lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/** compute width and duration classes dynamically **/}
      <aside className={`fixed left-0 top-0 h-full bg-white dark:bg-[#0a1628] border-r border-blue-100 dark:border-[#162033] flex flex-col py-6 px-4 z-[90] transition-transform overflow-y-auto ${
        (width ? `w-[${width}] max-w-[300px] lg:w-72 lg:max-w-72` : 'w-[72vw] max-w-[300px] lg:w-72 lg:max-w-72') + ' ' +
        `duration-[${durationMs}ms] ` +
        (open ? 'translate-x-0 lg:translate-x-0' : '-translate-x-full lg:-translate-x-full')
      }`}>
      <div className="mb-8 flex items-start justify-between gap-2">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-3 px-2 group min-w-0 flex-1">
          <Image
            src={logoSrc}
            alt="BlueCrab"
            width={56}
            height={56}
            unoptimized
            onError={() => setLogoSrc('/blue-crab.svg')}
            className="rounded-xl object-contain shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow"
          />
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
            Blue<span className="text-blue-500">Crab</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all relative ${
                active
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {item.icon(active)}
              <span>{item.label}</span>
              {item.badge === 'notif' && unread > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
              {item.badge === 'msg' && unreadMsg > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMsg > 9 ? '9+' : unreadMsg}
                </span>
              )}
            </Link>
          )
        })}

        {user && (
          <Link
            href={`/profile/${user.id}`}
            onClick={closeMenu}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
              pathname.startsWith('/profile')
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <svg className="w-6 h-6" fill={pathname.startsWith('/profile') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-blue-100 dark:border-[#162033] pt-4 mt-4">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
          <ThemeToggle />
        </div>
        {user ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <Avatar src={user.avatar_url} username={user.username} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.username}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <Link href="/login" onClick={closeMenu} className="block px-3 py-2 text-sm font-semibold text-blue-500 dark:text-blue-400 hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </aside>
    </>
  )
}
