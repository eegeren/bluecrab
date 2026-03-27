package main

import (
	"context"
	"log"
	"os"
	"strings"

	"circlex/internal/config"
	"circlex/internal/db"
	circhttp "circlex/internal/http"
)

func main() {
	cfg := config.Load()
	dbURL := strings.ToLower(strings.TrimSpace(cfg.Database))
	if dbURL == "" {
		log.Fatal("database url is required: set DATABASE_URL (Aiven)")
	}
	if strings.Contains(dbURL, "localhost") || strings.Contains(dbURL, "127.0.0.1") || strings.Contains(dbURL, "@db:") {
		log.Fatal("local database urls are disabled; use your Aiven DATABASE_URL")
	}

	pool, err := db.Connect(cfg.Database)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer pool.Close()

	if err := db.EnsureAuthUserFields(context.Background(), pool); err != nil {
		log.Fatalf("startup migration failed: %v", err)
	}

	if cfg.AutoMigrate {
		if err := db.RunMigrations(context.Background(), pool, cfg.MigrationsDir); err != nil {
			log.Fatalf("migration failed: %v", err)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	app := circhttp.NewServer(cfg, pool)
	log.Fatal(app.Listen(":" + port))
}
