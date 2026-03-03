package follows

import (
	"circlex/internal/http/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct{ svc *Service }

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) follow(c *fiber.Ctx) error {
	if err := h.svc.Follow(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) unfollow(c *fiber.Ctx) error {
	if err := h.svc.Unfollow(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)
	api.Post("/users/:id/follow", middleware.RequireAuth(secret), h.follow)
	api.Delete("/users/:id/follow", middleware.RequireAuth(secret), h.unfollow)
}
