-- New uploads become featured; previous featured moves into the gallery below.

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
    published,
    featured
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
    coalesce((payload->>'published')::boolean, true),
    true
  )
  RETURNING id INTO new_id;

  IF page_type = 'artwork' THEN
    UPDATE public.portfolio_items
    SET featured = false
    WHERE page_type = 'artwork'
      AND id <> new_id;
  ELSE
    UPDATE public.portfolio_items
    SET featured = false
    WHERE page_type = 'commission'
      AND commission_category = admin_create_portfolio_item.commission_category
      AND id <> new_id;
  END IF;

  DELETE FROM public.portfolio_upload_sessions
  WHERE storage_path IN (
    payload->>'image_path',
    NULLIF(payload->>'fullsize_path', '')
  );

  RETURN new_id;
END;
$$;
