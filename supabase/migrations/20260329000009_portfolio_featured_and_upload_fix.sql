-- Fix ambiguous storage_path in upload RPC; add featured pin + storage cleanup on delete

ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS portfolio_items_featured_idx
  ON public.portfolio_items (page_type, commission_category, featured DESC, sort_date DESC);

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
  ON CONFLICT (storage_path) DO UPDATE
  SET expires_at = now() + interval '15 minutes'
  RETURNING id INTO session_id;

  RETURN session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_portfolio_items(filter_page_type text DEFAULT NULL)
RETURNS SETOF public.portfolio_items
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.portfolio_items
  WHERE published = true
    AND (filter_page_type IS NULL OR page_type = filter_page_type)
  ORDER BY featured DESC, sort_date DESC, created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_portfolio_featured(
  input_password text,
  item_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.portfolio_items%ROWTYPE;
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO rec FROM public.portfolio_items WHERE id = item_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF rec.page_type = 'artwork' THEN
    UPDATE public.portfolio_items
    SET featured = false
    WHERE page_type = 'artwork';
  ELSE
    UPDATE public.portfolio_items
    SET featured = false
    WHERE page_type = 'commission'
      AND commission_category = rec.commission_category;
  END IF;

  UPDATE public.portfolio_items
  SET featured = true
  WHERE id = item_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_portfolio_item(
  input_password text,
  item_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.portfolio_items%ROWTYPE;
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO rec FROM public.portfolio_items WHERE id = item_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  DELETE FROM public.portfolio_items WHERE id = item_id;

  DELETE FROM storage.objects
  WHERE bucket_id = 'portfolio' AND name = rec.image_path;

  IF rec.fullsize_path IS NOT NULL AND rec.fullsize_path <> '' THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'portfolio' AND name = rec.fullsize_path;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_portfolio_featured(text, uuid) TO anon, authenticated;
