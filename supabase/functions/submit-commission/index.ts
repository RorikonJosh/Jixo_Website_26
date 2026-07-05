import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const MAX_LEN = {
  name: 100,
  email: 254,
  contact_handle: 200,
  purpose: 2000,
  character_desc: 4000,
  style_notes: 2000,
  budget: 200,
  reference_urls: 2000,
  usage_type: 50,
  locale: 10,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILES = 3;
const DISCORD_FIELD_MAX = 1024;

type Payload = {
  submission_id?: string;
  name?: string;
  email?: string;
  contact_handle?: string;
  purpose?: string;
  character_desc?: string;
  style_notes?: string;
  reference_urls?: string;
  budget?: string;
  deadline?: string;
  is_r18?: boolean;
  usage_type?: string;
  reference_files?: string[];
  locale?: string;
  website?: string;
};

type SignedFileLink = { path: string; url: string };

type CommissionRow = {
  name: string;
  email: string;
  contactHandle: string;
  purpose: string;
  characterDesc: string;
  styleNotes: string;
  referenceUrls: string;
  budget: string;
  usageType: string;
  locale: string;
  isR18: boolean;
  deadline: string | null;
  id: string;
  fileLinks: SignedFileLink[];
};

function trim(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function row(label: string, value: string): string {
  if (!value) return '';
  return `<tr><td style="padding:8px 12px;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`;
}

function buildEmailHtml(rowData: CommissionRow): string {
  const fileLinksHtml =
    rowData.fileLinks.length > 0
      ? `<h3>Reference files</h3><ul>${rowData.fileLinks
          .map(
            (item) =>
              `<li><a href="${item.url}">${escapeHtml(item.path)}</a></li>`,
          )
          .join('')}</ul>`
      : '';

  return `
    <h2>New commission request</h2>
    <p>ID: ${escapeHtml(rowData.id)}</p>
    <table style="border-collapse:collapse;width:100%;max-width:640px;">
      ${row('Name', rowData.name)}
      ${row('Email', rowData.email)}
      ${row('Contact', rowData.contactHandle)}
      ${row('Purpose', rowData.purpose)}
      ${row('Character', rowData.characterDesc)}
      ${row('Style / Composition', rowData.styleNotes)}
      ${row('Reference URLs', rowData.referenceUrls)}
      ${row('Budget', rowData.budget)}
      ${row('Deadline', rowData.deadline ?? '')}
      ${row('R18', rowData.isR18 ? 'Yes' : 'No')}
      ${row('Usage', rowData.usageType)}
      ${row('Locale', rowData.locale)}
    </table>
    ${fileLinksHtml}
  `;
}

async function sendResendEmail(
  rowData: CommissionRow,
  options: {
    apiKey: string;
    notifyEmail: string;
    from: string;
  },
): Promise<boolean> {
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: options.from,
      to: [options.notifyEmail],
      reply_to: rowData.email,
      subject: `[Commission] ${rowData.name}${rowData.isR18 ? ' (R18)' : ''}`,
      html: buildEmailHtml(rowData),
    }),
  });

  if (!emailRes.ok) {
    console.error('Resend error:', await emailRes.text());
    return false;
  }

  return true;
}

