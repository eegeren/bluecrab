package likes

import (
	"circlex/internal/http/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct{ svc *Service }

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) like(c *fiber.Ctx) error {
	if err := h.svc.Like(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) unlike(c *fiber.Ctx) error {
	if err := h.svc.Unlike(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)
	api.Post("/posts/:id/like", middleware.RequireAuth(secret), h.like)
	api.Delete("/posts/:id/like", middleware.RequireAuth(secret), h.unlike)
}
