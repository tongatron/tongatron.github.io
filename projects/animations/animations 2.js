(function () {
  const config = window.TongatronAnimationsConfig || {};
  const EFFECT_DEFINITIONS = config.EFFECT_DEFINITIONS || {};
  const STORAGE_KEY = config.STORAGE_KEY || 'tongatron-animations-demo-toggles';
  const registry = window.TongatronAnimationEffects || {};
  let memoryState = {};

  const dustLayer = document.getElementById('balloons-dust');
  const balloonLayer = document.getElementById('balloons-layer');
  const toast = document.getElementById('balloons-toast');
  const fallingLayer = document.getElementById('falling-layer');
  const activeFiltersEl = document.getElementById('animation-lab-active');
  const paramsEl = document.getElementById('animation-params');
  const resetBtn = document.getElementById('animations-reset');
  const toggleMap = {
    balloons: document.getElementById('toggle-balloons'),
    glitch: document.getElementById('toggle-glitch'),
    words: document.getElementById('toggle-words'),
    fall: document.getElementById('toggle-fall'),
    glass: document.getElementById('toggle-glass')
  };

  if (!dustLayer || !balloonLayer || !toast || !fallingLayer) return;

  const safeStorage = {
    get() {
      try {
        return window.localStorage.getItem(STORAGE_KEY);
      } catch (error) {
        return JSON.stringify(memoryState);
      }
    },
    set(value) {
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch (error) {
        try {
          memoryState = JSON.parse(value || '{}');
        } catch (parseError) {
          memoryState = {};
        }
      }
    }
  };

  const ctx = {
    window,
    document,
    dustLayer,
    balloonLayer,
    toast,
    fallingLayer,
    isEnabled(name) {
      return Boolean(toggleMap[name] && toggleMap[name].checked);
    }
  };

  const effects = {
    balloons: registry.balloons ? registry.balloons(ctx) : null,
    glitch: registry.glitch ? registry.glitch(ctx) : null,
    words: registry.words ? registry.words(ctx) : null,
    fall: registry.fall ? registry.fall(ctx) : null,
    glass: registry.glass ? registry.glass(ctx) : null
  };

  const renderActiveFilters = () => {
    if (!activeFiltersEl) return;
    activeFiltersEl.innerHTML = '';
    Object.keys(toggleMap).forEach((name) => {
      if (!ctx.isEnabled(name)) return;
      const chip = document.createElement('span');
      chip.className = 'animation-lab-chip';
      chip.textContent = (EFFECT_DEFINITIONS[name] && EFFECT_DEFINITIONS[name].label) || name;
      activeFiltersEl.appendChild(chip);
    });
  };

  const renderParams = () => {
    if (!paramsEl) return;
    paramsEl.innerHTML = '';
    const enabledNames = Object.keys(toggleMap).filter((name) => ctx.isEnabled(name));
    if (!enabledNames.length) {
      const empty = document.createElement('p');
      empty.className = 'animation-param-empty';
      empty.textContent = 'Attiva una o più animazioni per vedere i parametri correnti.';
      paramsEl.appendChild(empty);
      return;
    }
    enabledNames.forEach((name) => {
      const definition = EFFECT_DEFINITIONS[name];
      if (!definition) return;
      const group = document.createElement('section');
      group.className = 'animation-param-group';
      const title = document.createElement('div');
      title.className = 'animation-param-title';
      title.textContent = definition.label;
      group.appendChild(title);
      const list = document.createElement('div');
      list.className = 'animation-param-list';
      const params = definition.params || {};
      Object.keys(params).forEach((key) => {
        const row = document.createElement('div');
        row.className = 'animation-param-row';
        const keyEl = document.createElement('span');
        keyEl.className = 'animation-param-key';
        keyEl.textContent = key;
        const valueEl = document.createElement('span');
        valueEl.className = 'animation-param-value';
        valueEl.textContent = params[key];
        row.appendChild(keyEl);
        row.appendChild(valueEl);
        list.appendChild(row);
      });
      group.appendChild(list);
      paramsEl.appendChild(group);
    });
  };

  const saveState = () => {
    const state = {};
    Object.keys(toggleMap).forEach((name) => {
      if (toggleMap[name]) state[name] = toggleMap[name].checked;
    });
    safeStorage.set(JSON.stringify(state));
  };

  const restoreState = () => {
    try {
      const saved = JSON.parse(safeStorage.get() || '{}');
      Object.keys(toggleMap).forEach((name) => {
        const toggle = toggleMap[name];
        if (!toggle) return;
        if (typeof saved[name] === 'boolean') {
          toggle.checked = saved[name];
        }
      });
    } catch (error) {
      console.warn('Animations state restore skipped', error);
    }
  };

  const resetState = () => {
    Object.keys(toggleMap).forEach((name) => {
      const toggle = toggleMap[name];
      if (!toggle) return;
      toggle.checked = Boolean(EFFECT_DEFINITIONS[name] && EFFECT_DEFINITIONS[name].defaultEnabled);
    });
  };

  const handleToggleChange = () => {
    Object.keys(effects).forEach((name) => {
      const effect = effects[name];
      if (!effect || typeof effect.setEnabled !== 'function') return;
      effect.setEnabled(ctx.isEnabled(name));
    });
    renderActiveFilters();
    renderParams();
    saveState();
  };

  const startScenes = () => {
    Object.keys(effects).forEach((name) => {
      const effect = effects[name];
      if (!effect || typeof effect.startScene !== 'function') return;
      effect.startScene();
    });
  };

  const triggerEffect = (name) => {
    if (!ctx.isEnabled(name)) return;
    const effect = effects[name];
    if (!effect || typeof effect.trigger !== 'function') return;
    effect.trigger();
  };

  const triggerEnabledEffects = () => {
    Object.keys(toggleMap).forEach((name) => triggerEffect(name));
  };

  const handleSingleToggle = (name) => {
    handleToggleChange();
    if (ctx.isEnabled(name)) {
      triggerEffect(name);
    }
  };

  restoreState();
  Object.keys(effects).forEach((name) => {
    const effect = effects[name];
    if (effect && typeof effect.init === 'function') effect.init();
  });
  startScenes();
  Object.keys(toggleMap).forEach((name) => {
    const toggle = toggleMap[name];
    if (!toggle) return;
    toggle.addEventListener('change', () => handleSingleToggle(name));
  });
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetState();
      handleToggleChange();
      triggerEnabledEffects();
    });
  }
  handleToggleChange();
  triggerEnabledEffects();
})();
