(function () {
  const ASCII_MAP = " .,:;*oO#@";
  const NOISE_MAP = " .*:+x%$#@";
  const TWINKLE_MAP = ".:+*";
  const FONT_WIDTH_RATIO = 0.62;
  const FONT_LINE_RATIO = 0.84;
  const ANIMATION_MODES = [
    { id: "bloom", label: "Condensa" },
    { id: "scan", label: "Scansione" },
    { id: "cascade", label: "Cascata" },
    { id: "none", label: "Statica" },
  ];

  const sampleDefinitions = [
    {
      name: "Luna e dune",
      svg: `
        <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="800" fill="#020202" />
          <circle cx="860" cy="220" r="122" fill="#f4f4f4" />
          <circle cx="912" cy="206" r="122" fill="#020202" />
          <circle cx="180" cy="130" r="8" fill="#ffffff" />
          <circle cx="290" cy="170" r="6" fill="#ffffff" />
          <circle cx="340" cy="118" r="4" fill="#ffffff" />
          <circle cx="410" cy="205" r="5" fill="#ffffff" />
          <circle cx="510" cy="110" r="7" fill="#ffffff" />
          <circle cx="640" cy="165" r="4" fill="#ffffff" />
          <circle cx="720" cy="122" r="6" fill="#ffffff" />
          <path d="M80 700 Q300 470 530 655 T1120 610 L1120 800 L80 800Z" fill="#ffffff" />
          <path d="M-40 760 Q220 565 420 725 T780 690 T1240 715 L1240 800 L-40 800Z" fill="#d8d8d8" />
        </svg>
      `,
    },
    {
      name: "Occhio sintetico",
      svg: `
        <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="800" fill="#030303" />
          <path d="M170 400 Q600 120 1030 400 Q600 680 170 400Z" fill="#f4f4f4" />
          <ellipse cx="600" cy="400" rx="188" ry="188" fill="#111111" />
          <circle cx="600" cy="400" r="92" fill="#f2f2f2" />
          <circle cx="600" cy="400" r="44" fill="#0b0b0b" />
          <circle cx="646" cy="346" r="18" fill="#ffffff" />
          <path d="M250 400 Q600 222 950 400" stroke="#020202" stroke-width="26" fill="none" stroke-linecap="round" />
          <path d="M250 400 Q600 578 950 400" stroke="#020202" stroke-width="26" fill="none" stroke-linecap="round" />
        </svg>
      `,
    },
    {
      name: "Orbita",
      svg: `
        <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="800" fill="#030303" />
          <ellipse cx="630" cy="394" rx="330" ry="120" fill="none" stroke="#ffffff" stroke-width="42" />
          <circle cx="628" cy="396" r="136" fill="#f5f5f5" />
          <circle cx="710" cy="348" r="30" fill="#030303" />
          <circle cx="360" cy="258" r="10" fill="#ffffff" />
          <circle cx="435" cy="180" r="6" fill="#ffffff" />
          <circle cx="860" cy="200" r="8" fill="#ffffff" />
          <circle cx="912" cy="270" r="5" fill="#ffffff" />
          <circle cx="1005" cy="148" r="5" fill="#ffffff" />
        </svg>
      `,
    },
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothStep(value) {
    const clamped = clamp(value, 0, 1);
    return clamped * clamped * (3 - 2 * clamped);
  }

  function hashNoise(x, y, time, seed = 0) {
    const value =
      Math.sin(x * 127.1 + y * 311.7 + time * 0.021 + seed * 57.13) *
      43758.5453123;
    return value - Math.floor(value);
  }

  function svgToDataUri(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  window.createAsciiLabController = function createAsciiLabController(refs) {
    const {
      stage,
      screen,
      uploadInput,
      toggleMotionButton,
      nextButton,
      resetImagesButton,
      columnsRange,
      speedRange,
      contrastRange,
      columnsValue,
      speedValue,
      contrastValue,
      phraseInput,
      applyPhrasesButton,
      clearPhrasesButton,
      statusEl,
      messageEl,
    } = refs;

    const state = {
      active: false,
      preparedTargets: [],
      customSources: [],
      customPhrases: [],
      animationFields: {
        bloom: [],
        scan: [],
        cascade: [],
      },
      currentIndex: 0,
      phase: "reveal",
      phaseStartedAt: 0,
      lastFrameAt: 0,
      paused: false,
      pausedAt: 0,
      rafId: 0,
      metrics: null,
      rebuildTicket: 0,
      animationMode: "bloom",
      resizeTimer: 0,
      loopStarted: false,
      needsRebuild: true,
    };

    function setStatus(text = "") {
      statusEl.textContent = text;
    }

    function setMessage(text = "") {
      messageEl.hidden = !text;
      messageEl.textContent = text;
    }

    function getTiming() {
      const revealDuration = Number(speedRange.value);
      return {
        revealDuration,
        holdDuration: 1250,
        dissolveDuration: Math.max(1200, revealDuration * 0.62),
      };
    }

    function getContrast() {
      return Number(contrastRange.value) / 100;
    }

    function updateControlLabels() {
      columnsValue.textContent = columnsRange.value;
      speedValue.textContent = `${(Number(speedRange.value) / 1000).toFixed(1)}s`;
      contrastValue.textContent = `${getContrast().toFixed(2)}x`;
    }

    function computeGridMetrics() {
      const bounds = stage.getBoundingClientRect();
      const width = Math.max(bounds.width, window.innerWidth - 40);
      const height = Math.max(bounds.height, window.innerHeight - 40);
      const cols = Number(columnsRange.value);
      const fontSize = width / (cols * FONT_WIDTH_RATIO);
      const lineHeightPx = fontSize * FONT_LINE_RATIO;
      const rows = Math.max(18, Math.floor((height - 20) / lineHeightPx));

      screen.style.fontSize = `${fontSize}px`;
      screen.style.lineHeight = `${lineHeightPx}px`;

      return { cols, rows };
    }

    function buildAnimationFields(cols, rows) {
      const bloom = new Array(cols * rows);
      const scan = new Array(cols * rows);
      const cascade = new Array(cols * rows);

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const index = y * cols + x;
          const nx = cols > 1 ? x / (cols - 1) : 0;
          const ny = rows > 1 ? y / (rows - 1) : 0;
          const dx = nx - 0.5;
          const dy = ny - 0.5;
          const radial = Math.sqrt(dx * dx + dy * dy);
          const ripple = Math.abs(Math.sin((dx - dy) * 7.6)) * 0.14;
          const bloomNoise = hashNoise(x, y, 0, 9) * 0.36;
          const scanNoise = hashNoise(x, y, 0, 31) * 0.18;
          const cascadeNoise = hashNoise(x, y, 0, 47) * 0.22;

          bloom[index] = clamp(radial * 0.9 + ripple + bloomNoise, 0, 1);
          scan[index] = clamp(
            nx * 0.82 + scanNoise + Math.abs(Math.sin(ny * 9.5)) * 0.08,
            0,
            1
          );
          cascade[index] = clamp(ny * 0.84 + cascadeNoise + nx * 0.06, 0, 1);
        }
      }

      return { bloom, scan, cascade };
    }

    function makeNoiseChar(x, y, time) {
      const value = hashNoise(x, y, time, 2);
      const index = Math.min(
        NOISE_MAP.length - 1,
        Math.floor(value * NOISE_MAP.length)
      );
      return NOISE_MAP[index];
    }

    function makeTwinkleChar(x, y, time) {
      const value = hashNoise(x, y, time, 14);
      const index = Math.min(
        TWINKLE_MAP.length - 1,
        Math.floor(value * TWINKLE_MAP.length)
      );
      return TWINKLE_MAP[index];
    }

    function normalizePhraseSources(rawText) {
      return rawText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((phrase, index) => ({
          kind: "phrase",
          phrase,
          theme: index % 2 === 0 ? "dark" : "light",
          name: phrase.length > 26 ? `${phrase.slice(0, 26)}…` : phrase,
        }));
    }

    function getSources() {
      const builtIns = sampleDefinitions.map((item) => ({
        name: item.name,
        url: svgToDataUri(item.svg),
        kind: "sample",
      }));

      return [...state.customPhrases, ...state.customSources, ...builtIns];
    }

    function applyStageTheme(target) {
      if (target?.kind === "phrase" && target.theme === "light") {
        stage.style.backgroundColor = "#ffffff";
        screen.style.color = "#000000";
        return;
      }

      stage.style.backgroundColor = "#000000";
      screen.style.color = "#ffffff";
    }

    function getAnimationProfile() {
      if (state.animationMode === "scan") {
        return {
          field: state.animationFields.scan,
          spread: 5,
          bias: 0.14,
        };
      }

      if (state.animationMode === "cascade") {
        return {
          field: state.animationFields.cascade,
          spread: 4.6,
          bias: 0.18,
        };
      }

      return {
        field: state.animationFields.bloom,
        spread: 4.2,
        bias: 0.28,
      };
    }

    function makeTransitionChar(mode, x, y, time, progress, revealGate, noiseChar) {
      if (mode === "scan" && Math.abs(progress - revealGate) < 0.038) {
        return "|";
      }

      if (
        mode === "cascade" &&
        progress < revealGate &&
        hashNoise(x, y, time, 27) > 0.72
      ) {
        return ":";
      }

      return noiseChar;
    }

    function composeFrame(targetRows, progress, timeMs) {
      if (state.animationMode === "none") {
        return targetRows.join("\n");
      }

      const { cols, rows } = state.metrics;
      const time = timeMs * 0.016;
      const lines = new Array(rows);
      const profile = getAnimationProfile();

      for (let y = 0; y < rows; y += 1) {
        let line = "";

        for (let x = 0; x < cols; x += 1) {
          const index = y * cols + x;
          const targetChar = targetRows[y][x];
          const revealGate = profile.field[index];
          const localProgress = smoothStep(
            (progress - revealGate) * profile.spread + profile.bias
          );
          const noiseChar = makeNoiseChar(x, y, time);

          if (targetChar === " ") {
            line += noiseChar;
            continue;
          }

          if (localProgress <= 0.06) {
            line += makeTransitionChar(
              state.animationMode,
              x,
              y,
              time,
              progress,
              revealGate,
              noiseChar
            );
            continue;
          }

          if (
            localProgress < 0.94 &&
            hashNoise(x, y, time, 19) > localProgress
          ) {
            line += makeTwinkleChar(x, y, time);
            continue;
          }

          line += targetChar;
        }

        lines[y] = line;
      }

      return lines.join("\n");
    }

    function loadImage(url) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Impossibile caricare ${url}`));
        image.src = url;
      });
    }

    function drawContain(ctx, image, width, height) {
      const sourceRatio = image.width / image.height;
      const destinationRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (sourceRatio > destinationRatio) {
        drawHeight = width / sourceRatio;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawWidth = height * sourceRatio;
        offsetX = (width - drawWidth) / 2;
      }

      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    }

    function shouldInvert(luminanceGrid, cols, rows) {
      let borderSum = 0;
      let borderCount = 0;
      let centerSum = 0;
      let centerCount = 0;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const value = luminanceGrid[y * cols + x];
          const isBorder = x < 2 || y < 2 || x >= cols - 2 || y >= rows - 2;

          if (isBorder) {
            borderSum += value;
            borderCount += 1;
          }

          if (
            x > cols * 0.2 &&
            x < cols * 0.8 &&
            y > rows * 0.2 &&
            y < rows * 0.8
          ) {
            centerSum += value;
            centerCount += 1;
          }
        }
      }

      const borderAverage = borderCount ? borderSum / borderCount : 0;
      const centerAverage = centerCount ? centerSum / centerCount : 0;

      return borderAverage > centerAverage + 0.08;
    }

    function rasterizeToAscii(image, cols, rows) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = cols;
      canvas.height = rows;

      context.fillStyle = "#000";
      context.fillRect(0, 0, cols, rows);
      drawContain(context, image, cols, rows);

      const { data } = context.getImageData(0, 0, cols, rows);
      return imageDataToAsciiRows(data, cols, rows);
    }

    function imageDataToAsciiRows(data, cols, rows, invertOverride = null) {
      const luminanceGrid = new Array(cols * rows);

      for (let index = 0; index < cols * rows; index += 1) {
        const offset = index * 4;
        const alpha = data[offset + 3] / 255;
        const luminance =
          (0.2126 * data[offset] +
            0.7152 * data[offset + 1] +
            0.0722 * data[offset + 2]) /
          255;

        luminanceGrid[index] = luminance * alpha;
      }

      const invert =
        invertOverride === null
          ? shouldInvert(luminanceGrid, cols, rows)
          : invertOverride;
      const contrast = getContrast();
      const rowsOutput = new Array(rows);

      for (let y = 0; y < rows; y += 1) {
        let line = "";

        for (let x = 0; x < cols; x += 1) {
          const value = luminanceGrid[y * cols + x];
          const normalized = invert ? 1 - value : value;
          const contrasted = clamp((normalized - 0.5) * contrast + 0.5, 0, 1);
          const eased = Math.pow(contrasted, 0.92);

          if (eased < 0.07) {
            line += " ";
            continue;
          }

          const mapIndex = Math.min(
            ASCII_MAP.length - 1,
            Math.floor(eased * (ASCII_MAP.length - 1))
          );
          line += ASCII_MAP[mapIndex];
        }

        rowsOutput[y] = line;
      }

      return rowsOutput;
    }

    function rasterizePhraseToAscii(phrase, cols, rows, theme) {
      const blockRows = clamp(Math.floor(rows * 0.42), 8, Math.max(8, rows - 4));
      const minBlockCols = Math.max(18, Math.floor(cols * 0.42));
      const maxBlockCols = Math.max(cols + 12, cols * 5);
      const pixelHeight = 260;
      const paddingX = Math.floor(pixelHeight * 0.18);
      const invert = theme === "light";
      const background = invert ? "#ffffff" : "#000000";
      const foreground = invert ? "#000000" : "#ffffff";

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });

      let fontSize = Math.floor(pixelHeight * 0.72);
      let width = pixelHeight;

      for (let attempt = 0; attempt < 8; attempt += 1) {
        context.font = `900 ${fontSize}px "IBM Plex Mono", Menlo, Consolas, monospace`;
        const measured = Math.ceil(context.measureText(phrase).width);
        width = Math.max(pixelHeight, measured + paddingX * 2);
        const estimatedCols = Math.ceil(
          (width / pixelHeight) * (blockRows / FONT_WIDTH_RATIO)
        );

        if (estimatedCols <= maxBlockCols || fontSize <= 64) {
          break;
        }

        fontSize = Math.max(
          64,
          Math.floor(fontSize * (maxBlockCols / estimatedCols) * 0.98)
        );
      }

      canvas.width = width;
      canvas.height = pixelHeight;

      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = `900 ${fontSize}px "IBM Plex Mono", Menlo, Consolas, monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = foreground;
      context.fillText(phrase, canvas.width / 2, canvas.height / 2);

      const blockCols = clamp(
        Math.ceil((canvas.width / canvas.height) * (blockRows / FONT_WIDTH_RATIO)),
        minBlockCols,
        maxBlockCols
      );

      const sampleCanvas = document.createElement("canvas");
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      sampleCanvas.width = blockCols;
      sampleCanvas.height = blockRows;
      sampleContext.fillStyle = background;
      sampleContext.fillRect(0, 0, blockCols, blockRows);
      sampleContext.drawImage(canvas, 0, 0, blockCols, blockRows);

      const rowsOutput = imageDataToAsciiRows(
        sampleContext.getImageData(0, 0, blockCols, blockRows).data,
        blockCols,
        blockRows,
        invert
      );

      return {
        artRows: rowsOutput,
        artCols: blockCols,
        artHeight: blockRows,
      };
    }

    function getPhraseDuration(target) {
      return Math.max(Number(speedRange.value) + 2200, 5200, target.artCols * 80);
    }

    function composePhraseFrame(target, offsetX, timeMs = 0, metrics = state.metrics) {
      const { cols, rows } = metrics;
      const time = timeMs * 0.016;
      const lines = new Array(rows);
      const offsetY = Math.max(0, Math.floor((rows - target.artHeight) / 2));

      for (let y = 0; y < rows; y += 1) {
        const chars = new Array(cols);

        for (let x = 0; x < cols; x += 1) {
          chars[x] = makeNoiseChar(x, y, time);
        }

        const artRowIndex = y - offsetY;
        if (artRowIndex >= 0 && artRowIndex < target.artHeight) {
          const artRow = target.artRows[artRowIndex];

          for (let x = 0; x < target.artCols; x += 1) {
            const char = artRow[x];
            const screenX = offsetX + x;

            if (char !== " " && screenX >= 0 && screenX < cols) {
              chars[screenX] = char;
            }
          }
        }

        lines[y] = chars.join("");
      }

      return lines.join("\n");
    }

    function composeStaticPhraseFrame(target, metrics = state.metrics) {
      const centeredOffset = Math.floor((metrics.cols - target.artCols) / 2);
      return composePhraseFrame(target, centeredOffset, 0, metrics);
    }

    function updateMotionButtonState() {
      const animationsDisabled = state.animationMode === "none";
      toggleMotionButton.disabled = animationsDisabled;
      toggleMotionButton.textContent = animationsDisabled
        ? "Pausa"
        : state.paused
          ? "Riprendi"
          : "Pausa";
    }

    function setCurrentTarget(index, now = performance.now()) {
      if (!state.preparedTargets.length) {
        return;
      }

      state.currentIndex = clamp(index, 0, state.preparedTargets.length - 1);
      state.phase = "reveal";
      state.phaseStartedAt = now;
      const target = state.preparedTargets[state.currentIndex];
      setStatus(`${getModeLabel()} • ${target.name}`);
    }

    function getModeLabel() {
      const match = ANIMATION_MODES.find((mode) => mode.id === state.animationMode);
      return match ? `ASCII ${match.label.toUpperCase()}` : "ASCII";
    }

    function setAnimationMode(modeId) {
      if (!ANIMATION_MODES.some((mode) => mode.id === modeId)) {
        return;
      }

      state.animationMode = modeId;
      state.paused = false;
      state.phase = "reveal";
      state.phaseStartedAt = performance.now();
      state.lastFrameAt = 0;
      updateMotionButtonState();

      if (state.preparedTargets.length) {
        const target = state.preparedTargets[state.currentIndex];
        setStatus(`${getModeLabel()} • ${target.name}`);
      } else {
        setStatus(getModeLabel());
      }
    }

    async function prepareTargets() {
      const ticket = ++state.rebuildTicket;
      const metrics = computeGridMetrics();
      const animationFields = buildAnimationFields(metrics.cols, metrics.rows);
      const sources = getSources();

      setStatus("ASCII • preparo i campioni");
      const preparedTargets = [];

      for (const source of sources) {
        try {
          if (source.kind === "phrase") {
            const phraseArt = rasterizePhraseToAscii(
              source.phrase,
              metrics.cols,
              metrics.rows,
              source.theme
            );
            preparedTargets.push({
              ...source,
              rows: [],
              text: "",
              ...phraseArt,
            });
            continue;
          }

          const image = await loadImage(source.url);
          if (ticket !== state.rebuildTicket) {
            return;
          }

          preparedTargets.push({
            ...source,
            rows: rasterizeToAscii(image, metrics.cols, metrics.rows),
            text: "",
          });
        } catch (error) {
          console.error(error);
        }
      }

      if (ticket !== state.rebuildTicket) {
        return;
      }

      for (const target of preparedTargets) {
        if (target.kind === "phrase") {
          target.text = composeStaticPhraseFrame(target, metrics);
        } else {
          target.text = target.rows.join("\n");
        }
      }

      state.metrics = metrics;
      state.animationFields = animationFields;
      state.preparedTargets = preparedTargets;
      state.needsRebuild = false;

      if (!state.preparedTargets.length) {
        screen.textContent = "";
        setStatus("ASCII • nessuna sorgente");
        return;
      }

      setCurrentTarget(
        clamp(state.currentIndex, 0, state.preparedTargets.length - 1),
        performance.now()
      );
    }

    function getCurrentTarget() {
      if (!state.preparedTargets.length) {
        return null;
      }

      return state.preparedTargets[state.currentIndex];
    }

    function moveToNextTarget(now) {
      if (!state.preparedTargets.length) {
        return;
      }

      setCurrentTarget((state.currentIndex + 1) % state.preparedTargets.length, now);
    }

    function render(now) {
      state.rafId = requestAnimationFrame(render);
      if (!state.active || !state.preparedTargets.length) {
        return;
      }

      const target = getCurrentTarget();
      if (!target) {
        return;
      }

      applyStageTheme(target);

      if (state.animationMode === "none") {
        const nextFrame =
          target.kind === "phrase" ? composeStaticPhraseFrame(target) : target.text;
        if (screen.textContent !== nextFrame) {
          screen.textContent = nextFrame;
        }
        return;
      }

      if (state.paused) {
        return;
      }

      if (now - state.lastFrameAt < 38) {
        return;
      }

      state.lastFrameAt = now;

      if (target.kind === "phrase") {
        const progress = clamp(
          (now - state.phaseStartedAt) / getPhraseDuration(target),
          0,
          1
        );
        const offsetX = Math.round(
          state.metrics.cols + (-target.artCols - state.metrics.cols) * progress
        );
        screen.textContent = composePhraseFrame(target, offsetX, now);

        if (progress >= 1) {
          moveToNextTarget(now);
        }
        return;
      }

      const { revealDuration, holdDuration, dissolveDuration } = getTiming();
      let progress = 0;

      if (state.phase === "reveal") {
        progress = clamp((now - state.phaseStartedAt) / revealDuration, 0, 1);
        if (progress >= 1) {
          state.phase = "hold";
          state.phaseStartedAt = now;
          progress = 1;
        }
      } else if (state.phase === "hold") {
        progress = 1;
        if (now - state.phaseStartedAt >= holdDuration) {
          state.phase = "dissolve";
          state.phaseStartedAt = now;
        }
      } else {
        progress = 1 - clamp((now - state.phaseStartedAt) / dissolveDuration, 0, 1);
        if (progress <= 0) {
          moveToNextTarget(now);
          progress = 0;
        }
      }

      screen.textContent = composeFrame(target.rows, progress, now);
    }

    function startLoop() {
      if (state.loopStarted) {
        return;
      }

      state.loopStarted = true;
      state.rafId = requestAnimationFrame(render);
    }

    function setPaused(paused) {
      if (state.animationMode === "none") {
        return;
      }

      if (state.paused === paused) {
        return;
      }

      if (paused) {
        state.paused = true;
        state.pausedAt = performance.now();
        updateMotionButtonState();
        setMessage("ANIMAZIONE IN PAUSA.");
        return;
      }

      const now = performance.now();
      const delta = now - state.pausedAt;
      state.phaseStartedAt += delta;
      state.lastFrameAt += delta;
      state.paused = false;
      updateMotionButtonState();
      setMessage("");
    }

    function jumpToNext() {
      moveToNextTarget(performance.now());
    }

    async function applyPhrases() {
      state.customPhrases = normalizePhraseSources(phraseInput.value);
      state.currentIndex = 0;
      setMessage(
        state.customPhrases.length
          ? `CARICATE ${state.customPhrases.length} FRASI ASCII.`
          : "NESSUNA FRASE ASCII."
      );

      if (state.active) {
        await prepareTargets();
      } else {
        state.needsRebuild = true;
      }
    }

    async function clearPhrases() {
      phraseInput.value = "";
      state.customPhrases = [];
      state.currentIndex = 0;
      setMessage("FRASI ASCII RIMOSSE.");

      if (state.active) {
        await prepareTargets();
      } else {
        state.needsRebuild = true;
      }
    }

    async function handleFiles(files) {
      const picked = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (!picked.length) {
        setMessage("NESSUN FILE IMMAGINE VALIDO.");
        return;
      }

      const nextCustomSources = picked.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        kind: "upload",
      }));

      state.customSources.forEach((source) => {
        if (source.kind === "upload") {
          URL.revokeObjectURL(source.url);
        }
      });

      state.customSources = nextCustomSources;
      state.currentIndex = 0;
      setMessage(`CARICATE ${nextCustomSources.length} IMMAGINI.`);

      if (state.active) {
        await prepareTargets();
      } else {
        state.needsRebuild = true;
      }
    }

    async function resetCustomImages() {
      state.customSources.forEach((source) => {
        if (source.kind === "upload") {
          URL.revokeObjectURL(source.url);
        }
      });

      state.customSources = [];
      state.currentIndex = 0;
      setMessage("RIPRISTINATI I CAMPIONI ASCII.");

      if (state.active) {
        await prepareTargets();
      } else {
        state.needsRebuild = true;
      }
    }

    function scheduleRebuild() {
      window.clearTimeout(state.resizeTimer);
      state.resizeTimer = window.setTimeout(() => {
        state.needsRebuild = true;
        if (state.active) {
          prepareTargets();
        }
      }, 160);
    }

    function activate(modeId) {
      state.active = true;
      if (modeId) {
        setAnimationMode(modeId);
      } else {
        updateMotionButtonState();
      }

      updateControlLabels();
      startLoop();

      if (!state.preparedTargets.length || state.needsRebuild) {
        prepareTargets();
      } else {
        setCurrentTarget(state.currentIndex, performance.now());
      }
    }

    function deactivate() {
      state.active = false;
      state.paused = false;
      updateMotionButtonState();
    }

    function resize() {
      if (state.active) {
        scheduleRebuild();
      } else {
        state.needsRebuild = true;
      }
    }

    uploadInput.addEventListener("change", async (event) => {
      await handleFiles(event.target.files);
      uploadInput.value = "";
    });
    toggleMotionButton.addEventListener("click", () => {
      setPaused(!state.paused);
    });
    nextButton.addEventListener("click", jumpToNext);
    resetImagesButton.addEventListener("click", async () => {
      await resetCustomImages();
    });
    applyPhrasesButton.addEventListener("click", async () => {
      await applyPhrases();
    });
    clearPhrasesButton.addEventListener("click", async () => {
      await clearPhrases();
    });
    columnsRange.addEventListener("input", () => {
      updateControlLabels();
      scheduleRebuild();
    });
    speedRange.addEventListener("input", updateControlLabels);
    contrastRange.addEventListener("input", () => {
      updateControlLabels();
      scheduleRebuild();
    });
    phraseInput.addEventListener("keydown", async (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        await applyPhrases();
      }
    });

    updateControlLabels();
    updateMotionButtonState();
    setStatus("ASCII CONDENSA");

    return {
      activate,
      deactivate,
      resize,
    };
  };
})();
