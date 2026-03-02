package friends

import (
	"context"
	"errors"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

func (s *Service) ListFriends(ctx context.Context, userID string, limit, offset int) ([]models.UserPublic, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT u.id::text, u.username, u.avatar_url
		FROM friendships f
		JOIN users u ON u.id = CASE
			WHEN f.requester_id = $1::uuid THEN f.addressee_id
			ELSE f.requester_id
		END
		WHERE (f.requester_id = $1::uuid OR f.addressee_id = $1::uuid)
		  AND f.status = 'accepted'
		ORDER BY f.created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

func (s *Service) IncomingRequests(ctx context.Context, userID string, limit, offset int) ([]models.FriendRequest, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT f.id::text, f.requester_id::text, f.addressee_id::text, f.status, f.created_at,
		       u.id::text, u.username, u.avatar_url
		FROM friendships f
		JOIN users u ON u.id = f.requester_id
		WHERE f.addressee_id = $1::uuid
		  AND f.status = 'pending'
		ORDER BY f.created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.FriendRequest
	for rows.Next() {
		var fr models.FriendRequest
		if err := rows.Scan(
			&fr.ID, &fr.RequesterID, &fr.AddresseeID, &fr.Status, &fr.CreatedAt,
			&fr.Requester.ID, &fr.Requester.Username, &fr.Requester.AvatarURL,
		); err != nil {
			return nil, err
		}
		list = append(list, fr)
	}
	if list == nil {
		list = []models.FriendRequest{}
	}
	return list, rows.Err()
}

func (s *Service) SendRequest(ctx context.Context, requesterID, addresseeID string) error {
	if requesterID == addresseeID {
		return errors.New("cannot add yourself")
	}

	var alreadyFriends bool
	if err := s.pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM friendships
			WHERE ((requester_id = $1::uuid AND addressee_id = $2::uuid)
			    OR (requester_id = $2::uuid AND addressee_id = $1::uuid))
			  AND status = 'accepted'
		)`,
		requesterID, addresseeID,
	).Scan(&alreadyFriends); err != nil {
		return err
	}
	if alreadyFriends {
		return errors.New("already friends")
	}

	acceptedReverse, err := s.pool.Exec(ctx, `
		UPDATE friendships
		SET status = 'accepted'
		WHERE requester_id = $1::uuid
		  AND addressee_id = $2::uuid
		  AND status = 'pending'`,
		addresseeID, requesterID,
	)
	if err != nil {
		return err
	}
	if acceptedReverse.RowsAffected() > 0 {
		return nil
	}

	ct, err := s.pool.Exec(ctx, `
		INSERT INTO friendships (requester_id, addressee_id, status)
		VALUES ($1::uuid, $2::uuid, 'pending')
		ON CONFLICT (requester_id, addressee_id)
		DO UPDATE SET status = EXCLUDED.status
		WHERE friendships.status = 'declined'`,
		requesterID, addresseeID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("request already sent")
	}
	return nil
}

func (s *Service) AcceptRequest(ctx context.Context, addresseeID, requesterID string) error {
	ct, err := s.pool.Exec(ctx, `
		UPDATE friendships
		SET status = 'accepted'
		WHERE requester_id = $1::uuid
		  AND addressee_id = $2::uuid
		  AND status = 'pending'`,
		requesterID, addresseeID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("pending request not found")
	}
	return nil
}

func (s *Service) DeclineRequest(ctx context.Context, addresseeID, requesterID string) error {
	ct, err := s.pool.Exec(ctx, `
		UPDATE friendships
		SET status = 'declined'
		WHERE requester_id = $1::uuid
		  AND addressee_id = $2::uuid
		  AND status = 'pending'`,
		requesterID, addresseeID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("pending request not found")
	}
	return nil
}

func (s *Service) RemoveFriend(ctx context.Context, userID, otherID string) error {
	ct, err := s.pool.Exec(ctx, `
		DELETE FROM friendships
		WHERE ((requester_id = $1::uuid AND addressee_id = $2::uuid)
		    OR (requester_id = $2::uuid AND addressee_id = $1::uuid))
		  AND status = 'accepted'`,
		userID, otherID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("friendship not found")
	}
	return nil
}
