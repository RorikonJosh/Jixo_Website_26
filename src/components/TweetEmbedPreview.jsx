import { useEffect, useRef, useState } from 'react';
import { ensureTwitterWidgets, extractTweetId } from '../lib/featuredTweet';

export default function TweetEmbedPreview({ url, className = '' }) {
  const containerRef = useRef(null);
  const [tweetId, setTweetId] = useState(null);
  const [status, setStatus] = useState('empty');

  useEffect(() => {
    const id = extractTweetId(url || '');
    setTweetId(id);
    setStatus(id ? 'loading' : 'empty');
  }, [url]);

  useEffect(() => {
    if (!tweetId) return undefined;

    let cancelled = false;
    const container = containerRef.current;
    if (!container) return undefined;

    container.replaceChildren();
    setStatus('loading');

    ensureTwitterWidgets()
      .then((twttr) => {
        if (cancelled || !containerRef.current) return null;
        return twttr.widgets.createTweet(tweetId, containerRef.current, {
          conversation: 'none',
          dnt: true,
          width: 480,
          theme: 'light',
        });
      })
      .then((widget) => {
        if (cancelled) return;
        setStatus(widget ? 'ready' : 'error');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [tweetId]);

  return (
    <div className={`tweet-embed-preview ${className}`.trim()}>
      <div className="tweet-embed-preview-label">預覽</div>
      {status === 'empty' && (
        <p className="admin-note">貼上有效的 X 貼文網址後，這裡會顯示預覽。</p>
      )}
      {status === 'loading' && (
        <p className="admin-note admin-loading">載入貼文預覽中…</p>
      )}
      {status === 'error' && (
        <p className="admin-error">無法載入預覽。請確認網址正確，或稍後再試。</p>
      )}
      <div ref={containerRef} className="tweet-embed-preview-frame" />
    </div>
  );
}
