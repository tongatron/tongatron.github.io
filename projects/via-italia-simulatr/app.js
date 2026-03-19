const fallbackRoute = [
  [45.564019, 8.0574734],
  [45.5641558, 8.0573441],
  [45.5641919, 8.0573045],
  [45.5644217, 8.0570029],
  [45.5646465, 8.0566332],
  [45.5646699, 8.0565981],
  [45.5650643, 8.0560134],
  [45.5656769, 8.0552162],
  [45.5657326, 8.0551438],
  [45.5657658, 8.0550989],
  [45.5658878, 8.0549339],
  [45.5659393, 8.0549002],
  [45.5661252, 8.0547953],
  [45.5664251, 8.0545863],
  [45.5665606, 8.0544915],
  [45.5669444, 8.0542647],
  [45.5669977, 8.0542065],
  [45.5670413, 8.0541482],
  [45.5673919, 8.0539688],
  [45.5677681, 8.0537892],
  [45.5678106, 8.0537744]
];

const scenicSpots = [
  {
    index: 0,
    title: "Ingresso al Piazzo",
    copy:
      "Il gioco parte sul tratto alto di Via Italia: pavimentazione in pietra, respiro lento e la sensazione di entrare in un racconto."
  },
  {
    index: 4,
    title: "Sotto i portici",
    copy:
      "Le facciate si stringono, la via prende ritmo e ogni passo sembra convocare un frammento diverso della memoria biellese."
  },
  {
    index: 9,
    title: "Nodo delle idee",
    copy:
      "Qui il percorso si apre abbastanza da far convivere politica, commercio, arte e una certa ostinazione piemontese."
  },
  {
    index: 14,
    title: "Punto di incontro",
    copy:
      "Sei nel cuore della passeggiata: la mappa guida il corpo, ma le scelte nei dialoghi cominciano a definire il tono della tua citta."
  },
  {
    index: 19,
    title: "Ultimo tratto",
    copy:
      "La salita rallenta, la vista si allarga e la passeggiata e pronta a restituirti una Biella filtrata dalle tue risposte."
  }
];

