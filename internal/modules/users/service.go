package users

import (
	"context"
	"errors"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

type UpdateProfileInput struct {
	Username     string `json:"username"`
	Bio          string `json:"bio"`
	AvatarURL    string `json:"avatar_url"`
	CoverURL     string `json:"cover_url"`
	PhoneNumber  string `json:"phone_number"`
	WebsiteURL   string `json:"website_url"`
	InstagramURL string `json:"instagram_url"`
	TwitterURL   string `json:"twitter_url"`
	LinkedInURL  string `json:"linkedin_url"`
	GitHubURL    string `json:"github_url"`
}

type FriendshipStatus struct {
	Status string `json:"status"`
}

// GetProfile returns a user's public profile.
// viewerID may be empty when the request is unauthenticated.
func (s *Service) GetProfile(ctx context.Context, profileID, viewerID string) (*models.UserProfile, error) {
	var p models.UserProfile
	err := s.pool.QueryRow(ctx, `
		SELECT u.id::text, u.username, u.email, u.bio, u.avatar_url, u.cover_url, u.phone_number, u.website_url, u.instagram_url, u.twitter_url, u.linkedin_url, u.github_url, u.created_at,
		       COALESCE(fc.cnt, 0),
		       COALESCE(fg.cnt, 0),
		       EXISTS(
		           SELECT 1 FROM follows
		           WHERE follower_id = NULLIF($2,'')::uuid AND following_id = u.id
		       )
		FROM users u
		LEFT JOIN (SELECT following_id, COUNT(*) cnt FROM follows GROUP BY following_id) fc
		       ON fc.following_id = u.id
		LEFT JOIN (SELECT follower_id, COUNT(*) cnt FROM follows GROUP BY follower_id) fg
		       ON fg.follower_id = u.id
		WHERE u.id = $1::uuid`,
		profileID, viewerID,
	).Scan(&p.ID, &p.Username, &p.Email, &p.Bio, &p.AvatarURL, &p.CoverURL, &p.PhoneNumber, &p.WebsiteURL, &p.InstagramURL, &p.TwitterURL, &p.LinkedInURL, &p.GitHubURL, &p.CreatedAt,
		&p.FollowerCount, &p.FollowingCount, &p.IsFollowing)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("user not found")
	}
	return &p, err
}

// UpdateProfile lets users update their own bio and avatar.
func (s *Service) UpdateProfile(ctx context.Context, userID string, in UpdateProfileInput) (*models.UserProfile, error) {
	var p models.UserProfile
	err := s.pool.QueryRow(ctx,
		`UPDATE users SET
		   username = CASE WHEN NULLIF($1,'') IS NULL THEN username ELSE $1 END,
		   bio = $2,
		   avatar_url = $3,
		   cover_url = $4,
		   phone_number = $5,
		   website_url = $6,
		   instagram_url = $7,
		   twitter_url = $8,
		   linkedin_url = $9,
		   github_url = $10
		 WHERE id = $11::uuid
		 RETURNING id::text, username, email, bio, avatar_url, cover_url, phone_number, website_url, instagram_url, twitter_url, linkedin_url, github_url, created_at`,
		in.Username, in.Bio, in.AvatarURL, in.CoverURL, in.PhoneNumber, in.WebsiteURL, in.InstagramURL, in.TwitterURL, in.LinkedInURL, in.GitHubURL, userID,
	).Scan(&p.ID, &p.Username, &p.Email, &p.Bio, &p.AvatarURL, &p.CoverURL, &p.PhoneNumber, &p.WebsiteURL, &p.InstagramURL, &p.TwitterURL, &p.LinkedInURL, &p.GitHubURL, &p.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("user not found")
	}
	return &p, err
}

