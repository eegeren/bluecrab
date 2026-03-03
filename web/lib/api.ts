import { getAuthHeader } from './auth'
import type {
  AuthResponse,
  Comment,
  Conversation,
  FriendRequest,
  FriendshipStatus,
  ForumCategory,
  ForumReply,
  ForumThread,
  Group,
  GroupMember,
  Message,
  Notification,
  Post,
  SearchResult,
  UserPublic,
  UserProfile,
} from '@/types'


declare const process: { env: { NEXT_PUBLIC_API_BASE_URL?: string } }
const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '')

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE}${path}`
  console.log('[API] Request:', options.method || 'GET', url)
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options.headers as Record<string, string> | undefined),
      },
    })
    console.log('[API] Response:', res.status, res.statusText)
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Something went wrong' }))
      console.error('[API] Error response:', body)
      throw new Error(body.error || `HTTP ${res.status}: ${res.statusText}`)
    }
    if (res.status === 204) return undefined as T
    const data = await res.json()
    console.log('[API] Data received:', path)
    return data
  } catch (error) {
    console.error('[API] Request failed:', error)
    throw error
  }
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (username: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  me: () => request<UserProfile>('/auth/me'),
}

// Users
export const users = {
  getProfile: (id: string) => request<UserProfile>(`/users/${id}`),
  updateProfile: (data: {
    username?: string
    bio?: string
    avatar_url?: string
    cover_url?: string
    phone_number?: string
    website_url?: string
    instagram_url?: string
    twitter_url?: string
    linkedin_url?: string
    github_url?: string
  }) =>
    request<UserProfile>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getPosts: (id: string, page = 1) =>
    request<Post[]>(`/users/${id}/posts?page=${page}`),
  getFollowers: (id: string, page = 1) =>
    request<UserProfile[]>(`/users/${id}/followers?page=${page}`),
  getFollowing: (id: string, page = 1) =>
    request<UserProfile[]>(`/users/${id}/following?page=${page}`),
  follow: (id: string) =>
    request<void>(`/users/${id}/follow`, { method: 'POST' }),
  unfollow: (id: string) =>
    request<void>(`/users/${id}/follow`, { method: 'DELETE' }),
  friendshipStatus: (id: string) =>
    request<FriendshipStatus>(`/users/${id}/friendship`),
}

// Posts
export const posts = {
  create: (content: string, image_url?: string) =>
    request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, image_url }),
    }),
  get: (id: string) => request<Post>(`/posts/${id}`),
  delete: (id: string) => request<void>(`/posts/${id}`, { method: 'DELETE' }),
  like: (id: string) => request<void>(`/posts/${id}/like`, { method: 'POST' }),
  unlike: (id: string) =>
    request<void>(`/posts/${id}/like`, { method: 'DELETE' }),
  bookmark: (id: string) => request<void>(`/posts/${id}/bookmark`, { method: 'POST' }),
  unbookmark: (id: string) => request<void>(`/posts/${id}/bookmark`, { method: 'DELETE' }),
}

// Comments
export const comments = {
  list: (postId: string, page = 1) =>
    request<Comment[]>(`/posts/${postId}/comments?page=${page}`),
  create: (postId: string, content: string) =>
    request<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  delete: (postId: string, commentId: string) =>
    request<void>(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
}

// Feed
export const feed = {
  get: (page = 1) => request<Post[]>(`/feed?page=${page}`),
}

// Notifications
export const notifications = {
  list: (page = 1) => request<Notification[]>(`/notifications?page=${page}`),
  markRead: () => request<void>('/notifications/read', { method: 'PUT' }),
  unreadCount: () =>
    request<{ count: number }>('/notifications/unread-count'),
}

// Messages
export const messages = {
  conversations: () => request<Conversation[]>('/messages/'),
  history: (userId: string, page = 1) =>
    request<Message[]>(`/messages/${userId}?page=${page}`),
  send: (userId: string, content: string) =>
    request<Message>(`/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  unreadCount: () => request<{ count: number }>('/messages/unread-count'),
}

// Search
export const search = {
  query: (q: string) => request<SearchResult>(`/search?q=${encodeURIComponent(q)}`),
}

// Friends
export const friends = {
  list: (page = 1) => request<UserPublic[]>(`/friends?page=${page}`),
  requests: (page = 1) => request<FriendRequest[]>(`/friends/requests?page=${page}`),
  sendRequest: (id: string) => request<void>(`/friends/${id}/request`, { method: 'POST' }),
  accept: (id: string) => request<void>(`/friends/${id}/accept`, { method: 'PUT' }),
  decline: (id: string) => request<void>(`/friends/${id}/decline`, { method: 'PUT' }),
  remove: (id: string) => request<void>(`/friends/${id}`, { method: 'DELETE' }),
}

// Groups
export const groups = {
  list: (page = 1) => request<Group[]>(`/groups?page=${page}`),
  create: (data: { name: string; description?: string; avatar_url?: string; is_private?: boolean }) =>
    request<Group>('/groups', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) => request<Group>(`/groups/${id}`),
  update: (id: string, data: { name: string; description?: string; avatar_url?: string; is_private?: boolean }) =>
    request<Group>(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/groups/${id}`, { method: 'DELETE' }),
  join: (id: string) => request<void>(`/groups/${id}/join`, { method: 'POST' }),
  leave: (id: string) => request<void>(`/groups/${id}/join`, { method: 'DELETE' }),
  members: (id: string, page = 1) => request<GroupMember[]>(`/groups/${id}/members?page=${page}`),
}

// Forum
export const forum = {
  categories: () => request<ForumCategory[]>('/forum/categories'),
  categoryThreads: (slug: string, page = 1) =>
    request<{ category: ForumCategory; threads: ForumThread[] }>(`/forum/categories/${slug}?page=${page}`),
  createThread: (data: { category_id: string; title: string; content: string }) =>
    request<ForumThread>('/forum/threads', { method: 'POST', body: JSON.stringify(data) }),
  getThread: (id: string) => request<ForumThread>(`/forum/threads/${id}`),
  deleteThread: (id: string) => request<void>(`/forum/threads/${id}`, { method: 'DELETE' }),
  createReply: (threadId: string, content: string) =>
    request<ForumReply>(`/forum/threads/${threadId}/replies`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteReply: (id: string) => request<void>(`/forum/replies/${id}`, { method: 'DELETE' }),
}

// Bookmarks
export const bookmarks = {
  list: (page = 1) => request<Post[]>(`/bookmarks?page=${page}`),
}
