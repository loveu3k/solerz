-- Add is_bundle and is_clearance columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_bundle BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_clearance BOOLEAN DEFAULT FALSE;

-- Add columns for all category-specific filters
ALTER TABLE listings ADD COLUMN IF NOT EXISTS panel_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS wattage INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS efficiency DECIMAL(5,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS inverter_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS power_rating DECIMAL(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS phase TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS mppts INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS inverter_efficiency DECIMAL(5,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS battery_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS voltage INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cycle_life INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS mounting_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS resistance TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS voltage_rating INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS current_capacity INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cable_size TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS insulation_type TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS component_type TEXT;

-- Update realtime for listings
alter publication supabase_realtime add table listings;
