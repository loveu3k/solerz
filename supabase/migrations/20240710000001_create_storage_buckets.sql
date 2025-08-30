-- Create storage bucket for listings images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Set up public access policy for the listings bucket
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own objects" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'listings' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own objects" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'listings' AND auth.uid() = owner);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
