package friends

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

func (h *Handler) listFriends(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	list, err := h.svc.ListFriends(c.Context(), middleware.UserID(c), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) incomingRequests(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	list, err := h.svc.IncomingRequests(c.Context(), middleware.UserID(c), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) sendRequest(c *fiber.Ctx) error {
	if err := h.svc.SendRequest(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) accept(c *fiber.Ctx) error {
	if err := h.svc.AcceptRequest(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) decline(c *fiber.Ctx) error {
	if err := h.svc.DeclineRequest(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) remove(c *fiber.Ctx) error {
	if err := h.svc.RemoveFriend(c.Context(), middleware.UserID(c), c.Params("id")); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)

	api.Get("/friends", middleware.RequireAuth(secret), h.listFriends)
	api.Get("/friends/requests", middleware.RequireAuth(secret), h.incomingRequests)
	api.Post("/friends/:id/request", middleware.RequireAuth(secret), h.sendRequest)
	api.Put("/friends/:id/accept", middleware.RequireAuth(secret), h.accept)
	api.Put("/friends/:id/decline", middleware.RequireAuth(secret), h.decline)
	api.Delete("/friends/:id", middleware.RequireAuth(secret), h.remove)
}
