PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_hour INTEGER NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  end_hour INTEGER NOT NULL CHECK (end_hour = start_hour + 1),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past')),
  created_at TEXT NOT NULL,
  cancelled_at TEXT,
  CHECK ((status = 'cancelled' AND cancelled_at IS NOT NULL) OR status != 'cancelled')
);

CREATE UNIQUE INDEX IF NOT EXISTS reservations_active_slot
  ON reservations (court_id, date, start_hour)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS reservations_active_user
  ON reservations (user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS reservations_lookup
  ON reservations (court_id, date, status);
