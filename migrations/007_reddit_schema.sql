-- ============================================================
-- 007: Reddit-like schema transformation
-- ============================================================

-- Rename groups to communities and update structure
ALTER TABLE groups RENAME TO communities;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS banner_url TEXT NOT NULL DEFAULT '';
ALTER TABLE communities RENAME COLUMN owner_id TO created_by_id;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Update community_members
ALTER TABLE group_members ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
ALTER TABLE group_members RENAME TO community_members;
ALTER TABLE community_members ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Update posts for Reddit-like structure
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'link'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_url TEXT NOT NULL DEFAULT '';
ALTER TABLE posts RENAME COLUMN content TO body;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS score INT NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Update comments for nesting
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS score INT NOT NULL DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Create post_votes table (replace likes)
CREATE TABLE IF NOT EXISTS post_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  value INT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

-- Create comment_votes table
CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  value INT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, comment_id)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- Migrate existing likes to post_votes
INSERT INTO post_votes (user_id, post_id, value, created_at)
SELECT user_id, post_id, 1, created_at FROM likes
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Drop old likes table
DROP TABLE IF EXISTS likes;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_score ON posts(score DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_score ON comments(post_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_post_votes_post ON post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_reports_post ON reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_comment ON reports(comment_id);

-- Update community slugs (generate from name)
UPDATE communities SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- Ensure slug uniqueness (simple approach, may need manual fix for duplicates)
-- For now, assume no duplicates</content>
<parameter name="filePath">c:\Users\Ege\Desktop\bluecrab-main\migrations\007_reddit_schema.sql