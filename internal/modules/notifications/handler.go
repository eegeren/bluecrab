package notifications

import (
	"circlex/internal/http/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct{ svc *Service }

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) list(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	list, err := h.svc.GetNotifications(c.Context(), middleware.UserID(c), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) markRead(c *fiber.Ctx) error {
	if err := h.svc.MarkAllRead(c.Context(), middleware.UserID(c)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) unreadCount(c *fiber.Ctx) error {
	count, err := h.svc.UnreadCount(c.Context(), middleware.UserID(c))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"count": count})
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)
	g := api.Group("/notifications", middleware.RequireAuth(secret))
	g.Get("/", h.list)
	g.Put("/read", h.markRead)
	g.Get("/unread-count", h.unreadCount)
}
