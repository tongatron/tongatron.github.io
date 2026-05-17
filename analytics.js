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
