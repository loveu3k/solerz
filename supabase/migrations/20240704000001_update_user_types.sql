-- Add user_type column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
        ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'seller', 'both'));
    END IF;

    -- Add additional columns for settings page if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_notifications') THEN
        ALTER TABLE profiles ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'marketing_emails') THEN
        ALTER TABLE profiles ADD COLUMN marketing_emails BOOLEAN DEFAULT FALSE;
    END IF;

    -- Enable realtime for profiles table
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

END $$;

-- Update existing profiles to have a default user_type
UPDATE profiles
SET user_type = 'buyer'
WHERE user_type IS NULL;