package forum

import (
	"context"
	"errors"

	"circlex/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ pool *pgxpool.Pool }

func NewService(pool *pgxpool.Pool) *Service { return &Service{pool: pool} }

type CreateThreadInput struct {
	CategoryID string `json:"category_id"`
	Title      string `json:"title"`
	Content    string `json:"content"`
}

type CreateReplyInput struct {
	Content string `json:"content"`
}

type CategoryThreads struct {
	Category models.ForumCategory `json:"category"`
	Threads  []models.ForumThread `json:"threads"`
}

func (s *Service) Categories(ctx context.Context) ([]models.ForumCategory, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, name, description, slug, color, thread_count, created_at
		FROM forum_categories
		ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.ForumCategory
	for rows.Next() {
		var c models.ForumCategory
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.Slug, &c.Color, &c.ThreadCount, &c.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	if list == nil {
		list = []models.ForumCategory{}
	}
	return list, rows.Err()
}

func (s *Service) ThreadsByCategorySlug(ctx context.Context, slug string, limit, offset int) (*CategoryThreads, error) {
	var out CategoryThreads
	if err := s.pool.QueryRow(ctx, `
		SELECT id::text, name, description, slug, color, thread_count, created_at
		FROM forum_categories
		WHERE slug = $1`, slug,
	).Scan(
		&out.Category.ID, &out.Category.Name, &out.Category.Description, &out.Category.Slug,
		&out.Category.Color, &out.Category.ThreadCount, &out.Category.CreatedAt,
	); errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("category not found")
	} else if err != nil {
		return nil, err
	}

	rows, err := s.pool.Query(ctx, `
		SELECT t.id::text, t.category_id::text, t.user_id::text, t.title, t.content,
		       t.is_pinned, t.is_locked, t.view_count, t.reply_count, t.vote_count, t.created_at, t.last_reply_at,
		       u.id::text, u.username, u.avatar_url
		FROM forum_threads t
		JOIN users u ON u.id = t.user_id
		WHERE t.category_id = $1::uuid
		ORDER BY t.is_pinned DESC, t.last_reply_at DESC
		LIMIT $2 OFFSET $3`,
		out.Category.ID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var t models.ForumThread
		t.Category = out.Category
		if err := rows.Scan(
			&t.ID, &t.CategoryID, &t.UserID, &t.Title, &t.Content,
			&t.IsPinned, &t.IsLocked, &t.ViewCount, &t.ReplyCount, &t.VoteCount, &t.CreatedAt, &t.LastReplyAt,
			&t.Author.ID, &t.Author.Username, &t.Author.AvatarURL,
		); err != nil {
			return nil, err
		}
		out.Threads = append(out.Threads, t)
	}
	if out.Threads == nil {
		out.Threads = []models.ForumThread{}
	}
	return &out, rows.Err()
}

func (s *Service) CreateThread(ctx context.Context, userID string, in CreateThreadInput) (*models.ForumThread, error) {
	if in.CategoryID == "" || in.Title == "" || in.Content == "" {
		return nil, errors.New("category_id, title and content are required")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var t models.ForumThread
	err = tx.QueryRow(ctx, `
		INSERT INTO forum_threads (category_id, user_id, title, content)
		VALUES ($1::uuid, $2::uuid, $3, $4)
		RETURNING id::text, category_id::text, user_id::text, title, content,
		          is_pinned, is_locked, view_count, reply_count, vote_count, created_at, last_reply_at`,
		in.CategoryID, userID, in.Title, in.Content,
	).Scan(
		&t.ID, &t.CategoryID, &t.UserID, &t.Title, &t.Content,
		&t.IsPinned, &t.IsLocked, &t.ViewCount, &t.ReplyCount, &t.VoteCount, &t.CreatedAt, &t.LastReplyAt,
	)
	if err != nil {
		return nil, err
	}

	if _, err := tx.Exec(ctx, `
		UPDATE forum_categories
		SET thread_count = thread_count + 1
		WHERE id = $1::uuid`,
		in.CategoryID,
	); err != nil {
		return nil, err
	}

	if err := tx.QueryRow(ctx, `SELECT id::text, username, avatar_url FROM users WHERE id = $1::uuid`, userID).
		Scan(&t.Author.ID, &t.Author.Username, &t.Author.AvatarURL); err != nil {
		return nil, err
	}
	if err := tx.QueryRow(ctx, `
		SELECT id::text, name, description, slug, color, thread_count, created_at
		FROM forum_categories
		WHERE id = $1::uuid`, in.CategoryID,
	).Scan(
		&t.Category.ID, &t.Category.Name, &t.Category.Description, &t.Category.Slug,
		&t.Category.Color, &t.Category.ThreadCount, &t.Category.CreatedAt,
	); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *Service) GetThread(ctx context.Context, threadID string) (*models.ForumThread, error) {
	_, _ = s.pool.Exec(ctx, `
		UPDATE forum_threads
		SET view_count = view_count + 1
		WHERE id = $1::uuid`, threadID,
	)

	var t models.ForumThread
	err := s.pool.QueryRow(ctx, `
		SELECT t.id::text, t.category_id::text, t.user_id::text, t.title, t.content,
		       t.is_pinned, t.is_locked, t.view_count, t.reply_count, t.vote_count, t.created_at, t.last_reply_at,
		       u.id::text, u.username, u.avatar_url,
		       c.id::text, c.name, c.description, c.slug, c.color, c.thread_count, c.created_at
		FROM forum_threads t
		JOIN users u ON u.id = t.user_id
		JOIN forum_categories c ON c.id = t.category_id
		WHERE t.id = $1::uuid`,
		threadID,
	).Scan(
		&t.ID, &t.CategoryID, &t.UserID, &t.Title, &t.Content,
		&t.IsPinned, &t.IsLocked, &t.ViewCount, &t.ReplyCount, &t.VoteCount, &t.CreatedAt, &t.LastReplyAt,
		&t.Author.ID, &t.Author.Username, &t.Author.AvatarURL,
		&t.Category.ID, &t.Category.Name, &t.Category.Description, &t.Category.Slug, &t.Category.Color, &t.Category.ThreadCount, &t.Category.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("thread not found")
	}
	if err != nil {
		return nil, err
	}

	rows, err := s.pool.Query(ctx, `
		SELECT r.id::text, r.thread_id::text, r.user_id::text, r.content, r.vote_count, r.is_solution, r.created_at,
		       u.id::text, u.username, u.avatar_url
		FROM forum_replies r
		JOIN users u ON u.id = r.user_id
		WHERE r.thread_id = $1::uuid
		ORDER BY r.created_at ASC`,
		threadID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var r models.ForumReply
		if err := rows.Scan(
			&r.ID, &r.ThreadID, &r.UserID, &r.Content, &r.VoteCount, &r.IsSolution, &r.CreatedAt,
			&r.Author.ID, &r.Author.Username, &r.Author.AvatarURL,
		); err != nil {
			return nil, err
		}
		t.Replies = append(t.Replies, r)
	}
	if t.Replies == nil {
		t.Replies = []models.ForumReply{}
	}
	return &t, rows.Err()
}

func (s *Service) DeleteThread(ctx context.Context, threadID, userID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var categoryID string
	err = tx.QueryRow(ctx, `
		DELETE FROM forum_threads
		WHERE id = $1::uuid
		  AND user_id = $2::uuid
		RETURNING category_id::text`,
		threadID, userID,
	).Scan(&categoryID)
	if errors.Is(err, pgx.ErrNoRows) {
		return errors.New("thread not found or not yours")
	}
	if err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		UPDATE forum_categories
		SET thread_count = GREATEST(thread_count - 1, 0)
		WHERE id = $1::uuid`,
		categoryID,
	); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (s *Service) CreateReply(ctx context.Context, threadID, userID string, in CreateReplyInput) (*models.ForumReply, error) {
	if in.Content == "" {
		return nil, errors.New("content is required")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var isLocked bool
	if err := tx.QueryRow(ctx, `SELECT is_locked FROM forum_threads WHERE id = $1::uuid`, threadID).Scan(&isLocked); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("thread not found")
		}
		return nil, err
	}
	if isLocked {
		return nil, errors.New("thread is locked")
	}

	var r models.ForumReply
	err = tx.QueryRow(ctx, `
		INSERT INTO forum_replies (thread_id, user_id, content)
		VALUES ($1::uuid, $2::uuid, $3)
		RETURNING id::text, thread_id::text, user_id::text, content, vote_count, is_solution, created_at`,
		threadID, userID, in.Content,
	).Scan(&r.ID, &r.ThreadID, &r.UserID, &r.Content, &r.VoteCount, &r.IsSolution, &r.CreatedAt)
	if err != nil {
		return nil, err
	}

	if _, err := tx.Exec(ctx, `
		UPDATE forum_threads
		SET reply_count = reply_count + 1,
		    last_reply_at = now()
		WHERE id = $1::uuid`,
		threadID,
	); err != nil {
		return nil, err
	}

	if err := tx.QueryRow(ctx, `SELECT id::text, username, avatar_url FROM users WHERE id = $1::uuid`, userID).
		Scan(&r.Author.ID, &r.Author.Username, &r.Author.AvatarURL); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *Service) DeleteReply(ctx context.Context, replyID, userID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var threadID string
	err = tx.QueryRow(ctx, `
		DELETE FROM forum_replies
		WHERE id = $1::uuid
		  AND (
		    user_id = $2::uuid
		    OR EXISTS (
		      SELECT 1
		      FROM forum_threads t
		      WHERE t.id = forum_replies.thread_id
		        AND t.user_id = $2::uuid
		    )
		  )
		RETURNING thread_id::text`,
		replyID, userID,
	).Scan(&threadID)
	if errors.Is(err, pgx.ErrNoRows) {
		return errors.New("reply not found or not yours")
	}
	if err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		UPDATE forum_threads
		SET reply_count = GREATEST(reply_count - 1, 0)
		WHERE id = $1::uuid`,
		threadID,
	); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