const characters = [
  {
    id: "ferrero",
    emoji: "🏛️",
    name: "Sebastiano Ferrero",
    role: "Uomo di stato e mecenate",
    index: 3,
    intro:
      "Una figura rinascimentale ti intercetta all'angolo. Parla di cortili, potere e citta che devono saper mettere in scena se stesse.",
    prompt: "Se dovessi riattivare un palazzo storico lungo la via, da dove partiresti?",
    options: [
      {
        label: "Aprire il cortile al quartiere",
        detail: "Spazi civici, mostre, incontri pubblici.",
        effect: { civismo: 2, cultura: 1 },
        result:
          "Ferrero approva: un edificio vive davvero quando smette di essere cornice e torna a essere piazza."
      },
      {
        label: "Riportare botteghe e artigiani",
        detail: "Piccole economie radicate nella strada.",
        effect: { intraprendenza: 2, cultura: 1 },
        result:
          "Ferrero sorride: il prestigio, dice, non sta solo nello stemma ma nel lavoro che torna visibile."
      },
      {
        label: "Restaurare tutto e basta",
        detail: "Bellezza impeccabile, ma senza nuovo uso.",
        effect: { cultura: 1 },
        result:
          "Ti ferma subito: il restauro da solo non basta, serve un motivo per cui la gente voglia restare."
      }
    ]
  },
  {
    id: "sella",
    emoji: "⛰️",
    name: "Quintino Sella",
    role: "Politico, tecnico, alpinista",
    index: 7,
    intro:
      "Lo riconosci dal tono netto: disciplina, infrastrutture e una fiducia severa nella competenza pubblica.",
    prompt: "Via Italia ha bisogno di un progetto urgente. Quale scegli?",
    options: [
      {
        label: "Mobilita dolce e accessibile",
        detail: "Piu spazio a pedoni, sedute, percorsi chiari.",
        effect: { civismo: 2, cultura: 1 },
        result:
          "Sella annuisce: una citta ordinata non e rigida, e leggibile e permette a tutti di attraversarla bene."
      },
      {
        label: "Laboratori per imprese locali",
        detail: "Innovazione piccola ma concreta.",
        effect: { intraprendenza: 2, civismo: 1 },
        result:
          "Apprezza il pragmatismo: sviluppo e responsabilita, dice, devono salire insieme."
      },
      {
        label: "Un grande monumento celebrativo",
        detail: "Impatto simbolico, poco uso quotidiano.",
        effect: { cultura: 1 },
        result:
          "Ti avverte che la retorica da sola non tiene in piedi una strada. Servono funzioni, non solo facciate."
      }
    ]
  },
  {
    id: "pistoletto",
    emoji: "🎨",
    name: "Michelangelo Pistoletto",
    role: "Artista",
    index: 11,
    intro:
      "Ti compare accanto come se fosse sempre stato li. Riflessi, partecipazione e arte come motore sociale: il tono cambia subito.",
    prompt: "Come porteresti arte contemporanea su Via Italia senza farla sembrare decorazione?",
    options: [
      {
        label: "Opere create con chi abita la via",
        detail: "Processi collettivi prima dell'oggetto finale.",
        effect: { cultura: 2, civismo: 1 },
        result:
          "Pistoletto apprezza: l'opera migliore e quella che trasforma le relazioni prima ancora dello spazio."
      },
      {
        label: "Installazioni temporanee in vetrina",
        detail: "Un invito rapido a fermarsi.",
        effect: { cultura: 2, intraprendenza: 1 },
        result:
          "Funziona, dice, se ogni vetrina smette di essere solo commercio e diventa una domanda aperta."
      },
      {
        label: "Una scultura isolata al centro",
        detail: "Oggetto forte ma poco dialogico.",
        effect: { cultura: 1 },
        result:
          "Ti ricorda che l'arte pubblica non deve solo occupare spazio: deve rimettere in moto sguardi e conversazioni."
      }
    ]
  },
  {
    id: "zegna",
    emoji: "🧵",
    name: "Ermenegildo Zegna",
    role: "Imprenditore",
    index: 15,
    intro:
      "Misura la strada come si misura un tessuto: flusso, consistenza, cura del dettaglio e visione lunga.",
    prompt: "Se Via Italia fosse un laboratorio economico, cosa lanceresti per prima?",
    options: [
      {
        label: "Botteghe condivise per giovani marchi",
        detail: "Affitti leggeri, produzione visibile.",
        effect: { intraprendenza: 2, cultura: 1 },
        result:
          "Zegna approva: la qualita nasce quando il talento trova infrastrutture e una strada in cui esporsi."
      },
      {
        label: "Filiera locale raccontata al pubblico",
        detail: "Trasparenza, materiali, storie.",
        effect: { intraprendenza: 1, cultura: 1, civismo: 1 },
        result:
          "Ti dice che il lusso vero, qui, e far capire quante mani e quante competenze stanno dietro ogni cosa."
      },
      {
        label: "Solo eventi lampo molto fotografabili",
        detail: "Rumore iniziale, poca continuita.",
        effect: { intraprendenza: 1 },
        result:
          "Non lo boccia, ma ti chiede dove resti il valore quando le luci si spengono."
      }
    ]
  },
  {
    id: "ada",
    emoji: "📚",
    name: "Ada B., libraia immaginaria",
    role: "Voce quotidiana della via",
    index: 19,
    intro:
      "Non ha statue ne manuali di storia dedicati, ma conosce la temperatura vera della strada: chi passa, chi si ferma, chi torna.",
    prompt: "Qual e il segnale piu affidabile che una via sta davvero bene?",
    options: [
      {
        label: "Persone diverse che restano volentieri",
        detail: "Bambini, anziani, studenti, visitatori.",
        effect: { civismo: 2, cultura: 1 },
        result:
          "Ada chiude il libro e annuisce: una strada sana non espelle, mette insieme ritmi diversi senza forzarli."
      },
      {
        label: "Negozi che collaborano tra loro",
        detail: "Non solo competizione, ma alleanze.",
        effect: { intraprendenza: 2, civismo: 1 },
        result:
          "Sorride: quando i commercianti si parlano davvero, la via smette di essere una somma di vetrine."
      },
      {
        label: "Molto movimento, anche se superficiale",
        detail: "Conta soprattutto il volume di passaggio.",
        effect: { intraprendenza: 1 },
        result:
          "Ti lascia un dubbio secco: il traffico non equivale alla vita, a volte la nasconde soltanto."
      }
    ]
  }
];

