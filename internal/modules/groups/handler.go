package groups

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

func (h *Handler) list(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	list, err := h.svc.List(c.Context(), middleware.UserID(c), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) create(c *fiber.Ctx) error {
	var in CreateGroupInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	g, err := h.svc.Create(c.Context(), middleware.UserID(c), in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(g)
}

func (h *Handler) get(c *fiber.Ctx) error {
	g, err := h.svc.Get(c.Context(), c.Params("id"), middleware.UserID(c))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(g)
}

func (h *Handler) update(c *fiber.Ctx) error {
	var in UpdateGroupInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	g, err := h.svc.Update(c.Context(), c.Params("id"), middleware.UserID(c), in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(g)
}

func (h *Handler) delete(c *fiber.Ctx) error {
	if err := h.svc.Delete(c.Context(), c.Params("id"), middleware.UserID(c)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) join(c *fiber.Ctx) error {
	if err := h.svc.Join(c.Context(), c.Params("id"), middleware.UserID(c)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) leave(c *fiber.Ctx) error {
	if err := h.svc.Leave(c.Context(), c.Params("id"), middleware.UserID(c)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) members(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	list, err := h.svc.Members(c.Context(), c.Params("id"), middleware.UserID(c), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)

	api.Get("/groups", middleware.OptionalAuth(secret), h.list)
	api.Post("/groups", middleware.RequireAuth(secret), h.create)
	api.Get("/groups/:id", middleware.OptionalAuth(secret), h.get)
	api.Put("/groups/:id", middleware.RequireAuth(secret), h.update)
	api.Delete("/groups/:id", middleware.RequireAuth(secret), h.delete)
	api.Post("/groups/:id/join", middleware.RequireAuth(secret), h.join)
	api.Delete("/groups/:id/join", middleware.RequireAuth(secret), h.leave)
	api.Get("/groups/:id/members", middleware.OptionalAuth(secret), h.members)
}
