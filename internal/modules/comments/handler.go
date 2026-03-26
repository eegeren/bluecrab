package comments

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
	offset := (page - 1) * limit
	list, err := h.svc.GetComments(c.Context(), c.Params("id"), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) create(c *fiber.Ctx) error {
	var in CreateCommentInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	cm, err := h.svc.CreateComment(c.Context(), c.Params("id"), middleware.UserID(c), in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(cm)
}

func (h *Handler) delete(c *fiber.Ctx) error {
	if err := h.svc.DeleteComment(c.Context(), c.Params("commentId"), middleware.UserID(c)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)
	api.Get("/posts/:id/comments", h.list)
	api.Post("/posts/:id/comments", middleware.RequireAuth(secret), h.create)
	api.Delete("/posts/:id/comments/:commentId", middleware.RequireAuth(secret), h.delete)
}
