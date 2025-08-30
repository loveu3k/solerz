-- Consolidated Supabase Schema for SolarSwap Marketplace

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  listings_count INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  phone TEXT,
  avatar_url TEXT,
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  user_type VARCHAR(10) DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'seller', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  condition INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_bundle BOOLEAN DEFAULT FALSE,
  is_clearance BOOLEAN DEFAULT FALSE,
  -- Category-specific filter columns
  panel_type TEXT,
  wattage INTEGER,
  efficiency DECIMAL(5,2),
  inverter_type TEXT,
  power_rating DECIMAL(10,2),
  phase TEXT,
  mppts INTEGER,
  inverter_efficiency DECIMAL(5,2),
  battery_type TEXT,
  capacity INTEGER,
  voltage INTEGER,
  cycle_life INTEGER,
  mounting_type TEXT,
  material TEXT,
  resistance TEXT[],
  voltage_rating INTEGER,
  current_capacity INTEGER,
  cable_size TEXT,
  insulation_type TEXT,
  component_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listing_images table
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  seller_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, listing_id)
);

-- Create storage buckets
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
END $$;


-- Create RLS policies

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Listings policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
CREATE POLICY "Listings are viewable by everyone"
  ON listings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
CREATE POLICY "Users can insert their own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Listing images policies
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Listing images are viewable by everyone" ON listing_images;
CREATE POLICY "Listing images are viewable by everyone"
  ON listing_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert images for their own listings" ON listing_images;
CREATE POLICY "Users can insert images for their own listings"
  ON listing_images FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM listings WHERE id = listing_id
  ));

DROP POLICY IF EXISTS "Users can delete images for their own listings" ON listing_images;
CREATE POLICY "Users can delete images for their own listings"
  ON listing_images FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM listings WHERE id = listing_id
  ));

-- Favorites policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Orders policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view orders they're involved in" ON orders;
CREATE POLICY "Users can view orders they're involved in"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can insert orders as buyers" ON orders;
CREATE POLICY "Users can insert orders as buyers"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can update orders they're involved in" ON orders;
CREATE POLICY "Users can update orders they're involved in"
  ON orders FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Cart policies
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cart" ON carts;
CREATE POLICY "Users can view their own cart"
  ON carts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cart" ON carts;
CREATE POLICY "Users can insert their own cart"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cart" ON carts;
CREATE POLICY "Users can update their own cart"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id);

-- Cart items policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  USING (cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  USING (cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  ));

-- Avatar storage policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Create functions and triggers

-- Function to update listings_count in profiles
CREATE OR REPLACE FUNCTION update_listings_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET listings_count = listings_count + 1
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET listings_count = listings_count - 1
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for listings_count
DROP TRIGGER IF EXISTS update_listings_count_trigger ON listings;
CREATE TRIGGER update_listings_count_trigger
AFTER INSERT OR DELETE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_listings_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE listings;
ALTER PUBLICATION supabase_realtime ADD TABLE listing_images;
ALTER PUBLICATION supabase_realtime ADD TABLE favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE carts;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;

-- Update existing profiles to have a default user_type if needed
UPDATE profiles
SET user_type = 'buyer'
WHERE user_type IS NULL;
