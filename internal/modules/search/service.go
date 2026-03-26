package search

import (
	"context"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

type SearchResult struct {
	Users []models.UserPublic `json:"users"`
	Posts []models.Post       `json:"posts"`
}

func (s *Service) Search(ctx context.Context, query, viewerID string) (*SearchResult, error) {
	q := "%" + query + "%"
	result := &SearchResult{
		Users: []models.UserPublic{},
		Posts: []models.Post{},
	}

	// search users
	uRows, err := s.pool.Query(ctx, `
		SELECT id::text, username, avatar_url
		FROM users
		WHERE username ILIKE $1 OR bio ILIKE $1
		LIMIT 20`,
		q,
	)
	if err != nil {
		return nil, err
	}
	defer uRows.Close()
	for uRows.Next() {
		var u models.UserPublic
		if err := uRows.Scan(&u.ID, &u.Username, &u.AvatarURL); err != nil {
			return nil, err
		}
		result.Users = append(result.Users, u)
	}

	// search posts
	pRows, err := s.pool.Query(ctx, `
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
		WHERE p.content ILIKE $1
		ORDER BY p.created_at DESC
		LIMIT 20`,
		q, viewerID,
	)
	if err != nil {
		return nil, err
	}
	defer pRows.Close()
	for pRows.Next() {
		var p models.Post
		if err := pRows.Scan(
			&p.ID, &p.Content, &p.ImageURL, &p.CreatedAt, &p.UserID,
			&p.Author.Username, &p.Author.AvatarURL,
			&p.LikeCount, &p.CommentCount, &p.IsLiked, &p.IsBookmarked,
		); err != nil {
			return nil, err
		}
		p.Author.ID = p.UserID
		result.Posts = append(result.Posts, p)
	}

	return result, nil
}
