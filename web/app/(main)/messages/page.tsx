'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth, messages as msgApi } from '@/lib/api'
import { formatDistanceToNow } from '@/lib/time'
import Avatar from '@/components/user/Avatar'
import { MessageSkeleton } from '@/components/ui/Skeleton'
import type { Conversation } from '@/types'

export default function MessagesPage() {
  const router = useRouter()
  const [convs, setConvs] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auth
      .me()
      .then(() => msgApi.conversations().then(setConvs))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5">Messages</h1>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {[0,1,2,3].map(i => <MessageSkeleton key={i} />)}
        </div>
      ) : convs.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {convs.map((c, i) => (
            <Link
              key={c.user.id}
              href={`/messages/${c.user.id}`}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}
            >
              <Avatar src={c.user.avatar_url} username={c.user.username} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`font-semibold text-slate-900 dark:text-slate-100 ${c.unread_count > 0 ? 'font-bold' : ''}`}>
                    {c.user.username}
                  </p>
                  <span className="text-xs text-slate-400">{formatDistanceToNow(c.updated_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${c.unread_count > 0 ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-400'}`}>
                    {c.last_message}
                  </p>
                  {c.unread_count > 0 && (
                    <span className="ml-2 min-w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shrink-0">
                      {c.unread_count > 9 ? '9+' : c.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
