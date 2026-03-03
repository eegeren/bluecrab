'use client'
import { useEffect, useState } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { posts as postsApi, auth } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import PostCard from '@/components/post/PostCard'
import CommentSection from '@/components/post/CommentSection'
import Spinner from '@/components/ui/Spinner'
import type { Post, UserProfile } from '@/types'

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetches: Promise<unknown>[] = [
      postsApi.get(id).then(setPost),
    ]
    if (isLoggedIn()) fetches.push(auth.me().then(setCurrentUser))
    Promise.all(fetches).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!post) return <div className="text-center py-16 text-slate-400">Post not found</div>

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <PostCard
        post={post}
        currentUserId={currentUser?.id}
        onDelete={() => router.back()}
      />

      <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Comments</h2>
        <CommentSection postId={id} currentUser={currentUser ?? undefined} />
      </div>
    </div>
  )
}
