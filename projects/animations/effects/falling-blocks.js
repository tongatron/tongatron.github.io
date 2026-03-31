(function () {
  window.TongatronAnimationEffects = window.TongatronAnimationEffects || {};

  window.TongatronAnimationEffects.fall = function createFallingBlocksEffect(ctx) {
    const { window: win, document, fallingLayer } = ctx;
    const tokens = ['scope', 'build', 'release', 'web', 'mobile', 'iot', 'utility', 'game', 'prototype', 'delivery'];
    let started = false;

    const randomBetween = (min, max) => Math.random() * (max - min) + min;
    const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
    const getParams = () => ctx.getParams('fall');

    const spawnBlock = (text) => {
      const params = getParams();
      const block = document.createElement('span');
      block.className = 'falling-block';
      block.textContent = text;
      block.style.left = `${randomBetween(6, 84)}vw`;
      block.style.setProperty('--fall-x', `${randomBetween(-24, 24).toFixed(1)}px`);
      block.style.setProperty('--fall-drift', `${randomBetween(-160, 160).toFixed(1)}px`);
      block.style.setProperty('--fall-rot-start', `${randomBetween(-14, 14).toFixed(1)}deg`);
      block.style.setProperty('--fall-rot-end', `${randomBetween(-34, 34).toFixed(1)}deg`);
      block.style.setProperty('--fall-duration', `${randomBetween(params.durationMin, params.durationMax).toFixed(2)}s`);
      block.addEventListener('animationend', () => block.remove());
      fallingLayer.appendChild(block);
    };

    const trigger = () => {
      if (!ctx.isEnabled('fall')) return;
      const params = getParams();
      for (let i = 0; i < params.blocksPerBurst; i += 1) {
        win.setTimeout(() => spawnBlock(randomItem(tokens)), i * 80);
      }
    };

    const schedule = () => {
      if (!started) return;
      if (ctx.isEnabled('fall')) trigger();
      const params = getParams();
      win.setTimeout(schedule, randomBetween(params.intervalMin, params.intervalMax));
    };

    return {
      init() {},
      trigger,
      startScene() {
        if (started) return;
        started = true;
        schedule();
      },
      applyParams() {},
      setEnabled() {}
    };
  };
})();
