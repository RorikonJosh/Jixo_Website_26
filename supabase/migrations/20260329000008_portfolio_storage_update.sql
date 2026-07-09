-- Allow upsert (re-upload) when a valid upload session exists

DROP POLICY IF EXISTS "portfolio_update_via_session" ON storage.objects;
CREATE POLICY "portfolio_update_via_session"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (
  bucket_id = 'portfolio'
  AND EXISTS (
    SELECT 1
    FROM public.portfolio_upload_sessions s
    WHERE s.storage_path = name
      AND s.expires_at > now()
  )
)
WITH CHECK (
  bucket_id = 'portfolio'
  AND EXISTS (
    SELECT 1
    FROM public.portfolio_upload_sessions s
    WHERE s.storage_path = name
      AND s.expires_at > now()
  )
);
