import type {
  AuthResponse,
  Comment,
  Conversation,
  ForumCategory,
  ForumReply,
  ForumThread,
  FriendRequest,
  FriendshipStatus,
  Group,
  GroupMember,
  Message,
  Notification,
  Post,
  SearchResult,
  UserProfile,
  UserPublic,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

function getApiUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is required");
  }

  return API_URL;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      data?.error?.message ??
      data?.error ??
      data?.message ??
      "API Error";
    throw new Error(message);
  }

  return data as T;
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  return parseResponse<T>(res);
}

export async function serverApiFetch<T = any>(path: string, options: RequestInit = {}) {
  const { cookies, headers } = await import("next/headers");
  const cookieStore = await cookies();
  const headerStore = await headers();
  const requestHeaders = new Headers(options.headers || {});

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    requestHeaders.set("cookie", cookieHeader);
  }

  const origin = headerStore.get("origin");
  if (origin) {
    requestHeaders.set("origin", origin);
  }

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: requestHeaders,
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<T>(res);
}

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (username: string, email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
  logout: () =>
    apiFetch<{ success?: boolean }>("/auth/logout", {
      method: "POST",
    }),
  me: () => apiFetch<UserProfile>("/auth/me"),
};

export const users = {
  me: () => apiFetch<UserProfile>("/users/me"),
  getById: (id: string) => apiFetch<UserProfile>(`/users/${id}`),
  getProfile: (id: string) => apiFetch<UserProfile>(`/users/${id}`),
  updateProfile: (data: Record<string, unknown>) =>
    apiFetch<UserProfile>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getPosts: (id: string, page = 1) => apiFetch<Post[]>(`/users/${id}/posts?page=${page}`),
  getFollowers: (id: string, page = 1) => apiFetch<UserProfile[]>(`/users/${id}/followers?page=${page}`),
  getFollowing: (id: string, page = 1) => apiFetch<UserProfile[]>(`/users/${id}/following?page=${page}`),
  follow: (id: string) =>
    apiFetch<void>(`/users/${id}/follow`, {
      method: "POST",
    }),
  unfollow: (id: string) =>
    apiFetch<void>(`/users/${id}/follow`, {
      method: "DELETE",
    }),
  friendshipStatus: (id: string) => apiFetch<FriendshipStatus>(`/users/${id}/friendship`),
};

export const posts = {
  list: (page = 1, limit = 20, authorId?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (authorId) {
      params.set("authorId", authorId);
    }

    return apiFetch<{ items: Post[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/posts?${params.toString()}`);
  },
  create: (content: string, _imageUrl?: string) =>
    apiFetch<Post>("/posts", {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  get: (id: string) => apiFetch<Post>(`/posts/${id}`),
  delete: (id: string) =>
    apiFetch<void>(`/posts/${id}`, {
      method: "DELETE",
    }),
  like: (id: string) =>
    apiFetch<void>(`/posts/${id}/like`, {
      method: "POST",
    }),
  unlike: (id: string) =>
    apiFetch<void>(`/posts/${id}/like`, {
      method: "DELETE",
    }),
  bookmark: (id: string) =>
    apiFetch<void>(`/posts/${id}/bookmark`, {
      method: "POST",
    }),
  unbookmark: (id: string) =>
    apiFetch<void>(`/posts/${id}/bookmark`, {
      method: "DELETE",
    }),
};

export const comments = {
  list: (postId: string, page = 1) => apiFetch<Comment[]>(`/posts/${postId}/comments?page=${page}`),
  create: (postId: string, content: string) =>
    apiFetch<Comment>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  delete: (postId: string, commentId: string) =>
    apiFetch<void>(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }),
};

export const feed = {
  get: (page = 1) => apiFetch<Post[]>(`/feed?page=${page}`),
};

export const notifications = {
  list: (page = 1) => apiFetch<Notification[]>(`/notifications?page=${page}`),
  markRead: () =>
    apiFetch<void>("/notifications/read", {
      method: "PUT",
    }),
  unreadCount: () => apiFetch<{ count: number }>("/notifications/unread-count"),
};

export const messages = {
  conversations: () => apiFetch<Conversation[]>("/messages"),
  history: (userId: string, page = 1) => apiFetch<Message[]>(`/messages/${userId}?page=${page}`),
  send: (userId: string, content: string) =>
    apiFetch<Message>(`/messages/${userId}`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  unreadCount: () => apiFetch<{ count: number }>("/messages/unread-count"),
};

export const search = {
  query: (q: string) => apiFetch<SearchResult>(`/search?q=${encodeURIComponent(q)}`),
};

export const friends = {
  list: (page = 1) => apiFetch<UserPublic[]>(`/friends?page=${page}`),
  requests: (page = 1) => apiFetch<FriendRequest[]>(`/friends/requests?page=${page}`),
  sendRequest: (id: string) =>
    apiFetch<void>(`/friends/${id}/request`, {
      method: "POST",
    }),
  accept: (id: string) =>
    apiFetch<void>(`/friends/${id}/accept`, {
      method: "PUT",
    }),
  decline: (id: string) =>
    apiFetch<void>(`/friends/${id}/decline`, {
      method: "PUT",
    }),
  remove: (id: string) =>
    apiFetch<void>(`/friends/${id}`, {
      method: "DELETE",
    }),
};

export const groups = {
  list: (page = 1) => apiFetch<Group[]>(`/groups?page=${page}`),
  create: (data: Record<string, unknown>) =>
    apiFetch<Group>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  get: (id: string) => apiFetch<Group>(`/groups/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<Group>(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/groups/${id}`, {
      method: "DELETE",
    }),
  join: (id: string) =>
    apiFetch<void>(`/groups/${id}/join`, {
      method: "POST",
    }),
  leave: (id: string) =>
    apiFetch<void>(`/groups/${id}/join`, {
      method: "DELETE",
    }),
  members: (id: string, page = 1) => apiFetch<GroupMember[]>(`/groups/${id}/members?page=${page}`),
};

export const forum = {
  categories: () => apiFetch<ForumCategory[]>("/forum/categories"),
  categoryThreads: (slug: string, page = 1) => apiFetch<{ category: ForumCategory; threads: ForumThread[] }>(`/forum/categories/${slug}?page=${page}`),
  createThread: (data: Record<string, unknown>) =>
    apiFetch<ForumThread>("/forum/threads", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getThread: (id: string) => apiFetch<ForumThread>(`/forum/threads/${id}`),
  deleteThread: (id: string) =>
    apiFetch<void>(`/forum/threads/${id}`, {
      method: "DELETE",
    }),
  createReply: (threadId: string, content: string) =>
    apiFetch<ForumReply>(`/forum/threads/${threadId}/replies`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  deleteReply: (id: string) =>
    apiFetch<void>(`/forum/replies/${id}`, {
      method: "DELETE",
    }),
};

export const bookmarks = {
  list: (page = 1) => apiFetch<Post[]>(`/bookmarks?page=${page}`),
};
