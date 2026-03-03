'use client'
import Link from 'next/link'
import Avatar from '@/components/user/Avatar'
import type { UserPublic } from '@/types'

interface Props {
  users: UserPublic[]
  currentUser?: { id: string; username: string; avatar_url: string }
}

export default function StoryBar({ users, currentUser }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4">
      <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {/* Own story */}
        {currentUser && (
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="relative">
              <div className="w-14 h-14 rounded-full p-0.5 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Avatar src={currentUser.avatar_url} username={currentUser.username} size={52} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 w-14 text-center truncate">My Story</span>
          </div>
        )}

        {/* Following stories */}
        {users.map(u => (
          <Link key={u.id} href={`/profile/${u.id}`} className="flex flex-col items-center gap-1.5 shrink-0 group">
            <div className="w-14 h-14 rounded-full p-0.5 story-ring">
              <div className="w-full h-full rounded-full p-0.5 bg-white dark:bg-slate-900">
                <Avatar src={u.avatar_url} username={u.username} size={48} className="w-full h-full" />
              </div>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 w-14 text-center truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {u.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
