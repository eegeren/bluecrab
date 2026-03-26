'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { groups } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import Spinner from '@/components/ui/Spinner'
import type { Group } from '@/types'

export default function GroupsPage() {
  const { show } = useToast()
  const fetcher = useCallback((page: number) => groups.list(page), [])
  const { items, loading, loadingMore, hasMore, error, sentinelRef } = useInfiniteScroll<Group>(fetcher)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Groups</h1>
        <Link href="/groups/new" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">
          Create Group
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : error ? (
        <p className="text-rose-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-slate-400">No groups yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(g => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                  onClick={() => show(`Opening ${g.name}`, 'info')}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">{g.name}</h2>
                  {g.is_private && <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Private</span>}
                </div>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{g.description || 'No description'}</p>
                <p className="text-xs text-slate-400 mt-3">{g.member_count} members</p>
              </Link>
            ))}
          </div>
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && <div className="flex justify-center"><Spinner /></div>}
          {!hasMore && items.length > 0 && <p className="text-xs text-center text-slate-400">All groups loaded.</p>}
        </>
      )}
    </div>
  )
}

