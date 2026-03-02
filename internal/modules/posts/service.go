package posts

import (
	"context"
	"errors"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

type CreatePostInput struct {
	Content  string `json:"content"`
	ImageURL string `json:"image_url"`
}

// post query fragments shared across methods
const postCols = `
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
	WHERE p.id = $1::uuid`

func (s *Service) CreatePost(ctx context.Context, userID string, in CreatePostInput) (*models.Post, error) {
	if in.Content == "" {
		return nil, errors.New("content is required")
	}

	var p models.Post
	err := s.pool.QueryRow(ctx,
		`INSERT INTO posts (user_id, content, image_url)
		 VALUES ($1::uuid, $2, $3)
		 RETURNING id::text, content, image_url, created_at, user_id::text`,
		userID, in.Content, in.ImageURL,
	).Scan(&p.ID, &p.Content, &p.ImageURL, &p.CreatedAt, &p.UserID)
	if err != nil {
		return nil, err
	}

	// fetch author info to complete the response
	_ = s.pool.QueryRow(ctx,
		`SELECT username, avatar_url FROM users WHERE id = $1::uuid`, userID,
	).Scan(&p.Author.Username, &p.Author.AvatarURL)
	p.Author.ID = p.UserID
	return &p, nil
}

func (s *Service) GetPost(ctx context.Context, postID, viewerID string) (*models.Post, error) {
	var p models.Post
	err := s.pool.QueryRow(ctx, postCols, postID, viewerID).Scan(
		&p.ID, &p.Content, &p.ImageURL, &p.CreatedAt, &p.UserID,
		&p.Author.Username, &p.Author.AvatarURL,
		&p.LikeCount, &p.CommentCount, &p.IsLiked, &p.IsBookmarked,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("post not found")
	}
	if err != nil {
		return nil, err
	}
	p.Author.ID = p.UserID
	return &p, nil
}

func (s *Service) DeletePost(ctx context.Context, postID, userID string) error {
	ct, err := s.pool.Exec(ctx,
		`DELETE FROM posts WHERE id = $1::uuid AND user_id = $2::uuid`,
		postID, userID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("post not found or not yours")
	}
	return nil
}
