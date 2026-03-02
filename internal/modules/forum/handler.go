package forum

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

func (h *Handler) categories(c *fiber.Ctx) error {
	list, err := h.svc.Categories(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) categoryThreads(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	result, err := h.svc.ThreadsByCategorySlug(c.Context(), c.Params("slug"), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(result)
}

func (h *Handler) createThread(c *fiber.Ctx) error {
	var in CreateThreadInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	thread, err := h.svc.CreateThread(c.Context(), middleware.UserID(c), in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(thread)
}

func (h *Handler) getThread(c *fiber.Ctx) error {
	thread, err := h.svc.GetThread(c.Context(), c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(thread)
}

func (h *Handler) deleteThread(c *fiber.Ctx) error {
	if err := h.svc.DeleteThread(c.Context(), c.Params("id"), middleware.UserID(c)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) createReply(c *fiber.Ctx) error {
	var in CreateReplyInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	reply, err := h.svc.CreateReply(c.Context(), c.Params("id"), middleware.UserID(c), in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(reply)
}

func (h *Handler) deleteReply(c *fiber.Ctx) error {
	if err := h.svc.DeleteReply(c.Context(), c.Params("id"), middleware.UserID(c)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)

	api.Get("/forum/categories", h.categories)
	api.Get("/forum/categories/:slug", middleware.OptionalAuth(secret), h.categoryThreads)
	api.Post("/forum/threads", middleware.RequireAuth(secret), h.createThread)
	api.Get("/forum/threads/:id", middleware.OptionalAuth(secret), h.getThread)
	api.Delete("/forum/threads/:id", middleware.RequireAuth(secret), h.deleteThread)
	api.Post("/forum/threads/:id/replies", middleware.RequireAuth(secret), h.createReply)
	api.Delete("/forum/replies/:id", middleware.RequireAuth(secret), h.deleteReply)
}
