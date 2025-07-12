-- Add personalization fields to users table
ALTER TABLE public.users 
ADD COLUMN location TEXT,
ADD COLUMN interests JSONB DEFAULT '[]',
ADD COLUMN age INTEGER,
ADD COLUMN occupation TEXT,
ADD COLUMN hobbies TEXT,
ADD COLUMN goals TEXT,
ADD COLUMN bio TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.users.location IS 'User location (city, country, etc.)';
COMMENT ON COLUMN public.users.interests IS 'Array of user interests/topics they care about';
COMMENT ON COLUMN public.users.age IS 'User age (optional)';
COMMENT ON COLUMN public.users.occupation IS 'User job/profession (optional)';
COMMENT ON COLUMN public.users.hobbies IS 'User hobbies and activities (optional)';
COMMENT ON COLUMN public.users.goals IS 'User goals and aspirations (optional)';
COMMENT ON COLUMN public.users.bio IS 'Short bio or description (optional)';
