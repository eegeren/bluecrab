package messages

import (
	"context"
	"errors"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

type SendMessageInput struct {
	Content string `json:"content"`
}

// GetConversations returns a list of conversations (latest message per user).
func (s *Service) GetConversations(ctx context.Context, userID string) ([]models.Conversation, error) {
	rows, err := s.pool.Query(ctx, `
		WITH ranked AS (
		    SELECT
		        CASE WHEN sender_id = $1::uuid THEN receiver_id ELSE sender_id END AS other_id,
		        content,
		        created_at,
		        CASE WHEN receiver_id = $1::uuid AND is_read = false THEN 1 ELSE 0 END AS unread,
		        ROW_NUMBER() OVER (
		            PARTITION BY CASE WHEN sender_id = $1::uuid THEN receiver_id ELSE sender_id END
		            ORDER BY created_at DESC
		        ) AS rn
		    FROM messages
		    WHERE sender_id = $1::uuid OR receiver_id = $1::uuid
		)
		SELECT r.other_id::text, u.username, u.avatar_url,
		       r.content, SUM(r.unread) OVER (PARTITION BY r.other_id), r.created_at
		FROM ranked r
		JOIN users u ON u.id = r.other_id
		WHERE r.rn = 1
		ORDER BY r.created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Conversation
	for rows.Next() {
		var cv models.Conversation
		if err := rows.Scan(
			&cv.User.ID, &cv.User.Username, &cv.User.AvatarURL,
			&cv.LastMessage, &cv.UnreadCount, &cv.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, cv)
	}
	if list == nil {
		list = []models.Conversation{}
	}
	return list, rows.Err()
}

// GetMessages returns the message history between two users.
func (s *Service) GetMessages(ctx context.Context, userID, otherID string, limit, offset int) ([]models.Message, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT m.id::text, m.sender_id::text, m.receiver_id::text, m.content, m.is_read, m.created_at,
		       u.id::text, u.username, u.avatar_url
		FROM messages m
		JOIN users u ON u.id = m.sender_id
		WHERE (m.sender_id = $1::uuid AND m.receiver_id = $2::uuid)
		   OR (m.sender_id = $2::uuid AND m.receiver_id = $1::uuid)
		ORDER BY m.created_at DESC
		LIMIT $3 OFFSET $4`,
		userID, otherID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Message
	for rows.Next() {
		var m models.Message
		if err := rows.Scan(
			&m.ID, &m.SenderID, &m.ReceiverID, &m.Content, &m.IsRead, &m.CreatedAt,
			&m.Sender.ID, &m.Sender.Username, &m.Sender.AvatarURL,
		); err != nil {
			return nil, err
		}
		list = append(list, m)
	}
	if list == nil {
		list = []models.Message{}
	}

	// mark messages as read for the viewer
	_, _ = s.pool.Exec(ctx,
		`UPDATE messages SET is_read = true
		 WHERE receiver_id = $1::uuid AND sender_id = $2::uuid AND is_read = false`,
		userID, otherID,
	)

	return list, rows.Err()
}

// UnreadCount returns total unread message count for a user.
func (s *Service) UnreadCount(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := s.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM messages WHERE receiver_id = $1::uuid AND is_read = false`,
		userID,
	).Scan(&count)
	return count, err
}

// Send creates a new direct message.
func (s *Service) Send(ctx context.Context, senderID, receiverID string, in SendMessageInput) (*models.Message, error) {
	if in.Content == "" {
		return nil, errors.New("content is required")
	}
	if senderID == receiverID {
		return nil, errors.New("cannot message yourself")
	}

	var m models.Message
	err := s.pool.QueryRow(ctx,
		`INSERT INTO messages (sender_id, receiver_id, content)
		 VALUES ($1::uuid, $2::uuid, $3)
		 RETURNING id::text, sender_id::text, receiver_id::text, content, is_read, created_at`,
		senderID, receiverID, in.Content,
	).Scan(&m.ID, &m.SenderID, &m.ReceiverID, &m.Content, &m.IsRead, &m.CreatedAt)
	if err != nil {
		return nil, err
	}

	_ = s.pool.QueryRow(ctx,
		`SELECT username, avatar_url FROM users WHERE id = $1::uuid`, senderID,
	).Scan(&m.Sender.Username, &m.Sender.AvatarURL)
	m.Sender.ID = senderID

	return &m, nil
}
