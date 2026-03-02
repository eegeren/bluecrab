package posts

import (
	"circlex/internal/http/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct{ svc *Service }

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) create(c *fiber.Ctx) error {
	var in CreatePostInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	post, err := h.svc.CreatePost(c.Context(), middleware.UserID(c), in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(post)
}

func (h *Handler) get(c *fiber.Ctx) error {
	post, err := h.svc.GetPost(c.Context(), c.Params("id"), middleware.UserID(c))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(post)
}

func (h *Handler) delete(c *fiber.Ctx) error {
	if err := h.svc.DeletePost(c.Context(), c.Params("id"), middleware.UserID(c)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)
	api.Post("/posts", middleware.RequireAuth(secret), h.create)
	api.Get("/posts/:id", middleware.OptionalAuth(secret), h.get)
	api.Delete("/posts/:id", middleware.RequireAuth(secret), h.delete)
}