// GetUserPosts returns paginated posts for a given user.
func (s *Service) GetUserPosts(ctx context.Context, profileID, viewerID string, limit, offset int) ([]models.Post, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT p.id::text, p.content, p.image_url, p.created_at, p.user_id::text,
		       u.username, u.avatar_url,
		       COALESCE(lc.cnt, 0), COALESCE(cc.cnt, 0),
		       COALESCE(ml.liked, false),
		       COALESCE(mb.bookmarked, false)
		FROM posts p
		JOIN users u ON u.id = p.user_id
		LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM likes GROUP BY post_id) lc ON lc.post_id = p.id
		LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM comments GROUP BY post_id) cc ON cc.post_id = p.id
		LEFT JOIN (SELECT post_id, true liked FROM likes WHERE user_id = NULLIF($2,'')::uuid) ml ON ml.post_id = p.id
		LEFT JOIN (SELECT post_id, true bookmarked FROM bookmarks WHERE user_id = NULLIF($2,'')::uuid) mb ON mb.post_id = p.id
		WHERE p.user_id = $1::uuid
		ORDER BY p.created_at DESC
		LIMIT $3 OFFSET $4`,
		profileID, viewerID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPosts(rows)
}

// GetFollowers returns a user's followers list.
func (s *Service) GetFollowers(ctx context.Context, userID string, limit, offset int) ([]models.UserPublic, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT u.id::text, u.username, u.avatar_url
		FROM users u
		JOIN follows f ON f.follower_id = u.id
		WHERE f.following_id = $1::uuid
		ORDER BY f.created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanUserPublics(rows)
}

// GetFollowing returns the list of users a user follows.
func (s *Service) GetFollowing(ctx context.Context, userID string, limit, offset int) ([]models.UserPublic, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT u.id::text, u.username, u.avatar_url
		FROM users u
		JOIN follows f ON f.following_id = u.id
		WHERE f.follower_id = $1::uuid
		ORDER BY f.created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanUserPublics(rows)
}

func (s *Service) GetFriendshipStatus(ctx context.Context, viewerID, profileID string) (*FriendshipStatus, error) {
	if viewerID == "" {
		return &FriendshipStatus{Status: "none"}, nil
	}
	if viewerID == profileID {
		return &FriendshipStatus{Status: "self"}, nil
	}

	var status string
	err := s.pool.QueryRow(ctx, `
		SELECT CASE
		  WHEN f.status = 'accepted' THEN 'friends'
		  WHEN f.status = 'pending' AND f.requester_id = $1::uuid THEN 'pending_outgoing'
		  WHEN f.status = 'pending' AND f.addressee_id = $1::uuid THEN 'pending_incoming'
		  ELSE 'none'
		END
		FROM friendships f
		WHERE (f.requester_id = $1::uuid AND f.addressee_id = $2::uuid)
		   OR (f.requester_id = $2::uuid AND f.addressee_id = $1::uuid)
		ORDER BY f.created_at DESC
		LIMIT 1`,
		viewerID, profileID,
	).Scan(&status)
	if errors.Is(err, pgx.ErrNoRows) {
		return &FriendshipStatus{Status: "none"}, nil
	}
	if err != nil {
		return nil, err
	}
	return &FriendshipStatus{Status: status}, nil
}

// ---- scan helpers ----

func scanPosts(rows pgx.Rows) ([]models.Post, error) {
	var list []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(
			&p.ID, &p.Content, &p.ImageURL, &p.CreatedAt, &p.UserID,
			&p.Author.Username, &p.Author.AvatarURL,
			&p.LikeCount, &p.CommentCount, &p.IsLiked, &p.IsBookmarked,
		); err != nil {
			return nil, err
		}
		p.Author.ID = p.UserID
		list = append(list, p)
	}
	if list == nil {
		list = []models.Post{}
	}
	return list, rows.Err()
}

func scanUserPublics(rows pgx.Rows) ([]models.UserPublic, error) {
	var list []models.UserPublic
	for rows.Next() {
		var u models.UserPublic
		if err := rows.Scan(&u.ID, &u.Username, &u.AvatarURL); err != nil {
			return nil, err
		}
		list = append(list, u)
	}
	if list == nil {
		list = []models.UserPublic{}
	}
	return list, rows.Err()
}
