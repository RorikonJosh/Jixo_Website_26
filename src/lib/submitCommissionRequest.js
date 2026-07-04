const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildCommissionRecord(form, { referenceFiles, locale }) {
  return {
    name: form.name.trim().slice(0, 100),
    email: form.email.trim().slice(0, 254),
    contact_handle: form.contact_handle.trim().slice(0, 200) || null,
    purpose: form.purpose.trim().slice(0, 2000) || null,
    character_desc: form.character_desc.trim().slice(0, 4000) || null,
    style_notes: form.style_notes.trim().slice(0, 2000) || null,
    reference_urls: form.reference_urls
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    budget: form.budget.trim().slice(0, 200) || null,
    deadline: form.deadline || null,
    is_r18: Boolean(form.is_r18),
    usage_type: form.usage_type || 'personal',
    reference_files: referenceFiles,
    locale: locale || 'jp',
    status: 'pending',
  };
}

export function validateCommissionForm(form) {
  if (form.website) {
    return { ok: false, reason: 'spam' };
  }

  if (!form.name.trim() || !form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
    return { ok: false, reason: 'identity' };
  }

  if (!form.purpose.trim() && !form.character_desc.trim()) {
    return { ok: false, reason: 'content' };
  }

  return { ok: true };
}

export async function submitCommissionRequest(supabase, form, { referenceFiles, locale }) {
  const validation = validateCommissionForm(form);
  if (!validation.ok) {
    if (validation.reason === 'spam') {
      return { ok: true };
    }
    throw new Error(validation.reason);
  }

  const record = buildCommissionRecord(form, { referenceFiles, locale });

  const { error } = await supabase.from('commission_requests').insert(record);

  if (error) throw error;
  return { ok: true };
}
