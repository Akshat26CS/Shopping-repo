# User Database Setup

To enable user registration and login with database storage, run the following SQL in your Supabase SQL editor:

```sql
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
```

## Security Notes

- **For Production**: Enable Row Level Security (RLS) and use Supabase Auth for secure user management.
- **Password Hashing**: Currently using plain text passwords for demo. In production, hash passwords with bcrypt or similar.
- **RLS Policies**: Implement proper policies to allow users to only access their own data.

## Features Added

- User registration with email, name, phone, and password
- User login with email and password validation
- User data stored in Supabase `users` table
- Account page shows user-specific options when logged in
- Loading states and error handling for auth operations