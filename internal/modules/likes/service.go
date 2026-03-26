package likes

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

func (s *Service) Like(ctx context.Context, userID, postID string) error {
	_, err := s.pool.Exec(ctx,
		`INSERT INTO likes (user_id, post_id)
		 VALUES ($1::uuid, $2::uuid)
		 ON CONFLICT DO NOTHING`,
		userID, postID,
	)
	if err != nil {
		return err
	}

	// notify post owner
	var ownerID string
	if err := s.pool.QueryRow(ctx,
		`SELECT user_id::text FROM posts WHERE id = $1::uuid`, postID,
	).Scan(&ownerID); err == nil && ownerID != userID {
		_, _ = s.pool.Exec(ctx,
			`INSERT INTO notifications (user_id, actor_id, type, post_id)
			 VALUES ($1::uuid, $2::uuid, 'like', $3::uuid)
			 ON CONFLICT DO NOTHING`,
			ownerID, userID, postID,
		)
	}
	return nil
}

func (s *Service) Unlike(ctx context.Context, userID, postID string) error {
	_, err := s.pool.Exec(ctx,
		`DELETE FROM likes WHERE user_id = $1::uuid AND post_id = $2::uuid`,
		userID, postID,
	)
	return err
}
