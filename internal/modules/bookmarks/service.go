package bookmarks

import (
	"context"
	"errors"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

func (s *Service) Add(ctx context.Context, userID, postID string) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO bookmarks (user_id, post_id)
		VALUES ($1::uuid, $2::uuid)
		ON CONFLICT (user_id, post_id) DO NOTHING`,
		userID, postID,
	)
	return err
}

func (s *Service) Remove(ctx context.Context, userID, postID string) error {
	_, err := s.pool.Exec(ctx, `
		DELETE FROM bookmarks
		WHERE user_id = $1::uuid
		  AND post_id = $2::uuid`,
		userID, postID,
	)
	return err
}

func (s *Service) List(ctx context.Context, userID string, limit, offset int) ([]models.Post, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT p.id::text, p.content, p.image_url, p.created_at, p.user_id::text,
		       u.username, u.avatar_url,
		       COALESCE(lc.cnt, 0), COALESCE(cc.cnt, 0),
		       COALESCE(ml.liked, false),
		       true
		FROM bookmarks b
		JOIN posts p ON p.id = b.post_id
		JOIN users u ON u.id = p.user_id
		LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM likes GROUP BY post_id) lc ON lc.post_id = p.id
		LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM comments GROUP BY post_id) cc ON cc.post_id = p.id
		LEFT JOIN (SELECT post_id, true liked FROM likes WHERE user_id = $1::uuid) ml ON ml.post_id = p.id
		WHERE b.user_id = $1::uuid
		ORDER BY b.created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

func ensureExists(err error, label string) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return errors.New(label + " not found")
	}
	return err
}
