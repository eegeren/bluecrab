'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth, search, users as usersApi } from '@/lib/api'
import Avatar from '@/components/user/Avatar'
import FollowButton from '@/components/user/FollowButton'
import { SkeletonBox } from '@/components/ui/Skeleton'
import type { UserPublic, UserProfile } from '@/types'

export default function RightPanel() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserPublic[]>([])
  const [searching, setSearching] = useState(false)
  const [suggested, setSuggested] = useState<UserProfile[]>([])
  const [viewer, setViewer] = useState<UserProfile | null>(null)
  const [loadingSuggested, setLoadingSuggested] = useState(true)

  useEffect(() => {
    auth.me().then(setViewer).catch(() => setViewer(null))
  }, [])

  useEffect(() => {
    // Load suggested users via search with a common query
    search.query('a')
      .then(r => setSuggested((r.users as UserProfile[]).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoadingSuggested(false))
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await search.query(query)
        setResults(res.users.slice(0, 5))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setQuery('')
      setResults([])
    }
  }

  return (
    <aside className="hidden xl:block fixed right-0 top-16 h-[calc(100vh-4rem)] w-72 pt-4 pb-6 px-4 overflow-y-auto bg-[#f0f6ff]/50 dark:bg-transparent">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0e1f35] border border-blue-100 dark:border-[#162033] focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-2xl text-sm outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-slate-100"
        />
        {searching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}

        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-20">
            {results.map(u => (
              <Link
                key={u.id}
                href={`/profile/${u.id}`}
                onClick={() => { setQuery(''); setResults([]) }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Avatar src={u.avatar_url} username={u.username} size={34} />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{u.username}</span>
              </Link>
            ))}
          </div>
        )}
      </form>

      {/* Suggested users */}
      <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-blue-100 dark:border-[#162033] overflow-hidden mb-4">
        <div className="px-5 py-3.5 border-b border-blue-50 dark:border-[#162033]">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">People You May Know</h3>
        </div>
        <div className="divide-y divide-blue-50 dark:divide-[#162033]">
          {loadingSuggested
            ? [0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <SkeletonBox className="w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBox className="h-3 w-24" />
                  <SkeletonBox className="h-2.5 w-16" />
                </div>
              </div>
            ))
            : suggested.length === 0
            ? <p className="text-sm text-slate-400 px-5 py-4">No suggestions found</p>
            : suggested.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Link href={`/profile/${u.id}`}>
                  <Avatar src={u.avatar_url} username={u.username} size={36} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${u.id}`} className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 block truncate">
                    {u.username}
                  </Link>
                  <p className="text-xs text-slate-400 truncate">{u.follower_count} followers</p>
                </div>
                {viewer && (
                  <FollowButton userId={u.id} isFollowing={u.is_following} />
                )}
              </div>
            ))
          }
        </div>
        {suggested.length > 0 && (
          <div className="px-5 py-3 border-t border-blue-50 dark:border-[#162033]">
            <Link href="/search" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Show more
            </Link>
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="px-1">
        <p className="text-xs text-slate-400 leading-relaxed">
          © 2025 BlueCrab · Privacy · Terms · Cookies
        </p>
      </div>
    </aside>
  )
}
