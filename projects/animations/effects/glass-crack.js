(function () {
  window.TongatronAnimationEffects = window.TongatronAnimationEffects || {};

  window.TongatronAnimationEffects.glass = function createGlassCrackEffect(ctx) {
    const { window: win, document } = ctx;
    let crackTimer = 0;
    const getParams = () => ctx.getParams('glass');

    const trigger = () => {
      if (!ctx.isEnabled('glass')) return;
      const params = getParams();
      document.body.classList.add('glass-crack-active');
      if (crackTimer) win.clearTimeout(crackTimer);
      crackTimer = win.setTimeout(() => {
        document.body.classList.remove('glass-crack-active');
      }, params.duration);
    };

    return {
      init() {},
      trigger,
      startScene() {},
      applyParams() {},
      setEnabled(enabled) {
        if (!enabled) document.body.classList.remove('glass-crack-active');
      }
    };
  };
})();
