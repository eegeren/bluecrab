'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { auth, groups } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import Avatar from '@/components/user/Avatar'
import type { Group, GroupMember, UserProfile } from '@/types'

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { show } = useToast()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMembers, setShowMembers] = useState(true)

  useEffect(() => {
    Promise.all([groups.get(id), groups.members(id), auth.me().catch(() => null)])
      .then(([g, m, me]) => {
        setGroup(g)
        setMembers(m)
        setCurrentUser(me)
      })
      .finally(() => setLoading(false))
  }, [id])

  const join = async () => {
    try {
      await groups.join(id)
      setGroup(prev => prev ? { ...prev, is_member: true, member_count: prev.member_count + 1 } : prev)
      show('You joined the group')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Action failed', 'error')
    }
  }

  const leave = async () => {
    try {
      await groups.leave(id)
      setGroup(prev => prev ? { ...prev, is_member: false, member_count: Math.max(prev.member_count - 1, 1) } : prev)
      show('You left the group', 'info')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Action failed', 'error')
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>
  if (!group) return <p className="text-slate-400">Group not found.</p>

  const isOwner = currentUser?.id === group.owner_id

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{group.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{group.description || 'No description'}</p>
            <p className="text-xs text-slate-400 mt-2">{group.member_count} members</p>
          </div>
          {!isOwner && (group.is_member ? (
            <button onClick={leave} className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm">
               Leave
            </button>
          ) : (
            <button onClick={join} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">
               Join
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <button
          onClick={() => setShowMembers(v => !v)}
          className="font-semibold text-slate-900 dark:text-slate-100 mb-3"
        >
          Members
        </button>
        {showMembers && (
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center gap-3">
                <Link href={`/profile/${m.user.id}`}>
                  <Avatar src={m.user.avatar_url} username={m.user.username} size={40} />
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${m.user.id}`} className="font-medium text-slate-900 dark:text-slate-100">
                    {m.user.username}
                  </Link>
                  <p className="text-xs text-slate-400">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
