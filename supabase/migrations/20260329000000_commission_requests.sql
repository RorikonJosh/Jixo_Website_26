-- Commission request submissions (written only via Edge Function service role)
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

-- Anon may submit via frontend form (INSERT only; no public read).
CREATE POLICY "commission_requests_anon_insert"
ON public.commission_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Edge Function (service_role) can still insert when email is enabled later.

CREATE INDEX IF NOT EXISTS commission_requests_created_at_idx
  ON public.commission_requests (created_at DESC);

-- Private storage bucket for reference uploads
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

-- Anon may upload only under pending/{uuid}/...
CREATE POLICY "commission_refs_anon_insert"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'commission-refs'
  AND (storage.foldername(name))[1] = 'pending'
);
