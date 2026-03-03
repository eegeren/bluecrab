import Link from 'next/link'
import Avatar from './Avatar'
import FollowButton from './FollowButton'
import type { UserProfile } from '@/types'

interface Props {
  user: UserProfile
  showFollow?: boolean
  currentUserId?: string
}

export default function UserCard({ user, showFollow = false, currentUserId }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <Link href={`/profile/${user.id}`}>
        <Avatar src={user.avatar_url} username={user.username} size={44} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.id}`} className="font-semibold text-slate-900 dark:text-slate-100 hover:underline truncate block">
          {user.username}
        </Link>
        {user.bio && (
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.bio}</p>
        )}
      </div>
      {showFollow && currentUserId !== user.id && (
        <FollowButton userId={user.id} isFollowing={user.is_following} />
      )}
    </div>
  )
}


