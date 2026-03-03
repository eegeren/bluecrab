'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { forum } from '@/lib/api'
import type { ForumCategory } from '@/types'

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    forum.categories().then(setCategories).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Forum</h1>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map(c => (
            <Link key={c.id} href={`/forum/${c.slug}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</h2>
              </div>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{c.description}</p>
              <p className="text-xs text-slate-400 mt-2">{c.thread_count} thread</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

