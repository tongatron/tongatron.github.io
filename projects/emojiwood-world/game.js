(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const objectiveText = document.getElementById("objectiveText");
  const promptText = document.getElementById("promptText");
  const progressCount = document.getElementById("fireflyCount");
  const discoveriesText = document.getElementById("discoveriesText");
  const compassText = document.getElementById("compassText");
  const resetButton = document.getElementById("resetButton");
  const touchControls = document.getElementById("touchControls");
  const dialoguePanel = document.getElementById("dialoguePanel");
  const dialogueAvatar = document.getElementById("dialogueAvatar");
  const dialogueName = document.getElementById("dialogueName");
  const dialogueRole = document.getElementById("dialogueRole");
  const dialogueStep = document.getElementById("dialogueStep");
  const dialogueBody = document.getElementById("dialogueBody");
  const dialogueHint = document.getElementById("dialogueHint");

  const TAU = Math.PI * 2;
  const emojiAssetBase = "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72";
  const emojiSpriteCache = new Map();
  const emojiSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter("it", { granularity: "grapheme" })
    : null;
  const questTotals = {
    fireflies: 6,
    cells: 3,
    shards: 3,
    beacons: 4,
    sigils: 4,
    major: 11,
  };

  const world = {
    width: 6800,
    height: 4600,
    spawn: { x: 440, y: 640 },
    zones: {
      forest: { key: "forest", name: "Foresta emoji", x: 0, y: 0, width: 3000, height: 2200, ground: "#173c2b" },
      city: { key: "city", name: "Citta neon", x: 3000, y: 0, width: 3800, height: 2200, ground: "#263844" },
      desert: { key: "desert", name: "Deserto sticker", x: 0, y: 2200, width: 3200, height: 2400, ground: "#8a5a20" },
      snow: { key: "snow", name: "Tundra emoji", x: 3200, y: 2200, width: 3600, height: 2400, ground: "#d6eef7" },
    },
    lake: { x: 2290, y: 940, rx: 430, ry: 300 },
    grove: { x: 1120, y: 1730, radius: 190 },
    cityArcade: { x: 5210, y: 920, radius: 120 },
    desertObelisk: { x: 1320, y: 3620, radius: 130 },
    snowShrine: { x: 5660, y: 3610, radius: 140 },
    plaza: { x: 3470, y: 2290, radius: 170 },
  };

  const view = { width: 1, height: 1 };
  const rng = mulberry32(1337);

  const state = {
    time: 0,
    lastFrame: 0,
    zoneKey: "forest",
    player: {
      x: world.spawn.x,
      y: world.spawn.y,
      radius: 26,
      baseSpeed: 280,
      facing: "down",
      bob: 0,
    },
    camera: { x: 0, y: 0 },
    input: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
    actionQueued: false,
    quests: {
      fireflies: 0,
      grove: false,
      lake: false,
      cells: 0,
      arcade: false,
      shards: 0,
      obelisk: false,
      beacons: 0,
      aurora: false,
      sigils: 0,
      finale: false,
    },
    dialogue: {
      active: false,
      npcKey: null,
      pages: [],
      pageIndex: 0,
      reward: null,
    },
    floatingTexts: [],
    ripples: [],
    recentDiscoveries: [],
    lastPrompt: "La bussola indica una foresta enorme. Parti dalle lucciole.",
    snowSeeded: false,
  };

  const routes = createRoutes();
  const groundPatches = createGroundPatches();
  const flowers = createFlowers();
  const trees = createTrees();
  const reeds = createReeds();
  const mushrooms = createMushrooms();
  const fireflies = createFireflies();
  const fish = createFish();
  const cityBuildings = createCityBuildings();
  const powerCells = createPowerCells();
  const vehicles = createVehicles();
  const desertCacti = createDesertCacti();
  const desertRocks = createDesertRocks();
  const sunShards = createSunShards();
  const tumbleweeds = createTumbleweeds();
  const snowPines = createSnowPines();
  const iceChunks = createIceChunks();
  const snowBeacons = createSnowBeacons();
  const snowflakes = createSnowflakes();
  const npcs = createNpcs().map(enrichNpc);

  installEmojiRenderer();
  preloadEmojiSprites(collectEmojiGlyphs());

  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("keydown", handleKeyChange);
  document.addEventListener("keyup", handleKeyChange);
  resetButton.addEventListener("click", () => window.location.reload());
  bindTouchControls();

  resizeCanvas();
  updateUI();
  requestAnimationFrame(loop);

  function loop(now) {
    if (!state.lastFrame) {
      state.lastFrame = now;
    }

    const dt = Math.min(0.033, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    state.time += dt;

    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    updatePlayer(dt);
    state.zoneKey = getZoneAt(state.player.x, state.player.y).key;
    updateCamera(dt);
    updateFireflies(dt);
    updateFish(dt);
    updatePowerCells(dt);
    updateSunShards(dt);
    updateNpcs(dt);
    updateVehicles(dt);
    updateTumbleweeds(dt);
    updateSnowflakes(dt);
    updateRipples(dt);
    updateFloatingTexts(dt);
    handleAction();
    updateUI();
  }

  function updatePlayer(dt) {
    if (state.dialogue.active) {
      state.player.bob += dt * 2.2;
      return;
    }

    const inputX = Number(state.input.right) - Number(state.input.left);
    const inputY = Number(state.input.down) - Number(state.input.up);
    const moving = inputX !== 0 || inputY !== 0;

    if (moving) {
      const length = Math.hypot(inputX, inputY) || 1;
      const speed = state.player.baseSpeed * getSpeedMultiplier();
      const dx = (inputX / length) * speed * dt;
      const dy = (inputY / length) * speed * dt;
      tryMovePlayer(dx, dy);

      if (Math.abs(inputX) > Math.abs(inputY)) {
        state.player.facing = inputX > 0 ? "right" : "left";
      } else {
        state.player.facing = inputY > 0 ? "down" : "up";
      }
    }

    state.player.bob += dt * (moving ? 7.5 : 2.4);
  }

  function getSpeedMultiplier() {
    const zone = getZoneAt(state.player.x, state.player.y).key;
    if (zone === "city") {
      return state.quests.arcade ? 1.12 : 1.04;
    }
    if (zone === "desert") {
      return state.quests.obelisk ? 1 : 0.92;
    }
    if (zone === "snow") {
      return state.quests.aurora ? 1 : 0.95;
    }
    if (zone === "forest" && state.quests.grove && !state.quests.lake) {
      return 1.07;
    }
    return 1;
  }

  function tryMovePlayer(dx, dy) {
    const nextX = clamp(state.player.x + dx, state.player.radius, world.width - state.player.radius);
    if (!isBlocked(nextX, state.player.y)) {
      state.player.x = nextX;
    }

    const nextY = clamp(state.player.y + dy, state.player.radius, world.height - state.player.radius);
    if (!isBlocked(state.player.x, nextY)) {
      state.player.y = nextY;
    }
  }

  function isBlocked(x, y) {
    if (isInsideLake(x, y, 0.88)) {
      return true;
    }

    for (const tree of trees) {
      if (distance(x, y, tree.x, tree.y + 10) < tree.radius + state.player.radius) {
        return true;
      }
    }

    for (const cactus of desertCacti) {
      if (distance(x, y, cactus.x, cactus.y + 8) < cactus.radius + state.player.radius) {
        return true;
      }
    }

    for (const rock of desertRocks) {
      if (distance(x, y, rock.x, rock.y + 8) < rock.radius + state.player.radius) {
        return true;
      }
    }

    for (const pine of snowPines) {
      if (distance(x, y, pine.x, pine.y + 8) < pine.radius + state.player.radius) {
        return true;
      }
    }

    for (const ice of iceChunks) {
      if (distance(x, y, ice.x, ice.y + 4) < ice.radius + state.player.radius) {
        return true;
      }
    }

    for (const building of cityBuildings) {
      if (circleIntersectsRect(x, y, state.player.radius, building.collider)) {
        return true;
      }
    }

    return false;
  }

  function updateCamera(dt) {
    const targetX = clamp(state.player.x - view.width / 2, 0, Math.max(0, world.width - view.width));
    const targetY = clamp(state.player.y - view.height / 2, 0, Math.max(0, world.height - view.height));
    const smoothing = 1 - Math.exp(-dt * 7);
    state.camera.x += (targetX - state.camera.x) * smoothing;
    state.camera.y += (targetY - state.camera.y) * smoothing;
  }

  function updateFireflies(dt) {
    fireflies.forEach((firefly) => {
      firefly.phase += dt * firefly.speed;
      firefly.spark += dt * 3.1;

      if (firefly.collected) {
        return;
      }

      if (distance(state.player.x, state.player.y, firefly.x, firefly.y) < 58) {
        firefly.collected = true;
        state.quests.fireflies += 1;
        pushFloatingText("✨ Lucciola!", firefly.x, firefly.y - 28, "#fff2a6");
        addDiscovery("lucciola raccolta");

        if (state.quests.fireflies === questTotals.fireflies) {
          addDiscovery("radura dei funghi pronta");
          pushFloatingText("🍄 Il bosco si apre", world.grove.x, world.grove.y - 48, "#ffdb89");
        }
      }
    });
  }

  function updateFish(dt) {
    fish.forEach((fishie) => {
      fishie.turnTimer -= dt;
      fishie.bob += dt * fishie.bobSpeed;
      fishie.jumpTimer = Math.max(0, fishie.jumpTimer - dt);

      if (fishie.turnTimer <= 0) {
        fishie.angle += randomRange(-0.9, 0.9);
        fishie.turnTimer = randomRange(0.9, 2.8);
      }

      const speedBoost = state.quests.lake ? 1.35 : 1;
      const nextX = fishie.x + Math.cos(fishie.angle) * fishie.speed * speedBoost * dt;
      const nextY = fishie.y + Math.sin(fishie.angle) * fishie.speed * speedBoost * dt;

      if (isInsideLake(nextX, nextY, 0.74)) {
        fishie.x = nextX;
        fishie.y = nextY;
      } else {
        fishie.angle += Math.PI * (0.85 + rng() * 0.5);
      }

      fishie.splashTimer -= dt;
      if (state.quests.lake && fishie.splashTimer <= 0) {
        fishie.jumpTimer = 0.7;
        fishie.splashTimer = randomRange(0.6, 2.1);
        state.ripples.push({
          x: fishie.x,
          y: fishie.y + 12,
          radius: 3,
          alpha: 0.7,
        });
      }
    });
  }

  function updatePowerCells(dt) {
    powerCells.forEach((cell) => {
      cell.phase += dt * 3.2;
      if (cell.collected || !isStageUnlocked("cells")) {
        return;
      }

      if (distance(state.player.x, state.player.y, cell.x, cell.y) < 56) {
        cell.collected = true;
        state.quests.cells += 1;
        pushFloatingText("🔋 Cella neon", cell.x, cell.y - 24, "#aff7ff");
        addDiscovery("cella neon");

        if (state.quests.cells === questTotals.cells) {
          addDiscovery("arcade riattivabile");
          pushFloatingText("🕹️ Energia completa", world.cityArcade.x, world.cityArcade.y - 60, "#aef7ff");
        }
      }
    });
  }

  function updateSunShards(dt) {
    sunShards.forEach((shard) => {
      shard.phase += dt * 2.5;
      if (shard.collected || !isStageUnlocked("shards")) {
        return;
      }

      if (distance(state.player.x, state.player.y, shard.x, shard.y) < 60) {
        shard.collected = true;
        state.quests.shards += 1;
        pushFloatingText("💎 Frammento solare", shard.x, shard.y - 24, "#ffe08e");
        addDiscovery("frammento solare");

        if (state.quests.shards === questTotals.shards) {
          addDiscovery("obelisco caricabile");
          pushFloatingText("🗿 Il deserto risponde", world.desertObelisk.x, world.desertObelisk.y - 56, "#ffd492");
        }
      }
    });
  }

  function updateNpcs(dt) {
    npcs.forEach((npc, index) => {
      npc.bob += dt * npc.bobSpeed;
      npc.chatTimer = Math.max(0, npc.chatTimer - dt);

      let target = getNpcEventTarget(npc, index);
      if (!target) {
        if (distance(npc.x, npc.y, npc.targetX, npc.targetY) < 18 || npc.targetTimer <= 0) {
          npc.targetX = clamp(npc.homeX + randomRange(-npc.roam, npc.roam), npc.bounds.x + 30, npc.bounds.x + npc.bounds.width - 30);
          npc.targetY = clamp(npc.homeY + randomRange(-npc.roam, npc.roam), npc.bounds.y + 30, npc.bounds.y + npc.bounds.height - 30);
          npc.targetTimer = randomRange(2.2, 5.8);
        }
        npc.targetTimer -= dt;
        target = { x: npc.targetX, y: npc.targetY };
      }

      const dx = target.x - npc.x;
      const dy = target.y - npc.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1) {
        const speed = state.quests.finale ? 92 : npc.speed;
        npc.x += (dx / dist) * speed * dt;
        npc.y += (dy / dist) * speed * dt;
        npc.facing = dx >= 0 ? 1 : -1;
      }
    });
  }

  function getNpcEventTarget(npc, index) {
    if (state.quests.finale) {
      const angle = state.time * 0.5 + (index / npcs.length) * TAU;
      return {
        x: world.plaza.x + Math.cos(angle) * (82 + (index % 3) * 14),
        y: world.plaza.y + Math.sin(angle) * (58 + (index % 4) * 10),
      };
    }

    if (npc.biome === "forest") {
      if (state.quests.grove && !state.quests.lake) {
        const angle = state.time * 0.8 + (index / 4) * TAU;
        return {
          x: world.grove.x + Math.cos(angle) * 92,
          y: world.grove.y + Math.sin(angle) * 58,
        };
      }

      if (state.quests.lake) {
        const angle = state.time * 0.6 + (index / 4) * TAU;
        return {
          x: world.lake.x + Math.cos(angle) * (world.lake.rx + 95),
          y: world.lake.y + Math.sin(angle) * (world.lake.ry + 70),
        };
      }
    }

    if (npc.biome === "city" && state.quests.arcade) {
      const angle = state.time * 0.9 + index;
      return {
        x: world.cityArcade.x + Math.cos(angle) * 120,
        y: world.cityArcade.y + Math.sin(angle) * 72,
      };
    }

    if (npc.biome === "desert" && state.quests.obelisk) {
      const angle = state.time * 0.45 + index;
      return {
        x: world.desertObelisk.x + Math.cos(angle) * 120,
        y: world.desertObelisk.y + Math.sin(angle) * 74,
      };
    }

    if (npc.biome === "snow" && state.quests.aurora) {
      const angle = state.time * 0.55 + index;
      return {
        x: world.snowShrine.x + Math.cos(angle) * 122,
        y: world.snowShrine.y + Math.sin(angle) * 76,
      };
    }

    return null;
  }

  function updateVehicles(dt) {
    vehicles.forEach((vehicle) => {
      const speedBoost = state.quests.arcade ? 1.18 : 0.88;
      if (vehicle.axis === "x") {
        vehicle.x += vehicle.dir * vehicle.speed * speedBoost * dt;
        if (vehicle.x < vehicle.min) {
          vehicle.x = vehicle.max;
        }
        if (vehicle.x > vehicle.max) {
          vehicle.x = vehicle.min;
        }
      } else {
        vehicle.y += vehicle.dir * vehicle.speed * speedBoost * dt;
        if (vehicle.y < vehicle.min) {
          vehicle.y = vehicle.max;
        }
        if (vehicle.y > vehicle.max) {
          vehicle.y = vehicle.min;
        }
      }
    });
  }

  function updateTumbleweeds(dt) {
    tumbleweeds.forEach((weed) => {
      weed.x += weed.speed * dt;
      weed.spin += dt * weed.spinSpeed;
      weed.y += Math.sin(state.time * weed.wave + weed.phase) * weed.swing * dt;

      if (weed.x > world.zones.desert.x + world.zones.desert.width + 90) {
        weed.x = world.zones.desert.x - 90;
        weed.y = randomRange(world.zones.desert.y + 140, world.zones.desert.y + world.zones.desert.height - 120);
      }
    });
  }

  function updateSnowflakes(dt) {
    snowflakes.forEach((flake) => {
      flake.x += Math.sin(state.time * flake.swing + flake.phase) * flake.drift * dt;
      flake.y += flake.speed * dt;
      if (flake.y > view.height + 40) {
        flake.y = -20;
        flake.x = randomRange(0, view.width);
      }
      if (flake.x < -20) {
        flake.x = view.width + 20;
      }
      if (flake.x > view.width + 20) {
        flake.x = -20;
      }
    });
  }

  function updateRipples(dt) {
    state.ripples = state.ripples
      .map((ripple) => ({
        x: ripple.x,
        y: ripple.y,
        radius: ripple.radius + dt * 56,
        alpha: ripple.alpha - dt * 0.42,
      }))
      .filter((ripple) => ripple.alpha > 0);
  }

  function updateFloatingTexts(dt) {
    state.floatingTexts = state.floatingTexts
      .map((text) => ({
        ...text,
        y: text.y - dt * 28,
        age: text.age + dt,
      }))
      .filter((text) => text.age < 2.5);
  }

  function handleAction() {
    if (!state.actionQueued) {
      return;
    }

    state.actionQueued = false;

    if (state.dialogue.active) {
      advanceDialogue();
      return;
    }

    const action = getActionTarget();

    if (!action) {
      state.lastPrompt = "Qui non si attiva nulla. Segui la bussola o parla con qualcuno.";
      return;
    }

    if (action.type === "npc") {
      const npc = action.entity;
      npc.chatTimer = 3.8;
      addDiscovery(npc.shortTag);
      pushFloatingText(`${npc.emoji} ${npc.name}`, npc.x, npc.y - 38, "#fff6d4");
      state.lastPrompt = `${npc.name} ha qualcosa di utile da dire.`;
      openNpcDialogue(npc);
      return;
    }

    if (action.type === "hint") {
      pushFloatingText(action.text, action.x, action.y - 26, "#ffe7bc");
      state.lastPrompt = action.hint;
      return;
    }

    if (action.type === "grove") {
      state.quests.grove = true;
      addDiscovery("danza dei funghi");
      state.lastPrompt = "La foresta balla. Ora il lago e' pronto.";
      for (let i = 0; i < 12; i += 1) {
        const angle = (i / 12) * TAU;
        pushFloatingText("🍄✨", world.grove.x + Math.cos(angle) * 84, world.grove.y + Math.sin(angle) * 54, "#ffe08e");
      }
      return;
    }

    if (action.type === "lake") {
      state.quests.lake = true;
      addDiscovery("pesce luna evocato");
      state.lastPrompt = "Il lago si illumina. La Rana poeta puo' darti il primo sigillo, poi tocca alla citta neon.";
      pushFloatingText("🐟 Splash cosmico!", world.lake.x, world.lake.y - 64, "#d9f7ff");
      for (let i = 0; i < 14; i += 1) {
        const angle = (i / 14) * TAU;
        state.ripples.push({
          x: world.lake.x + Math.cos(angle) * 110,
          y: world.lake.y + Math.sin(angle) * 70,
          radius: 5,
          alpha: 0.72,
        });
      }
      return;
    }

    if (action.type === "arcade") {
      state.quests.arcade = true;
      addDiscovery("arcade acceso");
      state.lastPrompt = "La citta neon riparte. Il Custode patch ha un sigillo per te; poi cerca i frammenti nel deserto.";
      pushFloatingText("🕹️ Neon online", world.cityArcade.x, world.cityArcade.y - 56, "#9dfdff");
      return;
    }

    if (action.type === "obelisk") {
      state.quests.obelisk = true;
      addDiscovery("balena di sabbia");
      state.lastPrompt = "L'obelisco ha aperto la via del gelo. Lo Scorpione DJ custodisce un sigillo; poi vai nella tundra.";
      pushFloatingText("🐋 Sabbia viva", world.desertObelisk.x, world.desertObelisk.y - 64, "#ffd492");
      return;
    }

    if (action.type === "beacon") {
      const beacon = action.entity;
      if (!beacon.lit) {
        beacon.lit = true;
        state.quests.beacons += 1;
        addDiscovery(`torre ${state.quests.beacons} accesa`);
        pushFloatingText("🕯️ Faro attivo", beacon.x, beacon.y - 34, "#eef7ff");
        if (state.quests.beacons === questTotals.beacons) {
          addDiscovery("santuario polare pronto");
          pushFloatingText("❄️ Il santuario risponde", world.snowShrine.x, world.snowShrine.y - 58, "#eef7ff");
        }
      }
      return;
    }

    if (action.type === "shrine") {
      state.quests.aurora = true;
      addDiscovery("aurora accesa");
      state.lastPrompt = "Il cielo si apre. Recupera i sigilli mancanti parlando con i custodi, poi torna in piazza.";
      pushFloatingText("🌌 Aurora viva", world.snowShrine.x, world.snowShrine.y - 62, "#e7f7ff");
      return;
    }

    if (action.type === "finale") {
      state.quests.finale = true;
      addDiscovery("parata emoji");
      state.lastPrompt = "Mondo completato. Tutti i biomi sono in festa.";
      for (let i = 0; i < 18; i += 1) {
        const angle = (i / 18) * TAU;
        pushFloatingText("🎉🌈", world.plaza.x + Math.cos(angle) * 120, world.plaza.y + Math.sin(angle) * 82, "#fff7cc");
      }
    }
  }

  function getActionTarget() {
    const quest = getCurrentQuest();

    if (quest?.id === "grove" && distance(state.player.x, state.player.y, world.grove.x, world.grove.y) < 132) {
      return { type: "grove" };
    }

    if (quest?.id === "lake") {
      const lakeDistance = ellipseDistance(state.player.x, state.player.y, world.lake.x, world.lake.y, world.lake.rx + 52, world.lake.ry + 52);
      if (lakeDistance < 1.16) {
        return { type: "lake" };
      }
    }

    if (quest?.id === "arcade" && distance(state.player.x, state.player.y, world.cityArcade.x, world.cityArcade.y) < 134) {
      return { type: "arcade" };
    }

    if (quest?.id === "obelisk" && distance(state.player.x, state.player.y, world.desertObelisk.x, world.desertObelisk.y) < 138) {
      return { type: "obelisk" };
    }

    if (quest?.id === "beacons") {
      const nearestBeacon = snowBeacons.find((beacon) => !beacon.lit && distance(state.player.x, state.player.y, beacon.x, beacon.y) < 100);
      if (nearestBeacon) {
        return { type: "beacon", entity: nearestBeacon };
      }
    }

    if (quest?.id === "shrine" && distance(state.player.x, state.player.y, world.snowShrine.x, world.snowShrine.y) < 144) {
      return { type: "shrine" };
    }

    if (quest?.id === "finale" && distance(state.player.x, state.player.y, world.plaza.x, world.plaza.y) < 150) {
      return { type: "finale" };
    }

    const lockedHint = getLockedInteractionHint();
    if (lockedHint) {
      return lockedHint;
    }

    const nearbyNpc = npcs.find((npc) => distance(state.player.x, state.player.y, npc.x, npc.y) < 96);
    if (nearbyNpc) {
      return { type: "npc", entity: nearbyNpc };
    }

    return null;
  }

  function getLockedInteractionHint() {
    if (!state.quests.grove && distance(state.player.x, state.player.y, world.grove.x, world.grove.y) < 132) {
      return {
        type: "hint",
        x: world.grove.x,
        y: world.grove.y,
        text: "Servono 6 lucciole",
        hint: "Il cerchio dei funghi resta spento finche' non raccogli tutte le lucciole.",
      };
    }

    if (!state.quests.lake) {
      const lakeDistance = ellipseDistance(state.player.x, state.player.y, world.lake.x, world.lake.y, world.lake.rx + 52, world.lake.ry + 52);
      if (lakeDistance < 1.16) {
        return {
          type: "hint",
          x: world.lake.x,
          y: world.lake.y,
          text: "Attiva prima la radura",
          hint: "Il lago si apre solo dopo la danza dei funghi.",
        };
      }
    }

    if (!state.quests.arcade && distance(state.player.x, state.player.y, world.cityArcade.x, world.cityArcade.y) < 134) {
      return {
        type: "hint",
        x: world.cityArcade.x,
        y: world.cityArcade.y,
        text: "Mancano celle neon",
        hint: "La console arcade ha bisogno di tutte le celle della citta.",
      };
    }

    if (!state.quests.obelisk && distance(state.player.x, state.player.y, world.desertObelisk.x, world.desertObelisk.y) < 138) {
      return {
        type: "hint",
        x: world.desertObelisk.x,
        y: world.desertObelisk.y,
        text: "Servono frammenti",
        hint: "L'obelisco reagisce solo con 3 frammenti solari.",
      };
    }

    const unlitBeacon = snowBeacons.find((beacon) => !beacon.lit && distance(state.player.x, state.player.y, beacon.x, beacon.y) < 100);
    if (unlitBeacon && !state.quests.obelisk) {
      return {
        type: "hint",
        x: unlitBeacon.x,
        y: unlitBeacon.y,
        text: "Bloccatore di ghiaccio",
        hint: "Le torri si attivano solo dopo il rito del deserto.",
      };
    }

    if (!state.quests.aurora && distance(state.player.x, state.player.y, world.snowShrine.x, world.snowShrine.y) < 144) {
      return {
        type: "hint",
        x: world.snowShrine.x,
        y: world.snowShrine.y,
        text: "Mancano i fari",
        hint: "Il santuario polare richiede tutti i fari accesi.",
      };
    }

    if (!state.quests.finale && distance(state.player.x, state.player.y, world.plaza.x, world.plaza.y) < 150) {
      return {
        type: "hint",
        x: world.plaza.x,
        y: world.plaza.y,
        text: state.quests.aurora ? "Servono i sigilli" : "Serve l'aurora",
        hint: state.quests.aurora
          ? "La parata parte solo quando raccogli tutti i sigilli dei custodi."
          : "La parata parte solo quando la tundra illumina il cielo.",
      };
    }

    return null;
  }

  function updateUI() {
    const quest = getCurrentQuest();
    const zone = getZoneAt(state.player.x, state.player.y);
    progressCount.textContent = `${getCompletedQuestCount()} / ${questTotals.major}`;
    objectiveText.textContent = quest ? `${quest.title}: ${quest.objective}` : "Mondo completato: esplora liberamente e parla con i personaggi nei quattro biomi.";
    promptText.textContent = quest ? `${zone.name} • ${getPrompt()}` : `${zone.name} • Tutto e' acceso, resta solo da girare il mondo.`;
    compassText.textContent = getCompassLabel();
    discoveriesText.textContent = state.recentDiscoveries.length
      ? state.recentDiscoveries.join(" • ")
      : "Nessuna ancora";
    updateDialogueUI();
  }

  function updateDialogueUI() {
    if (!state.dialogue.active) {
      dialoguePanel.hidden = true;
      return;
    }

    const npc = getNpcByKey(state.dialogue.npcKey);
    const page = state.dialogue.pages[state.dialogue.pageIndex];
    if (!npc || !page) {
      closeDialogue();
      dialoguePanel.hidden = true;
      return;
    }

    dialoguePanel.hidden = false;
    dialogueAvatar.textContent = npc.emoji;
    dialogueName.textContent = npc.name;
    dialogueRole.textContent = npc.role;
    dialogueStep.textContent = `${state.dialogue.pageIndex + 1} / ${state.dialogue.pages.length}`;
    dialogueBody.textContent = page.text;
    dialogueHint.textContent = state.dialogue.pageIndex < state.dialogue.pages.length - 1
      ? "Premi Spazio o Invio per continuare"
      : state.dialogue.reward
        ? "Premi Spazio o Invio per ricevere la ricompensa"
        : "Premi Spazio o Invio per chiudere";
  }

  function openNpcDialogue(npc) {
    const dialogue = buildNpcDialogue(npc);
    state.dialogue.active = true;
    state.dialogue.npcKey = npc.key;
    state.dialogue.pages = dialogue.pages;
    state.dialogue.pageIndex = 0;
    state.dialogue.reward = dialogue.reward;
    npc.metCount += 1;
    clearMovementInput();
  }

  function advanceDialogue() {
    if (!state.dialogue.active) {
      return;
    }

    if (state.dialogue.pageIndex < state.dialogue.pages.length - 1) {
      state.dialogue.pageIndex += 1;
      return;
    }

    const reward = state.dialogue.reward;
    closeDialogue();
    if (reward) {
      applyDialogueReward(reward);
    }
  }

  function closeDialogue() {
    state.dialogue.active = false;
    state.dialogue.npcKey = null;
    state.dialogue.pages = [];
    state.dialogue.pageIndex = 0;
    state.dialogue.reward = null;
    dialoguePanel.hidden = true;
  }

  function buildNpcDialogue(npc) {
    const pages = [];
    const reward = getNpcDialogueReward(npc);
    const introText = npc.metCount === 0
      ? npc.introText
      : npc.dialogues[npc.metCount % npc.dialogues.length];
    const contextText = getNpcContextHint(npc);
    const closingText = reward ? reward.preview : getNpcClosingText(npc);

    [introText, contextText, closingText].forEach((text) => {
      if (text && !pages.some((page) => page.text === text)) {
        pages.push({ text });
      }
    });

    return { pages, reward };
  }

  function getNpcContextHint(npc) {
    if (canNpcGrantSigil(npc)) {
      return `Hai completato il percorso del ${getBiomeLabel(npc.biome)}. Posso consegnarti il Sigillo ${npc.sigilName}.`;
    }

    if (npc.guide && npc.sigilGranted) {
      const remaining = questTotals.sigils - state.quests.sigils;
      return remaining > 0
        ? `Il mio sigillo e' gia' con te. Te ne mancano ancora ${remaining} per chiudere il viaggio.`
        : "Hai gia' tutti i sigilli. La piazza centrale puo' finalmente esplodere in festa.";
    }

    if (state.quests.finale) {
      return "Il mondo e' in risonanza. Porta questa energia in piazza e lasciala correre.";
    }

    if (state.quests.aurora && state.quests.sigils < questTotals.sigils) {
      return npc.guide
        ? "Ora che l'aurora e' accesa, i custodi stanno distribuendo i sigilli del viaggio."
        : "I custodi dei biomi stanno aspettando il tuo passaggio per consegnarti i sigilli.";
    }

    if (npc.biome === "forest") {
      if (state.quests.fireflies < questTotals.fireflies) {
        return "Le lucciole non stanno ferme: tre amano il bordo del lago e le altre inseguono i sentieri larghi.";
      }
      if (!state.quests.grove) {
        return "La radura dei funghi e' pronta: accendila e il bosco cambiera' ritmo.";
      }
      if (!state.quests.lake) {
        return "Quando i funghi iniziano a danzare, il lago risponde. Vai verso l'acqua.";
      }
      return "La foresta ha finito il suo pezzo. Ora la citta neon puo' svegliarsi davvero.";
    }

    if (npc.biome === "city") {
      if (!state.quests.lake) {
        return "La citta e' ancora spenta. Prima devi svegliare il lago nella foresta.";
      }
      if (state.quests.cells < questTotals.cells) {
        return "Le celle neon sono finite ai margini dei grandi isolati: una a ovest, una a sud-est, una verso il distretto alto.";
      }
      if (!state.quests.arcade) {
        return "L'arcade centrale ha tutta l'energia che serve. Devi solo riaccenderlo.";
      }
      return "Le strade sono di nuovo online. Adesso il deserto ti dara' il prossimo problema.";
    }

    if (npc.biome === "desert") {
      if (!state.quests.arcade) {
        return "Il deserto resta chiuso finche' la citta non rimette corrente nella rete emoji.";
      }
      if (state.quests.shards < questTotals.shards) {
        return "I frammenti solari sono lontani tra loro: uno vicino alle dune basse, uno verso il centro e uno quasi al bordo sud.";
      }
      if (!state.quests.obelisk) {
        return "L'obelisco non vuole parole. Vuole tutti e tre i frammenti insieme.";
      }
      return "La sabbia ha aperto la via della tundra. Il gelo adesso ti sta aspettando.";
    }

    if (!state.quests.obelisk) {
      return "Le torri di ghiaccio dormono ancora. Il rito del deserto deve finire prima.";
    }
    if (state.quests.beacons < questTotals.beacons) {
      return "Le quattro torri sono sparse ai lati della tundra. Attivale tutte e il santuario respirera'.";
    }
    if (!state.quests.aurora) {
      return "Il santuario polare e' pronto. Una volta acceso, il cielo cambiera' su tutto il mondo.";
    }
    return "Il ghiaccio ha fatto la sua parte. Ora manca solo il passaggio tra i custodi e la piazza.";
  }

  function getNpcClosingText(npc) {
    if (npc.guide && !canNpcGrantSigil(npc) && !npc.sigilGranted) {
      return `Quando completi il percorso del ${getBiomeLabel(npc.biome)}, torna da me: custodisco il Sigillo ${npc.sigilName}.`;
    }

    if (state.quests.sigils >= questTotals.sigils && !state.quests.finale) {
      return "Non trattenerti qui. Tutti i biomi stanno convergendo verso la piazza centrale.";
    }

    return npc.dialogues[(npc.metCount + 1) % npc.dialogues.length];
  }

  function getNpcDialogueReward(npc) {
    if (!canNpcGrantSigil(npc)) {
      return null;
    }

    return {
      type: "sigil",
      npcKey: npc.key,
      label: npc.sigilName,
      color: npc.sigilColor,
      preview: `Hai chiuso il viaggio del ${getBiomeLabel(npc.biome)}. Tieni il Sigillo ${npc.sigilName} e portalo con te fino alla piazza.`,
    };
  }

  function applyDialogueReward(reward) {
    if (reward.type !== "sigil") {
      return;
    }

    const npc = getNpcByKey(reward.npcKey);
    if (!npc || npc.sigilGranted) {
      return;
    }

    npc.sigilGranted = true;
    state.quests.sigils += 1;
    addDiscovery(`sigillo ${reward.label.toLowerCase()}`);
    state.lastPrompt = `${npc.name} ti ha consegnato il Sigillo ${reward.label}.`;
    pushFloatingText(`🔖 ${reward.label}`, npc.x, npc.y - 44, reward.color);

    if (state.quests.sigils === questTotals.sigils) {
      addDiscovery("tutti i sigilli raccolti");
      state.lastPrompt = "Hai tutti i sigilli. La piazza centrale puo' finalmente attivare la parata.";
      pushFloatingText("🌈 Piazza pronta", world.plaza.x, world.plaza.y - 58, "#fff3bb");
    }
  }

  function getGuideNpcs() {
    return npcs.filter((npc) => npc.guide);
  }

  function getNpcByKey(key) {
    return npcs.find((npc) => npc.key === key);
  }

  function clearMovementInput() {
    state.input.up = false;
    state.input.down = false;
    state.input.left = false;
    state.input.right = false;
  }

  function canNpcGrantSigil(npc) {
    return npc.guide && !npc.sigilGranted && isSigilGateUnlocked(npc.sigilGate);
  }

  function isSigilGateUnlocked(gate) {
    switch (gate) {
      case "lake":
        return state.quests.lake;
      case "arcade":
        return state.quests.arcade;
      case "obelisk":
        return state.quests.obelisk;
      case "aurora":
        return state.quests.aurora;
      default:
        return false;
    }
  }

  function getBiomeLabel(biome) {
    return world.zones[biome].name.toLowerCase();
  }

  function getNpcWorldStatus(npc) {
    if (canNpcGrantSigil(npc)) {
      return `Sigillo ${npc.sigilName} pronto`;
    }
    if (npc.guide && npc.sigilGranted) {
      return `Sigillo ${npc.sigilName} consegnato`;
    }
    return npc.role;
  }

  function getCurrentQuest() {
    const q = state.quests;

    if (q.fireflies < questTotals.fireflies) {
      const target = getNearest(fireflies.filter((firefly) => !firefly.collected));
      return {
        id: "fireflies",
        title: `Lucciole ${q.fireflies}/${questTotals.fireflies}`,
        objective: "Esplora la foresta e cattura tutte le lucciole magiche.",
        target: target ? { x: target.x, y: target.y, label: "lucciola" } : null,
      };
    }

    if (!q.grove) {
      return {
        id: "grove",
        title: "Radura dei funghi",
        objective: "Vai al cerchio di funghi e premi Spazio per avviare la danza.",
        target: { x: world.grove.x, y: world.grove.y, label: "radura" },
      };
    }

    if (!q.lake) {
      return {
        id: "lake",
        title: "Lago incantato",
        objective: "Raggiungi la riva del lago e premi Spazio per evocare il pesce luna.",
        target: { x: world.lake.x, y: world.lake.y + world.lake.ry + 36, label: "lago" },
      };
    }

    if (q.cells < questTotals.cells) {
      const target = getNearest(powerCells.filter((cell) => !cell.collected));
      return {
        id: "cells",
        title: `Celle neon ${q.cells}/${questTotals.cells}`,
        objective: "Attraversa la citta e raccogli tutte le batterie sparse sui blocchi urbani.",
        target: target ? { x: target.x, y: target.y, label: "cella neon" } : null,
      };
    }

    if (!q.arcade) {
      return {
        id: "arcade",
        title: "Arcade centrale",
        objective: "Torna alla console arcade e premi Spazio per riaccendere la citta.",
        target: { x: world.cityArcade.x, y: world.cityArcade.y, label: "arcade" },
      };
    }

    if (q.shards < questTotals.shards) {
      const target = getNearest(sunShards.filter((shard) => !shard.collected));
      return {
        id: "shards",
        title: `Frammenti ${q.shards}/${questTotals.shards}`,
        objective: "Raccogli i 3 frammenti solari nascosti tra dune e cactus.",
        target: target ? { x: target.x, y: target.y, label: "frammento" } : null,
      };
    }

    if (!q.obelisk) {
      return {
        id: "obelisk",
        title: "Obelisco del deserto",
        objective: "Porta i frammenti all'obelisco e premi Spazio per attivarlo.",
        target: { x: world.desertObelisk.x, y: world.desertObelisk.y, label: "obelisco" },
      };
    }

    if (q.beacons < questTotals.beacons) {
      const target = getNearest(snowBeacons.filter((beacon) => !beacon.lit));
      return {
        id: "beacons",
        title: `Torri di neve ${q.beacons}/${questTotals.beacons}`,
        objective: "Raggiungi le 4 torri gelate e premi Spazio per accenderle.",
        target: target ? { x: target.x, y: target.y, label: "torre" } : null,
      };
    }

    if (!q.aurora) {
      return {
        id: "shrine",
        title: "Santuario polare",
        objective: "Vai al santuario di ghiaccio e premi Spazio per accendere l'aurora.",
        target: { x: world.snowShrine.x, y: world.snowShrine.y, label: "santuario" },
      };
    }

    if (q.sigils < questTotals.sigils) {
      const target = getNearest(getGuideNpcs().filter((npc) => !npc.sigilGranted));
      return {
        id: "sigils",
        title: `Sigilli ${q.sigils}/${questTotals.sigils}`,
        objective: "Parla con i custodi dei quattro biomi e raccogli tutti i sigilli del viaggio.",
        target: target ? { x: target.x, y: target.y, label: `sigillo ${target.sigilName.toLowerCase()}` } : null,
      };
    }

    if (!q.finale) {
      return {
        id: "finale",
        title: "Piazza centrale",
        objective: "Torna alla piazza tra i biomi e premi Spazio per lanciare la parata emoji.",
        target: { x: world.plaza.x, y: world.plaza.y, label: "piazza" },
      };
    }

    return null;
  }

  function getPrompt() {
    if (state.dialogue.active) {
      return "Spazio o Invio per continuare il dialogo.";
    }

    const action = getActionTarget();
    if (action?.type === "npc") {
      return `Premi Spazio per parlare con ${action.entity.name}.`;
    }
    if (action?.type === "grove") {
      return "Premi Spazio per accendere il cerchio di funghi.";
    }
    if (action?.type === "lake") {
      return "Premi Spazio per lanciare il richiamo nel lago.";
    }
    if (action?.type === "arcade") {
      return "Premi Spazio per riattivare la console arcade.";
    }
    if (action?.type === "obelisk") {
      return "Premi Spazio per riversare i frammenti nell'obelisco.";
    }
    if (action?.type === "beacon") {
      return "Premi Spazio per accendere la torre.";
    }
    if (action?.type === "shrine") {
      return "Premi Spazio per chiamare l'aurora.";
    }
    if (action?.type === "finale") {
      return "Premi Spazio per aprire la parata finale.";
    }
    if (action?.type === "hint") {
      return action.hint;
    }
    return state.lastPrompt;
  }

  function getCompassLabel() {
    const zone = getZoneAt(state.player.x, state.player.y);
    const target = getCompassTarget();
    if (!target) {
      return `${zone.name} • festa completa`;
    }

    const angle = Math.atan2(target.y - state.player.y, target.x - state.player.x);
    const directions = ["Est", "Sud-est", "Sud", "Sud-ovest", "Ovest", "Nord-ovest", "Nord", "Nord-est"];
    const normalizedAngle = (angle + TAU) % TAU;
    const slot = Math.round((normalizedAngle / TAU) * 8) % 8;
    return `${zone.name} • ${directions[slot]} • ${target.label}`;
  }

  function getCompassTarget() {
    const quest = getCurrentQuest();
    if (quest?.target) {
      return quest.target;
    }

    const nearbyNpc = getNearest(npcs);
    return nearbyNpc ? { x: nearbyNpc.x, y: nearbyNpc.y, label: nearbyNpc.name } : null;
  }

  function getCompletedQuestCount() {
    let count = 0;
    if (state.quests.fireflies >= questTotals.fireflies) {
      count += 1;
    }
    if (state.quests.grove) {
      count += 1;
    }
    if (state.quests.lake) {
      count += 1;
    }
    if (state.quests.cells >= questTotals.cells) {
      count += 1;
    }
    if (state.quests.arcade) {
      count += 1;
    }
    if (state.quests.shards >= questTotals.shards) {
      count += 1;
    }
    if (state.quests.obelisk) {
      count += 1;
    }
    if (state.quests.beacons >= questTotals.beacons) {
      count += 1;
    }
    if (state.quests.aurora) {
      count += 1;
    }
    if (state.quests.sigils >= questTotals.sigils) {
      count += 1;
    }
    if (state.quests.finale) {
      count += 1;
    }
    return count;
  }

  function isStageUnlocked(stage) {
    if (stage === "cells") {
      return state.quests.lake;
    }
    if (stage === "shards") {
      return state.quests.arcade;
    }
    return false;
  }

  function render() {
    ctx.clearRect(0, 0, view.width, view.height);
    drawSkyWash();
    drawBiomeGrounds();
    drawRoutes();
    drawLake();
    drawForestFeatures();
    drawCityFeatures();
    drawDesertFeatures();
    drawSnowFeatures();
    drawTargetBeacon();
    drawWorldEntities();
    drawWeatherOverlay();
    drawFloatingTexts();
    drawCompassArrow();
    drawBiomeBanner();
    drawFinaleRibbon();
  }

  function drawSkyWash() {
    const gradient = ctx.createLinearGradient(0, 0, 0, view.height);
    gradient.addColorStop(0, "rgba(247, 220, 146, 0.14)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
    gradient.addColorStop(1, "rgba(8, 16, 18, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, view.width, view.height);
  }

  function drawBiomeGrounds() {
    Object.values(world.zones).forEach((zone) => {
      const screen = worldToScreen(zone.x, zone.y);
      ctx.fillStyle = zone.ground;
      ctx.fillRect(screen.x, screen.y, zone.width, zone.height);
    });

    groundPatches.forEach((patch) => {
      const screen = worldToScreen(patch.x, patch.y);
      if (!isVisible(screen.x, screen.y, patch.radius * 2)) {
        return;
      }

      ctx.fillStyle = patch.color;
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y, patch.radius, patch.radius * patch.squeeze, patch.rotation, 0, TAU);
      ctx.fill();
    });

    const plazaScreen = worldToScreen(world.plaza.x, world.plaza.y);
    const plazaGradient = ctx.createRadialGradient(plazaScreen.x, plazaScreen.y, 20, plazaScreen.x, plazaScreen.y, 170);
    plazaGradient.addColorStop(0, "rgba(255, 228, 166, 0.42)");
    plazaGradient.addColorStop(1, "rgba(255, 228, 166, 0.02)");
    ctx.fillStyle = plazaGradient;
    ctx.beginPath();
    ctx.arc(plazaScreen.x, plazaScreen.y, 180, 0, TAU);
    ctx.fill();
  }

  function drawRoutes() {
    routes.forEach((route) => {
      ctx.save();
      ctx.translate(-state.camera.x, -state.camera.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = route.colorOuter;
      ctx.lineWidth = route.widthOuter;
      strokeRoute(route.points);
      ctx.strokeStyle = route.colorInner;
      ctx.lineWidth = route.widthInner;
      strokeRoute(route.points);
      ctx.restore();
    });

    cityBuildings.forEach((building) => {
      drawRoadStripe(building.roadHint);
    });
  }

  function strokeRoute(points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i += 1) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  function drawRoadStripe(road) {
    if (!road) {
      return;
    }

    const screen = worldToScreen(road.x, road.y);
    if (screen.x > view.width + road.width || screen.y > view.height + road.height || screen.x + road.width < -40 || screen.y + road.height < -40) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(247, 229, 143, 0.18)";
    if (road.axis === "x") {
      for (let x = road.x + 22; x < road.x + road.width - 24; x += 48) {
        const segment = worldToScreen(x, road.y + road.height / 2 - 3);
        ctx.fillRect(segment.x, segment.y, 24, 6);
      }
    } else {
      for (let y = road.y + 22; y < road.y + road.height - 24; y += 48) {
        const segment = worldToScreen(road.x + road.width / 2 - 3, y);
        ctx.fillRect(segment.x, segment.y, 6, 24);
      }
    }
    ctx.restore();
  }

  function drawLake() {
    const lakeScreen = worldToScreen(world.lake.x, world.lake.y);
    if (!isVisible(lakeScreen.x, lakeScreen.y, world.lake.rx + 80)) {
      return;
    }

    const lakeGradient = ctx.createRadialGradient(
      lakeScreen.x - 110,
      lakeScreen.y - 110,
      10,
      lakeScreen.x,
      lakeScreen.y,
      world.lake.rx
    );
    lakeGradient.addColorStop(0, "#a5fbff");
    lakeGradient.addColorStop(0.55, "#3297cb");
    lakeGradient.addColorStop(1, "#144d79");

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(lakeScreen.x, lakeScreen.y, world.lake.rx, world.lake.ry, 0, 0, TAU);
    ctx.fillStyle = lakeGradient;
    ctx.fill();
    ctx.clip();

    const shimmer = 0.5 + Math.sin(state.time * 1.5) * 0.5;
    for (let i = 0; i < 8; i += 1) {
      const y = lakeScreen.y - world.lake.ry + 34 + i * 68 + Math.sin(state.time * 1.2 + i) * 8;
      ctx.strokeStyle = `rgba(235, 255, 255, ${0.07 + shimmer * 0.09})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(lakeScreen.x - world.lake.rx - 10, y);
      ctx.quadraticCurveTo(lakeScreen.x, y + 20, lakeScreen.x + world.lake.rx + 10, y);
      ctx.stroke();
    }

    state.ripples.forEach((ripple) => {
      const screen = worldToScreen(ripple.x, ripple.y);
      ctx.strokeStyle = `rgba(239, 252, 255, ${ripple.alpha})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y, ripple.radius * 1.25, ripple.radius * 0.72, 0, 0, TAU);
      ctx.stroke();
    });

    fish.forEach((fishie) => {
      const screen = worldToScreen(fishie.x, fishie.y);
      const jumpArc = fishie.jumpTimer > 0 ? Math.sin((fishie.jumpTimer / 0.7) * Math.PI) * 28 : 0;
      const size = fishie.jumpTimer > 0 ? 30 : 24;
      ctx.save();
      ctx.translate(screen.x, screen.y - jumpArc);
      ctx.scale(fishie.angle > Math.PI / 2 || fishie.angle < -Math.PI / 2 ? -1 : 1, 1);
      ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(fishie.emoji, 0, Math.sin(fishie.bob) * 4);
      ctx.restore();
    });

    if (state.quests.lake) {
      ctx.font = `80px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("🐟", lakeScreen.x, lakeScreen.y - 54 - Math.sin(state.time * 2.9) * 18);
    }

    ctx.restore();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(219, 245, 227, 0.18)";
    ctx.beginPath();
    ctx.ellipse(lakeScreen.x, lakeScreen.y, world.lake.rx, world.lake.ry, 0, 0, TAU);
    ctx.stroke();
  }

  function drawForestFeatures() {
    flowers.forEach((flower) => {
      const screen = worldToScreen(flower.x, flower.y);
      if (!isVisible(screen.x, screen.y, 40)) {
        return;
      }
      ctx.save();
      ctx.globalAlpha = 0.76;
      ctx.font = `${flower.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(flower.emoji, screen.x, screen.y + Math.sin(state.time * flower.speed + flower.phase) * 2);
      ctx.restore();
    });

    reeds.forEach((reed) => {
      const screen = worldToScreen(reed.x, reed.y);
      if (!isVisible(screen.x, screen.y, 46)) {
        return;
      }
      ctx.save();
      ctx.font = `${reed.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("🌾", screen.x, screen.y + Math.sin(state.time * 1.5 + reed.phase) * 4);
      ctx.restore();
    });

    mushrooms.forEach((mushroom, index) => {
      const screen = worldToScreen(mushroom.x, mushroom.y);
      if (!isVisible(screen.x, screen.y, 56)) {
        return;
      }
      const bounce = state.quests.grove ? Math.sin(state.time * 5 + index) * 8 : Math.sin(state.time * 1.5 + index) * 1.8;
      ctx.save();
      ctx.font = `${state.quests.grove ? 36 : 30}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("🍄", screen.x, screen.y + bounce);
      ctx.restore();
    });

    fireflies.forEach((firefly) => {
      if (firefly.collected) {
        return;
      }
      const x = firefly.x + Math.cos(firefly.phase) * 14;
      const y = firefly.y + Math.sin(firefly.phase * 1.3) * 10;
      const screen = worldToScreen(x, y);
      if (!isVisible(screen.x, screen.y, 40)) {
        return;
      }
      ctx.save();
      const glow = 0.4 + (Math.sin(firefly.spark) + 1) * 0.3;
      ctx.shadowColor = `rgba(255, 229, 127, ${glow})`;
      ctx.shadowBlur = 20;
      ctx.font = `24px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("✨", screen.x, screen.y);
      ctx.restore();
    });
  }

  function drawCityFeatures() {
    cityBuildings.forEach((building) => {
      const screen = worldToScreen(building.x, building.y);
      if (!isVisible(screen.x + building.width / 2, screen.y + building.height / 2, Math.max(building.width, building.height))) {
        return;
      }

      ctx.save();
      ctx.fillStyle = building.body;
      ctx.fillRect(screen.x, screen.y + 26, building.width, building.height - 26);
      ctx.fillStyle = building.roof;
      ctx.fillRect(screen.x + 12, screen.y, building.width - 24, 42);
      ctx.fillStyle = "rgba(12, 22, 29, 0.26)";
      ctx.fillRect(screen.x + 14, screen.y + building.height - 22, building.width - 28, 12);
      ctx.restore();

      ctx.save();
      ctx.font = `${building.emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(building.emoji, screen.x + building.width / 2, screen.y + building.height / 2 + 12 + Math.sin(state.time + building.phase) * 3);
      ctx.restore();

      ctx.save();
      ctx.font = `bold 12px "Avenir Next", "Trebuchet MS", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = state.quests.arcade ? building.neonOn : building.neonOff;
      ctx.fillText(building.label, screen.x + building.width / 2, screen.y + 58);
      ctx.restore();
    });

    powerCells.forEach((cell) => {
      const screen = worldToScreen(cell.x, cell.y);
      if (!isVisible(screen.x, screen.y, 44)) {
        return;
      }

      ctx.save();
      ctx.globalAlpha = cell.collected ? 0.15 : isStageUnlocked("cells") ? 1 : 0.34;
      ctx.shadowColor = "rgba(137, 255, 255, 0.8)";
      ctx.shadowBlur = cell.collected ? 0 : 18;
      ctx.font = `30px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("🔋", screen.x, screen.y + Math.sin(cell.phase) * 6);
      ctx.restore();
    });

    const arcadeScreen = worldToScreen(world.cityArcade.x, world.cityArcade.y);
    if (isVisible(arcadeScreen.x, arcadeScreen.y, 140)) {
      ctx.save();
      ctx.fillStyle = "rgba(22, 35, 43, 0.34)";
      ctx.beginPath();
      ctx.ellipse(arcadeScreen.x, arcadeScreen.y + 30, 78, 24, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.font = `92px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("🕹️", arcadeScreen.x, arcadeScreen.y + Math.sin(state.time * 2.1) * 6);
      ctx.restore();

      ctx.save();
      ctx.font = `bold 14px "Avenir Next", "Trebuchet MS", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = state.quests.arcade ? "#9efcff" : "rgba(210, 235, 244, 0.72)";
      ctx.fillText(state.quests.arcade ? "NEON GRID ONLINE" : "ARCADE OFFLINE", arcadeScreen.x, arcadeScreen.y + 88);
      ctx.restore();
    }
  }

  function drawDesertFeatures() {
    for (let i = 0; i < 12; i += 1) {
      const x = 140 + i * 255;
      const y = world.zones.desert.y + 120 + (i % 4) * 140;
      const screen = worldToScreen(x, y);
      if (!isVisible(screen.x, screen.y, 180)) {
        continue;
      }
      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? "rgba(255, 214, 148, 0.08)" : "rgba(108, 74, 20, 0.12)";
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y, 180, 60, 0.1 * i, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    sunShards.forEach((shard) => {
      const screen = worldToScreen(shard.x, shard.y);
      if (!isVisible(screen.x, screen.y, 50)) {
        return;
      }
      ctx.save();
      ctx.globalAlpha = shard.collected ? 0.18 : isStageUnlocked("shards") ? 1 : 0.32;
      ctx.shadowColor = "rgba(255, 228, 157, 0.8)";
      ctx.shadowBlur = shard.collected ? 0 : 18;
      ctx.font = `34px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("💎", screen.x, screen.y - Math.sin(shard.phase) * 8);
      ctx.restore();
    });

    const obeliskScreen = worldToScreen(world.desertObelisk.x, world.desertObelisk.y);
    if (isVisible(obeliskScreen.x, obeliskScreen.y, 140)) {
      ctx.save();
      ctx.fillStyle = "rgba(74, 42, 10, 0.24)";
      ctx.beginPath();
      ctx.ellipse(obeliskScreen.x, obeliskScreen.y + 28, 88, 24, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.font = `92px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("🗿", obeliskScreen.x, obeliskScreen.y + Math.sin(state.time * 1.7) * 4);
      ctx.restore();

      if (state.quests.obelisk) {
        ctx.save();
        ctx.font = `72px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("🐋", obeliskScreen.x + 180 + Math.cos(state.time * 0.8) * 34, obeliskScreen.y - 90 + Math.sin(state.time * 0.9) * 20);
        ctx.restore();
      }
    }
  }

  function drawSnowFeatures() {
    for (let i = 0; i < 18; i += 1) {
      const x = world.zones.snow.x + 120 + i * 170;
      const y = world.zones.snow.y + 120 + (i % 5) * 110;
      const screen = worldToScreen(x, y);
      if (!isVisible(screen.x, screen.y, 140)) {
        continue;
      }
      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? "rgba(255, 255, 255, 0.11)" : "rgba(153, 205, 227, 0.12)";
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y, 120, 46, 0.05 * i, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    snowBeacons.forEach((beacon) => {
      const screen = worldToScreen(beacon.x, beacon.y);
      if (!isVisible(screen.x, screen.y, 70)) {
        return;
      }

      ctx.save();
      ctx.fillStyle = "rgba(105, 145, 168, 0.24)";
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y + 22, 28, 10, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.font = `58px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.globalAlpha = beacon.lit ? 1 : 0.52;
      ctx.fillText(beacon.lit ? "🕯️" : "📡", screen.x, screen.y);
      ctx.restore();

      if (beacon.lit) {
        ctx.save();
        ctx.strokeStyle = "rgba(233, 247, 255, 0.52)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y - 20, 20 + Math.sin(state.time * 4 + beacon.phase) * 6, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    });

    const shrineScreen = worldToScreen(world.snowShrine.x, world.snowShrine.y);
    if (isVisible(shrineScreen.x, shrineScreen.y, 150)) {
      ctx.save();
      ctx.fillStyle = "rgba(105, 145, 168, 0.2)";
      ctx.beginPath();
      ctx.ellipse(shrineScreen.x, shrineScreen.y + 28, 92, 26, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.font = `96px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("❄️", shrineScreen.x, shrineScreen.y + Math.sin(state.time * 1.8) * 4);
      ctx.restore();
    }

    const plazaScreen = worldToScreen(world.plaza.x, world.plaza.y);
    if (isVisible(plazaScreen.x, plazaScreen.y, 160)) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 233, 180, 0.38)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(plazaScreen.x, plazaScreen.y, 82, 0, TAU);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = `72px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(state.quests.finale ? "🎉" : "🌈", plazaScreen.x, plazaScreen.y + Math.sin(state.time * 2) * 4);
      ctx.restore();
    }
  }

  function drawWorldEntities() {
    const renderables = [];

    trees.forEach((tree) => {
      renderables.push({
        y: tree.y,
        draw() {
          const screen = worldToScreen(tree.x, tree.y);
          if (!isVisible(screen.x, screen.y, 74)) {
            return;
          }
          ctx.save();
          ctx.fillStyle = "rgba(8, 20, 15, 0.24)";
          ctx.beginPath();
          ctx.ellipse(screen.x, screen.y + 24, tree.radius * 0.9, tree.radius * 0.44, 0, 0, TAU);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.translate(screen.x, screen.y + Math.sin(state.time * 1.2 + tree.phase) * 3.2);
          ctx.rotate(Math.sin(state.time * 0.8 + tree.phase) * 0.04);
          ctx.font = `${tree.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(tree.emoji, 0, 0);
          ctx.restore();
        },
      });
    });

    desertCacti.forEach((cactus) => {
      renderables.push({
        y: cactus.y,
        draw() {
          const screen = worldToScreen(cactus.x, cactus.y);
          if (!isVisible(screen.x, screen.y, 60)) {
            return;
          }
          ctx.save();
          ctx.fillStyle = "rgba(60, 37, 8, 0.2)";
          ctx.beginPath();
          ctx.ellipse(screen.x, screen.y + 18, cactus.radius * 0.8, cactus.radius * 0.34, 0, 0, TAU);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.font = `${cactus.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(cactus.emoji, screen.x, screen.y + Math.sin(state.time * 0.9 + cactus.phase) * 2);
          ctx.restore();
        },
      });
    });

    desertRocks.forEach((rock) => {
      renderables.push({
        y: rock.y,
        draw() {
          const screen = worldToScreen(rock.x, rock.y);
          if (!isVisible(screen.x, screen.y, 56)) {
            return;
          }
          ctx.save();
          ctx.font = `${rock.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(rock.emoji, screen.x, screen.y);
          ctx.restore();
        },
      });
    });

    snowPines.forEach((pine) => {
      renderables.push({
        y: pine.y,
        draw() {
          const screen = worldToScreen(pine.x, pine.y);
          if (!isVisible(screen.x, screen.y, 64)) {
            return;
          }
          ctx.save();
          ctx.fillStyle = "rgba(90, 130, 154, 0.22)";
          ctx.beginPath();
          ctx.ellipse(screen.x, screen.y + 20, pine.radius * 0.84, pine.radius * 0.38, 0, 0, TAU);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.font = `${pine.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(pine.emoji, screen.x, screen.y + Math.sin(state.time * 0.9 + pine.phase) * 2);
          ctx.restore();
        },
      });
    });

    iceChunks.forEach((ice) => {
      renderables.push({
        y: ice.y,
        draw() {
          const screen = worldToScreen(ice.x, ice.y);
          if (!isVisible(screen.x, screen.y, 52)) {
            return;
          }
          ctx.save();
          ctx.font = `${ice.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("🧊", screen.x, screen.y);
          ctx.restore();
        },
      });
    });

    tumbleweeds.forEach((weed) => {
      renderables.push({
        y: weed.y,
        draw() {
          const screen = worldToScreen(weed.x, weed.y);
          if (!isVisible(screen.x, screen.y, 40)) {
            return;
          }
          ctx.save();
          ctx.translate(screen.x, screen.y);
          ctx.rotate(weed.spin);
          ctx.font = `28px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("🪵", 0, 0);
          ctx.restore();
        },
      });
    });

    vehicles.forEach((vehicle) => {
      renderables.push({
        y: vehicle.y,
        draw() {
          const screen = worldToScreen(vehicle.x, vehicle.y);
          if (!isVisible(screen.x, screen.y, 64)) {
            return;
          }
          ctx.save();
          ctx.translate(screen.x, screen.y);
          if (vehicle.axis === "x" && vehicle.dir < 0) {
            ctx.scale(-1, 1);
          }
          if (vehicle.axis === "y") {
            ctx.rotate(vehicle.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
          }
          ctx.font = `${vehicle.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(vehicle.emoji, 0, Math.sin(state.time * 6 + vehicle.phase) * 1.4);
          ctx.restore();
        },
      });
    });

    npcs.forEach((npc) => {
      renderables.push({
        y: npc.y,
        draw() {
          const screen = worldToScreen(npc.x, npc.y);
          if (!isVisible(screen.x, screen.y, 80)) {
            return;
          }

          ctx.save();
          ctx.fillStyle = "rgba(8, 20, 15, 0.2)";
          ctx.beginPath();
          ctx.ellipse(screen.x, screen.y + 16, 16, 8, 0, 0, TAU);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.translate(screen.x, screen.y - 4 + Math.sin(npc.bob) * (state.quests.finale ? 7 : 3));
          ctx.scale(npc.facing, 1);
          ctx.font = `${state.quests.finale ? 36 : 31}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(npc.emoji, 0, 0);
          ctx.restore();

          if (distance(state.player.x, state.player.y, npc.x, npc.y) < 132 || npc.chatTimer > 0 || state.dialogue.npcKey === npc.key) {
            const statusLabel = getNpcWorldStatus(npc);
            ctx.save();
            ctx.textAlign = "center";
            ctx.font = `bold 14px "Avenir Next", "Trebuchet MS", sans-serif`;
            ctx.fillStyle = "rgba(251, 245, 226, 0.95)";
            ctx.fillRect(screen.x - 92, screen.y - 68, 184, 38);
            ctx.strokeStyle = "rgba(34, 65, 48, 0.28)";
            ctx.strokeRect(screen.x - 92, screen.y - 68, 184, 38);
            ctx.fillStyle = "#143325";
            ctx.fillText(npc.name, screen.x, screen.y - 50);
            ctx.font = `12px "Avenir Next", "Trebuchet MS", sans-serif`;
            ctx.fillStyle = "#6d5431";
            ctx.fillText(statusLabel, screen.x, screen.y - 31);
            ctx.restore();
          }
        },
      });
    });

    renderables.push({
      y: state.player.y,
      draw() {
        const screen = worldToScreen(state.player.x, state.player.y);
        ctx.save();
        ctx.fillStyle = "rgba(8, 20, 15, 0.26)";
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + 18, 17, 10, 0, 0, TAU);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(screen.x, screen.y - 8 + Math.sin(state.player.bob) * 3);
        if (state.player.facing === "left") {
          ctx.scale(-1, 1);
        }
        ctx.font = `35px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(state.quests.finale ? "🧙" : "🧝", 0, 0);
        ctx.restore();
      },
    });

    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach((item) => item.draw());
  }

  function drawWeatherOverlay() {
    if (state.zoneKey === "snow" || state.quests.aurora) {
      snowflakes.forEach((flake) => {
        ctx.save();
        ctx.globalAlpha = flake.alpha * (state.zoneKey === "snow" ? 1 : 0.55);
        ctx.fillStyle = "#f7fdff";
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, TAU);
        ctx.fill();
        ctx.restore();
      });
    }

    if (state.zoneKey === "desert" && !state.quests.obelisk) {
      for (let i = 0; i < 9; i += 1) {
        const y = 60 + i * 44 + Math.sin(state.time * 2 + i) * 6;
        ctx.strokeStyle = "rgba(255, 219, 157, 0.08)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(view.width / 2, y + 10, view.width, y);
        ctx.stroke();
      }
    }

    if (state.quests.aurora) {
      ctx.save();
      ctx.globalAlpha = 0.46;
      const gradient = ctx.createLinearGradient(0, 0, view.width, 0);
      gradient.addColorStop(0, "rgba(121, 240, 184, 0.1)");
      gradient.addColorStop(0.35, "rgba(186, 255, 232, 0.28)");
      gradient.addColorStop(0.7, "rgba(141, 212, 255, 0.24)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.08)");
      ctx.fillStyle = gradient;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(0, 28 + i * 24);
        ctx.bezierCurveTo(
          view.width * 0.25,
          14 + i * 20 + Math.sin(state.time * 0.9 + i) * 12,
          view.width * 0.65,
          72 + i * 20 + Math.sin(state.time * 0.8 + i + 1) * 12,
          view.width,
          22 + i * 30
        );
        ctx.lineTo(view.width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawFloatingTexts() {
    state.floatingTexts.forEach((text) => {
      const screen = worldToScreen(text.x, text.y);
      if (!isVisible(screen.x, screen.y, 90)) {
        return;
      }
      ctx.save();
      ctx.globalAlpha = 1 - text.age / 2.5;
      ctx.font = `bold 17px "Avenir Next", "Trebuchet MS", sans-serif`;
      ctx.fillStyle = text.color;
      ctx.textAlign = "center";
      ctx.fillText(text.text, screen.x, screen.y);
      ctx.restore();
    });
  }

  function drawCompassArrow() {
    const target = getCompassTarget();
    if (!target) {
      return;
    }
    const angle = Math.atan2(target.y - state.player.y, target.x - state.player.x);
    const arrowX = view.width / 2;
    const arrowY = 64;

    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = "rgba(242, 195, 91, 0.95)";
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(12, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(-12, 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTargetBeacon() {
    const target = getCompassTarget();
    if (!target) {
      return;
    }
    const screen = worldToScreen(target.x, target.y);
    if (!isVisible(screen.x, screen.y, 120)) {
      return;
    }

    const pulse = 18 + (Math.sin(state.time * 4) + 1) * 7;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 239, 174, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y - 20, pulse, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(screen.x, screen.y - 20, pulse * 0.56, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawBiomeBanner() {
    const zone = getZoneAt(state.player.x, state.player.y);
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold 16px "Avenir Next", "Trebuchet MS", sans-serif`;
    ctx.fillStyle = "rgba(255, 249, 228, 0.96)";
    ctx.fillText(zone.name, view.width / 2, view.height - 22);
    ctx.restore();
  }

  function drawFinaleRibbon() {
    if (!state.quests.finale) {
      return;
    }

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold 18px "Avenir Next", "Trebuchet MS", sans-serif`;
    ctx.fillStyle = "rgba(255, 248, 224, 0.96)";
    ctx.fillText("Parata emoji attiva: foresta, citta, deserto e neve sono sincronizzati.", view.width / 2, 36);
    ctx.restore();
  }

  function handleKeyChange(event) {
    const isDown = event.type === "keydown";
    const key = event.key.toLowerCase();

    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter", "escape", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
    }

    if (key === "arrowup" || key === "w") {
      state.input.up = isDown;
    }
    if (key === "arrowdown" || key === "s") {
      state.input.down = isDown;
    }
    if (key === "arrowleft" || key === "a") {
      state.input.left = isDown;
    }
    if (key === "arrowright" || key === "d") {
      state.input.right = isDown;
    }

    if ((key === " " || event.code === "Space" || key === "enter") && isDown && !event.repeat) {
      state.actionQueued = true;
    }

    if (key === "escape" && isDown && state.dialogue.active) {
      closeDialogue();
    }
  }

  function bindTouchControls() {
    touchControls.querySelectorAll("[data-control]").forEach((button) => {
      const control = button.dataset.control;

      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        if (control === "action") {
          state.actionQueued = true;
        } else {
          state.input[control] = true;
        }
      });

      const release = () => {
        if (control !== "action") {
          state.input[control] = false;
        }
      };

      button.addEventListener("pointerup", release);
      button.addEventListener("pointerleave", release);
      button.addEventListener("pointercancel", release);
    });
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    view.width = rect.width;
    view.height = rect.height;
    if (!state.snowSeeded && view.width > 1 && view.height > 1) {
      snowflakes.forEach((flake) => {
        flake.x = randomRange(0, view.width);
        flake.y = randomRange(0, view.height);
      });
      state.snowSeeded = true;
    }
  }

  function installEmojiRenderer() {
    const nativeFillText = ctx.fillText.bind(ctx);

    ctx.fillText = function (text, x, y, maxWidth) {
      if (typeof text !== "string") {
        nativeFillText(text, x, y, maxWidth);
        return;
      }

      const glyphs = splitEmojiGraphemes(text);
      const emojiOnly = glyphs.length > 0 && glyphs.every(isEmojiGlyph);

      if (!emojiOnly) {
        nativeFillText(text, x, y, maxWidth);
        return;
      }

      if (drawEmojiSequence(glyphs, x, y)) {
        return;
      }

      const previousFill = ctx.fillStyle;
      ctx.fillStyle = getEmojiFallbackColor(glyphs);
      nativeFillText(text, x, y, maxWidth);
      ctx.fillStyle = previousFill;
    };
  }

  function splitEmojiGraphemes(text) {
    if (emojiSegmenter) {
      return Array.from(emojiSegmenter.segment(text), (entry) => entry.segment);
    }
    return Array.from(text);
  }

  function isEmojiGlyph(segment) {
    return /[\p{Extended_Pictographic}\u200d\uFE0F]/u.test(segment);
  }

  function drawEmojiSequence(glyphs, x, y) {
    const sprites = glyphs.map(getEmojiSprite);
    if (sprites.some((sprite) => !sprite.ready)) {
      return false;
    }

    const size = getFontPixelSize(ctx.font);
    const gap = Math.max(2, size * 0.04);
    const glyphWidth = size;
    const totalWidth = glyphWidth * glyphs.length + gap * Math.max(0, glyphs.length - 1);
    let drawX = x;
    if (ctx.textAlign === "center") {
      drawX -= totalWidth / 2;
    } else if (ctx.textAlign === "right" || ctx.textAlign === "end") {
      drawX -= totalWidth;
    }

    let drawY = y;
    if (ctx.textBaseline === "middle") {
      drawY -= size / 2;
    } else if (ctx.textBaseline === "bottom" || ctx.textBaseline === "ideographic") {
      drawY -= size;
    } else if (ctx.textBaseline === "top" || ctx.textBaseline === "hanging") {
      drawY += 0;
    } else {
      drawY -= size * 0.82;
    }

    sprites.forEach((sprite, index) => {
      ctx.drawImage(sprite.img, drawX + index * (glyphWidth + gap), drawY, glyphWidth, glyphWidth);
    });

    return true;
  }

  function getEmojiSprite(emoji) {
    if (emojiSpriteCache.has(emoji)) {
      return emojiSpriteCache.get(emoji);
    }

    const sprite = {
      ready: false,
      failed: false,
      img: new Image(),
    };

    sprite.img.crossOrigin = "anonymous";
    sprite.img.decoding = "async";
    sprite.img.onload = () => {
      sprite.ready = true;
    };
    sprite.img.onerror = () => {
      sprite.failed = true;
    };
    sprite.img.src = `${emojiAssetBase}/${toEmojiAssetCode(emoji)}.png`;
    emojiSpriteCache.set(emoji, sprite);
    return sprite;
  }

  function preloadEmojiSprites(glyphs) {
    glyphs.forEach((glyph) => {
      getEmojiSprite(glyph);
    });
  }

  function collectEmojiGlyphs() {
    const glyphs = new Set([
      "🌾", "🍄", "✨", "🔋", "🕹️", "💎", "🗿", "🐋", "🕯️", "📡", "❄️",
      "🎉", "🌈", "🧊", "🪵", "🧝", "🧙",
    ]);

    flowers.forEach((item) => glyphs.add(item.emoji));
    trees.forEach((item) => glyphs.add(item.emoji));
    fish.forEach((item) => glyphs.add(item.emoji));
    cityBuildings.forEach((item) => glyphs.add(item.emoji));
    desertCacti.forEach((item) => glyphs.add(item.emoji));
    desertRocks.forEach((item) => glyphs.add(item.emoji));
    snowPines.forEach((item) => glyphs.add(item.emoji));
    vehicles.forEach((item) => glyphs.add(item.emoji));
    npcs.forEach((item) => glyphs.add(item.emoji));

    return Array.from(glyphs);
  }

  function toEmojiAssetCode(emoji) {
    const normalized = emoji.replace(/\uFE0F/g, "");
    return Array.from(normalized, (char) => char.codePointAt(0).toString(16)).join("-");
  }

  function getFontPixelSize(font) {
    const match = /(\d+(?:\.\d+)?)px/.exec(font);
    return match ? Number(match[1]) : 32;
  }

  function getEmojiFallbackColor(glyphs) {
    if (glyphs.some((glyph) => ["🌲", "🌳", "🌴", "🌵", "🎄"].includes(glyph))) {
      return "#8ff3ad";
    }
    if (glyphs.some((glyph) => ["🐟", "🐠", "🧊", "❄️", "📡", "🕯️"].includes(glyph))) {
      return "#dff9ff";
    }
    if (glyphs.some((glyph) => ["💎", "✨", "🔋", "🕹️"].includes(glyph))) {
      return "#fff1a8";
    }
    if (glyphs.some((glyph) => ["🧝", "🧙", "🦄", "🐸", "👾", "🤖", "🐈", "🕊️", "🐪", "🦂", "👻", "🐧", "🦊", "☃️"].includes(glyph))) {
      return "#fff6da";
    }
    return "#fff4dc";
  }

  function worldToScreen(x, y) {
    return { x: x - state.camera.x, y: y - state.camera.y };
  }

  function isVisible(x, y, padding) {
    return x > -padding && y > -padding && x < view.width + padding && y < view.height + padding;
  }

  function isInsideLake(x, y, scale) {
    return ellipseDistance(x, y, world.lake.x, world.lake.y, world.lake.rx * scale, world.lake.ry * scale) < 1;
  }

  function ellipseDistance(x, y, cx, cy, rx, ry) {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy;
  }

  function circleIntersectsRect(x, y, radius, rect) {
    const closestX = clamp(x, rect.x, rect.x + rect.width);
    const closestY = clamp(y, rect.y, rect.y + rect.height);
    return distance(x, y, closestX, closestY) < radius;
  }

  function getZoneAt(x, y) {
    if (x < world.zones.forest.width && y < world.zones.forest.height) {
      return world.zones.forest;
    }
    if (y < world.zones.city.height) {
      return world.zones.city;
    }
    if (x < world.zones.desert.width) {
      return world.zones.desert;
    }
    return world.zones.snow;
  }

  function pushFloatingText(text, x, y, color) {
    state.floatingTexts.push({ text, x, y, color, age: 0 });
  }

  function addDiscovery(label) {
    if (state.recentDiscoveries.includes(label)) {
      return;
    }
    state.recentDiscoveries = [label, ...state.recentDiscoveries].slice(0, 5);
  }

  function getNearest(items) {
    return items
      .slice()
      .sort((a, b) => distance(state.player.x, state.player.y, a.x, a.y) - distance(state.player.x, state.player.y, b.x, b.y))[0];
  }

  function createRoutes() {
    return [
      {
        points: [
          { x: 360, y: 690 },
          { x: 640, y: 860 },
          { x: 980, y: 1240 },
          { x: 1120, y: 1730 },
          { x: 1570, y: 1510 },
          { x: 2110, y: 1260 },
          { x: 2640, y: 1350 },
          { x: 3420, y: 2120 },
        ],
        widthOuter: 58,
        widthInner: 28,
        colorOuter: "rgba(243, 217, 153, 0.14)",
        colorInner: "rgba(103, 73, 31, 0.16)",
      },
      {
        points: [
          { x: 3420, y: 2120 },
          { x: 3980, y: 1700 },
          { x: 4460, y: 1240 },
          { x: 5210, y: 920 },
        ],
        widthOuter: 54,
        widthInner: 26,
        colorOuter: "rgba(169, 224, 246, 0.12)",
        colorInner: "rgba(79, 109, 132, 0.18)",
      },
      {
        points: [
          { x: 3420, y: 2120 },
          { x: 2680, y: 2480 },
          { x: 2220, y: 2870 },
          { x: 1760, y: 3300 },
          { x: 1320, y: 3620 },
        ],
        widthOuter: 54,
        widthInner: 26,
        colorOuter: "rgba(255, 220, 166, 0.12)",
        colorInner: "rgba(133, 86, 20, 0.18)",
      },
      {
        points: [
          { x: 3420, y: 2120 },
          { x: 4120, y: 2520 },
          { x: 4860, y: 3040 },
          { x: 5660, y: 3610 },
        ],
        widthOuter: 54,
        widthInner: 26,
        colorOuter: "rgba(245, 253, 255, 0.16)",
        colorInner: "rgba(142, 182, 204, 0.2)",
      },
    ];
  }

  function createGroundPatches() {
    const patches = [];

    for (let i = 0; i < 70; i += 1) {
      patches.push({
        x: randomRange(0, world.zones.forest.width),
        y: randomRange(0, world.zones.forest.height),
        radius: randomRange(90, 240),
        squeeze: randomRange(0.58, 1.06),
        rotation: randomRange(0, Math.PI),
        color: rng() > 0.5 ? "rgba(60, 131, 93, 0.14)" : "rgba(24, 67, 49, 0.18)",
      });
    }

    for (let i = 0; i < 44; i += 1) {
      patches.push({
        x: randomRange(world.zones.city.x, world.zones.city.x + world.zones.city.width),
        y: randomRange(world.zones.city.y, world.zones.city.y + world.zones.city.height),
        radius: randomRange(80, 210),
        squeeze: randomRange(0.6, 1.05),
        rotation: randomRange(0, Math.PI),
        color: rng() > 0.5 ? "rgba(120, 166, 186, 0.08)" : "rgba(9, 21, 31, 0.12)",
      });
    }

    for (let i = 0; i < 50; i += 1) {
      patches.push({
        x: randomRange(world.zones.desert.x, world.zones.desert.x + world.zones.desert.width),
        y: randomRange(world.zones.desert.y, world.zones.desert.y + world.zones.desert.height),
        radius: randomRange(100, 260),
        squeeze: randomRange(0.42, 0.9),
        rotation: randomRange(0, Math.PI),
        color: rng() > 0.5 ? "rgba(255, 219, 158, 0.08)" : "rgba(115, 77, 24, 0.1)",
      });
    }

    for (let i = 0; i < 56; i += 1) {
      patches.push({
        x: randomRange(world.zones.snow.x, world.zones.snow.x + world.zones.snow.width),
        y: randomRange(world.zones.snow.y, world.zones.snow.y + world.zones.snow.height),
        radius: randomRange(90, 240),
        squeeze: randomRange(0.5, 1.08),
        rotation: randomRange(0, Math.PI),
        color: rng() > 0.5 ? "rgba(255, 255, 255, 0.12)" : "rgba(136, 196, 222, 0.12)",
      });
    }

    return patches;
  }

  function createFlowers() {
    const emojis = ["🌼", "🌷", "🪻"];
    const items = [];

    for (let i = 0; i < 180; i += 1) {
      const x = randomRange(60, world.zones.forest.width - 60);
      const y = randomRange(60, world.zones.forest.height - 60);
      if (isInsideLake(x, y, 1.08) || distance(x, y, world.grove.x, world.grove.y) < world.grove.radius * 0.8 || isNearRoutes(x, y, 62)) {
        continue;
      }
      items.push({
        x,
        y,
        size: randomRange(14, 22),
        speed: randomRange(0.7, 1.8),
        phase: randomRange(0, TAU),
        emoji: emojis[Math.floor(rng() * emojis.length)],
      });
    }

    return items;
  }

  function createTrees() {
    const items = [];
    const emojis = ["🌲", "🌳", "🌴"];
    let attempts = 0;

    while (items.length < 120 && attempts < 4000) {
      attempts += 1;
      const x = randomRange(90, world.zones.forest.width - 90);
      const y = randomRange(90, world.zones.forest.height - 90);
      const radius = randomRange(28, 40);
      if (isInsideLake(x, y, 1.18)) {
        continue;
      }
      if (distance(x, y, world.spawn.x, world.spawn.y) < 150) {
        continue;
      }
      if (distance(x, y, world.grove.x, world.grove.y) < world.grove.radius + 90) {
        continue;
      }
      if (isNearRoutes(x, y, 72)) {
        continue;
      }
      items.push({
        x,
        y,
        radius,
        size: randomRange(48, 64),
        phase: randomRange(0, TAU),
        emoji: emojis[Math.floor(rng() * emojis.length)],
      });
    }

    return items;
  }

  function createReeds() {
    return Array.from({ length: 28 }, (_, index) => {
      const angle = (index / 28) * TAU;
      return {
        x: world.lake.x + Math.cos(angle) * (world.lake.rx + randomRange(12, 30)),
        y: world.lake.y + Math.sin(angle) * (world.lake.ry + randomRange(12, 34)),
        size: randomRange(22, 30),
        phase: randomRange(0, TAU),
      };
    });
  }

  function createMushrooms() {
    return Array.from({ length: 16 }, (_, index) => {
      const angle = (index / 16) * TAU;
      return {
        x: world.grove.x + Math.cos(angle) * 118,
        y: world.grove.y + Math.sin(angle) * 86,
      };
    });
  }

  function createFireflies() {
    return [
      { x: 720, y: 480, phase: 0.4, spark: 0.2, speed: 1.8, collected: false },
      { x: 1210, y: 660, phase: 1.8, spark: 0.9, speed: 2.2, collected: false },
      { x: 1450, y: 1830, phase: 2.2, spark: 1.4, speed: 1.7, collected: false },
      { x: 1980, y: 620, phase: 3.1, spark: 1.8, speed: 2.1, collected: false },
      { x: 2520, y: 1380, phase: 4.6, spark: 2.3, speed: 1.9, collected: false },
      { x: 2790, y: 520, phase: 5.4, spark: 2.9, speed: 2.4, collected: false },
    ];
  }

  function createFish() {
    return Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * TAU + randomRange(-0.3, 0.3);
      return {
        emoji: rng() > 0.5 ? "🐠" : "🐟",
        x: world.lake.x + Math.cos(angle) * world.lake.rx * randomRange(0.15, 0.7),
        y: world.lake.y + Math.sin(angle) * world.lake.ry * randomRange(0.15, 0.7),
        angle: randomRange(0, TAU),
        speed: randomRange(38, 64),
        bob: randomRange(0, TAU),
        bobSpeed: randomRange(2.2, 4.1),
        turnTimer: randomRange(0.9, 2.8),
        jumpTimer: 0,
        splashTimer: randomRange(0.5, 1.9),
      };
    });
  }

  function createCityBuildings() {
    return [
      makeBuilding(3180, 180, 290, 240, "🏢", "HOTEL GIF", "#3f5566", "#728aa0", "#8efbff", "rgba(137, 248, 255, 0.34)", { x: 3040, y: 430, width: 3500, height: 140, axis: "x" }),
      makeBuilding(3560, 130, 360, 260, "🏪", "PIXEL MART", "#344a5b", "#6b8296", "#ffcf7a", "rgba(255, 211, 120, 0.34)", { x: 3580, y: 0, width: 150, height: 1850, axis: "y" }),
      makeBuilding(4090, 180, 320, 220, "🏬", "LOOP MALL", "#3d5164", "#71889b", "#9cffdc", "rgba(156, 255, 220, 0.34)", { x: 3040, y: 430, width: 3500, height: 140, axis: "x" }),
      makeBuilding(4800, 160, 360, 230, "🏨", "GLOW INN", "#394a58", "#6e8193", "#e2a3ff", "rgba(226, 163, 255, 0.34)", { x: 4640, y: 0, width: 150, height: 1850, axis: "y" }),
      makeBuilding(5450, 150, 330, 240, "🏦", "BANK PNG", "#31444f", "#667b8f", "#9fe8ff", "rgba(159, 232, 255, 0.34)", { x: 3040, y: 430, width: 3500, height: 140, axis: "x" }),
      makeBuilding(6000, 160, 360, 250, "🏫", "FONT LAB", "#344856", "#6c8194", "#ffe38a", "rgba(255, 227, 138, 0.34)", { x: 5760, y: 0, width: 150, height: 1850, axis: "y" }),
      makeBuilding(3180, 700, 320, 260, "🏢", "CHAT HUB", "#415665", "#72899d", "#89fbff", "rgba(137, 251, 255, 0.34)", { x: 3040, y: 980, width: 3500, height: 150, axis: "x" }),
      makeBuilding(3790, 720, 350, 250, "🏤", "STAMP.EXE", "#394d5e", "#667f93", "#ffc98d", "rgba(255, 201, 141, 0.34)", { x: 3580, y: 0, width: 150, height: 1850, axis: "y" }),
      makeBuilding(4320, 760, 310, 230, "🏥", "HEAL ZIP", "#3b5260", "#70889c", "#b9f7ff", "rgba(185, 247, 255, 0.34)", { x: 4640, y: 0, width: 150, height: 1850, axis: "y" }),
      makeBuilding(5660, 730, 330, 250, "🏛️", "MEME HALL", "#314857", "#6a8398", "#f3bdff", "rgba(243, 189, 255, 0.34)", { x: 5760, y: 0, width: 150, height: 1850, axis: "y" }),
      makeBuilding(3480, 1260, 340, 260, "🏠", "LOFI BLOCK", "#425666", "#7e90a2", "#a2ffe1", "rgba(162, 255, 225, 0.34)", { x: 3040, y: 1520, width: 3500, height: 150, axis: "x" }),
      makeBuilding(5180, 1220, 380, 280, "🏙️", "LOOP TOWER", "#384b58", "#70879b", "#8efbff", "rgba(142, 251, 255, 0.34)", { x: 4640, y: 0, width: 150, height: 1850, axis: "y" }),
    ];
  }

  function makeBuilding(x, y, width, height, emoji, label, body, roof, neonOn, neonOff, roadHint) {
    return {
      x,
      y,
      width,
      height,
      emoji,
      label,
      body,
      roof,
      neonOn,
      neonOff,
      roadHint,
      phase: randomRange(0, TAU),
      emojiSize: Math.min(84, Math.max(56, height / 3)),
      collider: {
        x: x + 24,
        y: y + 44,
        width: width - 48,
        height: height - 60,
      },
    };
  }

  function createPowerCells() {
    return [
      { x: 3750, y: 605, phase: 0.2, collected: false },
      { x: 4980, y: 1360, phase: 1.4, collected: false },
      { x: 6130, y: 720, phase: 2.8, collected: false },
    ];
  }

  function createVehicles() {
    return [
      { emoji: "🚕", axis: "x", x: 3100, y: 500, min: 3060, max: 6640, dir: 1, speed: 180, size: 32, phase: 0.2 },
      { emoji: "🛵", axis: "x", x: 6560, y: 1060, min: 3060, max: 6640, dir: -1, speed: 190, size: 28, phase: 1.7 },
      { emoji: "🚗", axis: "x", x: 3300, y: 1600, min: 3060, max: 6640, dir: 1, speed: 165, size: 30, phase: 2.9 },
      { emoji: "🤖", axis: "y", x: 3650, y: 120, min: 40, max: 1820, dir: 1, speed: 150, size: 28, phase: 0.8 },
      { emoji: "🚓", axis: "y", x: 4705, y: 1760, min: 40, max: 1820, dir: -1, speed: 165, size: 30, phase: 2.1 },
      { emoji: "🚐", axis: "y", x: 5810, y: 200, min: 40, max: 1820, dir: 1, speed: 142, size: 32, phase: 1.2 },
    ];
  }

  function createDesertCacti() {
    const emojis = ["🌵", "🌴"];
    const items = [];
    let attempts = 0;

    while (items.length < 54 && attempts < 2500) {
      attempts += 1;
      const x = randomRange(80, world.zones.desert.width - 80);
      const y = randomRange(world.zones.desert.y + 100, world.zones.desert.y + world.zones.desert.height - 80);
      if (distance(x, y, world.desertObelisk.x, world.desertObelisk.y) < 180 || isNearRoutes(x, y, 76)) {
        continue;
      }
      items.push({
        x,
        y,
        radius: randomRange(24, 34),
        size: randomRange(42, 60),
        phase: randomRange(0, TAU),
        emoji: emojis[Math.floor(rng() * emojis.length)],
      });
    }

    return items;
  }

  function createDesertRocks() {
    const items = [];
    let attempts = 0;

    while (items.length < 26 && attempts < 1200) {
      attempts += 1;
      const x = randomRange(60, world.zones.desert.width - 60);
      const y = randomRange(world.zones.desert.y + 90, world.zones.desert.y + world.zones.desert.height - 60);
      if (distance(x, y, world.desertObelisk.x, world.desertObelisk.y) < 180 || isNearRoutes(x, y, 66)) {
        continue;
      }
      items.push({
        x,
        y,
        radius: randomRange(18, 28),
        size: randomRange(28, 40),
        emoji: rng() > 0.5 ? "🪨" : "🦴",
      });
    }
    return items;
  }

  function createSunShards() {
    return [
      { x: 680, y: 2800, phase: 0.6, collected: false },
      { x: 2420, y: 3240, phase: 1.7, collected: false },
      { x: 2740, y: 4140, phase: 2.8, collected: false },
    ];
  }

  function createTumbleweeds() {
    return Array.from({ length: 8 }, (_, index) => ({
      x: randomRange(60, world.zones.desert.width),
      y: randomRange(world.zones.desert.y + 140, world.zones.desert.y + world.zones.desert.height - 120),
      speed: randomRange(70, 120),
      spin: randomRange(0, TAU),
      spinSpeed: randomRange(1.8, 4.4),
      swing: randomRange(6, 14),
      wave: randomRange(0.7, 1.9),
      phase: index,
    }));
  }

  function createSnowPines() {
    const items = [];
    let attempts = 0;

    while (items.length < 70 && attempts < 3200) {
      attempts += 1;
      const x = randomRange(world.zones.snow.x + 90, world.zones.snow.x + world.zones.snow.width - 90);
      const y = randomRange(world.zones.snow.y + 90, world.zones.snow.y + world.zones.snow.height - 90);
      if (distance(x, y, world.snowShrine.x, world.snowShrine.y) < 170 || isNearRoutes(x, y, 80)) {
        continue;
      }
      items.push({
        x,
        y,
        radius: randomRange(24, 36),
        size: randomRange(40, 58),
        phase: randomRange(0, TAU),
        emoji: rng() > 0.5 ? "🌲" : "🎄",
      });
    }

    return items;
  }

  function createIceChunks() {
    const items = [];
    let attempts = 0;

    while (items.length < 22 && attempts < 1600) {
      attempts += 1;
      const x = randomRange(world.zones.snow.x + 60, world.zones.snow.x + world.zones.snow.width - 60);
      const y = randomRange(world.zones.snow.y + 60, world.zones.snow.y + world.zones.snow.height - 60);
      if (distance(x, y, world.snowShrine.x, world.snowShrine.y) < 190 || isNearRoutes(x, y, 70)) {
        continue;
      }
      items.push({
        x,
        y,
        radius: randomRange(18, 26),
        size: randomRange(26, 40),
      });
    }

    return items;
  }

  function createSnowBeacons() {
    return [
      { x: 4340, y: 2720, lit: false, phase: 0.4 },
      { x: 6320, y: 2600, lit: false, phase: 1.6 },
      { x: 4520, y: 4090, lit: false, phase: 2.7 },
      { x: 6400, y: 3980, lit: false, phase: 3.8 },
    ];
  }

  function createSnowflakes() {
    return Array.from({ length: 110 }, () => ({
      x: randomRange(0, Math.max(1, view.width)),
      y: randomRange(0, Math.max(1, view.height)),
      radius: randomRange(1, 3.3),
      speed: randomRange(20, 70),
      drift: randomRange(10, 46),
      swing: randomRange(0.6, 2.2),
      phase: randomRange(0, TAU),
      alpha: randomRange(0.18, 0.72),
    }));
  }

  function enrichNpc(npc) {
    const profiles = {
      "unicorno": {
        role: "Scintilla del sottobosco",
        introText: "Non correre troppo. In questa foresta le luci premiano chi osserva i bordi dell'acqua e i sentieri larghi.",
      },
      "rana poeta": {
        role: "Custode della radura",
        guide: true,
        sigilName: "Laguna",
        sigilGate: "lake",
        sigilColor: "#d8f7ff",
        introText: "Ogni onda scrive una strofa. Se ascolti bene, il bosco ti dice sempre dove manca ancora una luce.",
      },
      "insetto arcade": {
        role: "Ricetrasmittente glitch",
        introText: "Io sento i passaggi tra i biomi prima che si aprano. Quando il lago canta, il neon della citta si accende.",
      },
      "custode patch": {
        role: "Custode del neon",
        guide: true,
        sigilName: "Neon",
        sigilGate: "arcade",
        sigilColor: "#aefcff",
        introText: "La citta non ha bisogno di ordine, ha bisogno di energia. Ogni batteria rimette in fase un pezzo di strada.",
      },
      "gatto streamer": {
        role: "Cronista del traffico",
        introText: "Io racconto tutto in diretta. Se vuoi views, segui i punti luminosi ai margini dei grandi isolati.",
      },
      "piccione manager": {
        role: "Direttore dei percorsi",
        introText: "I biomi sembrano lontani solo finche' non impari a leggerli come una mappa di consegne.",
      },
      "cammello turbo": {
        role: "Scout delle dune",
        introText: "Nel deserto non conta il passo piu veloce, conta il passo che non si perde tra le dune gemelle.",
      },
      "scorpione dj": {
        role: "Custode della sabbia",
        guide: true,
        sigilName: "Sabbia",
        sigilGate: "obelisk",
        sigilColor: "#ffd18d",
        introText: "Ogni frammento solare ha il suo ritmo. Se ne manca uno, l'obelisco resta fuori tempo.",
      },
      "miraggio": {
        role: "Archivio del caldo",
        introText: "Io compaio dove l'orizzonte si piega. Di solito li vicino c'e' sempre qualcosa che merita una deviazione.",
      },
      "pinguino postino": {
        role: "Custode dell'aurora",
        guide: true,
        sigilName: "Aurora",
        sigilGate: "aurora",
        sigilColor: "#e9f7ff",
        introText: "Consegno messaggi solo se il ghiaccio li approva. Le torri parlano tra loro prima ancora di accendersi.",
      },
      "volpe di ghiaccio": {
        role: "Esploratrice della tundra",
        introText: "Le torri sembrano sparse a caso, ma in realta' disegnano un anello che punta sempre al santuario.",
      },
      "pupazzo filosofo": {
        role: "Memo del cielo",
        introText: "I fiocchi non cadono: prendono nota. Se il santuario si apre, tutta la mappa cambia tono.",
      },
    };

    const profile = profiles[npc.shortTag] || {};
    return {
      ...npc,
      key: npc.shortTag,
      role: profile.role || "Viandante del bioma",
      guide: Boolean(profile.guide),
      sigilName: profile.sigilName || "",
      sigilGate: profile.sigilGate || "",
      sigilColor: profile.sigilColor || "#fff3bf",
      introText: profile.introText || npc.dialogues[0],
      metCount: 0,
      sigilGranted: false,
    };
  }

  function createNpcs() {
    return [
      makeNpc("🦄", "Unicorno fosforescente", "forest", 700, 1100, 170, "unicorno", [
        "Dice che il lago ricorda un monitor liquido.",
        "Vuole le lucciole per una corona da speedrun.",
      ]),
      makeNpc("🐸", "Rana poeta", "forest", 1840, 560, 120, "rana poeta", [
        "Ogni increspatura e' una rima.",
        "Scrive haiku dentro le ninfee.",
      ]),
      makeNpc("👾", "Insetto arcade", "forest", 930, 430, 110, "insetto arcade", [
        "Sente il richiamo della citta neon.",
        "Vibra quando un percorso segreto si apre.",
      ]),
      makeNpc("🤖", "Custode patch", "city", 3540, 1160, 180, "custode patch", [
        "Le batterie sono finite in angoli molto meme.",
        "Promette neon piu veloci appena l'arcade riparte.",
      ]),
      makeNpc("🐈", "Gatto streamer", "city", 6110, 1080, 160, "gatto streamer", [
        "Sta streammando le auto che girano in loop.",
        "Dice che i frammenti solari fanno views.",
      ]),
      makeNpc("🕊️", "Piccione manager", "city", 5040, 600, 150, "piccione manager", [
        "Firma tutto con il becco.",
        "Non consegna lettere: consegna side quest.",
      ]),
      makeNpc("🐪", "Cammello turbo", "desert", 840, 3040, 180, "cammello turbo", [
        "Corre meglio quando il sole glitcha.",
        "Conosce dune che sembrano scorciatoie ma non lo sono.",
      ]),
      makeNpc("🦂", "Scorpione DJ", "desert", 2460, 3640, 180, "scorpione dj", [
        "Suona trap con i sassolini.",
        "Aspetta l'obelisco per un drop di sabbia.",
      ]),
      makeNpc("👻", "Miraggio", "desert", 1660, 4270, 150, "miraggio", [
        "Appare solo a chi cammina tanto.",
        "Dice che la neve si sente da qui.",
      ]),
      makeNpc("🐧", "Pinguino postino", "snow", 4560, 2960, 170, "pinguino postino", [
        "Consegna messaggi congelati.",
        "Vuole accendere tutte le torri prima di pranzo.",
      ]),
      makeNpc("🦊", "Volpe di ghiaccio", "snow", 6240, 3520, 160, "volpe di ghiaccio", [
        "Corre sotto l'aurora come fosse una strada.",
        "Sostiene che la piazza finale sia solo l'inizio.",
      ]),
      makeNpc("☃️", "Pupazzo filosofo", "snow", 5400, 4170, 160, "pupazzo filosofo", [
        "Pensa lentamente ma sa tutto del cielo.",
        "Conta i fiocchi invece delle ore.",
      ]),
    ];
  }

  function makeNpc(emoji, name, biome, x, y, roam, shortTag, dialogues) {
    const zone = world.zones[biome];
    return {
      emoji,
      name,
      biome,
      x,
      y,
      homeX: x,
      homeY: y,
      roam,
      speed: randomRange(26, 46),
      bobSpeed: randomRange(3.1, 4.7),
      bob: randomRange(0, TAU),
      targetX: x,
      targetY: y,
      targetTimer: randomRange(2.4, 5.2),
      facing: 1,
      chat: "",
      chatTimer: 0,
      dialogues,
      shortTag,
      bounds: {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
      },
    };
  }

  function isNearRoutes(x, y, padding) {
    return routes.some((route) => {
      for (let i = 0; i < route.points.length - 1; i += 1) {
        const a = route.points[i];
        const b = route.points[i + 1];
        if (distanceToSegment(x, y, a.x, a.y, b.x, b.y) < padding) {
          return true;
        }
      }
      return false;
    });
  }

  function distanceToSegment(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const abLenSq = abx * abx + aby * aby || 1;
    const t = clamp(((px - ax) * abx + (py - ay) * aby) / abLenSq, 0, 1);
    const closestX = ax + abx * t;
    const closestY = ay + aby * t;
    return distance(px, py, closestX, closestY);
  }

  function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  function randomRange(min, max) {
    return min + rng() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mulberry32(seed) {
    return function () {
      let t = seed += 0x6d2b79f5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}());
