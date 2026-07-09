-- Supabase blocks direct DELETE on storage.objects; delete files via Storage API instead.

DROP POLICY IF EXISTS "portfolio_delete_via_session" ON storage.objects;
CREATE POLICY "portfolio_delete_via_session"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (
  bucket_id = 'portfolio'
  AND EXISTS (
    SELECT 1
    FROM public.portfolio_upload_sessions s
    WHERE s.storage_path = name
      AND s.expires_at > now()
  )
);

CREATE OR REPLACE FUNCTION public.admin_delete_portfolio_item(
  input_password text,
  item_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.portfolio_items WHERE id = item_id;
  RETURN FOUND;
END;
$$;
