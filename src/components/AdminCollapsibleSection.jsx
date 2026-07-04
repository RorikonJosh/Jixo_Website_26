import { useId, useState } from 'react';

export default function AdminCollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  variant = 'settings',
  headerActions = null,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const cardClass = [
    'brand-card',
    'admin-brand-card',
    variant === 'dashboard' ? 'admin-brand-card--dashboard' : 'admin-brand-card--settings',
    open ? 'admin-brand-card--open' : 'admin-brand-card--collapsed',
  ].join(' ');

  return (
    <section className="admin-section">
      <div className={cardClass}>
        {variant === 'dashboard' && <div className="admin-top-banner" aria-hidden="true" />}

        <div
          className={`brand-content admin-brand-content${
            variant === 'dashboard' ? ' admin-brand-content--dashboard' : ''
          }`}
        >
          <div className="admin-collapse-bar">
            <button
              type="button"
              className="admin-collapse-toggle"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={panelId}
            >
              <span className={`admin-collapse-arrow${open ? ' is-open' : ''}`} aria-hidden="true">
                ▶
              </span>
              <span className="admin-collapse-heading">
                <span className="admin-collapse-title">{title}</span>
                {subtitle && <span className="admin-note admin-collapse-subtitle">{subtitle}</span>}
              </span>
            </button>
            {headerActions && (
              <div className="admin-collapse-actions" onClick={(e) => e.stopPropagation()}>
                {headerActions}
              </div>
            )}
          </div>

          {open && (
            <div id={panelId} className="admin-collapse-body">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
