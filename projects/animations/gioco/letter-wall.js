(function () {
  const NOISE_ALPHABET = "@#%&*+=<>/\\|[]{}01".split("");
  const ACCENTS = ["amber", "cyan", "coral", "lime", "violet"];
  const BLOCKED_TERMS = [
    "FALLITO",
    "PUZZI",
    "IDIOTA",
    "CRETINO",
    "COGLIONE",
    "STRONZO",
    "MERDA",
    "SCHIFO",
    "BASTARDO",
    "TROIA",
    "PUTTANA",
  ];
  const STORAGE_KEY = "animation-lab-letter-phrases";
  const SETTINGS_KEY = "animation-lab-letter-settings";
  const DEFAULT_SETTINGS = {
    exposureMs: 2500,
    enableDrop: true,
    enableScramble: true,
    enableHighlight: true,
  };

  const FLIP_DURATION = 760;
  const BETWEEN_PHRASES = 950;
  const SCRAMBLE_RATE = 120;
  const DROP_INTERVAL = 13000;
  const DROP_FALL_DURATION = 1180;
  const DROP_HOLD = 420;
  const DROP_RETURN_DURATION = 320;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function normalizePhrase(phrase) {
    return phrase.trim().replace(/\s+/g, " ").toUpperCase();
  }

  function containsBlockedTerm(phrase) {
    return BLOCKED_TERMS.some((term) => phrase.includes(term));
  }

  function formatExposure(ms) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  window.createLetterWallController = function createLetterWallController(refs) {
    const {
      wall,
      phraseInput,
      exposureTimeInput,
      exposureValue,
      toggleDrop,
      toggleScramble,
      toggleHighlight,
      applyButton,
      resetButton,
      statusEl,
      messageEl,
    } = refs;

    const state = {
      active: false,
      tiles: [],
      phrases: [],
      settings: { ...DEFAULT_SETTINGS },
      rows: 0,
      cols: 0,
      phraseIndex: 0,
      cycleToken: 0,
      scrambleTimer: 0,
      nextPhraseTimer: 0,
      dropTimer: 0,
      dropReturnTimer: 0,
      dropFinishTimer: 0,
      activeIndices: new Set(),
      isDropping: false,
      resizeTimer: 0,
    };

    function setStatus(text = "") {
      statusEl.textContent = text;
    }

    function setMessage(text = "") {
      messageEl.hidden = !text;
      messageEl.textContent = text;
    }

    function hasActivePhrases() {
      return state.phrases.length > 0;
    }

    function randomChar() {
      return NOISE_ALPHABET[Math.floor(Math.random() * NOISE_ALPHABET.length)];
    }

    function getIdleChar() {
      return hasActivePhrases() ? randomChar() : "";
    }

    function loadStoredPhrases() {
      try {
        const rawValue = window.localStorage.getItem(STORAGE_KEY);
        if (!rawValue) {
          return [];
        }

        const parsed = JSON.parse(rawValue);
        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed
          .map((phrase) => normalizePhrase(String(phrase)))
          .filter((phrase) => phrase && !containsBlockedTerm(phrase));
      } catch {
        return [];
      }
    }

    function persistPhrases() {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.phrases));
      } catch {
        // Ignore storage errors in browser-restricted contexts.
      }
    }

    function loadStoredSettings() {
      try {
        const rawValue = window.localStorage.getItem(SETTINGS_KEY);
        if (!rawValue) {
          return { ...DEFAULT_SETTINGS };
        }

        const parsed = JSON.parse(rawValue);
        return {
          exposureMs: clamp(
            Number(parsed.exposureMs) || DEFAULT_SETTINGS.exposureMs,
            800,
            8000
          ),
          enableDrop:
            typeof parsed.enableDrop === "boolean"
              ? parsed.enableDrop
              : DEFAULT_SETTINGS.enableDrop,
          enableScramble:
            typeof parsed.enableScramble === "boolean"
              ? parsed.enableScramble
              : DEFAULT_SETTINGS.enableScramble,
          enableHighlight:
            typeof parsed.enableHighlight === "boolean"
              ? parsed.enableHighlight
              : DEFAULT_SETTINGS.enableHighlight,
        };
      } catch {
        return { ...DEFAULT_SETTINGS };
      }
    }

    function persistSettings() {
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
      } catch {
        // Ignore storage errors in browser-restricted contexts.
      }
    }

    function syncPhraseInput() {
      phraseInput.value = state.phrases.join("\n");
    }

    function syncSettingsControls() {
      exposureTimeInput.value = String(state.settings.exposureMs);
      exposureValue.textContent = formatExposure(state.settings.exposureMs);
      toggleDrop.checked = state.settings.enableDrop;
      toggleScramble.checked = state.settings.enableScramble;
      toggleHighlight.checked = state.settings.enableHighlight;
    }

    function updateSignal(phraseText = "") {
      if (!phraseText) {
        setStatus(hasActivePhrases() ? `FRASI ${state.phrases.length}` : "NESSUNA FRASE");
        return;
      }

      setStatus(phraseText);
    }

    function chooseGrid() {
      const rect = wall.getBoundingClientRect();
      const safeWidth = Math.max(rect.width, window.innerWidth - 40);
      const safeHeight = Math.max(rect.height, window.innerHeight - 40);
      const area = safeWidth * safeHeight;
      const desiredCells = clamp(
        Math.round(area / (window.innerWidth < 720 ? 1750 : 2300)),
        180,
        520
      );

      let cols = clamp(
        Math.round(Math.sqrt((desiredCells * safeWidth) / safeHeight)),
        14,
        38
      );
      let rows = clamp(Math.round(desiredCells / cols), 10, 24);

      while (cols * rows < desiredCells) {
        rows += 1;
      }

      const gap = window.innerWidth < 720 ? 4 : 6;
      const fontSize = clamp(
        Math.min(safeWidth / cols, safeHeight / rows) * 0.42,
        14,
        28
      );

      wall.style.setProperty("--cols", cols);
      wall.style.setProperty("--rows", rows);
      wall.style.setProperty("--gap", `${gap}px`);
      wall.style.setProperty("--letter-size", `${fontSize}px`);

      state.cols = cols;
      state.rows = rows;
    }

    function createTile(index) {
      const row = Math.floor(index / state.cols);
      const col = index % state.cols;
      const tile = document.createElement("article");
      tile.className = "tile";
      tile.dataset.accent = "neutral";

      const inner = document.createElement("div");
      inner.className = "tile__inner";

      const front = document.createElement("div");
      front.className = "tile__face tile__face--front";

      const back = document.createElement("div");
      back.className = "tile__face tile__face--back";

      const initial = getIdleChar();
      front.textContent = initial;
      back.textContent = initial;

      inner.append(front, back);
      tile.append(inner);
      wall.append(tile);

      return {
        index,
        row,
        col,
        el: tile,
        front,
        back,
        currentChar: initial,
        pending: false,
        locked: false,
        delayTimer: 0,
        finishTimer: 0,
      };
    }

    function buildGrid() {
      chooseGrid();
      wall.innerHTML = "";
      state.tiles.forEach(clearTileTimers);
      state.tiles = [];
      state.activeIndices.clear();

      const total = state.rows * state.cols;
      for (let index = 0; index < total; index += 1) {
        state.tiles.push(createTile(index));
      }

      assignDropMetrics();
    }

    function clearTileTimers(tile) {
      window.clearTimeout(tile.delayTimer);
      window.clearTimeout(tile.finishTimer);
    }

    function resetTileState(tile) {
      tile.pending = false;
      tile.locked = false;
      tile.el.classList.remove(
        "is-flipping",
        "is-phrase",
        "is-highlighted",
        "is-gap",
        "is-dropping",
        "is-returning"
      );
      delete tile.el.dataset.accent;
    }

    function assignDropMetrics() {
      const wallHeight = wall.clientHeight || window.innerHeight;
      const gap = window.innerWidth < 720 ? 4 : 6;
      const tileHeight = (wallHeight - gap * (state.rows - 1)) / state.rows;

      state.tiles.forEach((tile) => {
        const rowsToFloor = state.rows - tile.row - 0.15;
        const dropY = Math.max(30, rowsToFloor * tileHeight + randomBetween(18, 42));
        const centerOffset = tile.col - (state.cols - 1) / 2;
        const driftX = centerOffset * 1.1 + randomBetween(-10, 10);
        const dropRotate = centerOffset * 0.7 + randomBetween(-12, 12);
        const fallDelay = Math.round(tile.row * 18 + randomBetween(0, 90));
        const riseDelay = Math.round(randomBetween(0, 46));

        tile.el.style.setProperty("--drop-y", `${dropY.toFixed(1)}px`);
        tile.el.style.setProperty("--drop-x", `${driftX.toFixed(1)}px`);
        tile.el.style.setProperty("--drop-rotate", `${dropRotate.toFixed(1)}deg`);
        tile.el.style.setProperty("--fall-delay", `${fallDelay}ms`);
        tile.el.style.setProperty(
          "--drop-duration",
          `${Math.round(DROP_FALL_DURATION + tile.row * 12 + randomBetween(0, 90))}ms`
        );
        tile.el.style.setProperty("--rise-delay", `${riseDelay}ms`);
        tile.el.style.setProperty(
          "--return-duration",
          `${Math.round(DROP_RETURN_DURATION + randomBetween(0, 70))}ms`
        );
      });
    }

    function applyTileStyle(tile, options) {
      tile.el.dataset.accent = options.accent || "";
      tile.el.classList.toggle("is-phrase", Boolean(options.phrase));
      tile.el.classList.toggle("is-highlighted", Boolean(options.highlighted));
      tile.el.classList.toggle("is-gap", Boolean(options.gap));
      tile.locked = Boolean(options.locked);
    }

    function flipTile(tile, nextChar, options = {}) {
      const settings = {
        delay: 0,
        phrase: false,
        highlighted: false,
        accent: "",
        gap: false,
        locked: false,
        force: false,
        ...options,
      };

      clearTileTimers(tile);
      tile.pending = true;
      tile.el.classList.remove("is-flipping");

      tile.delayTimer = window.setTimeout(() => {
        if (
          !settings.force &&
          tile.currentChar === nextChar &&
          tile.locked === settings.locked
        ) {
          applyTileStyle(tile, settings);
          tile.pending = false;
          return;
        }

        tile.front.textContent = tile.currentChar;
        tile.back.textContent = nextChar;
        applyTileStyle(tile, settings);

        void tile.el.offsetWidth;
        tile.el.classList.add("is-flipping");

        tile.finishTimer = window.setTimeout(() => {
          tile.currentChar = nextChar;
          tile.front.textContent = nextChar;
          tile.back.textContent = nextChar;
          tile.el.classList.remove("is-flipping");
          applyTileStyle(tile, settings);
          tile.pending = false;
        }, FLIP_DURATION);
      }, settings.delay);
    }

    function startScramble() {
      window.clearInterval(state.scrambleTimer);
      if (!state.active || !state.settings.enableScramble || !hasActivePhrases()) {
        return;
      }

      state.scrambleTimer = window.setInterval(() => {
        if (!state.active || state.isDropping) {
          return;
        }

        const freeTiles = state.tiles.filter((tile) => !tile.locked && !tile.pending);
        const batchSize = clamp(Math.floor(freeTiles.length * 0.045), 4, 20);

        for (let step = 0; step < batchSize; step += 1) {
          const tile = freeTiles[Math.floor(Math.random() * freeTiles.length)];
          if (!tile) {
            continue;
          }

          flipTile(tile, randomChar(), { force: true });
        }
      }, SCRAMBLE_RATE);
    }

    function wrapPhrase(text, maxWidth, maxLines) {
      const words = text.split(" ");
      if (words[0].length > maxWidth) {
        return null;
      }

      const lines = [];
      let current = words[0];

      for (let index = 1; index < words.length; index += 1) {
        const word = words[index];
        if (word.length > maxWidth) {
          return null;
        }

        if (`${current} ${word}`.length <= maxWidth) {
          current = `${current} ${word}`;
        } else {
          lines.push(current);
          current = word;
        }
      }

      lines.push(current);
      return lines.length <= maxLines ? lines : null;
    }

    function layoutPhrase(text) {
      const maxLines = state.rows >= 14 ? 3 : 2;
      const preferredWidth = clamp(Math.floor(state.cols * 0.72), 8, state.cols - 2);
      const lines =
        wrapPhrase(text, preferredWidth, maxLines) ||
        wrapPhrase(text, state.cols - 2, maxLines);

      if (!lines) {
        return null;
      }

      const lineStep = lines.length > 1 && state.rows >= lines.length * 3 ? 2 : 1;
      const phraseHeight = (lines.length - 1) * lineStep + 1;
      const startRow = Math.floor((state.rows - phraseHeight) / 2);
      const placements = [];

      lines.forEach((line, lineIndex) => {
        const row = startRow + lineIndex * lineStep;
        const startCol = Math.floor((state.cols - line.length) / 2);

        [...line].forEach((char, charIndex) => {
          placements.push({
            row,
            col: startCol + charIndex,
            char: char === " " ? "" : char,
            gap: char === " ",
          });
        });
      });

      return placements;
    }

    function getFittingPhrase() {
      if (!hasActivePhrases()) {
        return null;
      }

      const tested = new Set();

      while (tested.size < state.phrases.length) {
        const index = state.phraseIndex % state.phrases.length;
        const phrase = {
          text: state.phrases[index],
          accent: ACCENTS[index % ACCENTS.length],
        };
        state.phraseIndex += 1;
        tested.add(phrase.text);

        const layout = layoutPhrase(phrase.text);
        if (layout) {
          return { phrase, layout };
        }
      }

      return null;
    }

    function schedulePhrase(delay = 800) {
      window.clearTimeout(state.nextPhraseTimer);
      if (!state.active || !hasActivePhrases()) {
        return;
      }

      state.nextPhraseTimer = window.setTimeout(revealPhrase, delay);
    }

    function scheduleDrop(delay = DROP_INTERVAL + randomBetween(0, 2600)) {
      window.clearTimeout(state.dropTimer);
      if (!state.active || !state.settings.enableDrop || !hasActivePhrases()) {
        return;
      }

      state.dropTimer = window.setTimeout(triggerDrop, delay);
    }

    function revealPhrase() {
      if (!state.active || state.isDropping) {
        return;
      }

      const candidate = getFittingPhrase();
      if (!candidate) {
        updateSignal();
        schedulePhrase(BETWEEN_PHRASES);
        return;
      }

      const token = ++state.cycleToken;
      const { phrase, layout } = candidate;
      const centerX = (state.cols - 1) / 2;
      const centerY = (state.rows - 1) / 2;
      const tiles = [];

      updateSignal(phrase.text);

      layout.forEach((placement) => {
        const tileIndex = placement.row * state.cols + placement.col;
        const tile = state.tiles[tileIndex];
        const distance =
          Math.abs(placement.col - centerX) + Math.abs(placement.row - centerY);
        const delay = Math.round(distance * 36 + Math.random() * 120);

        state.activeIndices.add(tileIndex);
        tiles.push({ tileIndex, tile, ...placement, delay });

        flipTile(tile, placement.char, {
          delay,
          phrase: true,
          accent: phrase.accent,
          gap: placement.gap,
          locked: true,
          force: true,
        });
      });

      const revealTime =
        Math.max(...tiles.map((entry) => entry.delay), 0) + FLIP_DURATION + 120;

      window.setTimeout(() => {
        if (token !== state.cycleToken || !state.active || !state.settings.enableHighlight) {
          return;
        }

        tiles.forEach(({ tile, gap }) => {
          applyTileStyle(tile, {
            phrase: true,
            highlighted: true,
            accent: phrase.accent,
            gap,
            locked: true,
          });
        });
      }, revealTime);

      state.nextPhraseTimer = window.setTimeout(() => {
        if (token !== state.cycleToken || !state.active) {
          return;
        }

        dissolvePhrase(tiles);
      }, revealTime + state.settings.exposureMs);
    }

    function dissolvePhrase(entries) {
      const token = state.cycleToken;

      entries.forEach(({ tile, tileIndex, gap }, orderIndex) => {
        state.activeIndices.delete(tileIndex);

        flipTile(tile, getIdleChar(), {
          delay: orderIndex * 26,
          phrase: false,
          highlighted: false,
          accent: "",
          gap: false,
          locked: false,
          force: true,
        });

        if (gap) {
          tile.el.classList.remove("is-gap");
        }
      });

      updateSignal();

      state.nextPhraseTimer = window.setTimeout(() => {
        if (token !== state.cycleToken || !state.active) {
          return;
        }

        revealPhrase();
      }, BETWEEN_PHRASES + entries.length * 10);
    }

    function settleTile(tile) {
      clearTileTimers(tile);
      tile.pending = false;
      tile.front.textContent = tile.currentChar;
      tile.back.textContent = tile.currentChar;
      tile.el.classList.remove("is-flipping");
    }

    function silenceWall() {
      state.tiles.forEach((tile) => {
        clearTileTimers(tile);
        tile.pending = false;
        tile.locked = false;
        tile.currentChar = "";
        tile.front.textContent = "";
        tile.back.textContent = "";
        tile.el.classList.remove("is-flipping", "is-dropping", "is-returning");
        applyTileStyle(tile, {
          phrase: false,
          highlighted: false,
          accent: "",
          gap: false,
          locked: false,
        });
      });
    }

    function clearPhraseLocks() {
      state.cycleToken += 1;
      window.clearTimeout(state.nextPhraseTimer);
      state.activeIndices.clear();

      if (!hasActivePhrases()) {
        silenceWall();
        return;
      }

      state.tiles.forEach((tile) => {
        settleTile(tile);
        applyTileStyle(tile, {
          phrase: false,
          highlighted: false,
          accent: "",
          gap: false,
          locked: false,
        });
      });
    }

    function applySettings(nextSettings) {
      state.settings = {
        exposureMs: clamp(
          Number(nextSettings.exposureMs) || DEFAULT_SETTINGS.exposureMs,
          800,
          8000
        ),
        enableDrop: Boolean(nextSettings.enableDrop),
        enableScramble: Boolean(nextSettings.enableScramble),
        enableHighlight: Boolean(nextSettings.enableHighlight),
      };

      persistSettings();
      syncSettingsControls();

      if (!state.active) {
        return;
      }

      if (!state.settings.enableHighlight) {
        state.tiles.forEach((tile) => tile.el.classList.remove("is-highlighted"));
      }

      if (!state.settings.enableScramble) {
        window.clearInterval(state.scrambleTimer);
      } else {
        startScramble();
      }

      if (!state.settings.enableDrop) {
        window.clearTimeout(state.dropTimer);
      } else {
        scheduleDrop();
      }
    }

    function setPhrases(nextPhrases) {
      state.phrases = nextPhrases.slice();
      state.phraseIndex = 0;
      persistPhrases();
      syncPhraseInput();
      updateSignal();
    }

    function parsePhraseList(rawValue) {
      const lines = rawValue.split("\n");
      const phrases = [];
      const seen = new Set();
      let rejected = 0;

      lines.forEach((line) => {
        const phrase = normalizePhrase(line);
        if (!phrase) {
          return;
        }

        if (containsBlockedTerm(phrase)) {
          rejected += 1;
          return;
        }

        if (!seen.has(phrase)) {
          phrases.push(phrase);
          seen.add(phrase);
        }
      });

      return { phrases, rejected };
    }

    function applyFromControls() {
      const rawValue = phraseInput.value;
      const { phrases, rejected } = parsePhraseList(rawValue);
      const hadInput = rawValue.trim().length > 0;
      const nextSettings = {
        exposureMs: Number(exposureTimeInput.value),
        enableDrop: toggleDrop.checked,
        enableScramble: toggleScramble.checked,
        enableHighlight: toggleHighlight.checked,
      };

      if (phrases.length === 0 && hadInput) {
        setMessage("NESSUNA FRASE APPLICATA.");
        return;
      }

      setPhrases(phrases);
      applySettings(nextSettings);

      if (!state.active) {
        setMessage("FRASI E OPZIONI SALVATE.");
        return;
      }

      clearPhraseLocks();
      scatterAfterDrop();
      schedulePhrase(600);

      if (rejected > 0) {
        setMessage("ALCUNE FRASI SONO STATE SCARTATE.");
      } else if (phrases.length === 0) {
        setMessage("CONSOLE VUOTA.");
      } else {
        setMessage("FRASI AGGIORNATE.");
      }
    }

    function resetAll() {
      setPhrases([]);
      applySettings(DEFAULT_SETTINGS);

      if (!state.active) {
        setMessage("LISTA FRASI SVUOTATA.");
        return;
      }

      clearPhraseLocks();
      scatterAfterDrop();
      schedulePhrase(600);
      setMessage("LISTA FRASI SVUOTATA.");
    }

    function scatterAfterDrop() {
      if (!state.active || !state.settings.enableScramble || !hasActivePhrases()) {
        return;
      }

      const batchSize = clamp(Math.floor(state.tiles.length * 0.24), 18, 90);
      const pool = [...state.tiles];

      for (let index = 0; index < batchSize; index += 1) {
        const pickIndex = Math.floor(Math.random() * pool.length);
        const tile = pool.splice(pickIndex, 1)[0];
        if (!tile) {
          break;
        }

        flipTile(tile, getIdleChar(), {
          delay: Math.round(randomBetween(0, 260)),
          force: true,
        });
      }
    }

    function finishDrop() {
      state.isDropping = false;
      state.tiles.forEach((tile) => {
        tile.el.classList.remove("is-dropping", "is-returning");
        applyTileStyle(tile, {
          phrase: false,
          highlighted: false,
          accent: "",
          gap: false,
          locked: false,
        });
        settleTile(tile);
      });

      if (!hasActivePhrases()) {
        silenceWall();
      }

      updateSignal();
      startScramble();
      scatterAfterDrop();
      schedulePhrase(1200);
      scheduleDrop();
    }

    function triggerDrop() {
      if (!state.active || state.isDropping || !hasActivePhrases() || state.tiles.length === 0) {
        return;
      }

      state.isDropping = true;
      state.cycleToken += 1;
      window.clearTimeout(state.nextPhraseTimer);
      window.clearInterval(state.scrambleTimer);
      window.clearTimeout(state.dropTimer);
      window.clearTimeout(state.dropReturnTimer);
      window.clearTimeout(state.dropFinishTimer);
      state.activeIndices.clear();

      updateSignal("CADUTA IN CORSO");

      state.tiles.forEach((tile) => {
        settleTile(tile);
        applyTileStyle(tile, {
          phrase: false,
          highlighted: false,
          accent: "",
          gap: false,
          locked: false,
        });
        tile.el.classList.remove("is-returning");
        void tile.el.offsetWidth;
        tile.el.classList.add("is-dropping");
      });

      const maxFallDelay = (state.rows - 1) * 18 + 90;

      state.dropReturnTimer = window.setTimeout(() => {
        state.tiles.forEach((tile) => {
          tile.el.classList.remove("is-dropping");
          void tile.el.offsetWidth;
          tile.el.classList.add("is-returning");
        });
      }, maxFallDelay + DROP_FALL_DURATION + DROP_HOLD);

      state.dropFinishTimer = window.setTimeout(
        finishDrop,
        maxFallDelay + DROP_FALL_DURATION + DROP_HOLD + DROP_RETURN_DURATION + 180
      );
    }

    function clearAllTimers() {
      state.cycleToken += 1;
      state.isDropping = false;
      window.clearInterval(state.scrambleTimer);
      window.clearTimeout(state.nextPhraseTimer);
      window.clearTimeout(state.dropTimer);
      window.clearTimeout(state.dropReturnTimer);
      window.clearTimeout(state.dropFinishTimer);
      state.tiles.forEach((tile) => {
        clearTileTimers(tile);
        resetTileState(tile);
      });
    }

    function initialize() {
      clearAllTimers();
      buildGrid();
      syncPhraseInput();
      syncSettingsControls();
      setMessage("");
      updateSignal();
      startScramble();
      schedulePhrase(800);
      scheduleDrop();

      if (!hasActivePhrases()) {
        silenceWall();
      }
    }

    function activate() {
      state.active = true;
      initialize();
    }

    function deactivate() {
      state.active = false;
      clearAllTimers();
    }

    function resize() {
      window.clearTimeout(state.resizeTimer);
      state.resizeTimer = window.setTimeout(() => {
        if (state.active) {
          initialize();
        }
      }, 180);
    }

    phraseInput.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        applyFromControls();
      }
    });
    exposureTimeInput.addEventListener("input", () => {
      exposureValue.textContent = formatExposure(Number(exposureTimeInput.value));
    });
    applyButton.addEventListener("click", applyFromControls);
    resetButton.addEventListener("click", resetAll);

    state.phrases = loadStoredPhrases();
    state.settings = loadStoredSettings();
    syncPhraseInput();
    syncSettingsControls();
    updateSignal();

    return {
      activate,
      deactivate,
      resize,
    };
  };
})();
