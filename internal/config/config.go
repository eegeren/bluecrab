package config

import (
	"os"
	"strings"
)

type Config struct {
	Port          string
	Database      string
	JWTSecret     string
	AutoMigrate   bool
	MigrationsDir string
}

func loadDotEnv(path string) {
	content, err := os.ReadFile(path)
	if err != nil {
		return
	}

	for _, line := range strings.Split(string(content), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		val = strings.Trim(val, `"`)
		val = strings.Trim(val, `'`)

		if key != "" && os.Getenv(key) == "" {
			_ = os.Setenv(key, val)
		}
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvBool(key string, def bool) bool {
	v := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
	if v == "" {
		return def
	}
	return v == "1" || v == "true" || v == "yes" || v == "on"
}

func getDatabaseURL() string {
	if v := strings.TrimSpace(os.Getenv("SUPABASE_DB_URL")); v != "" {
		return v
	}
	return getEnv("DATABASE_URL", "")
}

func Load() Config {
	loadDotEnv(".env")

	return Config{
		Port:          getEnv("PORT", "8080"),
		Database:      getDatabaseURL(),
		JWTSecret:     getEnv("JWT_SECRET", "dev_secret_change_me"),
		AutoMigrate:   getEnvBool("AUTO_MIGRATE", true),
		MigrationsDir: getEnv("MIGRATIONS_DIR", "migrations"),
	}
}
