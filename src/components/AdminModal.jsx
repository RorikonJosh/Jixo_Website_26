import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AdminModal({
  open,
  title,
  subtitle = '',
  onClose,
  size = 'lg',
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className={`admin-modal admin-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <h2 id="admin-modal-title">{title}</h2>
            {subtitle && <p className="admin-note">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="關閉"
          >
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
