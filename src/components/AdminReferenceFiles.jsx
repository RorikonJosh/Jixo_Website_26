import { useState } from 'react';
import {
  downloadReferenceFile,
  getReferenceFileName,
  openReferenceFile,
} from '../lib/referenceFiles';

export default function AdminReferenceFiles({ paths }) {
  const [busyPath, setBusyPath] = useState('');
  const [error, setError] = useState('');

  const runAction = async (path, action) => {
    setBusyPath(path);
    setError('');
    try {
      if (action === 'open') {
        await openReferenceFile(path);
      } else {
        await downloadReferenceFile(path);
      }
    } catch (err) {
      console.error(err);
      setError('無法開啟或下載檔案，請確認 Storage 讀取權限已設定。');
    } finally {
      setBusyPath('');
    }
  };

  if (!paths?.length) return null;

  return (
    <div className="admin-files">
      <strong>參考檔案：</strong>
      <ul className="admin-file-list">
        {paths.map((path) => {
          const busy = busyPath === path;
          const name = getReferenceFileName(path);

          return (
            <li key={path} className="admin-file-item">
              <span className="admin-file-name" title={path}>{name}</span>
              <div className="admin-file-actions">
                <button
                  type="button"
                  className="admin-file-btn"
                  disabled={busy}
                  onClick={() => runAction(path, 'open')}
                >
                  {busy ? '處理中…' : '開啟'}
                </button>
                <button
                  type="button"
                  className="admin-file-btn admin-file-btn--download"
                  disabled={busy}
                  onClick={() => runAction(path, 'download')}
                >
                  下載
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
