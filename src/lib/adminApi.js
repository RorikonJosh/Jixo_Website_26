import { supabase } from './supabase';

const SESSION_KEY = 'admin_password';

export function getAdminPassword() {
  return sessionStorage.getItem(SESSION_KEY) ?? '';
}

export function setAdminPassword(password) {
  sessionStorage.setItem(SESSION_KEY, password);
}

export function clearAdminPassword() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminLoggedIn() {
  return Boolean(getAdminPassword());
}

function requireClient() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}

export async function adminLogin(password) {
  const client = requireClient();
  const { data, error } = await client.rpc('admin_password_ok', {
    input_password: password,
  });

  if (error) throw error;
  if (!data) throw new Error('login_failed');

  setAdminPassword(password);
  return true;
}

export async function fetchCommissions() {
  const client = requireClient();
  const { data, error } = await client.rpc('admin_list_commissions', {
    input_password: getAdminPassword(),
  });

  if (error) throw error;
  return data ?? [];
}

export async function updateCommissionStatus(id, status) {
  const client = requireClient();
  const { error } = await client.rpc('admin_update_commission_status', {
    input_password: getAdminPassword(),
    request_id: id,
    new_status: status,
  });

  if (error) throw error;
}

export async function fetchMaintenanceSetting() {
  const client = requireClient();
  const { data, error } = await client.rpc('admin_get_maintenance', {
    input_password: getAdminPassword(),
  });

  if (error) throw error;
  return Boolean(data);
}

export async function setMaintenanceSetting(enabled) {
  const client = requireClient();
  const { data, error } = await client.rpc('admin_set_maintenance', {
    input_password: getAdminPassword(),
    enabled,
  });

  if (error) throw error;
  return Boolean(data);
}

export async function fetchPublicMaintenance() {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance')
    .maybeSingle();

  if (error) return false;
  return data?.value === true;
}

export const COMMISSION_STATUSES = [
  'pending',
  'reviewing',
  'accepted',
  'in_progress',
  'completed',
  'declined',
];

export async function registerPortfolioUpload(storagePath) {
  const client = requireClient();
  const { error } = await client.rpc('admin_register_portfolio_upload', {
    input_password: getAdminPassword(),
    storage_path: storagePath,
  });
  if (error) throw error;
}

export async function createPortfolioItem(payload) {
  const client = requireClient();
  const { data, error } = await client.rpc('admin_create_portfolio_item', {
    input_password: getAdminPassword(),
    payload,
  });
  if (error) throw error;
  return data;
}

export async function fetchAdminPortfolioItems() {
  const client = requireClient();
  const { data, error } = await client.rpc('admin_list_portfolio_items', {
    input_password: getAdminPassword(),
  });
  if (error) throw error;
  return data ?? [];
}

export async function deletePortfolioItem(itemId) {
  const client = requireClient();
  const { error } = await client.rpc('admin_delete_portfolio_item', {
    input_password: getAdminPassword(),
    item_id: itemId,
  });
  if (error) throw error;
}

export async function setPortfolioFeatured(itemId) {
  const client = requireClient();
  const { data, error } = await client.rpc('admin_set_portfolio_featured', {
    input_password: getAdminPassword(),
    item_id: itemId,
  });
  if (error) throw error;
  return Boolean(data);
}
