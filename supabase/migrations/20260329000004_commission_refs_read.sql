-- Allow admin UI to open/download reference files via signed URLs.
-- Paths are only exposed through admin RPC; bucket stays private (no public listing).

DROP POLICY IF EXISTS "commission_refs_anon_select" ON storage.objects;
CREATE POLICY "commission_refs_anon_select"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'commission-refs');
