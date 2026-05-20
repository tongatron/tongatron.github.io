/*!
 * Tongatron centralized analytics
 *
 * Single source of truth for analytics across tongatron.org and all
 * sub-repos / sub-domains. Include from any page with:
 *
 *   <script async src="https://tongatron.org/analytics.js"></script>
 *
 * Provider: Google Analytics 4 (G-S4XSYK0QB7)
 * Consent: Google Consent Mode v2, default denied, opt-in via banner.
 */
(function () {
  if (window.__tongatronAnalyticsLoaded) return;
  window.__tongatronAnalyticsLoaded = true;

  var GA_ID = 'G-S4XSYK0QB7';
  var CONSENT_KEY = 'tongatron-consent-v1';
  var INTERNAL_KEY = 'tongatron-analytics-disabled';
  var INTERNAL_PARAM = 'noanalytics';
  var INTERNAL_RESET_PARAM = 'analytics';
  var SHARED_DOMAIN = '.tongatron.org';

  function getSearchParams() {
    try { return new URLSearchParams(window.location.search); } catch (e) { return null; }
  }

  function getCookie(name) {
    try {
      var prefix = name + '=';
      var cookies = document.cookie ? document.cookie.split(';') : [];
      for (var i = 0; i < cookies.length; i += 1) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(prefix) === 0) return cookie.slice(prefix.length);
      }
    } catch (e) {}
    return null;
  }

  function setCookie(name, value, maxAge) {
    try {
      document.cookie = [
        name + '=' + value,
        'path=/',
        'domain=' + SHARED_DOMAIN,
        'max-age=' + maxAge,
        'SameSite=Lax',
        'Secure'
      ].join(';');
    } catch (e) {}
  }

  function persistInternalPreference(value) {
    try {
      if (value) {
        localStorage.setItem(INTERNAL_KEY, 'true');
      } else {
        localStorage.removeItem(INTERNAL_KEY);
      }
    } catch (e) {}

    if (value) {
      setCookie(INTERNAL_KEY, 'true', 60 * 60 * 24 * 365 * 2);
    } else {
      setCookie(INTERNAL_KEY, '', 0);
    }
  }

  function shouldDisableAnalytics() {
    var params = getSearchParams();
    if (params) {
      if (params.get(INTERNAL_PARAM) === '1') {
        persistInternalPreference(true);
        return true;
      }
      if (params.get(INTERNAL_RESET_PARAM) === '1') {
        persistInternalPreference(false);
      }
    }

    try {
      if (localStorage.getItem(INTERNAL_KEY) === 'true') return true;
    } catch (e) {
    }

    return getCookie(INTERNAL_KEY) === 'true';
  }

  if (shouldDisableAnalytics()) {
    window['ga-disable-' + GA_ID] = true;
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var stored = null;
  try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) {}

  // Default: deny everything until the user chooses.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: stored === 'granted' ? 'granted' : 'denied',
    wait_for_update: 500
  });

  gtag('js', new Date());
  gtag('config', GA_ID, {
    anonymize_ip: true,
    cookie_domain: 'tongatron.org',
    cookie_flags: 'SameSite=None;Secure'
  });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  if (stored === 'granted' || stored === 'denied') return;

  function buildBanner() {
    var wrap = document.createElement('div');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Consenso cookie');
    wrap.style.cssText = [
      'position:fixed', 'left:16px', 'right:16px', 'bottom:16px',
      'max-width:560px', 'margin:0 auto', 'padding:14px 16px',
      'background:#111', 'color:#eee', 'border:1px solid #333',
      'border-radius:8px', 'font:14px/1.45 system-ui,sans-serif',
      'z-index:2147483647', 'box-shadow:0 8px 24px rgba(0,0,0,.4)'
    ].join(';');
    wrap.innerHTML =
      '<div style="margin:0 0 10px">' +
        'Uso Google Analytics per capire come viene usato il sito. ' +
        'Nessun dato pubblicitario. ' +
        '<a href="https://policies.google.com/privacy" target="_blank" rel="noopener" style="color:#7cf">Privacy policy</a>.' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button data-consent="granted" style="flex:1 1 auto;padding:8px 12px;background:#eee;color:#111;border:0;border-radius:6px;font-weight:600;cursor:pointer">Accetta</button>' +
        '<button data-consent="denied"  style="flex:1 1 auto;padding:8px 12px;background:transparent;color:#eee;border:1px solid #555;border-radius:6px;cursor:pointer">Solo necessari</button>' +
      '</div>';

    wrap.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!(t instanceof HTMLElement)) return;
      var choice = t.getAttribute('data-consent');
      if (!choice) return;
      try { localStorage.setItem(CONSENT_KEY, choice); } catch (e) {}
      gtag('consent', 'update', { analytics_storage: choice });
      wrap.remove();
    });

    return wrap;
  }

  function mount() {
    if (!document.body) { setTimeout(mount, 50); return; }
    document.body.appendChild(buildBanner());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
