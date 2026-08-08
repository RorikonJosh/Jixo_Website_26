-- Contact platform classification for commission requests

ALTER TABLE public.commission_requests
  ADD COLUMN IF NOT EXISTS contact_platform text;
