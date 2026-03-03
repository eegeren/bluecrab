'use client'
import { useEffect, useState } from 'react'
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

const typeIcon = (type: string) => {
  if (type === 'like') return (
    <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    </div>
  )
  if (type === 'comment') return (
    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
    </div>
  )
  return (
    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
      </svg>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const [list, setList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    notifApi.list()
      .then(data => {
        setList(data)
        notifApi.markRead().catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5">Notifications</h1>

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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {list.map((n, i) => (
            <div
              key={n.id}
              className={`flex items-center gap-4 px-5 py-4 ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''} ${i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}
            >
              <div className="relative">
                <Link href={`/profile/${n.actor.id}`}>
                  <Avatar src={n.actor.avatar_url} username={n.actor.username} size={44} />
                </Link>
                <div className="absolute -bottom-1 -right-1">
                  {typeIcon(n.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  <Link href={`/profile/${n.actor.id}`} className="font-semibold hover:text-blue-600 dark:hover:text-blue-400">
                    {n.actor.username}
                  </Link>
                  {' '}{typeLabel(n.type)}
                  {n.post_id && (
                    <> — <Link href={`/post/${n.post_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">view post</Link></>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(n.created_at)}</p>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

