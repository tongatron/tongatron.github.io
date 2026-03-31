(function () {
  window.TongatronAnimationEffects = window.TongatronAnimationEffects || {};

  window.TongatronAnimationEffects.glitch = function createGlitchEffect(ctx) {
    const { window: win, document } = ctx;
    let started = false;
    let burstTimer = 0;

    const randomBetween = (min, max) => Math.random() * (max - min) + min;
    const getParams = () => ctx.getParams('glitch');

    const burst = () => {
      if (!ctx.isEnabled('glitch')) return;
      const params = getParams();
      document.body.classList.add('screen-glitch-active');
      if (burstTimer) win.clearTimeout(burstTimer);
      burstTimer = win.setTimeout(() => {
        document.body.classList.remove('screen-glitch-active');
      }, params.duration);
    };

    const schedule = () => {
      if (!started) return;
      if (ctx.isEnabled('glitch')) burst();
      const params = getParams();
      win.setTimeout(schedule, randomBetween(params.intervalMin, params.intervalMax));
    };

    return {
      init() {},
      trigger: burst,
      startScene() {
        if (started) return;
        started = true;
        schedule();
      },
      applyParams() {},
      setEnabled(enabled) {
        if (!enabled) document.body.classList.remove('screen-glitch-active');
      }
    };
  };
})();