const barMagnino = {
  name: "Bar Magnino",
  address: "Via Italia 21",
  emoji: "☕",
  coordinate: [45.5657926, 8.0548834],
  blurb:
    "Sei davanti al Bar Magnino. Entra e trovi i personaggi gia incontrati lungo la via insieme ai clienti abituali del locale."
};

const barRegulars = [
  {
    emoji: "🧣",
    name: "Teresa",
    role: "cliente del primo espresso",
    line: "Tiene il cappotto sulle spalle e commenta ogni novita della via come fosse un bollettino del quartiere."
  },
  {
    emoji: "🎓",
    name: "Nico",
    role: "studente in pausa lunga",
    line: "Ha il quaderno aperto sul tavolo e usa il rumore del bar come colonna sonora per studiare."
  },
  {
    emoji: "📷",
    name: "Lia",
    role: "visitatrice curiosa",
    line: "Fotografa bicchieri, insegna e portici: dice che Biella rende bene quando sembra vissuta davvero."
  },
  {
    emoji: "🧶",
    name: "Bruno",
    role: "cliente del bancone",
    line: "Parla di tessuti e ordini piccoli, convinto che una citta si capisca meglio davanti a un caffe."
  }
];

const barCharacterLines = {
  ferrero:
    "Si siede come se il tavolino fosse una piccola sala di rappresentanza e studia ogni cornice della stanza.",
  sella:
    "Ha gia spostato mentalmente sedie e tavolini per rendere il flusso del locale piu efficiente.",
  pistoletto:
    "Guarda il riflesso delle tazzine e trasforma il bancone in una piccola installazione partecipata.",
  zegna:
    "Sfiora tende e tappezzerie come fossero campioni di tessuto e parla di qualita senza alzare la voce.",
  ada:
    "Ha lasciato un libro aperto accanto allo zucchero e ascolta tutti con l'aria di chi conosce gia il finale."
};

const state = {
  map: null,
  route: [...fallbackRoute],
  playerIndex: 0,
  isMoving: false,
  isBarOpen: false,
  visited: new Set(),
  activeDialogue: null,
  lastOutcome: "",
  routeLine: null,
  playerMarker: null,
  barMarker: null,
  finishMarker: null,
  npcMarkers: new Map()
};

const elements = {
  locationTitle: document.querySelector("#location-title"),
  locationCopy: document.querySelector("#location-copy"),
  progressStep: document.querySelector("#progress-step"),
  progressFill: document.querySelector("#progress-fill"),
  castList: document.querySelector("#cast-list"),
  encounterCounter: document.querySelector("#encounter-counter"),
  dialoguePanel: document.querySelector("#dialogue-panel"),
  dialogueAvatar: document.querySelector("#dialogue-avatar"),
  dialogueRole: document.querySelector("#dialogue-role"),
  dialogueName: document.querySelector("#dialogue-name"),
  dialogueText: document.querySelector("#dialogue-text"),
  dialogueOptions: document.querySelector("#dialogue-options"),
  dialogueContinue: document.querySelector("#dialogue-continue"),
  endingPanel: document.querySelector("#ending-panel"),
  endingTitle: document.querySelector("#ending-title"),
  endingCopy: document.querySelector("#ending-copy"),
  stepBack: document.querySelector("#step-back"),
  stepForward: document.querySelector("#step-forward"),
  stepBackMobile: document.querySelector("#step-back-mobile"),
  stepForwardMobile: document.querySelector("#step-forward-mobile"),
  restartGame: document.querySelector("#restart-game"),
  barEntry: document.querySelector("#bar-entry"),
  enterBar: document.querySelector("#enter-bar"),
  barScene: document.querySelector("#bar-scene"),
  barStageVisitors: document.querySelector("#bar-stage-visitors"),
  barMetCharacters: document.querySelector("#bar-met-characters"),
  barRegulars: document.querySelector("#bar-regulars"),
  leaveBar: document.querySelector("#leave-bar")
};

