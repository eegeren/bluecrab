package comments

import (
	"context"
	"errors"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

type CreateCommentInput struct {
	Content string `json:"content"`
}

func (s *Service) GetComments(ctx context.Context, postID string, limit, offset int) ([]models.Comment, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT c.id::text, c.post_id::text, c.user_id::text, c.content, c.created_at,
		       u.username, u.avatar_url
		FROM comments c
		JOIN users u ON u.id = c.user_id
		WHERE c.post_id = $1::uuid
		ORDER BY c.created_at ASC
		LIMIT $2 OFFSET $3`,
		postID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Comment
	for rows.Next() {
		var cm models.Comment
		if err := rows.Scan(
			&cm.ID, &cm.PostID, &cm.UserID, &cm.Content, &cm.CreatedAt,
			&cm.Author.Username, &cm.Author.AvatarURL,
		); err != nil {
			return nil, err
		}
		cm.Author.ID = cm.UserID
		list = append(list, cm)
	}
	if list == nil {
		list = []models.Comment{}
	}
	return list, rows.Err()
}

func (s *Service) CreateComment(ctx context.Context, postID, userID string, in CreateCommentInput) (*models.Comment, error) {
	if in.Content == "" {
		return nil, errors.New("content is required")
	}

	var cm models.Comment
	err := s.pool.QueryRow(ctx,
		`INSERT INTO comments (post_id, user_id, content)
		 VALUES ($1::uuid, $2::uuid, $3)
		 RETURNING id::text, post_id::text, user_id::text, content, created_at`,
		postID, userID, in.Content,
	).Scan(&cm.ID, &cm.PostID, &cm.UserID, &cm.Content, &cm.CreatedAt)
	if err != nil {
		return nil, err
	}

	_ = s.pool.QueryRow(ctx,
		`SELECT username, avatar_url FROM users WHERE id = $1::uuid`, userID,
	).Scan(&cm.Author.Username, &cm.Author.AvatarURL)
	cm.Author.ID = userID

	// notify post owner
	var ownerID string
	if err := s.pool.QueryRow(ctx,
		`SELECT user_id::text FROM posts WHERE id = $1::uuid`, postID,
	).Scan(&ownerID); err == nil && ownerID != userID {
		_, _ = s.pool.Exec(ctx,
			`INSERT INTO notifications (user_id, actor_id, type, post_id)
			 VALUES ($1::uuid, $2::uuid, 'comment', $3::uuid)`,
			ownerID, userID, postID,
		)
	}

	return &cm, nil
}

func (s *Service) DeleteComment(ctx context.Context, commentID, userID string) error {
	ct, err := s.pool.Exec(ctx,
		`DELETE FROM comments WHERE id = $1::uuid AND user_id = $2::uuid`,
		commentID, userID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("comment not found or not yours")
	}
	return nil
}

