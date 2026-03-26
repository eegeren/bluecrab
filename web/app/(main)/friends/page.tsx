'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth, friends } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import Avatar from '@/components/user/Avatar'
import type { FriendRequest, UserProfile, UserPublic } from '@/types'

export default function FriendsPage() {
  const router = useRouter()
  const { show } = useToast()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [list, setList] = useState<UserPublic[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [friendsPage, setFriendsPage] = useState(1)
  const [requestsPage, setRequestsPage] = useState(1)
  const [friendsHasMore, setFriendsHasMore] = useState(true)
  const [requestsHasMore, setRequestsHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([auth.me(), friends.list(1), friends.requests(1)])
      .then(([me, myFriends, incoming]) => {
        setCurrentUser(me)
        setList(myFriends)
        setRequests(incoming)
        setFriendsHasMore(myFriends.length >= 20)
        setRequestsHasMore(incoming.length >= 20)
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  const accept = async (id: string) => {
    try {
      await friends.accept(id)
      const req = requests.find(x => x.requester_id === id)
      if (req) setList(prev => [req.requester, ...prev])
      setRequests(prev => prev.filter(x => x.requester_id !== id))
      show('Friend request accepted')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Action failed', 'error')
    }
  }

  const decline = async (id: string) => {
    try {
      await friends.decline(id)
      setRequests(prev => prev.filter(x => x.requester_id !== id))
      show('Friend request declined', 'info')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Action failed', 'error')
    }
  }

  const removeFriend = async (id: string) => {
    try {
      await friends.remove(id)
      setList(prev => prev.filter(x => x.id !== id))
      show('Friend removed', 'info')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Action failed', 'error')
    }
  }

  const loadMoreFriends = async () => {
    try {
      const nextPage = friendsPage + 1
      const next = await friends.list(nextPage)
      setList(prev => [...prev, ...next])
      setFriendsPage(nextPage)
      setFriendsHasMore(next.length >= 20)
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to load', 'error')
    }
  }

  const loadMoreRequests = async () => {
    try {
      const nextPage = requestsPage + 1
      const next = await friends.requests(nextPage)
      setRequests(prev => [...prev, ...next])
      setRequestsPage(nextPage)
      setRequestsHasMore(next.length >= 20)
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to load', 'error')
    }
  }

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Friends</h1>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Incoming Requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-slate-400">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex items-center gap-3">
                <Link href={`/profile/${req.requester.id}`}>
                  <Avatar src={req.requester.avatar_url} username={req.requester.username} size={40} />
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${req.requester.id}`} className="font-medium text-slate-900 dark:text-slate-100">
                    {req.requester.username}
                  </Link>
                </div>
                <button onClick={() => accept(req.requester_id)} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white">
                  Accept
                </button>
                <button onClick={() => decline(req.requester_id)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700">
                  Decline
                </button>
              </div>
            ))}
          </div>
        )}
        {requests.length > 0 && requestsHasMore && (
          <button onClick={loadMoreRequests} className="mt-3 text-sm text-blue-600 dark:text-blue-400">
            Load more requests
          </button>
        )}
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Friend List</h2>
        {list.length === 0 ? (
          <p className="text-sm text-slate-400">No friends yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <Link href={`/profile/${user.id}`}>
                  <Avatar src={user.avatar_url} username={user.username} size={40} />
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${user.id}`} className="font-medium text-slate-900 dark:text-slate-100">
                    {user.username}
                  </Link>
                </div>
                {currentUser?.id !== user.id && (
                  <button onClick={() => removeFriend(user.id)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {list.length > 0 && friendsHasMore && (
          <button onClick={loadMoreFriends} className="mt-3 text-sm text-blue-600 dark:text-blue-400">
            Load more friends
          </button>
        )}
      </section>
    </div>
  )
}
