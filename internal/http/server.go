package http

import (
	"circlex/internal/config"
	"circlex/internal/modules/auth"
	"circlex/internal/modules/bookmarks"
	"circlex/internal/modules/comments"
	"circlex/internal/modules/feed"
	"circlex/internal/modules/follows"
	"circlex/internal/modules/forum"
	"circlex/internal/modules/friends"
	"circlex/internal/modules/groups"
	"circlex/internal/modules/likes"
	"circlex/internal/modules/messages"
	"circlex/internal/modules/notifications"
	"circlex/internal/modules/posts"
	"circlex/internal/modules/search"
	"circlex/internal/modules/users"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewServer(cfg config.Config, pool *pgxpool.Pool) *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	api := app.Group("/api")

	auth.RegisterRoutes(api, pool, cfg.JWTSecret)
	users.RegisterRoutes(api, pool, cfg.JWTSecret)
	posts.RegisterRoutes(api, pool, cfg.JWTSecret)
	comments.RegisterRoutes(api, pool, cfg.JWTSecret)
	likes.RegisterRoutes(api, pool, cfg.JWTSecret)
	follows.RegisterRoutes(api, pool, cfg.JWTSecret)
	friends.RegisterRoutes(api, pool, cfg.JWTSecret)
	groups.RegisterRoutes(api, pool, cfg.JWTSecret)
	forum.RegisterRoutes(api, pool, cfg.JWTSecret)
	feed.RegisterRoutes(api, pool, cfg.JWTSecret)
	notifications.RegisterRoutes(api, pool, cfg.JWTSecret)
	messages.RegisterRoutes(api, pool, cfg.JWTSecret)
	search.RegisterRoutes(api, pool, cfg.JWTSecret)
	bookmarks.RegisterRoutes(api, pool, cfg.JWTSecret)

	return app
}
