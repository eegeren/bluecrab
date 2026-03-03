'use client'

import { useEffect, useRef, useState } from 'react'
import { posts } from '@/lib/api'
import Avatar from '@/components/user/Avatar'
import type { Post, UserProfile } from '@/types'

interface Props {
  currentUser: UserProfile
  onPost: (post: Post) => void
}

export default function PostComposer({ currentUser, onPost }: Props) {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showImage, setShowImage] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const submit = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    try {
      const post = await posts.create(content.trim(), imageUrl.trim() || undefined)
      onPost(post)
      setContent('')
      setImageUrl('')
      setShowImage(false)
      setExpanded(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Post could not be shared')
    } finally {
      setLoading(false)
    }
  }

  const remaining = 280 - content.length
  const overLimit = remaining < 0

  useEffect(() => {
    if (!expanded) return
    textareaRef.current?.focus()
  }, [expanded])

  useEffect(() => {
    if (!expanded) return
    const onDocPointerDown = (ev: MouseEvent) => {
      if (!rootRef.current) return
      if (rootRef.current.contains(ev.target as Node)) return
      if (!content.trim() && !imageUrl.trim()) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', onDocPointerDown)
    return () => document.removeEventListener('mousedown', onDocPointerDown)
  }, [expanded, content, imageUrl])

  return (
    <div
      ref={rootRef}
      onClick={() => !expanded && setExpanded(true)}
      className={`bg-white dark:bg-[#0a1628] rounded-2xl border border-blue-100 dark:border-[#162033] transition-all ${
        expanded ? 'p-5' : 'px-5 py-3 cursor-text'
      }`}
    >
      <div className="flex gap-3">
        <Avatar src={currentUser.avatar_url} username={currentUser.username} size={expanded ? 44 : 40} className="shrink-0 mt-1" />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="What are you thinking?"
            rows={expanded ? 3 : 1}
            className={`w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none ${
              expanded ? 'text-lg' : 'text-base leading-8'
            }`}
          />

          {expanded && showImage && (
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="w-full mt-2 px-3 py-2 bg-blue-50 dark:bg-[#0e1f35] border border-blue-200 dark:border-[#162033] rounded-xl text-sm outline-none focus:border-blue-400 transition-colors text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          )}

          {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}

          {expanded && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-50 dark:border-[#162033]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowImage(v => !v)}
                  className={`p-2 rounded-xl transition-colors ${showImage ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  title="Add image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span className={`text-xs font-medium tabular-nums ${overLimit ? 'text-rose-500' : remaining < 20 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {remaining}
                  </span>
                )}
                <button
                  onClick={submit}
                  disabled={loading || !content.trim() || overLimit}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full text-sm transition-all btn-glow"
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


