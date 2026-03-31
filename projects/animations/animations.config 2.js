window.TongatronAnimationsConfig = {
  STORAGE_KEY: 'tongatron-animations-demo-toggles',
  EFFECT_DEFINITIONS: {
    balloons: {
      label: 'Palloncini',
      description: 'Attiva l\'esplosione del logo e il layer di sfondo.',
      defaultEnabled: true,
      recurring: true,
      params: {
        spawnRate: '700-1800ms',
        depth: '3 layer',
        toast: '4.4s',
        dust: 'on'
      }
    },
    glitch: {
      label: 'Glitch televisivo',
      description: 'Disturbi rapidi sullo schermo a intervalli irregolari.',
      defaultEnabled: false,
      recurring: true,
      params: {
        interval: '3400-7600ms',
        burst: '150ms',
        mode: 'screen overlay'
      }
    },
    words: {
      label: 'Testo mutevole',
      description: 'Parole che cambiano per un istante e poi si riallineano.',
      defaultEnabled: false,
      recurring: true,
      params: {
        interval: '2800-5400ms',
        wordsPerBurst: '4',
        restore: '760ms'
      }
    },
    fall: {
      label: 'Blocchi in caduta',
      description: 'Parole e piccoli blocchi che attraversano lo schermo.',
      defaultEnabled: false,
      recurring: true,
      params: {
        interval: '5200-9200ms',
        blocksPerBurst: '6',
        duration: '1.2-2.1s'
      }
    },
    glass: {
      label: 'Vetro rotto',
      description: 'Una crepa rapida come overlay al momento del trigger.',
      defaultEnabled: false,
      recurring: false,
      params: {
        trigger: 'immediato',
        overlay: 'full screen',
        duration: '760ms'
      }
    }
  }
};
