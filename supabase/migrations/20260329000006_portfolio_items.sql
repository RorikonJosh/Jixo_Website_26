-- Portfolio items (artworks + commission gallery) with admin-managed metadata

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL CHECK (page_type IN ('artwork', 'commission')),
  commission_category text CHECK (
    commission_category IS NULL OR commission_category IN ('general', 'r18')
  ),
  display_date text NOT NULL,
  sort_date date NOT NULL,
  platform text,
  external_link text NOT NULL DEFAULT '#',
  title_zh text NOT NULL DEFAULT '',
  title_jp text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  desc_zh text NOT NULL DEFAULT '',
  desc_jp text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  bonus_label_zh text NOT NULL DEFAULT '',
  bonus_label_jp text NOT NULL DEFAULT '',
  bonus_label_en text NOT NULL DEFAULT '',
  bonus_text_zh text NOT NULL DEFAULT '',
  bonus_text_jp text NOT NULL DEFAULT '',
  bonus_text_en text NOT NULL DEFAULT '',
  bonus_url text NOT NULL DEFAULT '',
  client_zh text NOT NULL DEFAULT '',
  client_jp text NOT NULL DEFAULT '',
  client_en text NOT NULL DEFAULT '',
  image_path text NOT NULL,
  fullsize_path text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portfolio_page_category CHECK (
    (page_type = 'artwork' AND commission_category IS NULL)
    OR (page_type = 'commission' AND commission_category IN ('general', 'r18'))
  )
);

CREATE INDEX IF NOT EXISTS portfolio_items_sort_idx
  ON public.portfolio_items (page_type, sort_date DESC);

CREATE TABLE IF NOT EXISTS public.portfolio_upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes')
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portfolio_items_public_read" ON public.portfolio_items;
CREATE POLICY "portfolio_items_public_read"
ON public.portfolio_items
FOR SELECT
TO anon, authenticated
USING (published = true);

ALTER TABLE public.portfolio_upload_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portfolio_insert_via_session" ON storage.objects;
CREATE POLICY "portfolio_insert_via_session"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'portfolio'
  AND EXISTS (
    SELECT 1
    FROM public.portfolio_upload_sessions s
    WHERE s.storage_path = name
      AND s.expires_at > now()
  )
);

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
  ORDER BY sort_date DESC, created_at DESC;
$$;

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
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  IF storage_path IS NULL OR storage_path = '' THEN
    RAISE EXCEPTION 'Invalid storage path' USING ERRCODE = '22023';
  END IF;

  IF storage_path !~ '^(artworks|commissions)/' THEN
    RAISE EXCEPTION 'Invalid storage path prefix' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.portfolio_upload_sessions
  WHERE expires_at <= now();

  INSERT INTO public.portfolio_upload_sessions (storage_path)
  VALUES (storage_path)
  ON CONFLICT (storage_path) DO UPDATE
  SET expires_at = now() + interval '15 minutes'
  RETURNING id INTO session_id;

  RETURN session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_portfolio_item(
  input_password text,
  payload jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  page_type text;
  commission_category text;
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  page_type := payload->>'page_type';
  commission_category := NULLIF(payload->>'commission_category', '');

  IF page_type NOT IN ('artwork', 'commission') THEN
    RAISE EXCEPTION 'Invalid page_type' USING ERRCODE = '22023';
  END IF;

  IF page_type = 'commission' AND commission_category NOT IN ('general', 'r18') THEN
    RAISE EXCEPTION 'Invalid commission_category' USING ERRCODE = '22023';
  END IF;

  IF page_type = 'artwork' THEN
    commission_category := NULL;
  END IF;

  IF coalesce(payload->>'image_path', '') = '' THEN
    RAISE EXCEPTION 'image_path required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.portfolio_items (
    page_type,
    commission_category,
    display_date,
    sort_date,
    platform,
    external_link,
    title_zh,
    title_jp,
    title_en,
    desc_zh,
    desc_jp,
    desc_en,
    bonus_label_zh,
    bonus_label_jp,
    bonus_label_en,
    bonus_text_zh,
    bonus_text_jp,
    bonus_text_en,
    bonus_url,
    client_zh,
    client_jp,
    client_en,
    image_path,
    fullsize_path,
    published
  ) VALUES (
    page_type,
    commission_category,
    payload->>'display_date',
    (payload->>'sort_date')::date,
    NULLIF(payload->>'platform', ''),
    coalesce(NULLIF(payload->>'external_link', ''), '#'),
    coalesce(payload->>'title_zh', ''),
    coalesce(payload->>'title_jp', ''),
    coalesce(payload->>'title_en', ''),
    coalesce(payload->>'desc_zh', ''),
    coalesce(payload->>'desc_jp', ''),
    coalesce(payload->>'desc_en', ''),
    coalesce(payload->>'bonus_label_zh', ''),
    coalesce(payload->>'bonus_label_jp', ''),
    coalesce(payload->>'bonus_label_en', ''),
    coalesce(payload->>'bonus_text_zh', ''),
    coalesce(payload->>'bonus_text_jp', ''),
    coalesce(payload->>'bonus_text_en', ''),
    coalesce(payload->>'bonus_url', ''),
    coalesce(payload->>'client_zh', ''),
    coalesce(payload->>'client_jp', ''),
    coalesce(payload->>'client_en', ''),
    payload->>'image_path',
    NULLIF(payload->>'fullsize_path', ''),
    coalesce((payload->>'published')::boolean, true)
  )
  RETURNING id INTO new_id;

  DELETE FROM public.portfolio_upload_sessions
  WHERE storage_path IN (
    payload->>'image_path',
    NULLIF(payload->>'fullsize_path', '')
  );

  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_portfolio_items(input_password text)
RETURNS SETOF public.portfolio_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.portfolio_items
  ORDER BY sort_date DESC, created_at DESC;
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
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.portfolio_items WHERE id = item_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_portfolio_items(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_register_portfolio_upload(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_portfolio_item(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_portfolio_items(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_portfolio_item(text, uuid) TO anon, authenticated;
