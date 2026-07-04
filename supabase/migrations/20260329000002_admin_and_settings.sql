-- Site settings (maintenance mode, etc.)
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

-- Allowed commission statuses (documented in admin UI)
COMMENT ON COLUMN public.commission_requests.status IS
  'pending | reviewing | accepted | in_progress | completed | declined';
