package users

import (
	"circlex/internal/http/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct{ svc *Service }

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) getProfile(c *fiber.Ctx) error {
	prof, err := h.svc.GetProfile(c.Context(), c.Params("id"), middleware.UserID(c))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(prof)
}

func (h *Handler) updateProfile(c *fiber.Ctx) error {
	var in UpdateProfileInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	prof, err := h.svc.UpdateProfile(c.Context(), middleware.UserID(c), in)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(prof)
}

func (h *Handler) getUserPosts(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	posts, err := h.svc.GetUserPosts(c.Context(), c.Params("id"), middleware.UserID(c), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(posts)
}

func (h *Handler) getFollowers(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	list, err := h.svc.GetFollowers(c.Context(), c.Params("id"), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) getFollowing(c *fiber.Ctx) error {
	limit, offset := pagination(c)
	list, err := h.svc.GetFollowing(c.Context(), c.Params("id"), limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) getFriendshipStatus(c *fiber.Ctx) error {
	status, err := h.svc.GetFriendshipStatus(c.Context(), middleware.UserID(c), c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(status)
}

func pagination(c *fiber.Ctx) (limit, offset int) {
	page := c.QueryInt("page", 1)
	limit = c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}
	offset = (page - 1) * limit
	return
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool)
	h := NewHandler(svc)
	api.Get("/users/:id", middleware.OptionalAuth(secret), h.getProfile)
	api.Put("/users/me", middleware.RequireAuth(secret), h.updateProfile)
	api.Get("/users/:id/posts", middleware.OptionalAuth(secret), h.getUserPosts)
	api.Get("/users/:id/followers", h.getFollowers)
	api.Get("/users/:id/following", h.getFollowing)
	api.Get("/users/:id/friendship", middleware.OptionalAuth(secret), h.getFriendshipStatus)
}
