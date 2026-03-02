package middleware

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// RequireAuth rejects requests without a valid Bearer token.
func RequireAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := parseToken(c, secret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		c.Locals("userID", userID)
		return c.Next()
	}
}

// OptionalAuth parses the token if present but never blocks the request.
func OptionalAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if userID, err := parseToken(c, secret); err == nil {
			c.Locals("userID", userID)
		}
		return c.Next()
	}
}

// UserID returns the authenticated user's ID from fiber context locals.
func UserID(c *fiber.Ctx) string {
	id, _ := c.Locals("userID").(string)
	return id
}

func parseToken(c *fiber.Ctx, secret string) (string, error) {
	header := c.Get("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return "", errors.New("missing token")
	}
	tokenStr := strings.TrimPrefix(header, "Bearer ")
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid claims")
	}
	userID, _ := claims["user_id"].(string)
	if userID == "" {
		return "", errors.New("empty user_id")
	}
	return userID, nil
}
