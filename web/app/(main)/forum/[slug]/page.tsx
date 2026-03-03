'use client'

import { FormEvent, use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { forum } from '@/lib/api'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useToast } from '@/context/ToastContext'
import Spinner from '@/components/ui/Spinner'
import type { ForumCategory, ForumThread } from '@/types'

export default function ForumCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { show } = useToast()
  const [category, setCategory] = useState<ForumCategory | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const fetcher = useCallback(async (page: number) => {
    const res = await forum.categoryThreads(slug, page)
    setCategory(res.category)
    return res.threads
  }, [slug])

  const {
    items: threads,
    setItems: setThreads,
    loading,
    loadingMore,
    hasMore,
    error: loadError,
    sentinelRef,
  } = useInfiniteScroll<ForumThread>(fetcher)

  useEffect(() => {
    setCreating(false)
    setTitle('')
    setContent('')
    setError('')
  }, [slug])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!category) return
    setError('')
    try {
      const thread = await forum.createThread({ category_id: category.id, title, content })
      setThreads(prev => [thread, ...prev])
      setTitle('')
      setContent('')
      setCreating(false)
      show('Thread created')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      show(message, 'error')
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>
  if (loadError) return <p className="text-rose-500">{loadError}</p>
  if (!category) return <p className="text-slate-400">Category not found.</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{category.name}</h1>
          <p className="text-sm text-slate-500">{category.description}</p>
        </div>
        <button
          onClick={() => setCreating(v => !v)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
        >
          New Thread
        </button>
      </div>

      {creating && (
        <form
          onSubmit={submit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
        >
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            required
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Content"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            required
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">
            Share
          </button>
        </form>
      )}

      <div className="space-y-3">
        {threads.length === 0 ? (
          <p className="text-slate-400">No threads in this category.</p>
        ) : (
          <>
            {threads.map(thread => (
              <Link
                key={thread.id}
                href={`/forum/${slug}/${thread.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
              >
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{thread.title}</h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{thread.content}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {thread.reply_count} replies - {thread.view_count} views
                </p>
              </Link>
            ))}
            <div ref={sentinelRef} className="h-4" />
            {loadingMore && (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )}
            {!hasMore && threads.length > 0 && (
              <p className="text-xs text-slate-400 text-center">All threads loaded.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
