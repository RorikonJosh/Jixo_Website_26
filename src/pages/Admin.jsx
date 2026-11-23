import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminLogin,
  clearAdminPassword,
  fetchCommissions,
  fetchFeaturedTweetSetting,
  fetchMaintenanceSetting,
  isAdminLoggedIn,
  setFeaturedTweetSetting,
  setMaintenanceSetting,
  updateCommissionStatus,
} from '../lib/adminApi';
import { isSupabaseConfigured } from '../lib/supabase';
import AdminPortfolioUpload from '../components/AdminPortfolioUpload';
import AdminPortfolioManage from '../components/AdminPortfolioManage';
import AdminCommissionPanel from '../components/AdminCommissionPanel';
import TweetEmbedPreview from '../components/TweetEmbedPreview';
import { normalizeTweetUrl } from '../lib/featuredTweet';
import '../styles/admin.css';

const NAV_ITEMS = [
  { id: 'settings', label: '網站設定', hint: '維護模式' },
  { id: 'tweet', label: '精選貼文', hint: '首頁最新動態' },
  { id: 'upload', label: '上傳作品', hint: '發布新作品' },
  { id: 'portfolio', label: '作品管理', hint: '編輯 / 刪除' },
  { id: 'commissions', label: '委託管理', hint: '申請與狀態' },
];

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

