import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '確定',
  cancelLabel = '取消',
  variant = 'danger',
  confirmDisabled = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !confirmDisabled) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, confirmDisabled, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="admin-confirm-overlay" onClick={confirmDisabled ? undefined : onCancel}>
      <div
        className="admin-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-confirm-title" className="admin-confirm-title">{title}</h2>
        {message && <p className="admin-confirm-message">{message}</p>}
        <div className="admin-confirm-actions">
          <button type="button" className="admin-btn" onClick={onCancel} disabled={confirmDisabled}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-btn ${variant === 'danger' ? 'admin-btn-danger' : 'admin-btn-primary'}`}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
