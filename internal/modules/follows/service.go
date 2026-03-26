package follows

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

func (s *Service) Follow(ctx context.Context, followerID, followingID string) error {
	if followerID == followingID {
		return errors.New("cannot follow yourself")
	}
	_, err := s.pool.Exec(ctx,
		`INSERT INTO follows (follower_id, following_id)
		 VALUES ($1::uuid, $2::uuid)
		 ON CONFLICT DO NOTHING`,
		followerID, followingID,
	)
	if err != nil {
		return err
	}

	// notify the followed user
	_, _ = s.pool.Exec(ctx,
		`INSERT INTO notifications (user_id, actor_id, type)
		 VALUES ($1::uuid, $2::uuid, 'follow')`,
		followingID, followerID,
	)
	return nil
}

func (s *Service) Unfollow(ctx context.Context, followerID, followingID string) error {
	_, err := s.pool.Exec(ctx,
		`DELETE FROM follows WHERE follower_id = $1::uuid AND following_id = $2::uuid`,
		followerID, followingID,
	)
	return err
}