function AdminShell({ children }) {
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

function PanelCard({ title, subtitle, onClose, children }) {
  return (
    <section className="admin-panel-card brand-card admin-brand-card admin-brand-card--settings">
      <div className="brand-content admin-brand-content">
        <div className="admin-panel-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="admin-note">{subtitle}</p>}
          </div>
          <button type="button" className="admin-btn admin-btn--small" onClick={onClose}>
            收起
          </button>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(isAdminLoggedIn());
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [maintenance, setMaintenance] = useState(false);
  const [featuredTweetUrl, setFeaturedTweetUrl] = useState('');
  const [tweetDraft, setTweetDraft] = useState('');
  const [tweetSaving, setTweetSaving] = useState(false);
  const [tweetMessage, setTweetMessage] = useState('');
  const [pageError, setPageError] = useState('');
  const [portfolioRefreshKey, setPortfolioRefreshKey] = useState(0);
  const [activePanel, setActivePanel] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('com-bg');
    return () => {
      document.body.classList.remove('com-bg');
    };
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [rows, maintenanceEnabled, tweetUrl] = await Promise.all([
        fetchCommissions(),
        fetchMaintenanceSetting(),
        fetchFeaturedTweetSetting(),
      ]);
      setCommissions(rows);
      setMaintenance(maintenanceEnabled);
      setFeaturedTweetUrl(tweetUrl || '');
      setTweetDraft(tweetUrl || '');
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

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await adminLogin(password);
      setAuthed(true);
      setPassword('');
      setActivePanel(null);
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
    setActivePanel(null);
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

  const handleFeaturedTweetSave = async (event) => {
    event.preventDefault();
    setTweetMessage('');
    setPageError('');
    setTweetSaving(true);
    try {
      const normalized = normalizeTweetUrl(tweetDraft);
      if (tweetDraft.trim() && !normalized) {
        setPageError('請貼上有效的 X / Twitter 貼文網址。');
        return;
      }
      const saved = await setFeaturedTweetSetting(normalized);
      setFeaturedTweetUrl(saved);
      setTweetDraft(saved);
      setTweetMessage(saved ? '首頁精選貼文已更新。' : '已清除首頁精選貼文。');
    } catch (err) {
      console.error(err);
      setPageError('更新精選貼文失敗。');
    } finally {
      setTweetSaving(false);
    }
  };

  const selectPanel = (id) => {
    setActivePanel(id);
    setMobileNavOpen(false);
    setPageError('');
  };

  const navHint = (item) => {
    if (item.id === 'commissions') {
      return `${commissions.length} 筆`;
    }
    return item.hint;
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
      <AdminShell>
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
      <div className="admin-shell">
        <button
          type="button"
          className={`admin-mobile-nav-toggle${mobileNavOpen ? ' is-active' : ''}`}
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-label={mobileNavOpen ? '關閉選單' : '開啟選單'}
        >
          <span />
          <span />
          <span />
        </button>

        {mobileNavOpen && (
          <button
            type="button"
            className="admin-sidebar-backdrop"
            aria-label="關閉選單"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <aside className={`admin-sidebar${mobileNavOpen ? ' is-open' : ''}`}>
          <div className="admin-sidebar-brand">
            <h1>後台管理</h1>
            <p className="admin-note">選擇左側項目開啟設定</p>
          </div>

          <nav className="admin-sidebar-nav" aria-label="後台導覽">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-sidebar-link${activePanel === item.id ? ' is-active' : ''}`}
                onClick={() => selectPanel(item.id)}
              >
                <span>{item.label}</span>
                <small>{navHint(item)}</small>
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <button type="button" className="admin-btn" onClick={handleLogout}>
              登出
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {pageError && (
            <p className="admin-error admin-error-banner admin-error-standalone">{pageError}</p>
          )}

          {!activePanel && (
            <section className="admin-home-card brand-card admin-brand-card admin-brand-card--settings">
              <div className="brand-content admin-brand-content">
                <h2>歡迎回來</h2>
                <p className="admin-note">
                  左側選單可開啟各項設定。作品管理可點擊縮圖後，左側看圖、右側編輯資料。
                </p>
                <div className="admin-home-actions">
                  <button type="button" className="admin-btn" onClick={() => selectPanel('portfolio')}>
                    作品管理
                  </button>
                  <button type="button" className="admin-btn admin-btn-primary" onClick={() => selectPanel('upload')}>
                    上傳作品
                  </button>
                  <button type="button" className="admin-btn" onClick={() => selectPanel('commissions')}>
                    委託管理
                  </button>
                </div>
              </div>
            </section>
          )}

          {activePanel === 'settings' && (
            <PanelCard title="網站設定" onClose={() => setActivePanel(null)}>
              <div className="admin-maintenance">
                <div>
                  <h3>網站維護模式</h3>
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
            </PanelCard>
          )}

          {activePanel === 'tweet' && (
            <PanelCard
              title="首頁精選貼文"
              subtitle="貼上 X 貼文網址後可先預覽，確認無誤再儲存。"
              onClose={() => setActivePanel(null)}
            >
              <div className="admin-featured-tweet-layout">
                <form className="admin-featured-tweet admin-featured-tweet--panel" onSubmit={handleFeaturedTweetSave}>
                  <label className="admin-field">
                    <span>貼文網址</span>
                    <input
                      type="url"
                      value={tweetDraft}
                      onChange={(e) => setTweetDraft(e.target.value)}
                      placeholder="https://x.com/jixo95821699/status/..."
                    />
                  </label>
                  {featuredTweetUrl && (
                    <p className="admin-meta">目前已儲存：{featuredTweetUrl}</p>
                  )}
                  {tweetMessage && <p className="admin-success">{tweetMessage}</p>}
                  <div className="admin-featured-tweet-actions">
                    <button
                      type="submit"
                      className="admin-btn admin-btn-primary"
                      disabled={tweetSaving}
                    >
                      {tweetSaving ? '儲存中…' : '儲存貼文'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn"
                      disabled={tweetSaving || (!tweetDraft && !featuredTweetUrl)}
                      onClick={async () => {
                        setTweetDraft('');
                        setTweetSaving(true);
                        setTweetMessage('');
                        try {
                          await setFeaturedTweetSetting('');
                          setFeaturedTweetUrl('');
                          setTweetMessage('已清除首頁精選貼文。');
                        } catch (err) {
                          console.error(err);
                          setPageError('清除精選貼文失敗。');
                        } finally {
                          setTweetSaving(false);
                        }
                      }}
                    >
                      清除
                    </button>
                  </div>
                </form>
                <TweetEmbedPreview url={tweetDraft} />
              </div>
            </PanelCard>
          )}

          {activePanel === 'upload' && (
            <PanelCard
              title="上傳作品"
              subtitle="發布到作品集或委托作品集頁面"
              onClose={() => setActivePanel(null)}
            >
              <AdminPortfolioUpload
                onPublished={() => {
                  setPortfolioRefreshKey((key) => key + 1);
                  setActivePanel('portfolio');
                }}
              />
            </PanelCard>
          )}

          {activePanel === 'portfolio' && (
            <PanelCard
              title="作品管理"
              subtitle="點擊作品縮圖後，左側顯示圖片，右側編輯資料。"
              onClose={() => setActivePanel(null)}
            >
              <AdminPortfolioManage refreshKey={portfolioRefreshKey} />
            </PanelCard>
          )}

          {activePanel === 'commissions' && (
            <PanelCard
              title="委託管理"
              subtitle={`共 ${commissions.length} 筆委託申請`}
              onClose={() => setActivePanel(null)}
            >
              <AdminCommissionPanel
                commissions={commissions}
                loading={loading}
                onRefresh={loadDashboard}
                onStatusChange={handleStatusChange}
              />
            </PanelCard>
          )}
        </main>
      </div>
    </AdminPageWrap>
  );
}
