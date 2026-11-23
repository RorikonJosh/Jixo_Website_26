-- Featured X/Twitter post URL for home page (admin-managed)

INSERT INTO public.site_settings (key, value)
VALUES (
  'featured_tweet_url',
  '"https://x.com/jixo95821699/status/2124805065500430471"'::jsonb
)
ON CONFLICT (key) DO NOTHING;

DROP POLICY IF EXISTS "site_settings_public_read_maintenance" ON public.site_settings;
CREATE POLICY "site_settings_public_read_selected"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key IN ('maintenance', 'featured_tweet_url'));

CREATE OR REPLACE FUNCTION public.admin_get_featured_tweet(input_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tweet_url text;
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT trim(both '"' from value::text) INTO tweet_url
  FROM public.site_settings
  WHERE key = 'featured_tweet_url';

  RETURN coalesce(tweet_url, '');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_featured_tweet(
  input_password text,
  tweet_url text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned text;
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  cleaned := trim(coalesce(tweet_url, ''));

  IF cleaned <> '' AND cleaned !~* '^https?://(www\.)?(x|twitter)\.com/.+/status/[0-9]+' THEN
    RAISE EXCEPTION 'Invalid tweet URL' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.site_settings (key, value, updated_at)
  VALUES ('featured_tweet_url', to_jsonb(cleaned), now())
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

  RETURN cleaned;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_featured_tweet(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_featured_tweet(text, text) TO anon, authenticated;
