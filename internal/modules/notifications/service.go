package notifications

import (
	"context"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

func (s *Service) GetNotifications(ctx context.Context, userID string, limit, offset int) ([]models.Notification, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT n.id::text, n.type, COALESCE(n.post_id::text, ''), n.is_read, n.created_at,
		       u.id::text, u.username, u.avatar_url
		FROM notifications n
		JOIN users u ON u.id = n.actor_id
		WHERE n.user_id = $1::uuid
		ORDER BY n.created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Notification
	for rows.Next() {
		var n models.Notification
		if err := rows.Scan(
			&n.ID, &n.Type, &n.PostID, &n.IsRead, &n.CreatedAt,
			&n.Actor.ID, &n.Actor.Username, &n.Actor.AvatarURL,
		); err != nil {
			return nil, err
		}
		list = append(list, n)
	}
	if list == nil {
		list = []models.Notification{}
	}
	return list, rows.Err()
}

func (s *Service) MarkAllRead(ctx context.Context, userID string) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE notifications SET is_read = true WHERE user_id = $1::uuid`,
		userID,
	)
	return err
}

func (s *Service) UnreadCount(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := s.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1::uuid AND is_read = false`,
		userID,
	).Scan(&count)
	return count, err
}

