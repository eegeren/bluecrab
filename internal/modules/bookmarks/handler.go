package bookmarks

import (
	"circlex/internal/http/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct{ svc *Service }

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func pagination(c *fiber.Ctx) (limit, offset int) {
	page := c.QueryInt("page", 1)
	limit = c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}
	offset = (page - 1) * limit
	return
}

func (h *Handler) add(c *fiber.Ctx) error {
	if err := h.svc.Add(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) remove(c *fiber.Ctx) error {
	if err := h.svc.Remove(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) list(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	list, err := h.svc.List(c.Context(), middleware.UserID(c), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)
	api.Post("/posts/:id/bookmark", middleware.RequireAuth(secret), h.add)
	api.Delete("/posts/:id/bookmark", middleware.RequireAuth(secret), h.remove)
	api.Get("/bookmarks", middleware.RequireAuth(secret), h.list)
}
