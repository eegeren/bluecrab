'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { comments as commentsApi } from '@/lib/api'
import { formatDistanceToNow } from '@/lib/time'
import Avatar from '@/components/user/Avatar'
import Spinner from '@/components/ui/Spinner'
import type { Comment, UserProfile } from '@/types'

interface Props {
  postId: string
  currentUser?: UserProfile
}

export default function CommentSection({ postId, currentUser }: Props) {
  const [list, setList] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    commentsApi.list(postId).then(setList).finally(() => setLoading(false))
  }, [postId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !currentUser) return
    setSubmitting(true)
    try {
      const c = await commentsApi.create(postId, content.trim())
      setList(prev => [c, ...prev])
      setContent('')
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      await commentsApi.delete(postId, commentId)
      setList(prev => prev.filter(c => c.id !== commentId))
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-4">
      {currentUser && (
        <form onSubmit={submit} className="flex gap-3 mb-5">
          <Avatar src={currentUser.avatar_url} username={currentUser.username} size={36} className="shrink-0 mt-1" />
          <div className="flex-1 flex gap-2">
            <input
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : list.length === 0 ? (
        <p className="text-center text-slate-400 py-6">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {list.map(c => (
            <div key={c.id} className="flex gap-3">
              <Link href={`/profile/${c.author.id}`}>
                <Avatar src={c.author.avatar_url} username={c.author.username} size={36} />
              </Link>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <Link href={`/profile/${c.author.id}`} className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400">
                    {c.author.username}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{formatDistanceToNow(c.created_at)}</span>
                    {currentUser?.id === c.user_id && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


