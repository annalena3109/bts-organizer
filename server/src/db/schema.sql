-- Schema for Back-to-School & Life Organization App (Turso / LibSQL Database)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  grade_level TEXT DEFAULT 'Student',
  currency TEXT DEFAULT '$',
  week_start TEXT DEFAULT 'Monday',
  time_format TEXT DEFAULT '12h',
  theme_accent TEXT DEFAULT 'sage',
  target_sleep INTEGER DEFAULT 8,
  bedtime_goal TEXT DEFAULT '23:00',
  morning_reminder TEXT DEFAULT '07:30',
  sunday_reminder INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'School',
  priority TEXT DEFAULT 'medium',
  due_date TEXT,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly REAL DEFAULT 500.00,
  weekly REAL DEFAULT 125.00,
  daily REAL DEFAULT 20.00,
  snack_weekly REAL DEFAULT 30.00
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);

CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  snack TEXT,
  UNIQUE (user_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  category TEXT DEFAULT 'Produce',
  checked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shopping_user ON shopping_items(user_id);

CREATE TABLE IF NOT EXISTS freezer_meals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  portions INTEGER DEFAULT 1,
  date_frozen TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS clothing_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  laundry_status TEXT DEFAULT 'clean',
  worn_count INTEGER DEFAULT 0,
  image_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_clothing_user ON clothing_items(user_id);

CREATE TABLE IF NOT EXISTS outfits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occasion TEXT,
  items TEXT DEFAULT '[]',
  last_worn TEXT,
  is_today INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sleep_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  bedtime TEXT NOT NULL,
  wake_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  quality INTEGER DEFAULT 4,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_sleep_user ON sleep_records(user_id);

CREATE TABLE IF NOT EXISTS home_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  frequency TEXT DEFAULT 'Weekly',
  is_completed INTEGER DEFAULT 0,
  last_cleaned TEXT
);
CREATE INDEX IF NOT EXISTS idx_home_tasks_user ON home_tasks(user_id);
