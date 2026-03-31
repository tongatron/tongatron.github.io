(function () {
  window.TongatronAnimationEffects = window.TongatronAnimationEffects || {};

  window.TongatronAnimationEffects.balloons = function createBalloonsEffect(ctx) {
    const { window: win, document, dustLayer, balloonLayer, toast } = ctx;
    const activeBalloons = new Set();
    const activeDust = new Set();
    let sceneStarted = false;
    let toastTimer = 0;

    const randomBetween = (min, max) => Math.random() * (max - min) + min;
    const getParams = () => ctx.getParams('balloons');

    const removeBalloon = (balloon) => {
      activeBalloons.delete(balloon);
      balloon.remove();
    };

    const popBalloon = (balloon) => {
      if (!balloon || balloon.classList.contains('is-popping')) return;
      balloon.classList.add('is-popping');
      win.setTimeout(() => removeBalloon(balloon), 220);
    };

    const createDust = () => {
      const speck = document.createElement('span');
      const size = randomBetween(1.4, 3.2);
      speck.className = 'dust-speck';
      speck.style.width = `${size}px`;
      speck.style.height = `${size}px`;
      speck.style.left = `${randomBetween(0, 100)}%`;
      speck.style.bottom = `${randomBetween(-8, 18)}vh`;
      speck.style.animationDuration = `${randomBetween(16, 34)}s`;
      speck.style.setProperty('--dust-drift', `${randomBetween(-30, 30).toFixed(1)}px`);
      speck.addEventListener('animationend', () => {
        activeDust.delete(speck);
        speck.remove();
      });
      dustLayer.appendChild(speck);
      activeDust.add(speck);
    };

    const scheduleDust = () => {
      if (!sceneStarted) return;
      if (ctx.isEnabled('balloons')) createDust();
      const params = getParams();
      const dustMin = Math.max(80, Math.round(params.spawnMin * 0.25));
      const dustMax = Math.max(dustMin + 40, Math.round(params.spawnMax * 0.45));
      win.setTimeout(scheduleDust, randomBetween(dustMin, dustMax));
    };

    const spawnBalloon = () => {
      const params = getParams();
      const depthMode = params.depth;
      const depthRoll = Math.random();
      let depth = depthRoll < 0.2 ? 'depth-near' : depthRoll < 0.58 ? 'depth-mid' : 'depth-far';
      if (depthMode === 'mid-far' && depth === 'depth-near') depth = 'depth-mid';
      if (depthMode === 'far') depth = 'depth-far';
      const sizeRange = depth === 'depth-near' ? [34, 86] : depth === 'depth-mid' ? [20, 58] : [12, 36];
      const durationRange = depth === 'depth-near' ? [13, 22] : depth === 'depth-mid' ? [19, 30] : [24, 40];
      const balloon = document.createElement('button');
      const size = randomBetween(sizeRange[0], sizeRange[1]);
      const left = randomBetween(2, 94);
      const duration = randomBetween(durationRange[0], durationRange[1]);
      const driftRange = depth === 'depth-near' ? 44 : depth === 'depth-mid' ? 28 : 18;
      balloon.type = 'button';
      balloon.className = `balloon ${depth}`;
      balloon.setAttribute('aria-label', 'Scoppia palloncino');
      balloon.style.width = `${size}px`;
      balloon.style.height = `${size * randomBetween(1.08, 1.24)}px`;
      balloon.style.left = `${left}%`;
      balloon.style.animationDuration = `${duration}s`;
      balloon.style.setProperty('--drift', `${randomBetween(-driftRange, driftRange).toFixed(1)}px`);
      balloon.addEventListener('click', () => popBalloon(balloon));
      balloon.addEventListener('animationend', () => removeBalloon(balloon));
      balloonLayer.appendChild(balloon);
      activeBalloons.add(balloon);
    };

    const scheduleSpawn = () => {
      if (!sceneStarted) return;
      if (ctx.isEnabled('balloons')) spawnBalloon();
      const params = getParams();
      win.setTimeout(scheduleSpawn, randomBetween(params.spawnMin, params.spawnMax));
    };

    const startScene = () => {
      if (sceneStarted) return;
      sceneStarted = true;
      scheduleSpawn();
      scheduleDust();
    };

    const trigger = () => {
      if (!ctx.isEnabled('balloons')) return;
      const params = getParams();
      startScene();
      toast.classList.add('is-visible');
      if (toastTimer) win.clearTimeout(toastTimer);
      toastTimer = win.setTimeout(() => {
        toast.classList.remove('is-visible');
      }, params.toastMs);
      for (let i = 0; i < params.burstCount; i += 1) {
        win.setTimeout(spawnBalloon, i * 150);
      }
      for (let i = 0; i < params.dustBurst; i += 1) {
        win.setTimeout(createDust, i * 90);
      }
    };

    return {
      init() {
        document.body.classList.toggle('balloons-disabled', !ctx.isEnabled('balloons'));
      },
      trigger,
      startScene,
      applyParams() {},
      setEnabled(enabled) {
        document.body.classList.toggle('balloons-disabled', !enabled);
      }
    };
  };
})();
