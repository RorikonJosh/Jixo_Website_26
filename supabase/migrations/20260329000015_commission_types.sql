-- Commission type multi-select on request form

ALTER TABLE public.commission_requests
  ADD COLUMN IF NOT EXISTS commission_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS commission_type_other text;
