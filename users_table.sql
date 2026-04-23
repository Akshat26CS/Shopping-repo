-- Create users table in Supabase
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for demo purposes (enable in production with proper auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Note: For demo purposes, we're using plain text passwords.
-- In production, use proper password hashing with bcrypt or similar.
-- Also enable RLS and use Supabase Auth for secure user management.