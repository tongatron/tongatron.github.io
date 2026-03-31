window.TongatronAnimationsConfig = {
  STORAGE_KEY: 'tongatron-animations-demo-toggles',
  PARAMS_STORAGE_KEY: 'tongatron-animations-demo-params',
  EFFECT_DEFINITIONS: {
    balloons: {
      label: 'Palloncini',
      description: 'Layer di sfondo con palloncini, polvere e toast di avvio.',
      defaultEnabled: true,
      recurring: true,
      params: {
        spawnMin: { label: 'Spawn min', type: 'number', min: 200, max: 4000, step: 50, unit: 'ms', default: 700 },
        spawnMax: { label: 'Spawn max', type: 'number', min: 300, max: 6000, step: 50, unit: 'ms', default: 1800 },
        toastMs: { label: 'Toast', type: 'number', min: 500, max: 10000, step: 100, unit: 'ms', default: 4400 },
        burstCount: { label: 'Burst balloons', type: 'number', min: 1, max: 20, step: 1, default: 6 },
        dustBurst: { label: 'Burst dust', type: 'number', min: 0, max: 30, step: 1, default: 10 },
        depth: {
          label: 'Depth mode',
          type: 'select',
          default: 'all',
          options: [
            { value: 'all', label: 'All layers' },
            { value: 'mid-far', label: 'Mid + far' },
            { value: 'far', label: 'Far only' }
          ]
        }
      }
    },
    glitch: {
      label: 'Glitch televisivo',
      description: 'Disturbi rapidi sullo schermo a intervalli irregolari.',
      defaultEnabled: false,
      recurring: true,
      params: {
        intervalMin: { label: 'Interval min', type: 'number', min: 200, max: 15000, step: 100, unit: 'ms', default: 3400 },
        intervalMax: { label: 'Interval max', type: 'number', min: 300, max: 20000, step: 100, unit: 'ms', default: 7600 },
        duration: { label: 'Burst', type: 'number', min: 40, max: 1200, step: 10, unit: 'ms', default: 150 }
      }
    },
    words: {
      label: 'Testo mutevole',
      description: 'Parole che cambiano per un istante e poi si riallineano.',
      defaultEnabled: false,
      recurring: true,
      params: {
        intervalMin: { label: 'Interval min', type: 'number', min: 300, max: 15000, step: 100, unit: 'ms', default: 2800 },
        intervalMax: { label: 'Interval max', type: 'number', min: 400, max: 20000, step: 100, unit: 'ms', default: 5400 },
        wordsPerBurst: { label: 'Words / burst', type: 'number', min: 1, max: 20, step: 1, default: 4 },
        restore: { label: 'Restore', type: 'number', min: 80, max: 4000, step: 20, unit: 'ms', default: 760 }
      }
    },
    fall: {
      label: 'Blocchi in caduta',
      description: 'Parole e piccoli blocchi che attraversano lo schermo.',
      defaultEnabled: false,
      recurring: true,
      params: {
        intervalMin: { label: 'Interval min', type: 'number', min: 500, max: 20000, step: 100, unit: 'ms', default: 5200 },
        intervalMax: { label: 'Interval max', type: 'number', min: 800, max: 25000, step: 100, unit: 'ms', default: 9200 },
        blocksPerBurst: { label: 'Blocks / burst', type: 'number', min: 1, max: 30, step: 1, default: 6 },
        durationMin: { label: 'Duration min', type: 'number', min: 0.2, max: 10, step: 0.1, unit: 's', default: 1.2 },
        durationMax: { label: 'Duration max', type: 'number', min: 0.3, max: 12, step: 0.1, unit: 's', default: 2.1 }
      }
    },
    glass: {
      label: 'Vetro rotto',
      description: 'Una crepa rapida come overlay al momento del trigger.',
      defaultEnabled: false,
      recurring: false,
      params: {
        duration: { label: 'Duration', type: 'number', min: 60, max: 4000, step: 20, unit: 'ms', default: 760 }
      }
    }
  }
};
