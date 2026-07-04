import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const COMMISSION_STATUSES = [
  'pending',
  'reviewing',
  'accepted',
  'in_progress',
  'completed',
  'declined',
];

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isAuthorized(password: unknown, adminPassword: string | undefined) {
  return typeof password === 'string' && password === adminPassword;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const adminPassword = Deno.env.get('ADMIN_PASSWORD');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: 'Server not configured' }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const action = payload.action;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  if (action === 'login') {
    if (!adminPassword) {
      return jsonResponse({ ok: false, error: 'Admin password not configured' }, 500);
    }
    if (!isAuthorized(payload.password, adminPassword)) {
      return jsonResponse({ ok: false, error: 'Invalid password' }, 401);
    }
    return jsonResponse({ ok: true });
  }

  if (!adminPassword || !isAuthorized(payload.password, adminPassword)) {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
  }

  switch (action) {
    case 'list_commissions': {
      const { data, error } = await supabase
        .from('commission_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return jsonResponse({ ok: false, error: 'Failed to load commissions' }, 500);
      }

      return jsonResponse({ ok: true, data });
    }

    case 'update_status': {
      const id = payload.id;
      const status = payload.status;

      if (typeof id !== 'string' || typeof status !== 'string') {
        return jsonResponse({ ok: false, error: 'Invalid payload' }, 400);
      }

      if (!COMMISSION_STATUSES.includes(status)) {
        return jsonResponse({ ok: false, error: 'Invalid status' }, 400);
      }

      const { error } = await supabase
        .from('commission_requests')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error(error);
        return jsonResponse({ ok: false, error: 'Failed to update status' }, 500);
      }

      return jsonResponse({ ok: true });
    }

    case 'get_maintenance': {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance')
        .maybeSingle();

      if (error) {
        console.error(error);
        return jsonResponse({ ok: false, error: 'Failed to read maintenance' }, 500);
      }

      return jsonResponse({ ok: true, enabled: data?.value === true });
    }

    case 'set_maintenance': {
      const enabled = payload.enabled === true;

      const { error } = await supabase.from('site_settings').upsert({
        key: 'maintenance',
        value: enabled,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(error);
        return jsonResponse({ ok: false, error: 'Failed to update maintenance' }, 500);
      }

      return jsonResponse({ ok: true, enabled });
    }

    default:
      return jsonResponse({ ok: false, error: 'Unknown action' }, 400);
  }
});
