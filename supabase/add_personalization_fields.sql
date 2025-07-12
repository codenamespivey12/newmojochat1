-- Add personalization fields to existing users table
-- Run this in your Supabase SQL Editor if you have an existing database

-- Add the new columns (this will only work if they don't already exist)
DO $$ 
BEGIN
    -- Add location column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location') THEN
        ALTER TABLE public.users ADD COLUMN location TEXT;
    END IF;
    
    -- Add interests column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'interests') THEN
        ALTER TABLE public.users ADD COLUMN interests JSONB DEFAULT '[]';
    END IF;
    
    -- Add age column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'age') THEN
        ALTER TABLE public.users ADD COLUMN age INTEGER;
    END IF;
    
    -- Add occupation column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'occupation') THEN
        ALTER TABLE public.users ADD COLUMN occupation TEXT;
    END IF;
    
    -- Add hobbies column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'hobbies') THEN
        ALTER TABLE public.users ADD COLUMN hobbies TEXT;
    END IF;
    
    -- Add goals column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'goals') THEN
        ALTER TABLE public.users ADD COLUMN goals TEXT;
    END IF;
    
    -- Add bio column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE public.users ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.users.location IS 'User location (city, country, etc.)';
COMMENT ON COLUMN public.users.interests IS 'Array of user interests/topics they care about';
COMMENT ON COLUMN public.users.age IS 'User age (optional)';
COMMENT ON COLUMN public.users.occupation IS 'User job/profession (optional)';
COMMENT ON COLUMN public.users.hobbies IS 'User hobbies and activities (optional)';
COMMENT ON COLUMN public.users.goals IS 'User goals and aspirations (optional)';
COMMENT ON COLUMN public.users.bio IS 'Short bio or description (optional)';

-- Initialize interests column for existing users (set to empty array if NULL)
UPDATE public.users SET interests = '[]'::jsonb WHERE interests IS NULL;
