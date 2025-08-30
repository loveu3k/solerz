-- Create cart table
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, listing_id)
);

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create storage buckets for images if they don't exist
DO $$ 
BEGIN
  -- Create listing_images bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('listing_images', 'listing_images', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create avatars bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Set up storage policies for listing_images
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES ('Public Read Access', 'listing_images', '{"statement":"SELECT","effect":"ALLOW","principal":"*","condition":null}')
  ON CONFLICT (name, bucket_id) DO NOTHING;
  
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES ('Auth Insert Access', 'listing_images', '{"statement":"INSERT","effect":"ALLOW","principal":{"type":"authenticated"},"condition":null}')
  ON CONFLICT (name, bucket_id) DO NOTHING;
  
  -- Set up storage policies for avatars
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES ('Public Read Access', 'avatars', '{"statement":"SELECT","effect":"ALLOW","principal":"*","condition":null}')
  ON CONFLICT (name, bucket_id) DO NOTHING;
  
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES ('Auth Insert Access', 'avatars', '{"statement":"INSERT","effect":"ALLOW","principal":{"type":"authenticated"},"condition":null}')
  ON CONFLICT (name, bucket_id) DO NOTHING;
  
  -- Enable realtime for cart tables
  ALTER PUBLICATION supabase_realtime ADD TABLE carts;
  ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
  ALTER PUBLICATION supabase_realtime ADD TABLE favorites;
END $$;
