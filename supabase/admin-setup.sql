-- Admin setup only (run once in Supabase SQL Editor)
-- Project: gngrfmyucxyuutzlotre

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'false'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (key, value)
VALUES ('maintenance', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read_maintenance" ON public.site_settings;
CREATE POLICY "site_settings_public_read_maintenance"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key = 'maintenance');

INSERT INTO public.site_settings (key, value)
VALUES ('admin_password', '"9898trapa%%"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

CREATE OR REPLACE FUNCTION public.admin_password_ok(input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored text;
BEGIN
  SELECT value #>> '{}' INTO stored
  FROM public.site_settings
  WHERE key = 'admin_password';

  RETURN coalesce(stored, '') = coalesce(input_password, '');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_commissions(input_password text)
RETURNS SETOF public.commission_requests
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
  FROM public.commission_requests
  ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_commission_status(
  input_password text,
  request_id uuid,
  new_status text
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

  IF new_status NOT IN (
    'pending', 'reviewing', 'accepted', 'in_progress', 'completed', 'declined'
  ) THEN
    RAISE EXCEPTION 'Invalid status' USING ERRCODE = '22023';
  END IF;

  UPDATE public.commission_requests
  SET status = new_status
  WHERE id = request_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_maintenance(input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  enabled boolean;
BEGIN
  IF NOT public.admin_password_ok(input_password) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT (value = 'true'::jsonb) INTO enabled
  FROM public.site_settings
  WHERE key = 'maintenance';

  RETURN coalesce(enabled, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_maintenance(
  input_password text,
  enabled boolean
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

  INSERT INTO public.site_settings (key, value, updated_at)
  VALUES ('maintenance', to_jsonb(enabled), now())
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

  RETURN enabled;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_password_ok(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_commissions(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_commission_status(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_maintenance(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_maintenance(text, boolean) TO anon, authenticated;
