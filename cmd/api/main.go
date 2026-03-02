package main

import (
	"context"
	"log"

	"circlex/internal/config"
	"circlex/internal/db"
	circhttp "circlex/internal/http"
)

func main() {
	cfg := config.Load()

	pool, err := db.Connect(context.Background(), cfg.Database)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer pool.Close()

	app := circhttp.NewServer(cfg, pool)
	log.Fatal(app.Listen(":" + cfg.Port))
}
