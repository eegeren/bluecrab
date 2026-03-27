package auth

import (
	"circlex/internal/http/middleware"
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct{ svc *Service }

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) register(c *fiber.Ctx) error {
	var in RegisterInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	in.IPAddress = c.IP()
	in.UserAgent = c.Get("User-Agent")
	resp, err := h.svc.Register(c.Context(), in)
	if err != nil {
		return authError(c, err)
	}
	setAuthCookie(c, resp.Token)
	return c.Status(fiber.StatusCreated).JSON(resp)
}

func (h *Handler) login(c *fiber.Ctx) error {
	var in LoginInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	in.IPAddress = c.IP()
	in.UserAgent = c.Get("User-Agent")
	resp, err := h.svc.Login(c.Context(), in)
	if err != nil {
		return authError(c, err)
	}
	setAuthCookie(c, resp.Token)
	return c.JSON(resp)
}

func (h *Handler) logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
		Expires:  time.Unix(0, 0),
	})
	return c.JSON(fiber.Map{"success": true})
}

func (h *Handler) me(c *fiber.Ctx) error {
	user, err := h.svc.GetMe(c.Context(), middleware.UserID(c))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	return c.JSON(fiber.Map{"user": user})
}

func RegisterRoutes(api fiber.Router, pool *pgxpool.Pool, secret string) {
	svc := NewService(pool, secret)
	h := NewHandler(svc)
	g := api.Group("/auth")
	g.Post("/register", h.register)
	g.Post("/login", h.login)
	g.Post("/logout", h.logout)
	g.Get("/me", middleware.RequireAuth(secret), h.me)
}

func authError(c *fiber.Ctx, err error) error {
	message := err.Error()

	switch {
	case errors.Is(err, fiber.ErrBadRequest),
		message == "invalid body",
		message == "email and password are required",
		message == "username must be at least 3 characters",
		message == "password must be at least 6 characters":
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": message})
	case message == "invalid credentials":
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": message})
	case message == "email already taken" || message == "username or email already taken":
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": message})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
	}
}

func setAuthCookie(c *fiber.Ctx, token string) {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 7,
	})
}
