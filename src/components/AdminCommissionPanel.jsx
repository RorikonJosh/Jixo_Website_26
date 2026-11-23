import { useMemo, useState } from 'react';
import { COMMISSION_STATUSES } from '../lib/adminApi';
import { formatCommissionTypes } from '../lib/commissionTypes';
import { formatContactPlatform } from '../lib/contactPlatform';
import AdminReferenceFiles from './AdminReferenceFiles';

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
    item.contact_platform,
    item.purpose,
    item.character_desc,
    item.style_notes,
    item.budget,
    item.usage_type,
    ...(Array.isArray(item.commission_types) ? item.commission_types : []),
    item.commission_type_other,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export default function AdminCommissionPanel({
  commissions,
  loading,
  onRefresh,
  onStatusChange,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [r18Filter, setR18Filter] = useState('all');

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCommissions = useMemo(() => {
    return commissions.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (r18Filter === 'yes' && !item.is_r18) return false;
      if (r18Filter === 'no' && item.is_r18) return false;
      return matchesCommissionSearch(item, normalizedSearch);
    });
  }, [commissions, normalizedSearch, statusFilter, r18Filter]);

  return (
    <div className="admin-commission-panel">
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
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
        <button type="button" className="admin-btn" onClick={onRefresh} disabled={loading}>
          {loading ? '載入中…' : '重新整理'}
        </button>
      </div>

      <p className="admin-note">
        共 {commissions.length} 筆 · 顯示 {filteredCommissions.length} 筆
      </p>

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
                    {item.contact_handle || item.contact_platform
                      ? ` · ${formatContactPlatform(item.contact_platform, item.contact_handle)}`
                      : ''}
                  </p>
                  <p className="admin-meta">{formatDate(item.created_at)}</p>
                </div>
                <label className="admin-status-field">
                  <span className="admin-status-label">狀態</span>
                  <span className={`admin-status-capsule admin-status-capsule--${item.status}`}>
                    <select
                      value={item.status}
                      onChange={(e) => onStatusChange(item.id, e.target.value)}
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
                  <p>
                    <strong>其他聯絡：</strong>
                    {formatContactPlatform(item.contact_platform, item.contact_handle)}
                  </p>
                  <p>
                    <strong>委託類型：</strong>
                    {formatCommissionTypes(
                      item.commission_types,
                      item.commission_type_other,
                    )}
                  </p>
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
    </div>
  );
}
