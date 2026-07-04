-- Allow form submissions without Edge Function (email deferred).
-- Anon may INSERT only; no public read/update/delete.

CREATE POLICY "commission_requests_anon_insert"
ON public.commission_requests
FOR INSERT
TO anon
WITH CHECK (true);
