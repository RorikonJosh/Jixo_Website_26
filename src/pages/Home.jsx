import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import '../styles/home-brand.css';
import { useEffect, useRef, useState } from 'react';
import { fetchPublicFeaturedTweetUrl } from '../lib/adminApi';
import { ensureTwitterWidgets, extractTweetId } from '../lib/featuredTweet';

const X_PROFILE_URL = 'https://x.com/jixo95821699';
const DEFAULT_TWEET_ID = '2124805065500430471';

export default function Home() {
  const { t } = useTranslation();
  const tweetRef = useRef(null);
  const [tweetId, setTweetId] = useState(DEFAULT_TWEET_ID);
  const [embedFailed, setEmbedFailed] = useState(false);

  useEffect(() => {
    document.body.classList.add('home-bg');
    return () => {
      document.body.classList.remove('home-bg');
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchPublicFeaturedTweetUrl().then((url) => {
      if (!active) return;
      const id = extractTweetId(url);
      if (id) setTweetId(id);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!tweetId) return undefined;

    let cancelled = false;
    const container = tweetRef.current;
    if (!container) return undefined;

    container.replaceChildren();
    setEmbedFailed(false);

    ensureTwitterWidgets()
      .then((twttr) => {
        if (cancelled || !tweetRef.current) return null;
        return twttr.widgets.createTweet(tweetId, tweetRef.current, {
          conversation: 'none',
          dnt: true,
          align: 'center',
          width: 420,
        });
      })
      .then((widget) => {
        if (cancelled) return;
        if (!widget) setEmbedFailed(true);
      })
      .catch(() => {
        if (!cancelled) setEmbedFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [tweetId]);

  return (
    <div className="home-page">
      <section className="home-hero" aria-label="NIGHTFOX">
        <div className="home-hero-media" aria-hidden="true">
          <img src="/images/jixo_topbanner.jpg" alt="" />
        </div>
        <div className="home-hero-veil" aria-hidden="true" />
        <div className="home-hero-copy">
          <div className="home-nightfox" aria-hidden="true">NIGHTFOX</div>
          <h1>
            {t('home.greetingStart')}
            <span className="home-hero-name">{t('home.greetingName')}</span>
          </h1>
          <div className="home-hero-actions">
            <Link to="/artworks" className="home-action home-action--primary">
              {t('home.ctaArtworks')}
            </Link>
            <Link to="/commer" className="home-action">
              {t('home.ctaCommission')}
            </Link>
          </div>
        </div>
      </section>

      <section className="home-mainband">
        <div className="home-mainband-intro">
          <div className="home-about">
            <div className="home-about-portrait">
              <img src="/images/jixo_new_face.jpg" alt="kareya" />
            </div>
            <div className="home-about-text">
              <h2>{t('home.aboutTitle')}</h2>
              <p>{t('home.usageNotice')}</p>
              <p className="home-about-warn">{t('home.aiWarning')}</p>
              <p>
                {t('home.commission')}{' '}
                <a href="mailto:jixo0407@gmail.com">jixo0407@gmail.com</a>
              </p>
              <p className="home-about-langs">{t('home.languages')}</p>
            </div>
          </div>

          <aside className="home-connect" aria-label={t('home.connectTitle')}>
            <h2>{t('home.connectTitle')}</h2>
            <div className="home-connect-row">
              <a href="https://www.pixiv.net/users/31690832" target="_blank" rel="noreferrer" aria-label="Pixiv">
                <img src="/images/pixiv.png" alt="" />
              </a>
              <a href={X_PROFILE_URL} target="_blank" rel="noreferrer" aria-label="X">
                <img src="/images/Twitter.png" alt="" />
              </a>
              <a href="https://www.facebook.com/jixo95821699" target="_blank" rel="noreferrer" aria-label="Facebook">
                <img src="/images/facebook.png" alt="" />
              </a>
              <a href="https://home.gamer.com.tw/profile/index_feed.php?owner=jixo0407" target="_blank" rel="noreferrer" aria-label="Bahamut">
                <img src="/images/Bahamut.jpg" alt="" />
              </a>
              <a href="https://www.reddit.com/user/jixo0407/" target="_blank" rel="noreferrer" aria-label="Reddit">
                <img src="/images/reddit.png" alt="" />
              </a>
              <a href="https://bsky.app/profile/kareya.bsky.social" target="_blank" rel="noreferrer" aria-label="Bluesky">
                <img src="/images/Bluesky_Logo.png" alt="" />
              </a>
            </div>
          </aside>
        </div>

        <aside className="home-updates" aria-labelledby="home-latest-updates">
          <header className="home-updates-header">
            <h2 id="home-latest-updates">{t('home.latestUpdates')}</h2>
            <p>{t('home.latestUpdatesNote')}</p>
          </header>
          <div className="home-updates-embed">
            <div className="home-tweet-inner" ref={tweetRef} />
            {embedFailed && (
              <p className="home-tweet-fallback">
                <a
                  href={tweetId ? `https://x.com/i/status/${tweetId}` : X_PROFILE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('home.latestUpdatesOpenX')}
                </a>
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
