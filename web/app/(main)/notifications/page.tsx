'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { notifications as notifApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { formatDistanceToNow } from '@/lib/time'
import Avatar from '@/components/user/Avatar'
import { NotificationSkeleton } from '@/components/ui/Skeleton'
import type { Notification } from '@/types'

const typeLabel = (type: string) => {
  if (type === 'like') return 'liked your post'
  if (type === 'comment') return 'commented on your post'
  if (type === 'follow') return 'started following you'
  return ''
}

const typePreview = (type: Notification['type']) => {
  if (type === 'like') return 'They appreciated what you shared.'
  if (type === 'comment') return 'New feedback is waiting for you.'
  if (type === 'follow') return 'They will now see your future updates.'
  return ''
}

const iconStyles: Record<Notification['type'], { bg: string; glow: string; path: string }> = {
  like: {
    bg: 'from-rose-100 to-rose-200 dark:from-rose-900/20 dark:to-rose-900/40',
    glow: 'text-rose-500',
    path: 'M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z',
  },
  comment: {
    bg: 'from-sky-100 to-indigo-100 dark:from-sky-900/20 dark:to-indigo-900/30',
    glow: 'text-sky-500',
    path: 'M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z',
  },
  follow: {
    bg: 'from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30',
    glow: 'text-indigo-500',
    path: 'M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z',
  },
}

const typeIcon = (type: Notification['type']) => {
  const style = iconStyles[type]
  return (
    <div className={`w-8 h-8 rounded-2xl bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-inner shadow-white/40 dark:shadow-transparent`}>
      <svg className={`w-4 h-4 ${style.glow}`} viewBox="0 0 20 20" fill="currentColor">
        <path d={style.path} fillRule="evenodd" clipRule="evenodd" />
      </svg>
    </div>
  )
}

const getSectionLabel = (date: Date) => {
  const today = new Date()
  const diffDays = Math.floor((today.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

const buildSections = (items: Notification[]) => {
  const sorted = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return sorted.reduce<{ label: string; items: Notification[] }[]>((acc, item) => {
    const label = getSectionLabel(new Date(item.created_at))
    const existing = acc.find(section => section.label === label)
    if (existing) existing.items.push(item)
    else acc.push({ label, items: [item] })
    return acc
  }, [])
}

export default function NotificationsPage() {
  const router = useRouter()
  const [list, setList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    notifApi.list()
      .then(data => {
        setList(data)
      })
      .finally(() => setLoading(false))
  }, [router])

  const unreadCount = useMemo(() => list.filter(n => !n.is_read).length, [list])
  const sections = useMemo(() => buildSections(list), [list])

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return
    setMarkingAll(true)
    try {
      await notifApi.markRead()
      setList(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{unreadCount} unread updates</p>
        </div>
        <button
          onClick={handleMarkAll}
          disabled={unreadCount === 0 || markingAll}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {markingAll ? 'Marking…' : 'Mark all as read'}
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {[0,1,2,3,4].map(i => <NotificationSkeleton key={i} />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map(section => (
            <div key={section.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/60 text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                {section.label}
              </div>
              {section.items.map((n, index) => (
                <div
                  key={n.id}
                  className={`flex flex-wrap items-center gap-4 px-5 py-4 ${!n.is_read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''} ${index > 0 ? 'border-t border-slate-100 dark:border-slate-800/70' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <Link href={`/profile/${n.actor.id}`}>
                        <Avatar src={n.actor.avatar_url} username={n.actor.username} size={46} />
                      </Link>
                      <div className="absolute -bottom-1 -right-1">{typeIcon(n.type)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-slate-900 dark:text-slate-100">
                        <Link href={`/profile/${n.actor.id}`} className="font-semibold hover:text-blue-600 dark:hover:text-blue-400">
                          {n.actor.username}
                        </Link>
                        <span className="text-slate-500 dark:text-slate-400"> {typeLabel(n.type)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(n.created_at)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{typePreview(n.type)}</p>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {n.post_id && (
                      <Link
                        href={`/post/${n.post_id}`}
                        className="rounded-full border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/10"
                      >
                        View post
                      </Link>
                    )}
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shadow shadow-blue-500/40" />}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

