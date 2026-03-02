package messages

import (
	"circlex/internal/http/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct{ svc *Service }

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) conversations(c *fiber.Ctx) error {
	list, err := h.svc.GetConversations(c.Context(), middleware.UserID(c))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) history(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 40)
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	msgs, err := h.svc.GetMessages(c.Context(), middleware.UserID(c), c.Params("userId"), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(msgs)
}

func (h *Handler) send(c *fiber.Ctx) error {
	var in SendMessageInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	msg, err := h.svc.Send(c.Context(), middleware.UserID(c), c.Params("userId"), in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(msg)
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)
	g := api.Group("/messages", middleware.RequireAuth(secret))
	g.Get("/", h.conversations)
	g.Get("/:userId", h.history)
	g.Post("/:userId", h.send)
}
