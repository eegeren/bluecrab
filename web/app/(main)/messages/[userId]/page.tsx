'use client'
import { useEffect, useRef, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { messages as msgApi, users as usersApi, auth } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { formatDistanceToNow } from '@/lib/time'
import Avatar from '@/components/user/Avatar'
import Spinner from '@/components/ui/Spinner'
import type { Message, UserProfile } from '@/types'

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const router = useRouter()
  const [msgs, setMsgs] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    Promise.all([
      msgApi.history(userId),
      usersApi.getProfile(userId),
      auth.me(),
    ]).then(([history, user, me]) => {
      setMsgs(history.reverse())
      setOtherUser(user)
      setCurrentUser(me)
    }).finally(() => setLoading(false))
  }, [userId, router])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  // Poll every 4s for new incoming messages
  useEffect(() => {
    if (loading) return
    const intervalId = setInterval(async () => {
      try {
        const fresh = await msgApi.history(userId)
        const freshAsc = fresh.reverse()
        setMsgs(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newOnes = freshAsc.filter(m => !existingIds.has(m.id))
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev
        })
      } catch { /* ignore poll errors */ }
    }, 4000)
    return () => clearInterval(intervalId)
  }, [userId, loading])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !currentUser) return
    setSending(true)
    try {
      const msg = await msgApi.send(userId, content.trim())
      setMsgs(prev => [...prev, msg])
      setContent('')
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 mb-4 shrink-0">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {otherUser && (
          <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Avatar src={otherUser.avatar_url} username={otherUser.username} size={40} />
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">{otherUser.username}</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-2 sm:px-1 mb-4">
        {msgs.length === 0 && (
          <p className="text-center text-slate-400 py-8 text-sm">No messages yet. Send the first one!</p>
        )}
        {msgs.map(m => {
          const isMine = m.sender_id === currentUser?.id
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
              {!isMine && <Avatar src={m.sender.avatar_url} username={m.sender.username} size={32} className="shrink-0 mt-auto" />}
              <div className={`max-w-xs sm:max-w-sm px-3 sm:px-4 py-2.5 rounded-2xl text-sm ${
                isMine
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
              }`}>
                <p className="leading-relaxed break-words">{m.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                  {formatDistanceToNow(m.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2 sm:gap-3 shrink-0">
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 sm:px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="px-3 sm:px-5 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-semibold rounded-2xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
