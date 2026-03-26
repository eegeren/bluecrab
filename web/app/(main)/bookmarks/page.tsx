'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, bookmarks } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import PostCard from '@/components/post/PostCard'
import Spinner from '@/components/ui/Spinner'
import type { Post, UserProfile } from '@/types'

export default function BookmarksPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  const fetcher = useCallback((page: number) => bookmarks.list(page), [])
  const { items, remove, loading, loadingMore, hasMore, error, sentinelRef } = useInfiniteScroll<Post>(fetcher)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login')
      return
    }
    auth.me().then(setCurrentUser).catch(() => router.push('/login'))
  }, [router])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Bookmarks</h1>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : error ? (
        <p className="text-rose-500">{error}</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-400">
          No saved posts yet.
        </div>
      ) : (
        <>
          {items.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onDelete={() => remove(x => x.id === post.id)}
            />
          ))}
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && <div className="flex justify-center"><Spinner /></div>}
          {!hasMore && items.length > 0 && <p className="text-xs text-slate-400 text-center">All saved posts loaded.</p>}
        </>
      )}
    </div>
  )
}


