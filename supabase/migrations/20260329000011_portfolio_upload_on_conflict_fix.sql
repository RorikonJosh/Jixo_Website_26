-- ON CONFLICT (storage_path) is ambiguous with the function parameter of the same name.

CREATE OR REPLACE FUNCTION public.admin_register_portfolio_upload(
  input_password text,
  storage_path text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_id uuid;
  v_storage_path text;
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  v_storage_path := storage_path;

  IF v_storage_path IS NULL OR v_storage_path = '' THEN
    RAISE EXCEPTION 'Invalid storage path' USING ERRCODE = '22023';
  END IF;

  IF v_storage_path !~ '^(artworks|commissions)/' THEN
    RAISE EXCEPTION 'Invalid storage path prefix' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.portfolio_upload_sessions
  WHERE expires_at <= now();

  INSERT INTO public.portfolio_upload_sessions (storage_path)
  VALUES (v_storage_path)
  ON CONFLICT ON CONSTRAINT portfolio_upload_sessions_storage_path_key DO UPDATE
  SET expires_at = now() + interval '15 minutes'
  RETURNING id INTO session_id;

  RETURN session_id;
END;
$$;
