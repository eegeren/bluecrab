package config

import "os"

type Config struct {
	Port      string
	Database  string
	JWTSecret string
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func Load() Config {
	return Config{
		Port:      getEnv("PORT", "8080"),
		Database:  getEnv("DATABASE_URL", "postgres://circlex:circlex@localhost:5432/circlex?sslmode=disable"),
		JWTSecret: getEnv("JWT_SECRET", "dev_secret_change_me"),
	}
}
