package auth

import (
	"context"
	"errors"
	"strings"
	"time"

	"circlex/internal/util"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	pool      *pgxpool.Pool
	jwtSecret string
}

func NewService(pool *pgxpool.Pool, jwtSecret string) *Service {
	return &Service{pool: pool, jwtSecret: jwtSecret}
}

// ---- request / response types ----

type RegisterInput struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	IPAddress string `json:"-"`
	UserAgent string `json:"-"`
}

type LoginInput struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	IPAddress string `json:"-"`
	UserAgent string `json:"-"`
}

type MeResponse struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	Bio          string `json:"bio"`
	AvatarURL    string `json:"avatar_url"`
	CoverURL     string `json:"cover_url"`
	PhoneNumber  string `json:"phone_number"`
	WebsiteURL   string `json:"website_url"`
	InstagramURL string `json:"instagram_url"`
	TwitterURL   string `json:"twitter_url"`
	LinkedInURL  string `json:"linkedin_url"`
	GitHubURL    string `json:"github_url"`
}

type AuthResponse struct {
	Token string     `json:"token"`
	User  MeResponse `json:"user"`
}

// ---- service methods ----

func (s *Service) Register(ctx context.Context, in RegisterInput) (*AuthResponse, error) {
	in.Username = strings.TrimSpace(in.Username)
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))

	switch {
	case in.Username == "" || in.Email == "" || in.Password == "":
		s.logAuthEvent(ctx, "", in.Email, "register", false, in.IPAddress, in.UserAgent, "missing required fields")
		return nil, errors.New("username, email and password are required")
	case len(in.Username) < 3:
		s.logAuthEvent(ctx, "", in.Email, "register", false, in.IPAddress, in.UserAgent, "username too short")
		return nil, errors.New("username must be at least 3 characters")
	case len(in.Password) < 6:
		s.logAuthEvent(ctx, "", in.Email, "register", false, in.IPAddress, in.UserAgent, "password too short")
		return nil, errors.New("password must be at least 6 characters")
	}

	hash, err := util.HashPassword(in.Password)
	if err != nil {
		return nil, err
	}

	var user MeResponse
	err = s.pool.QueryRow(ctx,
		`INSERT INTO users (username, email, password_hash)
		 VALUES ($1, $2, $3)
		 RETURNING id::text, username, email, bio, avatar_url, cover_url, phone_number, website_url, instagram_url, twitter_url, linkedin_url, github_url`,
		in.Username, in.Email, hash,
	).Scan(
		&user.ID, &user.Username, &user.Email, &user.Bio, &user.AvatarURL, &user.CoverURL, &user.PhoneNumber,
		&user.WebsiteURL, &user.InstagramURL, &user.TwitterURL, &user.LinkedInURL, &user.GitHubURL,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			s.logAuthEvent(ctx, "", in.Email, "register", false, in.IPAddress, in.UserAgent, "username or email already taken")
			return nil, errors.New("username or email already taken")
		}
		s.logAuthEvent(ctx, "", in.Email, "register", false, in.IPAddress, in.UserAgent, "database error")
		return nil, err
	}
	s.logAuthEvent(ctx, user.ID, user.Email, "register", true, in.IPAddress, in.UserAgent, "")

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, err
	}
	return &AuthResponse{Token: token, User: user}, nil
}

func (s *Service) Login(ctx context.Context, in LoginInput) (*AuthResponse, error) {
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	if in.Email == "" || in.Password == "" {
		s.logAuthEvent(ctx, "", in.Email, "login", false, in.IPAddress, in.UserAgent, "missing required fields")
		return nil, errors.New("email and password are required")
	}

	var user MeResponse
	var hash string
	err := s.pool.QueryRow(ctx,
		`SELECT id::text, username, email, bio, avatar_url, cover_url, phone_number, website_url, instagram_url, twitter_url, linkedin_url, github_url, password_hash
		 FROM users WHERE email = $1`,
		in.Email,
	).Scan(
		&user.ID, &user.Username, &user.Email, &user.Bio, &user.AvatarURL, &user.CoverURL, &user.PhoneNumber,
		&user.WebsiteURL, &user.InstagramURL, &user.TwitterURL, &user.LinkedInURL, &user.GitHubURL, &hash,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		s.logAuthEvent(ctx, "", in.Email, "login", false, in.IPAddress, in.UserAgent, "invalid credentials")
		return nil, errors.New("invalid credentials")
	}
	if err != nil {
		s.logAuthEvent(ctx, "", in.Email, "login", false, in.IPAddress, in.UserAgent, "database error")
		return nil, err
	}
	if !util.CheckPassword(hash, in.Password) {
		s.logAuthEvent(ctx, user.ID, in.Email, "login", false, in.IPAddress, in.UserAgent, "invalid credentials")
		return nil, errors.New("invalid credentials")
	}
	_, _ = s.pool.Exec(ctx, `UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1::uuid`, user.ID)
	s.logAuthEvent(ctx, user.ID, user.Email, "login", true, in.IPAddress, in.UserAgent, "")

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, err
	}
	return &AuthResponse{Token: token, User: user}, nil
}

func (s *Service) GetMe(ctx context.Context, userID string) (*MeResponse, error) {
	var user MeResponse
	err := s.pool.QueryRow(ctx,
		`SELECT id::text, username, email, bio, avatar_url, cover_url, phone_number, website_url, instagram_url, twitter_url, linkedin_url, github_url FROM users WHERE id = $1::uuid`,
		userID,
	).Scan(
		&user.ID, &user.Username, &user.Email, &user.Bio, &user.AvatarURL, &user.CoverURL, &user.PhoneNumber,
		&user.WebsiteURL, &user.InstagramURL, &user.TwitterURL, &user.LinkedInURL, &user.GitHubURL,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("user not found")
	}
	return &user, err
}

func (s *Service) generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *Service) logAuthEvent(
	ctx context.Context,
	userID string,
	email string,
	eventType string,
	success bool,
	ipAddress string,
	userAgent string,
	reason string,
) {
	_, _ = s.pool.Exec(ctx, `
		INSERT INTO auth_events (user_id, email, event_type, success, ip_address, user_agent, reason)
		VALUES (NULLIF($1, '')::uuid, $2, $3, $4, $5, $6, $7)
	`, userID, email, eventType, success, ipAddress, userAgent, reason)
}
