-- Schema for Back-to-School & Life Organization App (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  grade_level VARCHAR(255) DEFAULT 'Student',
  currency VARCHAR(10) DEFAULT '$',
  week_start VARCHAR(20) DEFAULT 'Monday',
  time_format VARCHAR(10) DEFAULT '12h',
  theme_accent VARCHAR(30) DEFAULT 'sage',
  target_sleep INT DEFAULT 8,
  bedtime_goal VARCHAR(20) DEFAULT '23:00',
  morning_reminder VARCHAR(20) DEFAULT '07:30',
  sunday_reminder BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'School',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);

CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly NUMERIC(10,2) DEFAULT 500.00,
  weekly NUMERIC(10,2) DEFAULT 125.00,
  daily NUMERIC(10,2) DEFAULT 20.00,
  snack_weekly NUMERIC(10,2) DEFAULT 30.00
);

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  category VARCHAR(60) NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);

CREATE TABLE IF NOT EXISTS meals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  snack TEXT,
  CONSTRAINT uq_user_day UNIQUE (user_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item VARCHAR(255) NOT NULL,
  category VARCHAR(60) DEFAULT 'Produce',
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shopping_user ON shopping_items(user_id);

CREATE TABLE IF NOT EXISTS freezer_meals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  portions INT DEFAULT 1,
  date_frozen DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS clothing_items (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  color VARCHAR(50),
  laundry_status VARCHAR(30) DEFAULT 'clean',
  worn_count INT DEFAULT 0,
  image_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_clothing_user ON clothing_items(user_id);

CREATE TABLE IF NOT EXISTS outfits (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  occasion VARCHAR(100),
  items JSONB DEFAULT '[]',
  last_worn DATE,
  is_today BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS sleep_records (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bedtime VARCHAR(20) NOT NULL,
  wake_time VARCHAR(20) NOT NULL,
  duration_minutes INT NOT NULL,
  quality INT DEFAULT 4,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_sleep_user ON sleep_records(user_id);

CREATE TABLE IF NOT EXISTS home_tasks (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  area VARCHAR(50) NOT NULL,
  frequency VARCHAR(30) DEFAULT 'Weekly',
  is_completed BOOLEAN DEFAULT false,
  last_cleaned VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_home_tasks_user ON home_tasks(user_id);
