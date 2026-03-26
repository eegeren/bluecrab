package groups

import (
	"context"
	"errors"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

type CreateGroupInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	AvatarURL   string `json:"avatar_url"`
	IsPrivate   bool   `json:"is_private"`
}

type UpdateGroupInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	AvatarURL   string `json:"avatar_url"`
	IsPrivate   bool   `json:"is_private"`
}

func (s *Service) List(ctx context.Context, viewerID string, limit, offset int) ([]models.Group, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT g.id::text, g.name, g.description, g.avatar_url, g.owner_id::text, g.is_private, g.member_count, g.created_at,
		       o.id::text, o.username, o.avatar_url,
		       COALESCE(gm.user_id IS NOT NULL, false),
		       COALESCE(gm.role, '')
		FROM groups g
		JOIN users o ON o.id = g.owner_id
		LEFT JOIN group_members gm
		  ON gm.group_id = g.id
		 AND gm.user_id = NULLIF($1, '')::uuid
		WHERE g.is_private = false
		   OR g.owner_id = NULLIF($1, '')::uuid
		   OR gm.user_id IS NOT NULL
		ORDER BY g.created_at DESC
		LIMIT $2 OFFSET $3`,
		viewerID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Group
	for rows.Next() {
		var g models.Group
		if err := rows.Scan(
			&g.ID, &g.Name, &g.Description, &g.AvatarURL, &g.OwnerID, &g.IsPrivate, &g.MemberCount, &g.CreatedAt,
			&g.Owner.ID, &g.Owner.Username, &g.Owner.AvatarURL,
			&g.IsMember, &g.Role,
		); err != nil {
			return nil, err
		}
		list = append(list, g)
	}
	if list == nil {
		list = []models.Group{}
	}
	return list, rows.Err()
}

func (s *Service) Create(ctx context.Context, ownerID string, in CreateGroupInput) (*models.Group, error) {
	if in.Name == "" {
		return nil, errors.New("name is required")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var g models.Group
	err = tx.QueryRow(ctx, `
		INSERT INTO groups (name, description, avatar_url, owner_id, is_private, member_count)
		VALUES ($1, $2, $3, $4::uuid, $5, 1)
		RETURNING id::text, name, description, avatar_url, owner_id::text, is_private, member_count, created_at`,
		in.Name, in.Description, in.AvatarURL, ownerID, in.IsPrivate,
	).Scan(&g.ID, &g.Name, &g.Description, &g.AvatarURL, &g.OwnerID, &g.IsPrivate, &g.MemberCount, &g.CreatedAt)
	if err != nil {
		return nil, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO group_members (group_id, user_id, role)
		VALUES ($1::uuid, $2::uuid, 'owner')`,
		g.ID, ownerID,
	); err != nil {
		return nil, err
	}

	if err := tx.QueryRow(ctx, `SELECT id::text, username, avatar_url FROM users WHERE id = $1::uuid`, ownerID).
		Scan(&g.Owner.ID, &g.Owner.Username, &g.Owner.AvatarURL); err != nil {
		return nil, err
	}
	g.IsMember = true
	g.Role = "owner"

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &g, nil
}

func (s *Service) Get(ctx context.Context, groupID, viewerID string) (*models.Group, error) {
	var g models.Group
	err := s.pool.QueryRow(ctx, `
		SELECT g.id::text, g.name, g.description, g.avatar_url, g.owner_id::text, g.is_private, g.member_count, g.created_at,
		       o.id::text, o.username, o.avatar_url,
		       COALESCE(gm.user_id IS NOT NULL, false),
		       COALESCE(gm.role, '')
		FROM groups g
		JOIN users o ON o.id = g.owner_id
		LEFT JOIN group_members gm
		  ON gm.group_id = g.id
		 AND gm.user_id = NULLIF($2, '')::uuid
		WHERE g.id = $1::uuid
		  AND (
		    g.is_private = false
		    OR g.owner_id = NULLIF($2, '')::uuid
		    OR gm.user_id IS NOT NULL
		  )`,
		groupID, viewerID,
	).Scan(
		&g.ID, &g.Name, &g.Description, &g.AvatarURL, &g.OwnerID, &g.IsPrivate, &g.MemberCount, &g.CreatedAt,
		&g.Owner.ID, &g.Owner.Username, &g.Owner.AvatarURL,
		&g.IsMember, &g.Role,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("group not found")
	}
	if err != nil {
		return nil, err
	}
	return &g, nil
}

