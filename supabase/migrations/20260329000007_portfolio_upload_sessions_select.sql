-- Storage INSERT policy checks portfolio_upload_sessions via EXISTS.
-- Without SELECT on that table for anon, uploads always fail RLS.

DROP POLICY IF EXISTS "portfolio_upload_sessions_read_active" ON public.portfolio_upload_sessions;
CREATE POLICY "portfolio_upload_sessions_read_active"
ON public.portfolio_upload_sessions
FOR SELECT
TO anon, authenticated
USING (expires_at > now());
