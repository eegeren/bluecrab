'use client'
import { useState } from 'react'
import { users } from '@/lib/api'

interface Props {
  userId: string
  isFollowing: boolean
  onToggle?: (following: boolean) => void
}

export default function FollowButton({ userId, isFollowing, onToggle }: Props) {
  const [following, setFollowing] = useState(isFollowing)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      if (following) {
        await users.unfollow(userId)
        setFollowing(false)
        onToggle?.(false)
      } else {
        await users.follow(userId)
        setFollowing(true)
        onToggle?.(true)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold active:scale-95 transition-all ${
        following
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } disabled:opacity-50`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