function createMap() {
  state.map = L.map("map", {
    zoomControl: false,
    scrollWheelZoom: true,
    worldCopyJump: false,
    maxBoundsViscosity: 1,
    center: fallbackRoute[0],
    zoom: 16
  });

  L.control
    .zoom({
      position: "bottomright"
    })
    .addTo(state.map);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(state.map);

  drawRoute();
}

function drawRoute() {
  if (state.routeLine) {
    state.routeLine.remove();
  }

  if (state.playerMarker) {
    state.playerMarker.remove();
  }

  if (state.barMarker) {
    state.barMarker.remove();
  }

  if (state.finishMarker) {
    state.finishMarker.remove();
  }

  state.routeLine = L.polyline(state.route, {
    color: "#b4583d",
    weight: 8,
    opacity: 0.9,
    lineCap: "round"
  }).addTo(state.map);

  state.playerMarker = L.marker(state.route[state.playerIndex], {
    icon: buildPlayerIcon()
  }).addTo(state.map);

  state.barMarker = L.marker(state.route[getBarIndex()], {
    icon: buildBarIcon()
  }).addTo(state.map);
  state.barMarker.bindTooltip(`${barMagnino.name} • ${barMagnino.address}`, {
    direction: "top",
    offset: [0, -12]
  });
  state.barMarker.on("click", async () => {
    if (state.isMoving || state.activeDialogue || state.isBarOpen) {
      return;
    }

    if (!isAtBar()) {
      await travelPlayerTo(getBarIndex(), {
        animate: false
      });
    }

    if (canEnterBar()) {
      openBarScene();
    }
  });

  state.finishMarker = L.marker(state.route[state.route.length - 1], {
    icon: L.divIcon({
      className: "",
      html: '<div class="terminal-pin" aria-hidden="true"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    })
  }).addTo(state.map);

  state.map.fitBounds(state.routeLine.getBounds(), {
    padding: [36, 36],
    maxZoom: 18
  });
  state.map.setMaxBounds(state.routeLine.getBounds().pad(1.2));

  drawNpcMarkers();
  bringGameplayLayersToFront();
}

function buildPlayerIcon() {
  const walkingClass = state.isMoving ? " player-pin--walking" : "";

  return L.divIcon({
    className: "",
    html: `
      <div class="player-pin${walkingClass}" aria-hidden="true">
        <span class="player-pin__emoji">😎</span>
        <span class="player-pin__label">TU</span>
      </div>
    `,
    iconSize: [56, 64],
    iconAnchor: [28, 58]
  });
}

function buildBarIcon() {
  const activeClass = isAtBar() ? " bar-pin--active" : "";

  return L.divIcon({
    className: "",
    html: `<div class="bar-pin${activeClass}" aria-hidden="true">${barMagnino.emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

function refreshPlayerMarkerIcon() {
  if (!state.playerMarker) {
    return;
  }

  state.playerMarker.setIcon(buildPlayerIcon());
  state.playerMarker.setZIndexOffset(1200);
}

function refreshBarMarkerIcon() {
  if (!state.barMarker) {
    return;
  }

  state.barMarker.setIcon(buildBarIcon());
  state.barMarker.setZIndexOffset(1050);
}

function drawNpcMarkers() {
  for (const marker of state.npcMarkers.values()) {
    marker.remove();
  }

  state.npcMarkers.clear();

  characters.forEach((character) => {
    const marker = L.marker(state.route[getCharacterIndex(character)], {
      icon: buildNpcIcon(character)
    }).addTo(state.map);

    marker.bindTooltip(character.name, {
      direction: "top",
      offset: [0, -12]
    });

    state.npcMarkers.set(character.id, marker);
  });
}

function getCharacterIndex(character) {
  const routeSpan = state.route.length - 1;
  const fallbackSpan = fallbackRoute.length - 1;
  const scaledIndex = Math.round((character.index / fallbackSpan) * routeSpan);

  return Math.min(Math.max(scaledIndex, 0), routeSpan);
}

function getScaledIndex(index) {
  const routeSpan = state.route.length - 1;
  const fallbackSpan = fallbackRoute.length - 1;
  const scaledIndex = Math.round((index / fallbackSpan) * routeSpan);

  return Math.min(Math.max(scaledIndex, 0), routeSpan);
}

function findNearestRouteIndex(targetPoint) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  state.route.forEach((point, index) => {
    const distance =
      (point[0] - targetPoint[0]) ** 2 + (point[1] - targetPoint[1]) ** 2;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function getBarIndex() {
  return findNearestRouteIndex(barMagnino.coordinate);
}

function isAtBar() {
  return state.playerIndex === getBarIndex();
}

function canEnterBar() {
  return isAtBar() && !state.activeDialogue && !state.isMoving;
}

function buildNpcIcon(character) {
  const visitedClass = state.visited.has(character.id) ? " npc-pin--visited" : "";

  return L.divIcon({
    className: "",
    html: `<div class="npc-pin${visitedClass}" aria-hidden="true">${character.emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

function updateNpcMarkers() {
  characters.forEach((character) => {
    const marker = state.npcMarkers.get(character.id);

    if (marker) {
      marker.setIcon(buildNpcIcon(character));
    }
  });
}

function bringGameplayLayersToFront() {
  if (state.routeLine) {
    state.routeLine.bringToFront();
  }

  if (state.playerMarker) {
    state.playerMarker.setZIndexOffset(1200);
  }

  if (state.barMarker) {
    state.barMarker.setZIndexOffset(1050);
  }

  if (state.finishMarker) {
    state.finishMarker.setZIndexOffset(900);
  }

  state.npcMarkers.forEach((marker) => {
    marker.setZIndexOffset(1000);
  });
}

function findScenicSpot(index) {
  let current = scenicSpots[0];

  scenicSpots.forEach((spot) => {
    if (index >= getScaledIndex(spot.index)) {
      current = spot;
    }
  });

  return current;
}

function updateStatus() {
  const scenicSpot = findScenicSpot(state.playerIndex);
  const atBar = isAtBar();

  elements.locationTitle.textContent = atBar
    ? `${barMagnino.name}, ${barMagnino.address}`
    : scenicSpot.title;
  elements.locationCopy.textContent = atBar ? barMagnino.blurb : scenicSpot.copy;
  elements.progressStep.textContent = `Tappa ${state.playerIndex + 1} / ${state.route.length}`;
  elements.progressFill.style.width = `${(state.playerIndex / (state.route.length - 1)) * 100}%`;
  elements.encounterCounter.textContent = `${state.visited.size} / ${characters.length}`;

  elements.stepBack.disabled =
    state.playerIndex === 0 || Boolean(state.activeDialogue) || state.isMoving || state.isBarOpen;
  elements.stepForward.disabled =
    state.playerIndex === state.route.length - 1 ||
    Boolean(state.activeDialogue) ||
    state.isMoving ||
    state.isBarOpen;
  elements.stepBackMobile.disabled = elements.stepBack.disabled;
  elements.stepForwardMobile.disabled = elements.stepForward.disabled;
}

function renderCast() {
  const activeId = state.activeDialogue ? state.activeDialogue.character.id : null;
  const interactionLocked = Boolean(activeId) || state.isMoving || state.isBarOpen;

  elements.castList.innerHTML = characters
    .map((character) => {
      const travelIndex = getCharacterIndex(character);
      const stateClass = state.visited.has(character.id)
        ? "cast-state cast-state--done"
        : activeId === character.id
          ? "cast-state cast-state--active"
          : "cast-state cast-state--waiting";

      const stateLabel = state.visited.has(character.id)
        ? "Incontrato"
        : activeId === character.id
          ? "Qui ora"
          : `Tappa ${travelIndex + 1}`;

      const jumpLabel = activeId === character.id
        ? "Dialogo aperto"
        : state.playerIndex === travelIndex
          ? "Sei gia qui"
          : "Vai a questa tappa";

      return `
        <li>
          <button
              class="cast-item"
              type="button"
              data-character-id="${character.id}"
              ${interactionLocked ? "disabled" : ""}
            >
          <div class="cast-avatar">${character.emoji}</div>
          <div class="cast-meta">
            <p class="cast-name">${character.name}</p>
            <p class="cast-role">${character.role}</p>
            <span class="cast-jump">${jumpLabel}</span>
          </div>
          <span class="${stateClass}">${stateLabel}</span>
          </button>
        </li>
      `;
    })
    .join("");
}

function renderDialogue() {
  if (!state.activeDialogue) {
    elements.dialoguePanel.classList.add("is-hidden");
    return;
  }

  const { character, selectedOption } = state.activeDialogue;
  elements.dialoguePanel.classList.remove("is-hidden");
  elements.dialogueAvatar.textContent = character.emoji;
  elements.dialogueRole.textContent = character.role;
  elements.dialogueName.textContent = character.name;

  if (selectedOption === null) {
    elements.dialogueText.textContent = `${character.intro} ${character.prompt}`;
    elements.dialogueOptions.innerHTML = character.options
      .map(
        (option, optionIndex) => `
          <button class="dialogue-option" type="button" data-option-index="${optionIndex}">
            <strong>${option.label}</strong>
            <span>${option.detail}</span>
          </button>
        `
      )
      .join("");
    elements.dialogueContinue.classList.add("is-hidden");
  } else {
    elements.dialogueText.textContent = state.lastOutcome;
    elements.dialogueOptions.innerHTML = "";
    elements.dialogueContinue.classList.remove("is-hidden");
  }
}

function getEncounteredBarGuests() {
  return characters
    .filter((character) => state.visited.has(character.id))
    .map((character) => ({
      emoji: character.emoji,
      name: character.name,
      role: character.role,
      line: barCharacterLines[character.id]
    }));
}

function renderBarEntry() {
  elements.barEntry.classList.toggle("is-hidden", !canEnterBar() || state.isBarOpen);
}

function renderBarScene() {
  document.body.classList.toggle("scene-open", state.isBarOpen);

  if (!state.isBarOpen) {
    elements.barScene.classList.add("is-hidden");
    return;
  }

  const encounteredGuests = getEncounteredBarGuests();
  const stageGuests = [...encounteredGuests, ...barRegulars];

  elements.barStageVisitors.innerHTML = stageGuests
    .map(
      (guest) => `
        <div class="bar-stage__guest">
          <span class="bar-stage__guest-emoji">${guest.emoji}</span>
          <span class="bar-stage__guest-name">${guest.name}</span>
        </div>
      `
    )
    .join("");

  elements.barMetCharacters.innerHTML = encounteredGuests.length
    ? encounteredGuests
      .map(
        (guest) => `
          <article class="bar-guest-card">
            <div class="bar-guest-card__avatar">${guest.emoji}</div>
            <div>
              <p class="bar-guest-card__name">${guest.name}</p>
              <p class="bar-guest-card__role">${guest.role}</p>
              <p class="bar-guest-card__line">${guest.line}</p>
            </div>
          </article>
        `
      )
      .join("")
    : `
        <div class="bar-empty">
          Per ora al Magnino trovi solo gli avventori abituali. Continua la passeggiata e torna qui dopo qualche incontro.
        </div>
      `;

  elements.barRegulars.innerHTML = barRegulars
    .map(
      (guest) => `
        <article class="bar-guest-card bar-guest-card--regular">
          <div class="bar-guest-card__avatar">${guest.emoji}</div>
          <div>
            <p class="bar-guest-card__name">${guest.name}</p>
            <p class="bar-guest-card__role">${guest.role}</p>
            <p class="bar-guest-card__line">${guest.line}</p>
          </div>
        </article>
      `
    )
    .join("");

  elements.barScene.classList.remove("is-hidden");
}

function renderEnding() {
  const completed = state.visited.size === characters.length;

  if (!completed) {
    elements.endingPanel.classList.add("is-hidden");
    return;
  }

  elements.endingTitle.textContent = "Hai incontrato tutti lungo Via Italia";
  elements.endingCopy.textContent =
    "Puoi continuare a muoverti sulla via oppure cliccare di nuovo i nomi per tornare subito ai personaggi.";
  elements.endingPanel.classList.remove("is-hidden");
}

function render() {
  updateStatus();
  renderCast();
  renderDialogue();
  renderBarEntry();
  renderBarScene();
  renderEnding();
  updateNpcMarkers();
  refreshBarMarkerIcon();
}

function revealDialogue() {
  if (elements.dialoguePanel.classList.contains("is-hidden")) {
    return;
  }

  elements.dialoguePanel.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
  elements.dialoguePanel.focus({
    preventScroll: true
  });
}

function revealBarScene() {
  if (elements.barScene.classList.contains("is-hidden")) {
    return;
  }

  elements.barScene.focus({
    preventScroll: true
  });
}

function openBarScene() {
  if (!canEnterBar() || state.isBarOpen) {
    return;
  }

  state.isBarOpen = true;
  render();
  window.requestAnimationFrame(revealBarScene);
}

function closeBarScene() {
  if (!state.isBarOpen) {
    return;
  }

  state.isBarOpen = false;
  render();
  window.requestAnimationFrame(() => {
    elements.enterBar.focus({
      preventScroll: true
    });
  });
}

function panToPlayer() {
  state.playerMarker.setLatLng(state.route[state.playerIndex]);
  state.map.panTo(state.route[state.playerIndex], {
    animate: true,
    duration: 0.6
  });
}

function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3;
}

function interpolatePoint(startPoint, endPoint, progress) {
  return [
    startPoint[0] + (endPoint[0] - startPoint[0]) * progress,
    startPoint[1] + (endPoint[1] - startPoint[1]) * progress
  ];
}

function animateMarkerBetween(startPoint, endPoint, duration) {
  return new Promise((resolve) => {
    const startTime = window.performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(rawProgress);

      state.playerMarker.setLatLng(interpolatePoint(startPoint, endPoint, easedProgress));

      if (rawProgress < 1) {
        window.requestAnimationFrame(step);
        return;
      }

      resolve();
    }

    window.requestAnimationFrame(step);
  });
}

async function travelPlayerTo(nextIndex, { animate = true } = {}) {
  const startIndex = state.playerIndex;

  if (nextIndex === startIndex) {
    return;
  }

  const startPoint = state.route[startIndex];
  const endPoint = state.route[nextIndex];

  state.isMoving = true;
  refreshPlayerMarkerIcon();
  render();

  state.map.panTo(endPoint, {
    animate: true,
    duration: animate ? 0.45 : 0.3
  });

  if (animate) {
    const duration = Math.min(480, 230 + Math.abs(nextIndex - startIndex) * 90);
    await animateMarkerBetween(startPoint, endPoint, duration);
  } else {
    state.playerMarker.setLatLng(endPoint);
  }

  state.playerIndex = nextIndex;
  state.isMoving = false;
  refreshPlayerMarkerIcon();
  render();
}

function maybeTriggerEncounter() {
  const character = characters.find(
    (entry) => getCharacterIndex(entry) === state.playerIndex && !state.visited.has(entry.id)
  );

  if (!character) {
    return;
  }

  state.activeDialogue = {
    character,
    selectedOption: null
  };

  render();
  window.requestAnimationFrame(revealDialogue);
}

async function movePlayer(delta) {
  if (state.activeDialogue || state.isMoving || state.isBarOpen) {
    return;
  }

  const nextIndex = Math.min(
    Math.max(state.playerIndex + delta, 0),
    state.route.length - 1
  );

  if (nextIndex === state.playerIndex) {
    return;
  }

  await travelPlayerTo(nextIndex);
  maybeTriggerEncounter();
}

async function jumpToCharacter(characterId) {
  if (state.activeDialogue || state.isMoving || state.isBarOpen) {
    return;
  }

  const character = characters.find((entry) => entry.id === characterId);

  if (!character) {
    return;
  }

  await travelPlayerTo(getCharacterIndex(character), {
    animate: false
  });
  maybeTriggerEncounter();
}

function applyOption(optionIndex) {
  if (!state.activeDialogue) {
    return;
  }

  const option = state.activeDialogue.character.options[optionIndex];

  state.visited.add(state.activeDialogue.character.id);
  state.lastOutcome = option.result;
  state.activeDialogue.selectedOption = optionIndex;
  render();
  window.requestAnimationFrame(revealDialogue);
}

function closeDialogue() {
  state.activeDialogue = null;
  state.lastOutcome = "";
  render();
}

function restartGame() {
  state.playerIndex = 0;
  state.isMoving = false;
  state.isBarOpen = false;
  state.visited = new Set();
  state.activeDialogue = null;
  state.lastOutcome = "";
  refreshPlayerMarkerIcon();
  panToPlayer();
  render();
  maybeTriggerEncounter();
}

async function loadLiveRoute() {
  const query = `
    [out:json][timeout:15];
    way(id:163563365,46043840);
    out geom;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: new URLSearchParams({
      data: query
    })
  });

  if (!response.ok) {
    throw new Error("Overpass non disponibile");
  }

  const data = await response.json();
  const candidates = data.elements
    .filter((element) => Array.isArray(element.geometry))
    .map((element) =>
      element.geometry.map((point) => [point.lat, point.lon])
    )
    .sort((left, right) => right.length - left.length);

  if (!candidates.length) {
    throw new Error("Nessuna geometria ricevuta");
  }

  return candidates[0];
}

async function initRoute() {
  try {
    const liveRoute = await loadLiveRoute();
    state.route = liveRoute;
    drawRoute();
    render();
  } catch (error) {
    state.route = [...fallbackRoute];
    drawRoute();
    render();
  }
}

function attachEvents() {
  elements.stepBack.addEventListener("click", () => movePlayer(-1));
  elements.stepForward.addEventListener("click", () => movePlayer(1));
  elements.stepBackMobile.addEventListener("click", () => movePlayer(-1));
  elements.stepForwardMobile.addEventListener("click", () => movePlayer(1));
  elements.enterBar.addEventListener("click", openBarScene);
  elements.leaveBar.addEventListener("click", closeBarScene);
  elements.dialogueContinue.addEventListener("click", closeDialogue);
  elements.restartGame.addEventListener("click", restartGame);

  elements.dialogueOptions.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-option-index]");

    if (!trigger) {
      return;
    }

    applyOption(Number(trigger.dataset.optionIndex));
  });

  elements.castList.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-character-id]");

    if (!trigger) {
      return;
    }

    jumpToCharacter(trigger.dataset.characterId);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.isBarOpen) {
      closeBarScene();
      return;
    }

    if (state.isBarOpen) {
      return;
    }

    if (event.key === "ArrowRight") {
      movePlayer(1);
    }

    if (event.key === "ArrowLeft") {
      movePlayer(-1);
    }
  });
}

function init() {
  createMap();
  attachEvents();
  render();
  maybeTriggerEncounter();
  initRoute();
}

init();
