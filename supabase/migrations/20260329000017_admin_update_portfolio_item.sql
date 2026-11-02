-- Allow admin to update portfolio metadata after publish (links, titles, etc.)

CREATE OR REPLACE FUNCTION public.admin_update_portfolio_item(
  input_password text,
  item_id uuid,
  payload jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_page_type text;
  v_commission_category text;
  v_display_date text;
  v_sort_date date;
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.portfolio_items WHERE id = item_id) THEN
    RETURN false;
  END IF;

  v_page_type := payload->>'page_type';
  v_commission_category := NULLIF(payload->>'commission_category', '');
  v_display_date := coalesce(payload->>'display_date', '');
  v_sort_date := (payload->>'sort_date')::date;

  IF v_page_type NOT IN ('artwork', 'commission') THEN
    RAISE EXCEPTION 'Invalid page_type' USING ERRCODE = '22023';
  END IF;

  IF v_page_type = 'commission' AND v_commission_category NOT IN ('general', 'r18') THEN
    RAISE EXCEPTION 'Invalid commission_category' USING ERRCODE = '22023';
  END IF;

  IF v_page_type = 'artwork' THEN
    v_commission_category := NULL;
  END IF;

  IF v_display_date = '' OR v_sort_date IS NULL THEN
    RAISE EXCEPTION 'display_date / sort_date required' USING ERRCODE = '22023';
  END IF;

  IF coalesce(payload->>'title_zh', '') = '' THEN
    RAISE EXCEPTION 'title_zh required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.portfolio_items
  SET
    page_type = v_page_type,
    commission_category = v_commission_category,
    display_date = v_display_date,
    sort_date = v_sort_date,
    platform = CASE
      WHEN v_page_type = 'artwork' THEN NULLIF(payload->>'platform', '')
      ELSE NULL
    END,
    external_link = coalesce(NULLIF(payload->>'external_link', ''), '#'),
    title_zh = coalesce(payload->>'title_zh', ''),
    title_jp = coalesce(payload->>'title_jp', ''),
    title_en = coalesce(payload->>'title_en', ''),
    desc_zh = coalesce(payload->>'desc_zh', ''),
    desc_jp = coalesce(payload->>'desc_jp', ''),
    desc_en = coalesce(payload->>'desc_en', ''),
    bonus_label_zh = coalesce(payload->>'bonus_label_zh', ''),
    bonus_label_jp = coalesce(payload->>'bonus_label_jp', ''),
    bonus_label_en = coalesce(payload->>'bonus_label_en', ''),
    bonus_text_zh = coalesce(payload->>'bonus_text_zh', ''),
    bonus_text_jp = coalesce(payload->>'bonus_text_jp', ''),
    bonus_text_en = coalesce(payload->>'bonus_text_en', ''),
    bonus_url = coalesce(payload->>'bonus_url', ''),
    client_zh = coalesce(payload->>'client_zh', ''),
    client_jp = coalesce(payload->>'client_jp', ''),
    client_en = coalesce(payload->>'client_en', ''),
    published = coalesce((payload->>'published')::boolean, true)
  WHERE id = item_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_portfolio_item(text, uuid, jsonb) TO anon, authenticated;
