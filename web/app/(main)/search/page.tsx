'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { search as searchApi, auth } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import PostCard from '@/components/post/PostCard'
import UserCard from '@/components/user/UserCard'
import Spinner from '@/components/ui/Spinner'
import type { Post, UserProfile, SearchResult } from '@/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'all' | 'users' | 'posts'>('all')

  useEffect(() => {
    if (isLoggedIn()) auth.me().then(setCurrentUser).catch(() => {})
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setQuery(q)
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    searchApi.query(q)
      .then(setResults)
      .finally(() => setLoading(false))
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const users = results?.users ?? []
  const posts = (results?.posts ?? []) as Post[]

  return (
    <div>
      <form onSubmit={handleSearch} className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search users or posts..."
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-400 transition-colors text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
      </form>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {results && !loading && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['all', 'users', 'posts'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t === 'all' ? 'All' : t === 'users' ? `Users (${users.length})` : `Posts (${posts.length})`}
              </button>
            ))}
          </div>

          {(tab === 'all' || tab === 'users') && users.length > 0 && (
            <div className="mb-5">
              {tab === 'all' && <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Users</h2>}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <UserCard
                    key={u.id}
                    user={u as UserProfile}
                    showFollow={!!currentUser}
                    currentUserId={currentUser?.id}
                  />
                ))}
              </div>
            </div>
          )}

          {(tab === 'all' || tab === 'posts') && posts.length > 0 && (
            <div className="space-y-4">
              {tab === 'all' && <h2 className="font-semibold text-slate-700 dark:text-slate-300">Posts</h2>}
              {posts.map(p => (
                <PostCard key={p.id} post={p} currentUserId={currentUser?.id} />
              ))}
            </div>
          )}

          {users.length === 0 && posts.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg">No results found for "{searchParams.get('q')}"</p>
            </div>
          )}
        </>
      )}

      {!results && !loading && !searchParams.get('q') && (
        <div className="text-center py-16 text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Type something to search</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner size="lg" /></div>}>
      <SearchContent />
    </Suspense>
  )
}


