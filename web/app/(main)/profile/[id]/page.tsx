'use client'

import { FormEvent, use, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { auth, friends as friendsApi, users as usersApi } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import { useToast } from '@/context/ToastContext'
import Avatar from '@/components/user/Avatar'
import FollowButton from '@/components/user/FollowButton'
import PostCard from '@/components/post/PostCard'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import type { FriendshipStatus, Post, UserProfile } from '@/types'

type TabType = 'grid' | 'list' | 'followers' | 'following'

function formatHandle(username: string) {
  const normalized = username
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return normalized || 'user'
}

function MetaPill({
  href,
  label,
  kind,
}: {
  href: string
  label: string
  kind: 'phone' | 'link'
}) {
  return (
    <a
      href={href}
      target={kind === 'link' ? '_blank' : undefined}
      rel={kind === 'link' ? 'noreferrer' : undefined}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
        {kind === 'phone' ? (
          <path d="M2.8 4.9a1.7 1.7 0 0 1 1.9-1.4l2.2.3A1.7 1.7 0 0 1 8.3 5l.3 1.6c.1.6 0 1.1-.4 1.5l-1 .9a13.4 13.4 0 0 0 3.8 3.8l.9-1c.4-.4 1-.6 1.5-.4l1.6.3c.8.2 1.3.8 1.3 1.6l.3 2.2a1.7 1.7 0 0 1-1.4 1.9c-1.8.3-5.4-.2-8.8-3.5S2.4 6.7 2.8 4.9Z" />
        ) : (
          <path d="M4.7 10a3.8 3.8 0 0 1 3.8-3.8h2v1.5h-2a2.3 2.3 0 1 0 0 4.6h2v1.5h-2A3.8 3.8 0 0 1 4.7 10Zm4.3.8h2V9.3H9v1.5Zm2.5-4.6h-2v1.5h2a2.3 2.3 0 1 1 0 4.6h-2v1.5h2a3.8 3.8 0 1 0 0-7.6Z" />
        )}
      </svg>
      {label}
    </a>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center bg-white/60 dark:bg-slate-900/40">
      <div className="mx-auto mb-3 h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5 text-slate-500 dark:text-slate-400">
          <path d="M5.2 3.8A2.2 2.2 0 0 1 7.4 1.6h5.2a2.2 2.2 0 0 1 2.2 2.2v12.4a2.2 2.2 0 0 1-2.2 2.2H7.4a2.2 2.2 0 0 1-2.2-2.2V3.8Zm2.2-.7a.7.7 0 0 0-.7.7v12.4c0 .4.3.7.7.7h5.2c.4 0 .7-.3.7-.7V3.8a.7.7 0 0 0-.7-.7H7.4Z" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { show } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('grid')
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [following, setFollowing] = useState<UserProfile[]>([])
  const [friendship, setFriendship] = useState<FriendshipStatus['status']>('none')

  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    cover_url: '',
    phone_number: '',
    website_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    github_url: '',
  })

  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setLoading(true)
    setTab('grid')
    const fetches: Promise<unknown>[] = [
      usersApi.getProfile(id).then(setProfile),
      usersApi.getPosts(id).then(setPosts),
    ]
    if (isLoggedIn()) {
      fetches.push(auth.me().then(setCurrentUser))
      fetches.push(
        usersApi
          .friendshipStatus(id)
          .then(s => setFriendship(s.status))
          .catch(() => setFriendship('none'))
      )
    }
    Promise.all(fetches).finally(() => setLoading(false))
  }, [id])

  const processPickedImage = async (
    file: File,
    options: { maxW: number; maxH: number; quality: number }
  ): Promise<string> => {
    if (!file.type.startsWith('image/')) throw new Error('Please select an image')
    const raw = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('File could not be read'))
      reader.readAsDataURL(file)
    })
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Image could not be loaded'))
      el.src = raw
    })
    const scale = Math.min(options.maxW / img.width, options.maxH / img.height, 1)
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not available')
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', options.quality)
  }

  const onPickAvatar = async (file?: File) => {
    if (!file) return
    try {
      const data = await processPickedImage(file, { maxW: 700, maxH: 700, quality: 0.85 })
      setEditForm(f => ({ ...f, avatar_url: data }))
      show('Profile photo selected')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Image could not be selected', 'error')
    }
  }

  const onPickCover = async (file?: File) => {
    if (!file) return
    try {
      const data = await processPickedImage(file, { maxW: 1600, maxH: 900, quality: 0.82 })
      setEditForm(f => ({ ...f, cover_url: data }))
      show('Cover photo selected')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Image could not be selected', 'error')
    }
  }

  const openEdit = () => {
    if (!profile) return
    setEditForm({
      username: profile.username,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      cover_url: profile.cover_url,
      phone_number: profile.phone_number,
      website_url: profile.website_url,
      instagram_url: profile.instagram_url,
      twitter_url: profile.twitter_url,
      linkedin_url: profile.linkedin_url,
      github_url: profile.github_url,
    })
    setEditOpen(true)
  }

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await usersApi.updateProfile(editForm)
      setProfile(updated)
      setCurrentUser(updated)
      setEditOpen(false)
      show('Profile updated')
    } catch (err) {
      show(err instanceof Error ? err.message : 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFriendAction = async () => {
    if (!profile) return
    try {
      if (friendship === 'none') {
        await friendsApi.sendRequest(profile.id)
        setFriendship('pending_outgoing')
        show('Friend request sent')
      } else if (friendship === 'pending_incoming') {
        await friendsApi.accept(profile.id)
        setFriendship('friends')
        show('Friend request accepted')
      }
    } catch (err) {
      show(err instanceof Error ? err.message : 'Action failed', 'error')
    }
  }

  const loadTab = async (next: TabType) => {
    setTab(next)
    if (next === 'followers' && followers.length === 0) usersApi.getFollowers(id).then(setFollowers)
    if (next === 'following' && following.length === 0) usersApi.getFollowing(id).then(setFollowing)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!profile) return <div className="text-center py-16 text-slate-400">User not found</div>

  const isOwn = currentUser?.id === profile.id
  const socialLinks = [
    { key: 'website', label: 'Web', url: profile.website_url },
    { key: 'instagram', label: 'Instagram', url: profile.instagram_url },
    { key: 'twitter', label: 'X', url: profile.twitter_url },
    { key: 'linkedin', label: 'LinkedIn', url: profile.linkedin_url },
    { key: 'github', label: 'GitHub', url: profile.github_url },
  ].filter(x => x.url)
  const profileHandle = formatHandle(profile.username)

  return (
    <>
      <div className="space-y-4">
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="relative">
            <div
              className="h-36 sm:h-44 md:h-52 relative"
              style={profile.cover_url
                ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : undefined}
            >
              {!profile.cover_url && (
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/20 to-transparent" />
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_82%_16%,rgba(255,255,255,0.22),transparent_35%)]" />
            </div>
          </div>

          <div className="px-4 pb-5 md:px-6 md:pb-6 -mt-12 md:-mt-14 relative">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="ring-4 ring-white dark:ring-slate-900 rounded-full shadow-sm shrink-0">
                    <Avatar src={profile.avatar_url} username={profile.username} size={96} />
                  </div>
                  <div className="min-w-0 pt-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{profile.username}</h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">@{profileHandle}</p>
                    {profile.bio ? (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">{profile.bio}</p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">No bio yet.</p>
                    )}
                    {(profile.phone_number || socialLinks.length > 0) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {profile.phone_number && (
                          <MetaPill href={`tel:${profile.phone_number}`} label={profile.phone_number} kind="phone" />
                        )}
                        {socialLinks.map(s => (
                          <MetaPill key={s.key} href={s.url} label={s.label} kind="link" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {isOwn ? (
                    <button
                      aria-label="Edit profile"
                      onClick={openEdit}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Edit Profile
                    </button>
                  ) : currentUser && (
                    <>
                      <button
                        aria-label="Friend action"
                        onClick={handleFriendAction}
                        disabled={friendship === 'friends' || friendship === 'pending_outgoing'}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          friendship === 'friends'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : friendship === 'pending_outgoing'
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {friendship === 'friends'
                          ? 'You are friends'
                          : friendship === 'pending_outgoing'
                            ? 'Request sent'
                            : friendship === 'pending_incoming'
                              ? 'Accept request'
                              : 'Add friend'}
                      </button>
                      <FollowButton
                        userId={profile.id}
                        isFollowing={profile.is_following}
                        onToggle={f =>
                          setProfile(p => (p ? { ...p, is_following: f, follower_count: p.follower_count + (f ? 1 : -1) } : p))
                        }
                      />
                      <Link
                        href={`/messages/${profile.id}`}
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Message
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                <button
                  aria-label="View posts tab"
                  onClick={() => loadTab('grid')}
                  className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    tab === 'grid' || tab === 'list'
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  } col-span-2 sm:col-span-1`}
                >
                  <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{posts.length}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Posts</p>
                </button>
                <button
                  aria-label="View followers tab"
                  onClick={() => loadTab('followers')}
                  className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    tab === 'followers'
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{profile.follower_count}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Followers</p>
                </button>
                <button
                  aria-label="View following tab"
                  onClick={() => loadTab('following')}
                  className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    tab === 'following'
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{profile.following_count}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Following</p>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-slate-200 dark:border-slate-800">
            <button
              aria-label="Grid view"
              onClick={() => loadTab('grid')}
              className={`py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tab === 'grid' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Grid
            </button>
            <button
              aria-label="List view"
              onClick={() => loadTab('list')}
              className={`py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tab === 'list' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400'}`}
            >
              List
            </button>
          </div>
        </section>

        {tab === 'grid' && (
          posts.length === 0 ? (
            <EmptyState title="No posts yet" description="Shared posts will appear here." />
          ) : (
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              {posts.map(p => (
                <Link
                  key={p.id}
                  href={`/post/${p.id}`}
                  className="relative aspect-square bg-slate-100 dark:bg-slate-800 group overflow-hidden"
                >
                  {p.image_url ? (
                    <Image src={p.image_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 p-3 flex items-center justify-center">
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 text-center line-clamp-5">{p.content}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )
        )}

        {tab === 'list' && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <EmptyState title="No posts yet" description="Switch to grid after your first post." />
            ) : (
              posts.map(p => (
                <PostCard
                  key={p.id}
                  post={p}
                  currentUserId={currentUser?.id}
                  onDelete={pid => setPosts(prev => prev.filter(x => x.id !== pid))}
                />
              ))
            )}
          </div>
        )}

        {tab === 'followers' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3 space-y-2">
            {followers.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No followers yet" description="People who follow this profile will be listed here." />
              </div>
            ) : (
              followers.map(u => (
                <div
                  key={u.id}
                  className="group rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30 px-3 py-3 sm:px-4 transition-colors hover:bg-white dark:hover:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${u.id}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                      aria-label={`${u.username} profile`}
                    >
                      <Avatar src={u.avatar_url} username={u.username} size={46} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${u.id}`}
                        className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        {u.username}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        @{formatHandle(u.username)}
                      </p>
                      {isOwn && u.is_following && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Mutual
                        </span>
                      )}
                      {u.bio ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{u.bio}</p>
                      ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 truncate mt-1">No bio provided.</p>
                      )}
                    </div>
                    {currentUser && currentUser.id !== u.id && (
                      <div className="shrink-0">
                        <FollowButton userId={u.id} isFollowing={u.is_following} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'following' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3 space-y-2">
            {following.length === 0 ? (
              <div className="p-4">
                <EmptyState title="Not following anyone yet" description="Accounts followed by this profile will appear here." />
              </div>
            ) : (
              following.map(u => (
                <div
                  key={u.id}
                  className="group rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30 px-3 py-3 sm:px-4 transition-colors hover:bg-white dark:hover:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${u.id}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                      aria-label={`${u.username} profile`}
                    >
                      <Avatar src={u.avatar_url} username={u.username} size={46} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${u.id}`}
                        className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        {u.username}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        @{formatHandle(u.username)}
                      </p>
                      {u.bio ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{u.bio}</p>
                      ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 truncate mt-1">No bio provided.</p>
                      )}
                    </div>
                    {currentUser && currentUser.id !== u.id && (
                      <div className="shrink-0">
                        <FollowButton userId={u.id} isFollowing={u.is_following} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Photo</p>
              <div className="flex items-center gap-3">
                <Avatar src={editForm.avatar_url || profile.avatar_url} username={editForm.username || profile.username} size={56} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                    Choose from gallery
                  </button>
                  <button type="button" onClick={() => setEditForm(f => ({ ...f, avatar_url: '' }))} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
                    Remove
                  </button>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={e => onPickAvatar(e.target.files?.[0])}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cover Photo</p>
              <div className="space-y-2">
                <div
                  className="h-20 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center"
                  style={editForm.cover_url || profile.cover_url ? { backgroundImage: `url(${editForm.cover_url || profile.cover_url})` } : undefined}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => coverInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                    Choose from gallery
                  </button>
                  <button type="button" onClick={() => setEditForm(f => ({ ...f, cover_url: '' }))} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
                    Remove
                  </button>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => onPickCover(e.target.files?.[0])}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
            <input
              value={editForm.username}
              onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
            <textarea
              value={editForm.bio}
              onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 resize-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
            <input
              type="tel"
              value={editForm.phone_number}
              onChange={e => setEditForm(f => ({ ...f, phone_number: e.target.value }))}
              placeholder="+90..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="url"
              value={editForm.website_url}
              onChange={e => setEditForm(f => ({ ...f, website_url: e.target.value }))}
              placeholder="Website URL"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 text-slate-900 dark:text-slate-100"
            />
            <input
              type="url"
              value={editForm.instagram_url}
              onChange={e => setEditForm(f => ({ ...f, instagram_url: e.target.value }))}
              placeholder="Instagram URL"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 text-slate-900 dark:text-slate-100"
            />
            <input
              type="url"
              value={editForm.twitter_url}
              onChange={e => setEditForm(f => ({ ...f, twitter_url: e.target.value }))}
              placeholder="X / Twitter URL"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 text-slate-900 dark:text-slate-100"
            />
            <input
              type="url"
              value={editForm.linkedin_url}
              onChange={e => setEditForm(f => ({ ...f, linkedin_url: e.target.value }))}
              placeholder="LinkedIn URL"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 text-slate-900 dark:text-slate-100"
            />
            <input
              type="url"
              value={editForm.github_url}
              onChange={e => setEditForm(f => ({ ...f, github_url: e.target.value }))}
              placeholder="GitHub URL"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 text-slate-900 dark:text-slate-100 md:col-span-2"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
