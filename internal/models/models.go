package models

import "time"

type User struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Bio          string    `json:"bio"`
	AvatarURL    string    `json:"avatar_url"`
	CoverURL     string    `json:"cover_url"`
	PhoneNumber  string    `json:"phone_number"`
	WebsiteURL   string    `json:"website_url"`
	InstagramURL string    `json:"instagram_url"`
	TwitterURL   string    `json:"twitter_url"`
	LinkedInURL  string    `json:"linkedin_url"`
	GitHubURL    string    `json:"github_url"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserPublic struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	AvatarURL string `json:"avatar_url"`
}

type UserProfile struct {
	ID             string    `json:"id"`
	Username       string    `json:"username"`
	Email          string    `json:"email,omitempty"`
	Bio            string    `json:"bio"`
	AvatarURL      string    `json:"avatar_url"`
	CoverURL       string    `json:"cover_url"`
	PhoneNumber    string    `json:"phone_number"`
	WebsiteURL     string    `json:"website_url"`
	InstagramURL   string    `json:"instagram_url"`
	TwitterURL     string    `json:"twitter_url"`
	LinkedInURL    string    `json:"linkedin_url"`
	GitHubURL      string    `json:"github_url"`
	FollowerCount  int       `json:"follower_count"`
	FollowingCount int       `json:"following_count"`
	IsFollowing    bool      `json:"is_following"`
	CreatedAt      time.Time `json:"created_at"`
}

type Post struct {
	ID           string     `json:"id"`
	UserID       string     `json:"user_id"`
	Content      string     `json:"content"`
	ImageURL     string     `json:"image_url"`
	LikeCount    int        `json:"like_count"`
	CommentCount int        `json:"comment_count"`
	IsLiked      bool       `json:"is_liked"`
	IsBookmarked bool       `json:"is_bookmarked"`
	Author       UserPublic `json:"author"`
	CreatedAt    time.Time  `json:"created_at"`
}

type Comment struct {
	ID        string     `json:"id"`
	PostID    string     `json:"post_id"`
	UserID    string     `json:"user_id"`
	Content   string     `json:"content"`
	Author    UserPublic `json:"author"`
	CreatedAt time.Time  `json:"created_at"`
}

type Notification struct {
	ID        string     `json:"id"`
	Type      string     `json:"type"`
	PostID    string     `json:"post_id,omitempty"`
	IsRead    bool       `json:"is_read"`
	Actor     UserPublic `json:"actor"`
	CreatedAt time.Time  `json:"created_at"`
}

type Message struct {
	ID         string     `json:"id"`
	SenderID   string     `json:"sender_id"`
	ReceiverID string     `json:"receiver_id"`
	Content    string     `json:"content"`
	IsRead     bool       `json:"is_read"`
	Sender     UserPublic `json:"sender"`
	CreatedAt  time.Time  `json:"created_at"`
}

type Conversation struct {
	User        UserPublic `json:"user"`
	LastMessage string     `json:"last_message"`
	UnreadCount int        `json:"unread_count"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type FriendRequest struct {
	ID          string     `json:"id"`
	RequesterID string     `json:"requester_id"`
	AddresseeID string     `json:"addressee_id"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	Requester   UserPublic `json:"requester"`
	Addressee   UserPublic `json:"addressee"`
}

type Group struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	AvatarURL   string     `json:"avatar_url"`
	OwnerID     string     `json:"owner_id"`
	IsPrivate   bool       `json:"is_private"`
	MemberCount int        `json:"member_count"`
	CreatedAt   time.Time  `json:"created_at"`
	Owner       UserPublic `json:"owner"`
	IsMember    bool       `json:"is_member"`
	Role        string     `json:"role,omitempty"`
}

type GroupMember struct {
	GroupID  string     `json:"group_id"`
	UserID   string     `json:"user_id"`
	Role     string     `json:"role"`
	JoinedAt time.Time  `json:"joined_at"`
	User     UserPublic `json:"user"`
}

type ForumCategory struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Slug        string    `json:"slug"`
	Color       string    `json:"color"`
	ThreadCount int       `json:"thread_count"`
	CreatedAt   time.Time `json:"created_at"`
}

type ForumThread struct {
	ID          string        `json:"id"`
	CategoryID  string        `json:"category_id"`
	UserID      string        `json:"user_id"`
	Title       string        `json:"title"`
	Content     string        `json:"content"`
	IsPinned    bool          `json:"is_pinned"`
	IsLocked    bool          `json:"is_locked"`
	ViewCount   int           `json:"view_count"`
	ReplyCount  int           `json:"reply_count"`
	VoteCount   int           `json:"vote_count"`
	CreatedAt   time.Time     `json:"created_at"`
	LastReplyAt time.Time     `json:"last_reply_at"`
	Author      UserPublic    `json:"author"`
	Category    ForumCategory `json:"category"`
	Replies     []ForumReply  `json:"replies,omitempty"`
}

type ForumReply struct {
	ID         string     `json:"id"`
	ThreadID   string     `json:"thread_id"`
	UserID     string     `json:"user_id"`
	Content    string     `json:"content"`
	VoteCount  int        `json:"vote_count"`
	IsSolution bool       `json:"is_solution"`
	CreatedAt  time.Time  `json:"created_at"`
	Author     UserPublic `json:"author"`
}
