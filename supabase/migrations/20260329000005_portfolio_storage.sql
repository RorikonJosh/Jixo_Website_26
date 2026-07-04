-- Public portfolio bucket (artworks + commission gallery images)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "portfolio_public_read" ON storage.objects;
CREATE POLICY "portfolio_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio');
