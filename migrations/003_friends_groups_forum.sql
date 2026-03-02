-- ============================================================
-- 003: Friends, Groups, Forum
-- ============================================================

-- Arkadaşlık sistemi
CREATE TABLE IF NOT EXISTS friendships (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);

-- Gruplar
CREATE TABLE IF NOT EXISTS groups (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  avatar_url   TEXT NOT NULL DEFAULT '',
  owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private   BOOLEAN NOT NULL DEFAULT false,
  member_count INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id  UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_groups_owner     ON groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_group_members_u  ON group_members(user_id);

-- Forum kategorileri
CREATE TABLE IF NOT EXISTS forum_categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  slug         TEXT NOT NULL UNIQUE,
  color        TEXT NOT NULL DEFAULT '#7c3aed',
  thread_count INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forum thread'leri
CREATE TABLE IF NOT EXISTS forum_threads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id  UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  is_pinned    BOOLEAN NOT NULL DEFAULT false,
  is_locked    BOOLEAN NOT NULL DEFAULT false,
  view_count   INT NOT NULL DEFAULT 0,
  reply_count  INT NOT NULL DEFAULT 0,
  vote_count   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reply_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id, last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user     ON forum_threads(user_id);

-- Forum cevapları
CREATE TABLE IF NOT EXISTS forum_replies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id   UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  vote_count  INT NOT NULL DEFAULT 0,
  is_solution BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id, created_at ASC);

-- Varsayılan forum kategorileri
INSERT INTO forum_categories (name, description, slug, color) VALUES
  ('Genel',      'Genel konuşmalar ve duyurular',    'genel',      '#7c3aed'),
  ('Teknoloji',  'Yazılım, donanım ve teknoloji',    'teknoloji',  '#2563eb'),
  ('Sanat',      'Sanat, tasarım ve yaratıcılık',    'sanat',      '#dc2626'),
  ('Spor',       'Spor, fitness ve sağlık',          'spor',       '#16a34a'),
  ('Oyun',       'Oyunlar, e-spor ve eğlence',       'oyun',       '#d97706')
ON CONFLICT (slug) DO NOTHING;
