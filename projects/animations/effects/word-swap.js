(function () {
  window.TongatronAnimationEffects = window.TongatronAnimationEffects || {};

  window.TongatronAnimationEffects.words = function createWordSwapEffect(ctx) {
    const { window: win, document } = ctx;
    const wordVariants = {
      soluzioni: ['sistemi', 'esperienze', 'interfacce'],
      prototipi: ['rilasci', 'strumenti', 'concept'],
      digitali: ['software', 'connesse', 'operative'],
      destinazione: ['release', 'produzione', 'delivery'],
      progetto: ['imposto', 'strutturo', 'coordino'],
      sviluppo: ['realizzo', 'costruisco', 'rilascio'],
      metodo: ['processo', 'struttura', 'ritmo'],
      esecuzione: ['delivery', 'messa a terra', 'sviluppo'],
      rilascio: ['go-live', 'handover', 'validazione'],
      contesto: ['scenario', 'perimetro', 'ecosistema'],
      roadmap: ['sequenza', 'traiettoria', 'tabella'],
      strumenti: ['moduli', 'blocchi', 'componenti'],
      autonomia: ['continuita', 'operativita', 'tenuta']
    };
    const fallbackVariants = ['signal', 'runtime', 'build', 'scope', 'deploy', 'release'];
    const swapWords = [];
    let started = false;

    const randomBetween = (min, max) => Math.random() * (max - min) + min;
    const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
    const normalizeToken = (value) => String(value || '').toLowerCase().replace(/[.,:;!?()]/g, '').trim();
    const getParams = () => ctx.getParams('words');

    const prepareTargets = () => {
      document.querySelectorAll('.animation-copy-target').forEach((element) => {
        const text = element.textContent;
        const parts = text.split(/(\s+)/);
        element.innerHTML = '';
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part) || !/[A-Za-zÀ-ÿ]/.test(part)) {
            element.appendChild(document.createTextNode(part));
            return;
          }
          const span = document.createElement('span');
          span.className = 'swap-word';
          span.dataset.original = part;
          span.textContent = part;
          swapWords.push(span);
          element.appendChild(span);
        });
      });
    };

    const mutateWord = (wordEl) => {
      if (!wordEl || wordEl.classList.contains('is-mutating')) return;
      const params = getParams();
      const original = wordEl.dataset.original || wordEl.textContent || '';
      const normalized = normalizeToken(original);
      const variants = wordVariants[normalized] || fallbackVariants;
      wordEl.classList.add('is-mutating');
      wordEl.textContent = randomItem(variants);
      win.setTimeout(() => {
        wordEl.textContent = original;
        wordEl.classList.remove('is-mutating');
      }, params.restore);
    };

    const trigger = () => {
      if (!ctx.isEnabled('words') || !swapWords.length) return;
      const params = getParams();
      const shuffled = [...swapWords].sort(() => Math.random() - 0.5).slice(0, Math.min(params.wordsPerBurst, swapWords.length));
      shuffled.forEach((wordEl, index) => {
        win.setTimeout(() => mutateWord(wordEl), index * 80);
      });
    };

    const schedule = () => {
      if (!started) return;
      if (ctx.isEnabled('words')) trigger();
      const params = getParams();
      win.setTimeout(schedule, randomBetween(params.intervalMin, params.intervalMax));
    };

    return {
      init() {
        prepareTargets();
      },
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
