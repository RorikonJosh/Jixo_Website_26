import { COMMISSION_BUCKET, supabase } from './supabase';

export function getReferenceFileName(path) {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export async function openReferenceFile(path) {
  if (!supabase) throw new Error('not_configured');

  const { data, error } = await supabase.storage
    .from(COMMISSION_BUCKET)
    .createSignedUrl(path, 3600);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error('signed_url_failed');

  window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

export async function downloadReferenceFile(path) {
  if (!supabase) throw new Error('not_configured');

  const { data, error } = await supabase.storage
    .from(COMMISSION_BUCKET)
    .download(path);

  if (error) throw error;

  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = getReferenceFileName(path);
  link.click();
  URL.revokeObjectURL(url);
}
