-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster login queries
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Enable Row Level Security (optional for custom auth)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- For custom authentication, RLS policies can be disabled initially
-- Add policies later when integrating with Supabase Auth

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;
