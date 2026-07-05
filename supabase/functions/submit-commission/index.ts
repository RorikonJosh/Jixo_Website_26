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

function parseIdList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id));
}

function buildDiscordMentions(userIds: string[], roleIds: string[]) {
  if (userIds.length === 0 && roleIds.length === 0) {
    return { content: undefined, allowed_mentions: undefined };
  }

  const parts = [
    ...userIds.map((id) => `<@${id}>`),
    ...roleIds.map((id) => `<@&${id}>`),
  ];

  return {
    content: parts.join(' '),
    allowed_mentions: {
      parse: [] as string[],
      users: userIds,
      roles: roleIds,
    },
  };
}

async function sendDiscordWebhook(
  rowData: CommissionRow,
  webhookUrl: string,
  adminUrl: string,
  mentionUserIds: string[],
  mentionRoleIds: string[],
): Promise<boolean> {
  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    { name: 'Email', value: rowData.email, inline: true },
    { name: '預算 (NTD)', value: rowData.budget || '—', inline: true },
    { name: '希望交稿', value: rowData.deadline || '—', inline: true },
  ];

  if (rowData.contactHandle) {
    fields.push({
      name: '其他聯絡方式',
      value: truncate(rowData.contactHandle, DISCORD_FIELD_MAX),
    });
  }

  if (rowData.purpose) {
    fields.push({
      name: '委託用途',
      value: truncate(rowData.purpose, DISCORD_FIELD_MAX),
    });
  }

  if (rowData.characterDesc) {
    fields.push({
      name: '角色 / 內容描述',
      value: truncate(rowData.characterDesc, DISCORD_FIELD_MAX),
    });
  }

  if (rowData.styleNotes) {
    fields.push({
      name: '構圖 / 畫風',
      value: truncate(rowData.styleNotes, DISCORD_FIELD_MAX),
    });
  }

  if (rowData.referenceUrls) {
    fields.push({
      name: '參考連結',
      value: truncate(rowData.referenceUrls, DISCORD_FIELD_MAX),
    });
  }

  fields.push({
    name: '用途類型',
    value: rowData.usageType === 'commercial' ? '商用' : '非商用 / 個人',
    inline: true,
  });

  if (rowData.fileLinks.length > 0) {
    fields.push({
      name: '參考圖',
      value: truncate(
        rowData.fileLinks.map((item) => item.url).join('\n'),
        DISCORD_FIELD_MAX,
      ),
    });
  }

  fields.push({
    name: '後台管理',
    value: adminUrl,
  });

  const { content, allowed_mentions } = buildDiscordMentions(
    mentionUserIds,
    mentionRoleIds,
  );

  const discordRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: '委託通知',
      ...(content ? { content, allowed_mentions } : {}),
      embeds: [
        {
          title: `新委託：${rowData.name}${rowData.isR18 ? ' · R18' : ''}`,
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

  const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
  const mentionUserIds = parseIdList(Deno.env.get('DISCORD_MENTION_USER_IDS'));
  const mentionRoleIds = parseIdList(Deno.env.get('DISCORD_MENTION_ROLE_IDS'));
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

  if (discordWebhookUrl) {
    const discordOk = await sendDiscordWebhook(
      rowData,
      discordWebhookUrl,
      adminUrl,
      mentionUserIds,
      mentionRoleIds,
    );
    if (!discordOk) {
      return jsonResponse(
        {
          ok: true,
          id: inserted.id,
          warning: 'Saved but Discord notification failed',
        },
        202,
      );
    }
  }

  return jsonResponse({ ok: true, id: inserted.id });
});
