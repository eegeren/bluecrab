'use client'

import { FormEvent, use, useEffect, useState } from 'react'
import Link from 'next/link'
import { auth, forum } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import Avatar from '@/components/user/Avatar'
import type { ForumThread, UserProfile } from '@/types'

export default function ForumThreadPage({ params }: { params: Promise<{ slug: string; threadId: string }> }) {
  const { slug, threadId } = use(params)
  const { show } = useToast()
  const [thread, setThread] = useState<ForumThread | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([forum.getThread(threadId), auth.me().catch(() => null)])
      .then(([loadedThread, me]) => {
        setThread(loadedThread)
        setCurrentUser(me)
      })
      .finally(() => setLoading(false))
  }, [threadId])

  const submitReply = async (e: FormEvent) => {
    e.preventDefault()
    const replyContent = content.trim()
    if (!replyContent || !thread) return
    try {
      const reply = await forum.createReply(thread.id, replyContent)
      setThread(prev =>
        prev
          ? {
              ...prev,
              reply_count: prev.reply_count + 1,
              replies: [...(prev.replies || []), reply],
            }
          : prev,
      )
      setContent('')
      show('Reply added')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Reply could not be added', 'error')
    }
  }

  const deleteReply = async (replyId: string) => {
    try {
      await forum.deleteReply(replyId)
      setThread(prev =>
        prev
          ? {
              ...prev,
              reply_count: Math.max(prev.reply_count - 1, 0),
              replies: (prev.replies || []).filter(reply => reply.id !== replyId),
            }
          : prev,
      )
      show('Reply deleted', 'info')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Reply could not be deleted', 'error')
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>
  if (!thread) return <p className="text-slate-400">Thread not found.</p>

  return (
    <div className="space-y-4">
      <Link href={`/forum/${slug}`} className="text-sm text-blue-600 dark:text-blue-400">
        Back to category
      </Link>

      <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{thread.title}</h1>
        <p className="text-sm text-slate-500 mt-1">by {thread.author.username}</p>
        <p className="text-slate-700 dark:text-slate-300 mt-4 whitespace-pre-wrap">{thread.content}</p>
      </article>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Replies</h2>
        {(thread.replies || []).length === 0 ? (
          <p className="text-sm text-slate-400">No replies yet.</p>
        ) : (
          <div className="space-y-3">
            {(thread.replies || []).map(reply => (
              <div key={reply.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Avatar src={reply.author.avatar_url} username={reply.author.username} size={28} />
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{reply.author.username}</p>
                  {currentUser?.id === reply.user_id && (
                    <button
                      onClick={() => deleteReply(reply.id)}
                      className="ml-auto text-xs text-rose-500"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {currentUser && (
        <form
          onSubmit={submitReply}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
        >
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your reply..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            required
          />
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Reply</button>
        </form>
      )}
    </div>
  )
}