func (s *Service) Update(ctx context.Context, groupID, userID string, in UpdateGroupInput) (*models.Group, error) {
	var g models.Group
	err := s.pool.QueryRow(ctx, `
		UPDATE groups
		SET name = $1, description = $2, avatar_url = $3, is_private = $4
		WHERE id = $5::uuid
		  AND owner_id = $6::uuid
		RETURNING id::text, name, description, avatar_url, owner_id::text, is_private, member_count, created_at`,
		in.Name, in.Description, in.AvatarURL, in.IsPrivate, groupID, userID,
	).Scan(&g.ID, &g.Name, &g.Description, &g.AvatarURL, &g.OwnerID, &g.IsPrivate, &g.MemberCount, &g.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("group not found or not owner")
	}
	if err != nil {
		return nil, err
	}
	if err := s.pool.QueryRow(ctx, `SELECT id::text, username, avatar_url FROM users WHERE id = $1::uuid`, g.OwnerID).
		Scan(&g.Owner.ID, &g.Owner.Username, &g.Owner.AvatarURL); err != nil {
		return nil, err
	}
	g.IsMember = true
	g.Role = "owner"
	return &g, nil
}

func (s *Service) Delete(ctx context.Context, groupID, userID string) error {
	ct, err := s.pool.Exec(ctx, `
		DELETE FROM groups
		WHERE id = $1::uuid
		  AND owner_id = $2::uuid`,
		groupID, userID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("group not found or not owner")
	}
	return nil
}

func (s *Service) Join(ctx context.Context, groupID, userID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var isPrivate bool
	if err := tx.QueryRow(ctx, `SELECT is_private FROM groups WHERE id = $1::uuid`, groupID).Scan(&isPrivate); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return errors.New("group not found")
		}
		return err
	}
	if isPrivate {
		return errors.New("private groups cannot be joined directly")
	}

	ct, err := tx.Exec(ctx, `
		INSERT INTO group_members (group_id, user_id, role)
		VALUES ($1::uuid, $2::uuid, 'member')
		ON CONFLICT (group_id, user_id) DO NOTHING`,
		groupID, userID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() > 0 {
		if _, err := tx.Exec(ctx, `
			UPDATE groups
			SET member_count = member_count + 1
			WHERE id = $1::uuid`,
			groupID,
		); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

func (s *Service) Leave(ctx context.Context, groupID, userID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	ct, err := tx.Exec(ctx, `
		DELETE FROM group_members
		WHERE group_id = $1::uuid
		  AND user_id = $2::uuid
		  AND role <> 'owner'`,
		groupID, userID,
	)
	if err != nil {
		return err
	}
	if ct.RowsAffected() > 0 {
		if _, err := tx.Exec(ctx, `
			UPDATE groups
			SET member_count = GREATEST(member_count - 1, 1)
			WHERE id = $1::uuid`,
			groupID,
		); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

func (s *Service) Members(ctx context.Context, groupID, viewerID string, limit, offset int) ([]models.GroupMember, error) {
	var canView bool
	if err := s.pool.QueryRow(ctx, `
		SELECT CASE
		  WHEN g.is_private = false THEN true
		  WHEN g.owner_id = NULLIF($2, '')::uuid THEN true
		  WHEN EXISTS (
		    SELECT 1 FROM group_members gm
		    WHERE gm.group_id = g.id AND gm.user_id = NULLIF($2, '')::uuid
		  ) THEN true
		  ELSE false
		END
		FROM groups g
		WHERE g.id = $1::uuid`,
		groupID, viewerID,
	).Scan(&canView); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("group not found")
		}
		return nil, err
	}
	if !canView {
		return nil, errors.New("group is private")
	}

	rows, err := s.pool.Query(ctx, `
		SELECT gm.group_id::text, gm.user_id::text, gm.role, gm.joined_at,
		       u.id::text, u.username, u.avatar_url
		FROM group_members gm
		JOIN users u ON u.id = gm.user_id
		WHERE gm.group_id = $1::uuid
		ORDER BY gm.joined_at ASC
		LIMIT $2 OFFSET $3`,
		groupID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.GroupMember
	for rows.Next() {
		var m models.GroupMember
		if err := rows.Scan(
			&m.GroupID, &m.UserID, &m.Role, &m.JoinedAt,
			&m.User.ID, &m.User.Username, &m.User.AvatarURL,
		); err != nil {
			return nil, err
		}
		list = append(list, m)
	}
	if list == nil {
		list = []models.GroupMember{}
	}
	return list, rows.Err()
}
