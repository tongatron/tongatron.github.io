(function () {
  const config = window.TongatronAnimationsConfig || {};
  const EFFECT_DEFINITIONS = config.EFFECT_DEFINITIONS || {};
  const STORAGE_KEY = config.STORAGE_KEY || 'tongatron-animations-demo-toggles';
  const PARAMS_STORAGE_KEY = config.PARAMS_STORAGE_KEY || `${STORAGE_KEY}-params`;
  const registry = window.TongatronAnimationEffects || {};
  let memoryState = {};
  let memoryParams = {};

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

  if (!dustLayer || !balloonLayer || !toast || !fallingLayer || !paramsEl) return;

  const storage = {
    get(key, fallback) {
      try {
        return window.localStorage.getItem(key) || fallback;
      } catch (error) {
        if (key === PARAMS_STORAGE_KEY) return JSON.stringify(memoryParams);
        return JSON.stringify(memoryState);
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        try {
          if (key === PARAMS_STORAGE_KEY) {
            memoryParams = JSON.parse(value || '{}');
          } else {
            memoryState = JSON.parse(value || '{}');
          }
        } catch (parseError) {
          if (key === PARAMS_STORAGE_KEY) memoryParams = {};
          else memoryState = {};
        }
      }
    }
  };

  const buildDefaultParams = () => {
    const state = {};
    Object.entries(EFFECT_DEFINITIONS).forEach(([effectName, definition]) => {
      state[effectName] = {};
      Object.entries(definition.params || {}).forEach(([paramKey, paramDef]) => {
        state[effectName][paramKey] = paramDef.default;
      });
    });
    return state;
  };

  let paramState = buildDefaultParams();

  const normalizeNumericBounds = (value, field) => {
    let current = Number(value);
    if (Number.isNaN(current)) current = Number(field.default) || 0;
    if (typeof field.min === 'number') current = Math.max(field.min, current);
    if (typeof field.max === 'number') current = Math.min(field.max, current);
    return current;
  };

  const getEffectParams = (name) => {
    const definition = EFFECT_DEFINITIONS[name] || {};
    const fields = definition.params || {};
    const values = paramState[name] || {};
    const normalized = {};
    Object.entries(fields).forEach(([paramKey, field]) => {
      const rawValue = values[paramKey];
      if (field.type === 'number') {
        normalized[paramKey] = normalizeNumericBounds(rawValue, field);
      } else {
        normalized[paramKey] = rawValue ?? field.default;
      }
    });
    return normalized;
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
    },
    getParams(name) {
      return getEffectParams(name);
    },
    getParam(name, key) {
      return getEffectParams(name)[key];
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
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'animation-lab-chip';
      chip.innerHTML = `${(EFFECT_DEFINITIONS[name] && EFFECT_DEFINITIONS[name].label) || name}<span aria-hidden="true">×</span>`;
      chip.addEventListener('click', () => {
        if (!toggleMap[name]) return;
        toggleMap[name].checked = false;
        handleToggleChange();
      });
      activeFiltersEl.appendChild(chip);
    });
  };

  const updateParam = (effectName, paramKey, value) => {
    if (!paramState[effectName]) paramState[effectName] = {};
    const field = EFFECT_DEFINITIONS[effectName]?.params?.[paramKey];
    if (!field) return;
    if (field.type === 'number') {
      paramState[effectName][paramKey] = normalizeNumericBounds(value, field);
    } else {
      paramState[effectName][paramKey] = value;
    }
    storage.set(PARAMS_STORAGE_KEY, JSON.stringify(paramState));
    const effect = effects[effectName];
    if (effect && typeof effect.applyParams === 'function') {
      effect.applyParams(getEffectParams(effectName));
    }
    renderParams();
    if (ctx.isEnabled(effectName) && effect && typeof effect.trigger === 'function') {
      effect.trigger();
    }
  };

  const createParamControl = (effectName, paramKey, field) => {
    const row = document.createElement('label');
    row.className = 'animation-param-control';

    const meta = document.createElement('span');
    meta.className = 'animation-param-meta';
    const title = document.createElement('span');
    title.className = 'animation-param-key';
    title.textContent = field.label;
    meta.appendChild(title);

    if (field.type === 'number' && typeof field.min === 'number' && typeof field.max === 'number') {
      const help = document.createElement('span');
      help.className = 'animation-param-help';
      help.textContent = `${field.min}–${field.max}${field.unit ? ` ${field.unit}` : ''}`;
      meta.appendChild(help);
    }
    row.appendChild(meta);

    const controls = document.createElement('span');
    controls.className = 'animation-param-inputs';

    if (field.type === 'select') {
      const select = document.createElement('select');
      select.className = 'animation-param-select';
      (field.options || []).forEach((option) => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        select.appendChild(opt);
      });
      select.value = String(getEffectParams(effectName)[paramKey]);
      select.addEventListener('change', () => updateParam(effectName, paramKey, select.value));
      controls.appendChild(select);
    } else {
      const input = document.createElement('input');
      input.className = 'animation-param-input';
      input.type = 'number';
      if (typeof field.min === 'number') input.min = String(field.min);
      if (typeof field.max === 'number') input.max = String(field.max);
      if (typeof field.step === 'number') input.step = String(field.step);
      input.value = String(getEffectParams(effectName)[paramKey]);
      input.addEventListener('change', () => {
        updateParam(effectName, paramKey, Number(input.value));
        input.value = String(getEffectParams(effectName)[paramKey]);
      });
      controls.appendChild(input);
    }

    if (field.unit) {
      const unit = document.createElement('span');
      unit.className = 'animation-param-unit';
      unit.textContent = field.unit;
      controls.appendChild(unit);
    }

    row.appendChild(controls);
    return row;
  };

  const renderParams = () => {
    paramsEl.innerHTML = '';
    Object.entries(EFFECT_DEFINITIONS).forEach(([effectName, definition]) => {
      const group = document.createElement('section');
      group.className = 'animation-param-group';

      const head = document.createElement('div');
      head.className = 'animation-param-head';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'animation-param-title-wrap';

      const title = document.createElement('div');
      title.className = 'animation-param-title';
      title.textContent = definition.label;
      titleWrap.appendChild(title);

      const desc = document.createElement('div');
      desc.className = 'animation-param-description';
      desc.textContent = definition.description;
      titleWrap.appendChild(desc);
      head.appendChild(titleWrap);

      const status = document.createElement('span');
      status.className = `animation-param-status${ctx.isEnabled(effectName) ? ' is-on' : ''}`;
      status.textContent = ctx.isEnabled(effectName) ? 'ON' : 'OFF';
      head.appendChild(status);
      group.appendChild(head);

      const list = document.createElement('div');
      list.className = 'animation-param-list';
      Object.entries(definition.params || {}).forEach(([paramKey, field]) => {
        list.appendChild(createParamControl(effectName, paramKey, field));
      });
      group.appendChild(list);
      paramsEl.appendChild(group);
    });
  };

  const saveToggles = () => {
    const state = {};
    Object.keys(toggleMap).forEach((name) => {
      if (toggleMap[name]) state[name] = toggleMap[name].checked;
    });
    storage.set(STORAGE_KEY, JSON.stringify(state));
  };

  const restoreToggles = () => {
    try {
      const saved = JSON.parse(storage.get(STORAGE_KEY, '{}') || '{}');
      Object.keys(toggleMap).forEach((name) => {
        const toggle = toggleMap[name];
        if (toggle && typeof saved[name] === 'boolean') {
          toggle.checked = saved[name];
        }
      });
    } catch (error) {
      console.warn('Animations state restore skipped', error);
    }
  };

  const restoreParams = () => {
    try {
      const saved = JSON.parse(storage.get(PARAMS_STORAGE_KEY, '{}') || '{}');
      Object.entries(EFFECT_DEFINITIONS).forEach(([effectName, definition]) => {
        if (!paramState[effectName]) paramState[effectName] = {};
        Object.entries(definition.params || {}).forEach(([paramKey, field]) => {
          const savedValue = saved?.[effectName]?.[paramKey];
          paramState[effectName][paramKey] =
            savedValue !== undefined
              ? (field.type === 'number' ? normalizeNumericBounds(savedValue, field) : savedValue)
              : field.default;
        });
      });
    } catch (error) {
      console.warn('Animation params restore skipped', error);
    }
  };

  const resetState = () => {
    Object.keys(toggleMap).forEach((name) => {
      const toggle = toggleMap[name];
      if (!toggle) return;
      toggle.checked = Boolean(EFFECT_DEFINITIONS[name] && EFFECT_DEFINITIONS[name].defaultEnabled);
    });
    paramState = buildDefaultParams();
    storage.set(PARAMS_STORAGE_KEY, JSON.stringify(paramState));
  };

  const applyAllParams = () => {
    Object.keys(effects).forEach((name) => {
      const effect = effects[name];
      if (effect && typeof effect.applyParams === 'function') {
        effect.applyParams(getEffectParams(name));
      }
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
    saveToggles();
  };

  const startScenes = () => {
    Object.keys(effects).forEach((name) => {
      const effect = effects[name];
      if (effect && typeof effect.startScene === 'function') {
        effect.startScene();
      }
    });
  };

  const triggerEffect = (name) => {
    if (!ctx.isEnabled(name)) return;
    const effect = effects[name];
    if (effect && typeof effect.trigger === 'function') {
      effect.trigger();
    }
  };

  const triggerEnabledEffects = () => {
    Object.keys(toggleMap).forEach((name) => triggerEffect(name));
  };

  restoreToggles();
  restoreParams();

  Object.keys(effects).forEach((name) => {
    const effect = effects[name];
    if (effect && typeof effect.init === 'function') {
      effect.init();
    }
  });

  applyAllParams();
  startScenes();

  Object.keys(toggleMap).forEach((name) => {
    const toggle = toggleMap[name];
    if (!toggle) return;
    toggle.addEventListener('change', () => {
      handleToggleChange();
      if (ctx.isEnabled(name)) triggerEffect(name);
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetState();
      applyAllParams();
      handleToggleChange();
      triggerEnabledEffects();
    });
  }

  handleToggleChange();
  triggerEnabledEffects();
})();