async function sendDiscordWebhook(
  rowData: CommissionRow,
  webhookUrl: string,
  adminUrl: string,
): Promise<boolean> {
  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    { name: 'Email', value: rowData.email, inline: true },
    { name: 'Budget', value: rowData.budget || '—', inline: true },
    { name: 'Deadline', value: rowData.deadline || '—', inline: true },
  ];

  if (rowData.contactHandle) {
    fields.push({
      name: 'Contact',
      value: truncate(rowData.contactHandle, DISCORD_FIELD_MAX),
    });
  }

  const summary = rowData.purpose || rowData.characterDesc;
  if (summary) {
    fields.push({
      name: 'Summary',
      value: truncate(summary, DISCORD_FIELD_MAX),
    });
  }

  if (rowData.fileLinks.length > 0) {
    fields.push({
      name: 'Reference files',
      value: truncate(
        rowData.fileLinks.map((item) => item.url).join('\n'),
        DISCORD_FIELD_MAX,
      ),
    });
  }

  fields.push({
    name: 'Admin',
    value: adminUrl,
  });

  const discordRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Commission Bot',
      embeds: [
        {
          title: `新委託：${rowData.name}${rowData.isR18 ? ' (R18)' : ''}`,
          color: rowData.isR18 ? 0xff4444 : 0x44aa88,
          fields,
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!discordRes.ok) {
    console.error('Discord webhook error:', await discordRes.text());
    return false;
  }

  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const notifyEmail = Deno.env.get('NOTIFY_EMAIL') ?? 'jixo0407@gmail.com';
  const resendFrom =
    Deno.env.get('RESEND_FROM') ?? 'Commission Form <onboarding@resend.dev>';
  const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
  const adminUrl =
    Deno.env.get('SITE_ADMIN_URL') ??
    'https://jixo-website-26.vercel.app/admin';
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: 'Server not configured' }, 500);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  if (payload.website) {
    return jsonResponse({ ok: true });
  }

  const name = trim(payload.name, MAX_LEN.name);
  const email = trim(payload.email, MAX_LEN.email);
  const contactHandle = trim(payload.contact_handle, MAX_LEN.contact_handle);
  const purpose = trim(payload.purpose, MAX_LEN.purpose);
  const characterDesc = trim(payload.character_desc, MAX_LEN.character_desc);
  const styleNotes = trim(payload.style_notes, MAX_LEN.style_notes);
  const referenceUrls = trim(payload.reference_urls, MAX_LEN.reference_urls);
  const budget = trim(payload.budget, MAX_LEN.budget);
  const usageType = trim(payload.usage_type, MAX_LEN.usage_type) || 'personal';
  const locale = trim(payload.locale, MAX_LEN.locale) || 'jp';
  const isR18 = Boolean(payload.is_r18);
  const deadline = trim(payload.deadline ?? '', 10) || null;

  const referenceFiles = Array.isArray(payload.reference_files)
    ? payload.reference_files
        .filter((item): item is string => typeof item === 'string')
        .slice(0, MAX_FILES)
    : [];

  if (!name || !email || !EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: 'Invalid name or email' }, 400);
  }

  if (!purpose && !characterDesc) {
    return jsonResponse(
      { ok: false, error: 'Purpose or character description required' },
      400,
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: inserted, error: insertError } = await supabase
    .from('commission_requests')
    .insert({
      name,
      email,
      contact_handle: contactHandle || null,
      purpose: purpose || null,
      character_desc: characterDesc || null,
      style_notes: styleNotes || null,
      reference_urls: referenceUrls
        ? referenceUrls.split('\n').map((line) => line.trim()).filter(Boolean)
        : [],
      budget: budget || null,
      deadline: deadline || null,
      is_r18: isR18,
      usage_type: usageType,
      reference_files: referenceFiles,
      locale,
      status: 'pending',
    })
    .select('id, created_at')
    .single();

  if (insertError || !inserted) {
    console.error(insertError);
    return jsonResponse({ ok: false, error: 'Failed to save request' }, 500);
  }

  const fileLinks: SignedFileLink[] = [];
  if (referenceFiles.length > 0) {
    const { data: signedUrls, error: signedError } = await supabase.storage
      .from('commission-refs')
      .createSignedUrls(referenceFiles, 60 * 60 * 24 * 7);

    if (!signedError && signedUrls) {
      for (const item of signedUrls) {
        if (item.signedUrl && item.path) {
          fileLinks.push({ path: item.path, url: item.signedUrl });
        }
      }
    }
  }

  const rowData: CommissionRow = {
    name,
    email,
    contactHandle,
    purpose,
    characterDesc,
    styleNotes,
    referenceUrls,
    budget,
    usageType,
    locale,
    isR18,
    deadline,
    id: inserted.id,
    fileLinks,
  };

  const warnings: string[] = [];

  if (resendApiKey) {
    const emailOk = await sendResendEmail(rowData, {
      apiKey: resendApiKey,
      notifyEmail,
      from: resendFrom,
    });
    if (!emailOk) warnings.push('email_failed');
  } else {
    warnings.push('email_skipped');
  }

  if (discordWebhookUrl) {
    const discordOk = await sendDiscordWebhook(
      rowData,
      discordWebhookUrl,
      adminUrl,
    );
    if (!discordOk) warnings.push('discord_failed');
  } else {
    warnings.push('discord_skipped');
  }

  if (warnings.includes('email_failed') || warnings.includes('discord_failed')) {
    return jsonResponse(
      {
        ok: true,
        id: inserted.id,
        warning: 'Saved but some notifications failed',
        warnings,
      },
      202,
    );
  }

  return jsonResponse({ ok: true, id: inserted.id, warnings });
});
