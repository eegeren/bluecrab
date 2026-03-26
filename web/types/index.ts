export interface UserPublic {
  id: string
  username: string
  avatar_url: string
}

export interface UserProfile {
  id: string
  username: string
  email?: string
  bio: string
  avatar_url: string
  cover_url: string
  phone_number: string
  website_url: string
  instagram_url: string
  twitter_url: string
  linkedin_url: string
  github_url: string
  follower_count: number
  following_count: number
  is_following: boolean
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url: string
  like_count: number
  comment_count: number
  is_liked: boolean
  is_bookmarked: boolean
  author: UserPublic
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  author: UserPublic
  created_at: string
}

export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow'
  post_id?: string
  is_read: boolean
  actor: UserPublic
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  sender: UserPublic
  created_at: string
}

export interface Conversation {
  user: UserPublic
  last_message: string
  unread_count: number
  updated_at: string
}

export interface SearchResult {
  users: UserPublic[]
  posts: Post[]
}

export interface AuthResponse {
  success?: boolean
  user: UserProfile
}

export interface FriendRequest {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  requester: UserPublic
  addressee?: UserPublic
}

export interface FriendshipStatus {
  status: 'none' | 'self' | 'friends' | 'pending_incoming' | 'pending_outgoing'
}

export interface Group {
  id: string
  name: string
  description: string
  avatar_url: string
  owner_id: string
  is_private: boolean
  member_count: number
  created_at: string
  owner: UserPublic
  is_member: boolean
  role?: string
}

export interface GroupMember {
  group_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user: UserPublic
}

export interface ForumCategory {
  id: string
  name: string
  description: string
  slug: string
  color: string
  thread_count: number
  created_at: string
}

export interface ForumReply {
  id: string
  thread_id: string
  user_id: string
  content: string
  vote_count: number
  is_solution: boolean
  created_at: string
  author: UserPublic
}

export interface ForumThread {
  id: string
  category_id: string
  user_id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  reply_count: number
  vote_count: number
  created_at: string
  last_reply_at: string
  author: UserPublic
  category: ForumCategory
  replies?: ForumReply[]
}

