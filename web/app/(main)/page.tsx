'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { feed as feedApi, auth, users as usersApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import PostCard from '@/components/post/PostCard'
import PostComposer from '@/components/post/PostComposer'
import StoryBar from '@/components/post/StoryBar'
import { PostSkeleton, StorySkeleton } from '@/components/ui/Skeleton'
import Spinner from '@/components/ui/Spinner'
import type { Post, UserProfile, UserPublic } from '@/types'

export default function FeedPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [following, setFollowing] = useState<UserPublic[]>([])
  const [authLoading, setAuthLoading] = useState(true)

  const fetcher = useCallback((page: number) => feedApi.get(page), [])
  const { items: posts, loading, loadingMore, hasMore, sentinelRef, prepend, remove } = useInfiniteScroll<Post>(fetcher)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    auth.me()
      .then(user => {
        setCurrentUser(user)
        usersApi.getFollowing(user.id).then(list => setFollowing(list as unknown as UserPublic[])).catch(() => {})
      })
      .catch(() => router.push('/login'))
      .finally(() => setAuthLoading(false))
  }, [router])

  if (authLoading || (loading && !currentUser)) {
    return (
      <div className="space-y-3">
        <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-blue-100 dark:border-[#162033] px-5 py-4">
          <div className="flex gap-5">
            {[0,1,2,3,4].map(i => <StorySkeleton key={i} />)}
          </div>
        </div>
        {[0,1,2].map(i => <PostSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {currentUser && (
        <StoryBar users={following.slice(0, 10)} currentUser={currentUser} />
      )}

      {currentUser && (
        <PostComposer currentUser={currentUser} onPost={post => prepend(post)} />
      )}

      {posts.length === 0 && !loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#0a1628] rounded-2xl border border-blue-100 dark:border-[#162033]">
          <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-300 dark:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Feed is empty</p>
          <p className="text-sm text-slate-400 mt-1">Follow people to fill your feed</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onDelete={id => remove(p => p.id === id)}
            />
          ))}

          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-sm text-slate-400 py-4">You've reached the end</p>
          )}
        </>
      )}
    </div>
  )
}


