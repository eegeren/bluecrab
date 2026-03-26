'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from '@/lib/time'
import { posts } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import Avatar from '@/components/user/Avatar'
import ImageLightbox from '@/components/ui/ImageLightbox'
import type { Post } from '@/types'

interface Props {
  post: Post
  currentUserId?: string
  onDelete?: (id: string) => void
  compact?: boolean
}

export default function PostCard({ post, currentUserId, onDelete, compact }: Props) {
  const { show } = useToast()
  const [liked, setLiked] = useState(post.is_liked)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [likePop, setLikePop] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked)

  const toggleLike = async () => {
    if (!currentUserId) {
      show('Sign in to like', 'info')
      return
    }
    const prev = liked
    setLiked(!prev)
    setLikeCount(c => (prev ? c - 1 : c + 1))
    if (!prev) {
      setLikePop(true)
      setTimeout(() => setLikePop(false), 300)
    }
    try {
      if (prev) await posts.unlike(post.id)
      else await posts.like(post.id)
    } catch {
      setLiked(prev)
      setLikeCount(c => (prev ? c + 1 : c - 1))
    }
  }

  const toggleBookmark = async () => {
    if (!currentUserId) {
      show('Sign in to save', 'info')
      return
    }
    const prev = bookmarked
    setBookmarked(!prev)
    try {
      if (prev) {
        await posts.unbookmark(post.id)
        show('Removed from bookmarks', 'info')
      } else {
        await posts.bookmark(post.id)
        show('Saved')
      }
    } catch {
      setBookmarked(prev)
      show('Action failed', 'error')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Do you want to delete this post?')) return
    setDeleting(true)
    try {
      await posts.delete(post.id)
      onDelete?.(post.id)
      show('Post deleted')
    } catch {
      show('Could not delete', 'error')
      setDeleting(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`
    navigator.clipboard.writeText(url).then(() => show('Link copied'))
  }

  return (
    <>
      <article className="bg-white dark:bg-[#0a1628] rounded-2xl border border-blue-100 dark:border-[#162033] overflow-hidden hover:border-blue-300 dark:hover:border-blue-800/60 transition-all fade-in group">
        <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 gap-2">
          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Avatar src={post.author.avatar_url} username={post.author.username} size={40} />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors leading-none mb-0.5 text-sm sm:text-base truncate">
                {post.author.username}
              </p>
              <p className="text-xs text-slate-400">{formatDistanceToNow(post.created_at)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            {currentUserId === post.user_id && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {post.content && (
          <Link href={`/post/${post.id}`}>
            <p className={`px-3 sm:px-5 ${post.image_url ? 'pb-2 sm:pb-3' : 'pb-3 sm:pb-4'} text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-[15px] ${compact ? 'line-clamp-4' : ''}`}>
              {post.content}
            </p>
          </Link>
        )}

        {post.image_url && (
          <div
            className="relative w-full cursor-zoom-in overflow-hidden"
            style={{ aspectRatio: '16/9' }}
            onClick={() => setLightbox(true)}
          >
            <Image
              src={post.image_url}
              alt="Post image"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 border-t border-blue-50 dark:border-[#162033]">
          <div className="flex items-center gap-0.5 flex-wrap">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${
                liked
                  ? 'text-rose-500'
                  : 'text-slate-400 dark:text-slate-500 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10'
              }`}
            >
              <svg
                className={`w-5 h-5 transition-all ${likePop ? 'like-pop' : ''}`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount > 0 && (
                <span className={liked ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}>
                  {likeCount}
                </span>
              )}
            </button>

            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.comment_count > 0 && (
                <span className="text-slate-500 dark:text-slate-400">{post.comment_count}</span>
              )}
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center px-2 sm:px-3 py-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              bookmarked
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-slate-300 dark:text-slate-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
            }`}
          >
            <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </article>

      {lightbox && post.image_url && (
        <ImageLightbox src={post.image_url} onClose={() => setLightbox(false)} />
      )}
    </>
  )
}

