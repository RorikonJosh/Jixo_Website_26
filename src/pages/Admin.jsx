import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminLogin,
  clearAdminPassword,
  COMMISSION_STATUSES,
  fetchCommissions,
  fetchMaintenanceSetting,
  isAdminLoggedIn,
  setMaintenanceSetting,
  updateCommissionStatus,
} from '../lib/adminApi';
import { isSupabaseConfigured } from '../lib/supabase';
import AdminReferenceFiles from '../components/AdminReferenceFiles';
import AdminPortfolioUpload from '../components/AdminPortfolioUpload';
import AdminPortfolioManage from '../components/AdminPortfolioManage';
import AdminCollapsibleSection from '../components/AdminCollapsibleSection';
import '../styles/admin.css';

const STATUS_LABELS = {
  pending: '待處理',
  reviewing: '審核中',
  accepted: '已接受',
  in_progress: '製作中',
  completed: '已完成',
  declined: '已婉拒',
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('zh-TW', { hour12: false });
}

function matchesCommissionSearch(item, query) {
  if (!query) return true;
  const haystack = [
    item.name,
    item.email,
    item.contact_handle,
    item.purpose,
    item.character_desc,
    item.style_notes,
    item.budget,
    item.usage_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function AdminPageWrap({ children }) {
  return (
    <div className="admin-page-wrap">
      <Link to="/" className="admin-corner-logo" aria-label="返回首頁">
        <img src="/images/logo.png" alt="NIGHTFOX" />
      </Link>
      {children}
    </div>
  );
}

function AdminShell({ variant = 'login', children }) {
  if (variant === 'login') {
    return (
      <AdminPageWrap>
        <section className="admin-intro">
          <div className="brand-card admin-brand-card">
            <div className="brand-image">
              <img src="/images/contact.png" alt="" className="brand-img" />
            </div>
            <div className="brand-content admin-brand-content">{children}</div>
          </div>
        </section>
      </AdminPageWrap>
    );
  }

  return null;
}

export default function Admin() {
  const [authed, setAuthed] = useState(isAdminLoggedIn());
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [maintenance, setMaintenance] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [pageError, setPageError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [r18Filter, setR18Filter] = useState('all');
  const [portfolioRefreshKey, setPortfolioRefreshKey] = useState(0);

  useEffect(() => {
    document.body.classList.add('com-bg');
    return () => {
      document.body.classList.remove('com-bg');
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [rows, maintenanceEnabled] = await Promise.all([
        fetchCommissions(),
        fetchMaintenanceSetting(),
      ]);
      setCommissions(rows);
      setMaintenance(maintenanceEnabled);
    } catch (err) {
      console.error(err);
      setPageError('無法載入管理資料。請確認已在 Supabase SQL Editor 執行 admin RPC 設定 SQL。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadDashboard();
  }, [authed, loadDashboard]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCommissions = useMemo(() => {
    return commissions.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (r18Filter === 'yes' && !item.is_r18) return false;
      if (r18Filter === 'no' && item.is_r18) return false;
      return matchesCommissionSearch(item, normalizedSearch);
    });
  }, [commissions, normalizedSearch, statusFilter, r18Filter]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await adminLogin(password);
      setAuthed(true);
      setPassword('');
    } catch {
      setLoginError('密碼錯誤，或 Admin SQL 尚未執行。');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminPassword();
    setAuthed(false);
    setCommissions([]);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateCommissionStatus(id, status);
      setCommissions((rows) =>
        rows.map((row) => (row.id === id ? { ...row, status } : row)),
      );
    } catch (err) {
      console.error(err);
      setPageError('更新狀態失敗。');
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      const next = !maintenance;
      const enabled = await setMaintenanceSetting(next);
      setMaintenance(enabled);
    } catch (err) {
      console.error(err);
      setPageError('更新維護模式失敗。');
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <AdminShell>
        <h1>Admin</h1>
        <p className="admin-note">Supabase 尚未設定。</p>
      </AdminShell>
    );
  }

  if (!authed) {
    return (
      <AdminShell variant="login">
        <form className="admin-login" onSubmit={handleLogin}>
          <h1>Admin 登入</h1>
          <p className="admin-note">輸入管理密碼以查看委託與網站設定。</p>
          <label className="admin-field">
            <span>密碼</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {loginError && <p className="admin-error">{loginError}</p>}
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
            {loading ? '登入中…' : '登入'}
          </button>
        </form>
      </AdminShell>
    );
  }

  return (
    <AdminPageWrap>
      <div className="admin-dashboard">
        <section className="admin-section">
          <div className="brand-card admin-brand-card admin-brand-card--settings">
            <div className="brand-content admin-brand-content">
              <div className="admin-maintenance">
                <div>
                  <h2>網站維護模式</h2>
                  <p className="admin-note">
                    開啟後，訪客會看到維護頁面；`/admin` 仍可進入。
                  </p>
                  {maintenance && <span className="admin-badge admin-badge--warn">維護中</span>}
                </div>
                <button
                  type="button"
                  className={`admin-btn ${maintenance ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                  onClick={handleMaintenanceToggle}
                >
                  {maintenance ? '關閉維護模式' : '開啟維護模式'}
                </button>
              </div>
              <div className="admin-settings-footer">
                <button type="button" className="admin-btn" onClick={handleLogout}>
                  登出
                </button>
              </div>
            </div>
          </div>
        </section>

        <AdminCollapsibleSection
          title="作品管理"
          subtitle="管理作品集與委托作品：刪除、設為最新展示"
          defaultOpen
        >
          <AdminPortfolioManage refreshKey={portfolioRefreshKey} />
        </AdminCollapsibleSection>

        <AdminCollapsibleSection
          title="上傳新作品"
          subtitle="發布到作品集或委托作品集頁面"
          defaultOpen={false}
        >
          <AdminPortfolioUpload onPublished={() => setPortfolioRefreshKey((key) => key + 1)} />
        </AdminCollapsibleSection>

        {pageError && (
          <p className="admin-error admin-error-banner admin-error-standalone">{pageError}</p>
        )}

        <AdminCollapsibleSection
          title="委託管理"
          subtitle={`共 ${commissions.length} 筆 · 顯示 ${filteredCommissions.length} 筆`}
          defaultOpen
          variant="dashboard"
          headerActions={
            <button type="button" className="admin-btn" onClick={loadDashboard} disabled={loading}>
              重新整理
            </button>
          }
        >
          <div className="admin-filters">
            <label className="admin-field admin-field--grow">
              <span>搜尋</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="姓名、Email、用途、描述…"
              />
            </label>
            <label className="admin-field">
              <span>狀態</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">全部狀態</option>
                {COMMISSION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status] ?? status}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>R18</span>
              <select value={r18Filter} onChange={(e) => setR18Filter(e.target.value)}>
                <option value="all">全部</option>
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p className="admin-note admin-loading">載入中…</p>
          ) : filteredCommissions.length === 0 ? (
            <section className="admin-panel admin-panel--empty">
              <p>
                {commissions.length === 0
                  ? '目前沒有委託資料。'
                  : '沒有符合篩選條件的委託。'}
              </p>
            </section>
          ) : (
            <div className="admin-list">
              {filteredCommissions.map((item) => (
                <article key={item.id} className="admin-panel admin-request">
                  <div className="admin-request-top">
                    <div>
                      <h3>{item.name}</h3>
                      <p className="admin-meta">
                        {item.email}
                        {item.contact_handle ? ` · ${item.contact_handle}` : ''}
                      </p>
                      <p className="admin-meta">{formatDate(item.created_at)}</p>
                    </div>
                    <label className="admin-status-field">
                      <span className="admin-status-label">狀態</span>
                      <span className={`admin-status-capsule admin-status-capsule--${item.status}`}>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`admin-status-select admin-status-select--${item.status}`}
                          aria-label="委託狀態"
                        >
                          {COMMISSION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status] ?? status}
                            </option>
                          ))}
                        </select>
                      </span>
                    </label>
                  </div>

                  <button
                    type="button"
                    className="admin-expand"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    {expandedId === item.id ? '收起詳情' : '查看詳情'}
                  </button>

                  {expandedId === item.id && (
                    <div className="admin-details">
                      <p><strong>用途：</strong>{item.purpose || '—'}</p>
                      <p><strong>角色描述：</strong>{item.character_desc || '—'}</p>
                      <p><strong>構圖 / 畫風：</strong>{item.style_notes || '—'}</p>
                      <p><strong>預算 (NTD)：</strong>{item.budget || '—'}</p>
                      <p><strong>希望交稿：</strong>{item.deadline || '—'}</p>
                      <p><strong>R18：</strong>{item.is_r18 ? '是' : '否'}</p>
                      <p><strong>用途類型：</strong>{item.usage_type || '—'}</p>
                      <p><strong>語系：</strong>{item.locale || '—'}</p>
                      {item.reference_urls?.length > 0 && (
                        <div>
                          <strong>參考連結：</strong>
                          <ul>
                            {item.reference_urls.map((url) => (
                              <li key={url}>
                                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.reference_files?.length > 0 && (
                        <AdminReferenceFiles paths={item.reference_files} />
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </AdminCollapsibleSection>
      </div>
    </AdminPageWrap>
  );
}
