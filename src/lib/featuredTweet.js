const STATUS_RE = /(?:x|twitter)\.com\/[^/]+\/status\/(\d+)/i;

export function extractTweetId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(STATUS_RE);
  return match?.[1] ?? null;
}

export function normalizeTweetUrl(input) {
  const id = extractTweetId(input);
  if (!id) return '';
  return `https://x.com/i/status/${id}`;
}

export function ensureTwitterWidgets() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('twitter_widgets_unavailable'));
  }

  if (window.twttr?.widgets) {
    return Promise.resolve(window.twttr);
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      if (window.twttr?.ready) {
        window.twttr.ready(resolve);
        return;
      }
      if (window.twttr?.widgets) {
        resolve(window.twttr);
        return;
      }
      reject(new Error('twitter_widgets_unavailable'));
    };

    const existing = document.getElementById('x-widgets-js');
    if (existing) {
      if (window.twttr) {
        finish();
        return;
      }
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('twitter_script_error')), {
        once: true,
      });
      return;
    }

    window.twttr = window.twttr || {
      _e: [],
      ready(fn) {
        this._e.push(fn);
      },
    };

    const script = document.createElement('script');
    script.id = 'x-widgets-js';
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => reject(new Error('twitter_script_error')), {
      once: true,
    });
    document.body.appendChild(script);
  });
}
