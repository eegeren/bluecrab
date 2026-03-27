package db

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

const ensureAuthUserFieldsSQL = `
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;
`

const ensureAuthUsernameConstraintSQL = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
    END IF;
END
$$;
`

const ensureAuthUsernameIndexSQL = `
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`

func EnsureAuthUserFields(ctx context.Context, pool *pgxpool.Pool) error {
	log.Println("startup migration: ensuring auth user fields on users table")

	statements := []struct {
		name string
		sql  string
	}{
		{name: "ensure users auth columns", sql: ensureAuthUserFieldsSQL},
		{name: "ensure users username unique constraint", sql: ensureAuthUsernameConstraintSQL},
		{name: "ensure users username index", sql: ensureAuthUsernameIndexSQL},
	}

	for _, stmt := range statements {
		if _, err := pool.Exec(ctx, stmt.sql); err != nil {
			log.Printf("startup migration failed: %s: %v", stmt.name, err)
			return fmt.Errorf("%s: %w", stmt.name, err)
		}
	}

	log.Println("startup migration completed: auth user fields verified")
	return nil
}
