-- Run this once in Supabase SQL Editor (Dashboard → SQL → New query → Run)
-- Project: gngrfmyucxyuutzlotre

CREATE TABLE IF NOT EXISTS public.commission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  contact_handle text,
  purpose text,
  character_desc text,
  style_notes text,
  reference_urls text[] DEFAULT '{}',
  budget text,
  deadline date,
  is_r18 boolean NOT NULL DEFAULT false,
  usage_type text NOT NULL DEFAULT 'personal',
  reference_files text[] DEFAULT '{}',
  locale text DEFAULT 'jp',
  status text NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "commission_requests_anon_insert" ON public.commission_requests;
CREATE POLICY "commission_requests_anon_insert"
ON public.commission_requests
FOR INSERT
TO anon
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS commission_requests_created_at_idx
  ON public.commission_requests (created_at DESC);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'commission-refs',
  'commission-refs',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "commission_refs_anon_insert" ON storage.objects;
CREATE POLICY "commission_refs_anon_insert"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'commission-refs'
  AND (storage.foldername(name))[1] = 'pending'
);

DROP POLICY IF EXISTS "commission_refs_anon_select" ON storage.objects;
CREATE POLICY "commission_refs_anon_select"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'commission-refs');

-- Portfolio gallery (artworks + commission showcase images, public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "portfolio_public_read" ON storage.objects;
CREATE POLICY "portfolio_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio');

-- Site settings (maintenance mode)
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

-- Admin RPC (no Edge Function deploy required)
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
