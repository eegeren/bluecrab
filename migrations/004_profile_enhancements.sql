-- ============================================================
-- 004: Profile enhancements (contact + socials + cover image)
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS twitter_url   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS github_url    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_url     TEXT NOT NULL DEFAULT '';
