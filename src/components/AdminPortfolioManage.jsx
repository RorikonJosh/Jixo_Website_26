import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deletePortfolioItem,
  fetchAdminPortfolioItems,
  setPortfolioFeatured,
} from '../lib/adminApi';
import { portfolioUrl } from '../lib/portfolioStorage';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminPortfolioEditForm from './AdminPortfolioEditForm';

const CATEGORY_TABS = [
  { value: 'all', label: '全部' },
  { value: 'artwork', label: '作品集' },
  { value: 'commission_general', label: '委托 — 一般' },
  { value: 'commission_r18', label: '委托 — R18' },
];

function pageLabel(row) {
  if (row.page_type === 'artwork') return '作品集';
  return row.commission_category === 'r18' ? '委托 R18' : '委托 一般';
}

function matchesCategory(row, category) {
  if (category === 'all') return true;
  if (category === 'artwork') return row.page_type === 'artwork';
  if (category === 'commission_general') {
    return row.page_type === 'commission' && row.commission_category === 'general';
  }
  if (category === 'commission_r18') {
    return row.page_type === 'commission' && row.commission_category === 'r18';
  }
  return true;
}

export default function AdminPortfolioManage({ refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchAdminPortfolioItems();
      setItems(rows);
      setSelectedId((current) => {
        if (current && rows.some((row) => row.id === current)) return current;
        return null;
      });
    } catch (err) {
      console.error(err);
      setError('無法載入作品列表。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshKey]);

  const filteredItems = useMemo(
    () => items.filter((row) => matchesCategory(row, category)),
    [items, category],
  );

  const selectedItem = useMemo(
    () => filteredItems.find((row) => row.id === selectedId) ?? null,
    [filteredItems, selectedId],
  );

  const categoryCounts = useMemo(() => {
    const counts = { all: items.length };
    CATEGORY_TABS.slice(1).forEach((tab) => {
      counts[tab.value] = items.filter((row) => matchesCategory(row, tab.value)).length;
    });
    return counts;
  }, [items]);

  const handleDeleteRequest = (row) => {
    setError('');
    setMessage('');
    setPendingDelete(row);
  };

  const handleDeleteCancel = () => {
    if (deleting) return;
    setPendingDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setError('');
    setMessage('');
    try {
      await deletePortfolioItem(pendingDelete);
      setItems((rows) => rows.filter((item) => item.id !== pendingDelete.id));
      if (selectedId === pendingDelete.id) setSelectedId(null);
      setMessage('作品已刪除。');
      setPendingDelete(null);
    } catch (err) {
      console.error(err);
      const detail = err?.message ?? String(err);
      setError(`刪除失敗：${detail}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleSetFeatured = async (id) => {
    setError('');
    setMessage('');
    try {
      await setPortfolioFeatured(id);
      await loadItems();
      setMessage('已設為該分類的最新展示作品。');
    } catch (err) {
      console.error(err);
      setError('設定失敗。');
    }
  };

  const handleEditSaved = async () => {
    setMessage('作品已更新。');
    setError('');
    await loadItems();
  };

  return (
    <div className="admin-portfolio-manage">
      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title="確定刪除此作品？"
        message={
          pendingDelete
            ? `「${pendingDelete.title_zh || pendingDelete.title_jp || '未命名作品'}」將從網站移除，資料庫與 Storage 圖片會一併刪除，此操作無法復原。`
            : ''
        }
        confirmLabel={deleting ? '刪除中…' : '確定刪除'}
        cancelLabel="取消"
        confirmDisabled={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <div className="admin-portfolio-toolbar">
        <div className="admin-portfolio-tabs" role="tablist" aria-label="作品分類">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={category === tab.value}
              className={`admin-portfolio-tab${category === tab.value ? ' is-active' : ''}`}
              onClick={() => {
                setCategory(tab.value);
                setSelectedId(null);
              }}
            >
              {tab.label}
              <span className="admin-portfolio-tab-count">{categoryCounts[tab.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <button type="button" className="admin-btn" onClick={loadItems} disabled={loading}>
          {loading ? '載入中…' : '重新整理'}
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {message && <p className="admin-success">{message}</p>}

      {loading && items.length === 0 ? (
        <p className="admin-note admin-loading">載入作品列表中…</p>
      ) : filteredItems.length === 0 ? (
        <p className="admin-note">此分類目前沒有作品。</p>
      ) : (
        <div className={`admin-portfolio-workspace${selectedItem ? ' has-selection' : ''}`}>
          <div className="admin-portfolio-gallery">
            {filteredItems.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`admin-portfolio-thumb${selectedId === row.id ? ' is-selected' : ''}`}
                onClick={() => setSelectedId(row.id)}
              >
                <img src={portfolioUrl(row.image_path)} alt="" />
                <span className="admin-portfolio-thumb-meta">
                  <strong>{row.title_zh || row.title_jp || '—'}</strong>
                  <small>{pageLabel(row)} · {row.display_date}</small>
                </span>
                {row.featured && <span className="admin-badge admin-badge--featured">最新</span>}
              </button>
            ))}
          </div>

          <div className="admin-portfolio-detail">
            {!selectedItem ? (
              <div className="admin-portfolio-detail-empty">
                <p>點擊左側作品圖片，即可在此查看與編輯資料。</p>
              </div>
            ) : (
              <>
                <div className="admin-portfolio-detail-top">
                  <button
                    type="button"
                    className="admin-btn admin-btn--small admin-portfolio-back"
                    onClick={() => setSelectedId(null)}
                  >
                    ← 返回列表
                  </button>
                  <div className="admin-portfolio-list-actions">
                    {!selectedItem.featured && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary admin-btn--small"
                        onClick={() => handleSetFeatured(selectedItem.id)}
                      >
                        設為最新展示
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger admin-btn--small"
                      onClick={() => handleDeleteRequest(selectedItem)}
                      disabled={deleting}
                    >
                      刪除
                    </button>
                  </div>
                </div>

                <div className="admin-portfolio-detail-split">
                  <aside className="admin-portfolio-detail-media">
                    <img
                      src={portfolioUrl(selectedItem.image_path)}
                      alt={selectedItem.title_zh || selectedItem.title_jp || ''}
                    />
                    <div className="admin-portfolio-detail-summary">
                      <h3>{selectedItem.title_zh || selectedItem.title_jp || '—'}</h3>
                      <p className="admin-meta">
                        {pageLabel(selectedItem)} · {selectedItem.display_date}
                      </p>
                      {selectedItem.featured && (
                        <span className="admin-badge admin-badge--featured">最新展示</span>
                      )}
                      {!selectedItem.published && (
                        <span className="admin-badge admin-badge--warn">未公開</span>
                      )}
                    </div>
                    {selectedItem.fullsize_path && (
                      <a
                        className="admin-btn admin-btn--small"
                        href={portfolioUrl(selectedItem.fullsize_path)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        開啟大圖
                      </a>
                    )}
                  </aside>
                  <div className="admin-portfolio-detail-form">
                    <AdminPortfolioEditForm
                      key={selectedItem.id}
                      item={selectedItem}
                      onCancel={() => setSelectedId(null)}
                      onSaved={handleEditSaved}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
