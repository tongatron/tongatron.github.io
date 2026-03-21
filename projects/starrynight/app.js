const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const STORAGE_KEY = "starry-night-settings-v1";
const FALLBACK_LOCATION = {
  latitude: 41.9028,
  longitude: 12.4964,
  label: "Roma fallback",
};

const STAR_CATALOG = [
  { id: "polaris", name: "Polaris", ra: 2.5303, dec: 89.2641, mag: 1.98 },
  { id: "kochab", name: "Kochab", ra: 14.8451, dec: 74.1555, mag: 2.08 },
  { id: "pherkad", name: "Pherkad", ra: 15.3455, dec: 71.834, mag: 3.05 },
  { id: "caph", name: "Caph", ra: 0.1529, dec: 59.1498, mag: 2.28 },
  { id: "schedar", name: "Schedar", ra: 0.6751, dec: 56.5373, mag: 2.24 },
  { id: "gamma_cas", name: "Gamma Cas", ra: 0.9451, dec: 60.7167, mag: 2.15 },
  { id: "ruchbah", name: "Ruchbah", ra: 1.4303, dec: 60.2353, mag: 2.68 },
  { id: "segin", name: "Segin", ra: 2.2939, dec: 63.6701, mag: 3.35 },
  { id: "mirfak", name: "Mirfak", ra: 3.4054, dec: 49.8611, mag: 1.79 },
  { id: "algol", name: "Algol", ra: 3.1361, dec: 40.9556, mag: 2.12 },
  { id: "atik", name: "Atik", ra: 3.7154, dec: 31.8833, mag: 2.88 },
  { id: "capella", name: "Capella", ra: 5.2782, dec: 45.9978, mag: 0.08 },
  { id: "mahasim", name: "Mahasim", ra: 5.1086, dec: 41.2345, mag: 2.69 },
  { id: "menkalinan", name: "Menkalinan", ra: 5.9921, dec: 44.9474, mag: 1.9 },
  { id: "aldebaran", name: "Aldebaran", ra: 4.5987, dec: 16.5092, mag: 0.86 },
  { id: "ain", name: "Ain", ra: 4.4769, dec: 19.1804, mag: 3.53 },
  { id: "elnath", name: "Elnath", ra: 5.4382, dec: 28.6075, mag: 1.65 },
  { id: "betelgeuse", name: "Betelgeuse", ra: 5.9195, dec: 7.4071, mag: 0.5 },
  { id: "bellatrix", name: "Bellatrix", ra: 5.4189, dec: 6.3497, mag: 1.64 },
  { id: "alnitak", name: "Alnitak", ra: 5.6793, dec: -1.9426, mag: 1.74 },
  { id: "alnilam", name: "Alnilam", ra: 5.6036, dec: -1.2019, mag: 1.69 },
  { id: "mintaka", name: "Mintaka", ra: 5.5334, dec: -0.2991, mag: 2.23 },
  { id: "saiph", name: "Saiph", ra: 5.7959, dec: -9.6696, mag: 2.07 },
  { id: "rigel", name: "Rigel", ra: 5.2423, dec: -8.2016, mag: 0.13 },
  { id: "sirius", name: "Sirius", ra: 6.7525, dec: -16.7161, mag: -1.46 },
  { id: "mirzam", name: "Mirzam", ra: 6.3783, dec: -17.9559, mag: 1.98 },
  { id: "wezen", name: "Wezen", ra: 7.1399, dec: -26.3932, mag: 1.83 },
  { id: "adhara", name: "Adhara", ra: 6.9771, dec: -28.9721, mag: 1.5 },
  { id: "aludra", name: "Aludra", ra: 7.4016, dec: -29.3031, mag: 2.45 },
  { id: "procyon", name: "Procyon", ra: 7.655, dec: 5.225, mag: 0.38 },
  { id: "castor", name: "Castor", ra: 7.5767, dec: 31.8883, mag: 1.58 },
  { id: "pollux", name: "Pollux", ra: 7.7553, dec: 28.0262, mag: 1.14 },
  { id: "wasat", name: "Wasat", ra: 7.3354, dec: 21.9823, mag: 3.53 },
  { id: "alhena", name: "Alhena", ra: 6.6285, dec: 16.3993, mag: 1.93 },
  { id: "regulus", name: "Regulus", ra: 10.1395, dec: 11.9672, mag: 1.35 },
  { id: "algieba", name: "Algieba", ra: 10.3329, dec: 19.8415, mag: 2.01 },
  { id: "zosma", name: "Zosma", ra: 11.2351, dec: 20.5237, mag: 2.56 },
  { id: "denebola", name: "Denebola", ra: 11.8177, dec: 14.5721, mag: 2.14 },
  { id: "dubhe", name: "Dubhe", ra: 11.0621, dec: 61.7508, mag: 1.79 },
  { id: "merak", name: "Merak", ra: 11.0307, dec: 56.3824, mag: 2.37 },
  { id: "phecda", name: "Phecda", ra: 11.8972, dec: 53.6948, mag: 2.41 },
  { id: "megrez", name: "Megrez", ra: 12.257, dec: 57.0326, mag: 3.32 },
  { id: "alioth", name: "Alioth", ra: 12.9004, dec: 55.9598, mag: 1.76 },
  { id: "mizar", name: "Mizar", ra: 13.3987, dec: 54.9254, mag: 2.23 },
  { id: "alkaid", name: "Alkaid", ra: 13.7923, dec: 49.3133, mag: 1.85 },
  { id: "arcturus", name: "Arcturus", ra: 14.261, dec: 19.1825, mag: -0.05 },
  { id: "izar", name: "Izar", ra: 14.7498, dec: 27.0742, mag: 2.37 },
  { id: "alphecca", name: "Alphecca", ra: 15.5781, dec: 26.7147, mag: 2.22 },
  { id: "spica", name: "Spica", ra: 13.4199, dec: -11.1614, mag: 0.98 },
  { id: "antares", name: "Antares", ra: 16.4901, dec: -26.432, mag: 1.06 },
  { id: "dschubba", name: "Dschubba", ra: 16.0056, dec: -22.6217, mag: 2.29 },
  { id: "acrab", name: "Acrab", ra: 16.0906, dec: -19.8055, mag: 2.62 },
  { id: "sargas", name: "Sargas", ra: 17.6219, dec: -42.9978, mag: 1.86 },
  { id: "shaula", name: "Shaula", ra: 17.5601, dec: -37.1038, mag: 1.62 },
  { id: "vega", name: "Vega", ra: 18.6156, dec: 38.7837, mag: 0.03 },
  { id: "sheliak", name: "Sheliak", ra: 18.8347, dec: 33.3627, mag: 3.52 },
  { id: "sulafat", name: "Sulafat", ra: 18.9824, dec: 32.6896, mag: 3.25 },
  { id: "kaus_borealis", name: "Kaus Borealis", ra: 18.4662, dec: -25.4217, mag: 2.81 },
  { id: "kaus_media", name: "Kaus Media", ra: 18.3499, dec: -29.8281, mag: 2.7 },
  { id: "kaus_australis", name: "Kaus Australis", ra: 18.4029, dec: -34.3846, mag: 1.85 },
  { id: "nunki", name: "Nunki", ra: 18.9211, dec: -26.2967, mag: 2.02 },
  { id: "ascella", name: "Ascella", ra: 19.0435, dec: -29.8801, mag: 2.6 },
  { id: "albireo", name: "Albireo", ra: 19.512, dec: 27.9597, mag: 3.05 },
  { id: "sadr", name: "Sadr", ra: 20.3705, dec: 40.2567, mag: 2.23 },
  { id: "gienah_cyg", name: "Gienah", ra: 20.7702, dec: 33.9702, mag: 2.48 },
  { id: "delta_cyg", name: "Delta Cyg", ra: 19.7496, dec: 45.1307, mag: 2.86 },
  { id: "deneb", name: "Deneb", ra: 20.6905, dec: 45.2803, mag: 1.25 },
  { id: "tarazed", name: "Tarazed", ra: 19.7711, dec: 10.6133, mag: 2.72 },
  { id: "altair", name: "Altair", ra: 19.8464, dec: 8.8683, mag: 0.76 },
  { id: "alshain", name: "Alshain", ra: 19.9219, dec: 6.4068, mag: 3.71 },
  { id: "alpheratz", name: "Alpheratz", ra: 0.1398, dec: 29.0904, mag: 2.06 },
  { id: "mirach", name: "Mirach", ra: 1.1622, dec: 35.6206, mag: 2.07 },
  { id: "almach", name: "Almach", ra: 2.0649, dec: 42.3297, mag: 2.1 },
  { id: "markab", name: "Markab", ra: 23.0794, dec: 15.2053, mag: 2.49 },
  { id: "scheat", name: "Scheat", ra: 23.0629, dec: 28.0824, mag: 2.42 },
  { id: "algenib", name: "Algenib", ra: 0.2206, dec: 15.1836, mag: 2.83 },
  { id: "enif", name: "Enif", ra: 21.7364, dec: 9.875, mag: 2.38 },
  { id: "alderamin", name: "Alderamin", ra: 21.3097, dec: 62.5856, mag: 2.45 },
  { id: "alfirk", name: "Alfirk", ra: 21.4777, dec: 70.5608, mag: 3.23 },
  { id: "errai", name: "Errai", ra: 23.6558, dec: 77.6324, mag: 3.21 },
];

const CONSTELLATIONS = [
  {
    id: "ursa_minor",
    name: "Orsa Minore",
    color: "#8ed4ff",
    stars: ["polaris", "pherkad", "kochab"],
    segments: [["polaris", "pherkad"], ["pherkad", "kochab"]],
  },
  {
    id: "ursa_major",
    name: "Orsa Maggiore",
    color: "#7ce0ff",
    stars: ["dubhe", "merak", "phecda", "megrez", "alioth", "mizar", "alkaid"],
    segments: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"],
    ],
  },
  {
    id: "cassiopeia",
    name: "Cassiopea",
    color: "#8cc4ff",
    stars: ["caph", "schedar", "gamma_cas", "ruchbah", "segin"],
    segments: [
      ["caph", "schedar"],
      ["schedar", "gamma_cas"],
      ["gamma_cas", "ruchbah"],
      ["ruchbah", "segin"],
    ],
  },
  {
    id: "perseus",
    name: "Perseo",
    color: "#87d8ff",
    stars: ["mirfak", "algol", "atik"],
    segments: [["algol", "mirfak"], ["mirfak", "atik"]],
  },
  {
    id: "auriga",
    name: "Auriga",
    color: "#9be0ff",
    stars: ["capella", "mahasim", "menkalinan", "elnath"],
    segments: [
      ["capella", "mahasim"],
      ["mahasim", "menkalinan"],
      ["menkalinan", "elnath"],
      ["elnath", "capella"],
    ],
  },
  {
    id: "taurus",
    name: "Toro",
    color: "#ffd87d",
    stars: ["elnath", "aldebaran", "ain", "betelgeuse"],
    segments: [
      ["elnath", "aldebaran"],
      ["aldebaran", "ain"],
      ["aldebaran", "betelgeuse"],
    ],
  },
  {
    id: "orion",
    name: "Orione",
    color: "#ffc96e",
    stars: ["betelgeuse", "bellatrix", "alnitak", "alnilam", "mintaka", "saiph", "rigel"],
    segments: [
      ["betelgeuse", "bellatrix"],
      ["betelgeuse", "alnitak"],
      ["bellatrix", "mintaka"],
      ["alnitak", "alnilam"],
      ["alnilam", "mintaka"],
      ["alnitak", "saiph"],
      ["mintaka", "rigel"],
      ["saiph", "rigel"],
    ],
  },
  {
    id: "canis_major",
    name: "Cane Maggiore",
    color: "#9ce8ff",
    stars: ["sirius", "mirzam", "wezen", "adhara", "aludra"],
    segments: [
      ["mirzam", "sirius"],
      ["sirius", "wezen"],
      ["wezen", "adhara"],
      ["adhara", "aludra"],
    ],
  },
  {
    id: "canis_minor",
    name: "Cane Minore",
    color: "#a0eeff",
    stars: ["procyon", "betelgeuse", "sirius"],
    segments: [["betelgeuse", "procyon"], ["procyon", "sirius"]],
  },
  {
    id: "gemini",
    name: "Gemelli",
    color: "#b2e7ff",
    stars: ["castor", "pollux", "wasat", "alhena"],
    segments: [
      ["castor", "pollux"],
      ["pollux", "wasat"],
      ["wasat", "alhena"],
    ],
  },
  {
    id: "leo",
    name: "Leone",
    color: "#ffd38f",
    stars: ["regulus", "algieba", "zosma", "denebola"],
    segments: [
      ["regulus", "algieba"],
      ["algieba", "zosma"],
      ["zosma", "denebola"],
    ],
  },
  {
    id: "bootes",
    name: "Bifolco",
    color: "#91e4ff",
    stars: ["arcturus", "izar", "alphecca"],
    segments: [["alphecca", "izar"], ["izar", "arcturus"]],
  },
  {
    id: "virgo",
    name: "Vergine",
    color: "#89d0ff",
    stars: ["spica", "denebola", "arcturus"],
    segments: [["arcturus", "spica"], ["denebola", "spica"]],
  },
  {
    id: "scorpius",
    name: "Scorpione",
    color: "#ff967f",
    stars: ["acrab", "dschubba", "antares", "sargas", "shaula"],
    segments: [
      ["acrab", "dschubba"],
      ["dschubba", "antares"],
      ["antares", "sargas"],
      ["sargas", "shaula"],
    ],
  },
  {
    id: "sagittarius",
    name: "Sagittario",
    color: "#ffb87b",
    stars: ["kaus_borealis", "kaus_media", "kaus_australis", "nunki", "ascella"],
    segments: [
      ["kaus_borealis", "kaus_media"],
      ["kaus_media", "kaus_australis"],
      ["kaus_media", "nunki"],
      ["nunki", "ascella"],
      ["ascella", "kaus_australis"],
    ],
  },
  {
    id: "lyra",
    name: "Lira",
    color: "#8de7ff",
    stars: ["vega", "sheliak", "sulafat"],
    segments: [["vega", "sheliak"], ["sheliak", "sulafat"], ["sulafat", "vega"]],
  },
  {
    id: "cygnus",
    name: "Cigno",
    color: "#8bc3ff",
    stars: ["deneb", "sadr", "gienah_cyg", "albireo", "delta_cyg"],
    segments: [
      ["deneb", "sadr"],
      ["sadr", "albireo"],
      ["sadr", "gienah_cyg"],
      ["sadr", "delta_cyg"],
    ],
  },
  {
    id: "aquila",
    name: "Aquila",
    color: "#92e7ff",
    stars: ["tarazed", "altair", "alshain"],
    segments: [["tarazed", "altair"], ["altair", "alshain"]],
  },
  {
    id: "andromeda",
    name: "Andromeda",
    color: "#9dd0ff",
    stars: ["alpheratz", "mirach", "almach"],
    segments: [["alpheratz", "mirach"], ["mirach", "almach"]],
  },
  {
    id: "pegasus",
    name: "Pegaso",
    color: "#c6ddff",
    stars: ["markab", "scheat", "alpheratz", "algenib", "enif"],
    segments: [
      ["markab", "scheat"],
      ["scheat", "alpheratz"],
      ["alpheratz", "algenib"],
      ["algenib", "markab"],
      ["markab", "enif"],
    ],
  },
  {
    id: "cepheus",
    name: "Cefeo",
    color: "#a7c6ff",
    stars: ["alderamin", "alfirk", "errai"],
    segments: [["alderamin", "alfirk"], ["alfirk", "errai"]],
  },
];

const STAR_BY_ID = new Map(STAR_CATALOG.map((star) => [star.id, star]));

const refs = {
  stage: document.querySelector("#skyStage"),
  canvas: document.querySelector("#starCanvas"),
  video: document.querySelector("#cameraFeed"),
  startButton: document.querySelector("#startButton"),
  stageNote: document.querySelector("#stageNote"),
  statusMessage: document.querySelector("#statusMessage"),
  locationBadge: document.querySelector("#locationBadge"),
  orientationBadge: document.querySelector("#orientationBadge"),
  cameraBadge: document.querySelector("#cameraBadge"),
  azimuthValue: document.querySelector("#azimuthValue"),
  altitudeValue: document.querySelector("#altitudeValue"),
  coordsValue: document.querySelector("#coordsValue"),
  modeValue: document.querySelector("#modeValue"),
  timeValue: document.querySelector("#timeValue"),
  toggleModeButton: document.querySelector("#toggleModeButton"),
  recenterButton: document.querySelector("#recenterButton"),
  toggleCameraButton: document.querySelector("#toggleCameraButton"),
  fovSlider: document.querySelector("#fovSlider"),
  fovValue: document.querySelector("#fovValue"),
  visibleConstellations: document.querySelector("#visibleConstellations"),
  listMeta: document.querySelector("#listMeta"),
};

const savedSettings = loadSettings();

const state = {
  viewport: {
    width: 0,
    height: 0,
    dpr: window.devicePixelRatio || 1,
  },
  location: {
    latitude: FALLBACK_LOCATION.latitude,
    longitude: FALLBACK_LOCATION.longitude,
    accuracy: null,
    source: "fallback",
    label: FALLBACK_LOCATION.label,
  },
  permissions: {
    geolocation: "idle",
    orientation: "idle",
    camera: "idle",
  },
  locationWatchId: null,
  orientationListenerAttached: false,
  sensors: {
    azimuth: Number.NaN,
    altitude: Number.NaN,
    source: "none",
    rank: 0,
    lastUpdated: 0,
  },
  view: {
    mode: savedSettings.mode === "manual" ? "manual" : "sensor",
    manualAzimuth: savedSettings.manualAzimuth ?? 180,
    manualAltitude: savedSettings.manualAltitude ?? 42,
    headingOffset: savedSettings.headingOffset ?? 0,
    altitudeOffset: savedSettings.altitudeOffset ?? 0,
    fieldOfView: savedSettings.fieldOfView ?? 62,
  },
  drag: {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  },
  camera: {
    stream: null,
    visible: savedSettings.cameraVisible ?? true,
    active: false,
  },
  ui: {
    lastListUpdate: 0,
  },
};

const ctx = refs.canvas.getContext("2d");

init();

function init() {
  if (!ctx) {
    refs.statusMessage.textContent = "Canvas non disponibile nel browser.";
    return;
  }

  refs.fovSlider.value = String(state.view.fieldOfView);
  syncCameraVisibility();
  updateBadges();
  updateControls();
  resizeCanvas();
  attachUiEvents();
  renderFrame();
  registerServiceWorker();
}

function attachUiEvents() {
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);

  refs.startButton.addEventListener("click", startExperience);
  refs.toggleModeButton.addEventListener("click", toggleMode);
  refs.recenterButton.addEventListener("click", resetOffsets);
  refs.toggleCameraButton.addEventListener("click", toggleCameraVisibility);
  refs.fovSlider.addEventListener("input", handleFovChange);

  refs.canvas.addEventListener("pointerdown", handlePointerDown);
  refs.canvas.addEventListener("pointermove", handlePointerMove);
  refs.canvas.addEventListener("pointerup", handlePointerEnd);
  refs.canvas.addEventListener("pointercancel", handlePointerEnd);
  refs.canvas.addEventListener("pointerleave", handlePointerEnd);
}

async function startExperience() {
  refs.startButton.disabled = true;
  refs.statusMessage.textContent = "Richiesta permessi in corso...";
  tryLockPortrait();

  await requestOrientation();
  await requestGeolocation();
  await requestCamera();

  refs.startButton.hidden = true;
  refs.statusMessage.textContent = buildStatusSummary();
  refs.stageNote.textContent =
    "Trascina sul cielo per correggere azimut e altezza se i sensori non sono perfetti.";
  refs.startButton.disabled = false;
}

function tryLockPortrait() {
  if (!screen.orientation?.lock) {
    return;
  }

  screen.orientation.lock("portrait-primary").catch(() => {});
}

async function requestOrientation() {
  if (!("DeviceOrientationEvent" in window)) {
    state.permissions.orientation = "unsupported";
    updateBadges();
    return;
  }

  state.permissions.orientation = "pending";
  updateBadges();

  try {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        throw new Error("permesso orientamento negato");
      }
    }

    if (!state.orientationListenerAttached) {
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
      state.orientationListenerAttached = true;
    }

    state.permissions.orientation = "granted";
  } catch (error) {
    state.permissions.orientation = "denied";
    refs.statusMessage.textContent =
      "Orientamento non disponibile. Puoi comunque usare la modalita manuale.";
  }

  updateBadges();
}

async function requestGeolocation() {
  if (!navigator.geolocation) {
    state.permissions.geolocation = "unsupported";
    updateBadges();
    return;
  }

  state.permissions.geolocation = "pending";
  updateBadges();

  const options = {
    enableHighAccuracy: true,
    maximumAge: 10_000,
    timeout: 12_000,
  };

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    applyLocation(position);
    state.permissions.geolocation = "granted";

    if (state.locationWatchId === null) {
      state.locationWatchId = navigator.geolocation.watchPosition(
        applyLocation,
        handleLocationError,
        {
          enableHighAccuracy: true,
          maximumAge: 15_000,
          timeout: 20_000,
        },
      );
    }
  } catch (error) {
    handleLocationError(error);
  }

  updateBadges();
}

function applyLocation(position) {
  state.location.latitude = position.coords.latitude;
  state.location.longitude = position.coords.longitude;
  state.location.accuracy = position.coords.accuracy;
  state.location.source = "gps";
  state.location.label = formatCoordinates(
    position.coords.latitude,
    position.coords.longitude,
  );
  updateBadges();
}

function handleLocationError() {
  state.permissions.geolocation = "denied";
  state.location.source = "fallback";
  state.location.label = FALLBACK_LOCATION.label;
  refs.statusMessage.textContent =
    "Geolocalizzazione non concessa. Uso il cielo di Roma come fallback.";
  updateBadges();
}

async function requestCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    state.permissions.camera = "unsupported";
    updateBadges();
    return;
  }

  state.permissions.camera = "pending";
  updateBadges();

  try {
    if (state.camera.stream) {
      stopCamera();
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    state.camera.stream = stream;
    refs.video.srcObject = stream;
    await refs.video.play();
    state.camera.active = true;
    state.permissions.camera = "granted";
  } catch (error) {
    state.permissions.camera = "denied";
    state.camera.active = false;
    refs.statusMessage.textContent =
      "Camera non disponibile. L'overlay continua su sfondo simulato.";
  }

  syncCameraVisibility();
  updateBadges();
}

function stopCamera() {
  if (!state.camera.stream) {
    return;
  }

  for (const track of state.camera.stream.getTracks()) {
    track.stop();
  }

  state.camera.stream = null;
  state.camera.active = false;
  refs.video.srcObject = null;
}

function handleOrientation(event) {
  const source = getOrientationSource(event);
  const rank = sourceRank(source);

  if (rank < state.sensors.rank && performance.now() - state.sensors.lastUpdated < 5_000) {
    return;
  }

  let alpha = Number.isFinite(event.webkitCompassHeading)
    ? event.webkitCompassHeading
    : event.alpha;

  const beta = event.beta;
  const gamma = event.gamma;

  if (!Number.isFinite(alpha) || !Number.isFinite(beta) || !Number.isFinite(gamma)) {
    return;
  }

  alpha = normalizeDegrees(alpha);

  const vector = orientationToCameraVector(alpha, beta, gamma);
  const azimuth = normalizeDegrees(Math.atan2(vector.x, vector.y) * RAD_TO_DEG);
  const altitude = clamp(Math.asin(clamp(vector.z, -1, 1)) * RAD_TO_DEG, -10, 89);

  state.sensors.azimuth = azimuth;
  state.sensors.altitude = altitude;
  state.sensors.source = source;
  state.sensors.rank = rank;
  state.sensors.lastUpdated = performance.now();

  if (state.view.mode === "sensor" && refs.startButton.hidden === false) {
    refs.startButton.hidden = true;
  }

  refs.statusMessage.textContent = buildStatusSummary();
  updateBadges();
  updateControls();
}

function orientationToCameraVector(alphaDeg, betaDeg, gammaDeg) {
  const alpha = alphaDeg * DEG_TO_RAD;
  const beta = betaDeg * DEG_TO_RAD;
  const gamma = gammaDeg * DEG_TO_RAD;

  const sinA = Math.sin(alpha);
  const cosA = Math.cos(alpha);
  const sinB = Math.sin(beta);
  const cosB = Math.cos(beta);
  const sinG = Math.sin(gamma);
  const cosG = Math.cos(gamma);

  return normalizeVector({
    x: -sinG * cosA + sinB * cosG * sinA,
    y: sinG * sinA + sinB * cosG * cosA,
    z: -cosB * cosG,
  });
}

function getOrientationSource(event) {
  if (Number.isFinite(event.webkitCompassHeading)) {
    return "compass";
  }

  if (event.type === "deviceorientationabsolute" || event.absolute === true) {
    return "absolute";
  }

  return "relative";
}

function sourceRank(source) {
  switch (source) {
    case "compass":
      return 3;
    case "absolute":
      return 2;
    case "relative":
      return 1;
    default:
      return 0;
  }
}

function resizeCanvas() {
  const rect = refs.stage.getBoundingClientRect();
  const dpr = Math.max(window.devicePixelRatio || 1, 1);

  state.viewport.width = rect.width;
  state.viewport.height = rect.height;
  state.viewport.dpr = dpr;

  refs.canvas.width = Math.round(rect.width * dpr);
  refs.canvas.height = Math.round(rect.height * dpr);
  refs.canvas.style.width = `${rect.width}px`;
  refs.canvas.style.height = `${rect.height}px`;
}

function renderFrame() {
  const now = new Date();
  const view = getCurrentView();
  const snapshot = computeSkySnapshot(now, view);
  drawSky(snapshot, view, now);

  if (performance.now() - state.ui.lastListUpdate > 900) {
    renderVisibleConstellations(snapshot);
    state.ui.lastListUpdate = performance.now();
  }

  updateStats(view, now, snapshot);
  requestAnimationFrame(renderFrame);
}

function getCurrentView() {
  const sensorsReady =
    Number.isFinite(state.sensors.azimuth) && Number.isFinite(state.sensors.altitude);

  if (state.view.mode === "sensor" && sensorsReady) {
    return {
      azimuth: normalizeDegrees(state.sensors.azimuth + state.view.headingOffset),
      altitude: clamp(state.sensors.altitude + state.view.altitudeOffset, -10, 89),
      modeLabel: state.sensors.source === "compass"
        ? "Bussola"
        : state.sensors.source === "absolute"
          ? "Sensore assoluto"
          : "Sensore relativo",
    };
  }

  return {
    azimuth: normalizeDegrees(state.view.manualAzimuth),
    altitude: clamp(state.view.manualAltitude, -10, 89),
    modeLabel: "Manuale",
  };
}

function computeSkySnapshot(date, view) {
  const starPositions = new Map();

  for (const star of STAR_CATALOG) {
    const horizontal = equatorialToHorizontal(
      star.ra,
      star.dec,
      state.location.latitude,
      state.location.longitude,
      date,
    );
    starPositions.set(star.id, {
      ...star,
      azimuth: horizontal.azimuth,
      altitude: horizontal.altitude,
      vector: horizontalToVector(horizontal.azimuth, horizontal.altitude),
    });
  }

  const basis = buildCameraBasis(view.azimuth, view.altitude);
  const projectedStars = new Map();

  for (const [id, star] of starPositions.entries()) {
    const projected = projectVector(
      star.vector,
      basis,
      state.viewport.width,
      state.viewport.height,
      state.view.fieldOfView,
    );

    projectedStars.set(id, {
      ...star,
      projected,
    });
  }

  const visibleConstellations = CONSTELLATIONS.map((constellation) =>
    summarizeConstellation(constellation, projectedStars),
  )
    .filter(Boolean)
    .sort((left, right) => {
      if (right.onScreenCount !== left.onScreenCount) {
        return right.onScreenCount - left.onScreenCount;
      }
      return right.meanAltitude - left.meanAltitude;
    });

  return {
    starPositions: projectedStars,
    visibleConstellations,
    basis,
  };
}

function drawSky(snapshot, view, now) {
  ctx.setTransform(state.viewport.dpr, 0, 0, state.viewport.dpr, 0, 0);
  ctx.clearRect(0, 0, state.viewport.width, state.viewport.height);

  drawConstellationLines(snapshot.starPositions);
  drawStars(snapshot.starPositions);
  drawLabels(snapshot.visibleConstellations);
  drawHudOverlay(view, now);
}

function drawConstellationLines(starPositions) {
  for (const constellation of CONSTELLATIONS) {
    ctx.beginPath();
    let segmentCount = 0;

    for (const [fromId, toId] of constellation.segments) {
      const from = starPositions.get(fromId);
      const to = starPositions.get(toId);

      if (!from?.projected || !to?.projected) {
        continue;
      }

      if (!from.projected.inFrame || !to.projected.inFrame) {
        continue;
      }

      ctx.moveTo(from.projected.x, from.projected.y);
      ctx.lineTo(to.projected.x, to.projected.y);
      segmentCount += 1;
    }

    if (segmentCount === 0) {
      continue;
    }

    ctx.strokeStyle = `${constellation.color}aa`;
    ctx.lineWidth = 1.35;
    ctx.shadowColor = constellation.color;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawStars(starPositions) {
  const stars = Array.from(starPositions.values())
    .filter((star) => star.projected?.inFrame)
    .sort((left, right) => left.mag - right.mag);

  for (const star of stars) {
    const radius = clamp(4.8 - star.mag * 0.75, 1.15, 5.4);
    const glow = radius * 4.6;

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 245, 230, 0.92)";
    ctx.shadowColor = star.mag < 1.2 ? "rgba(255, 201, 110, 0.75)" : "rgba(124, 224, 255, 0.42)";
    ctx.shadowBlur = glow;
    ctx.arc(star.projected.x, star.projected.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (star.mag < 1 && star.projected.camZ > 0.45) {
      ctx.fillStyle = "rgba(235, 243, 255, 0.78)";
      ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
      ctx.fillText(star.name, star.projected.x + 8, star.projected.y - 8);
    }
  }
}

function drawLabels(visibleConstellations) {
  const labels = visibleConstellations
    .filter((constellation) => constellation.labelPosition)
    .slice(0, 5);

  for (const constellation of labels) {
    const { x, y } = constellation.labelPosition;
    ctx.fillStyle = `${constellation.color}cc`;
    ctx.font = '600 14px "Avenir Next", "Trebuchet MS", sans-serif';
    ctx.fillText(constellation.name, x + 10, y - 10);
  }
}

function drawHudOverlay(view, now) {
  const padding = 18;
  const boxWidth = 208;
  const boxHeight = 68;
  const boxX = state.viewport.width - boxWidth - padding;
  const boxY = state.viewport.height - boxHeight - padding;

  ctx.fillStyle = "rgba(5, 13, 27, 0.62)";
  ctx.strokeStyle = "rgba(124, 224, 255, 0.22)";
  ctx.lineWidth = 1;
  roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f6f8ff";
  ctx.font = '700 14px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.fillText(
    `${directionFromAzimuth(view.azimuth)} ${formatAngle(view.azimuth)} / ${formatSignedAngle(view.altitude)}`,
    boxX + 14,
    boxY + 24,
  );

  ctx.fillStyle = "rgba(167, 184, 209, 0.9)";
  ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.fillText(view.modeLabel, boxX + 14, boxY + 44);
  ctx.fillText(now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), boxX + 14, boxY + 60);
}

function summarizeConstellation(constellation, starPositions) {
  const visibleStars = constellation.stars
    .map((id) => starPositions.get(id))
    .filter(Boolean)
    .filter((star) => star.altitude > 0);

  if (visibleStars.length < 2) {
    return null;
  }

  const onScreenStars = visibleStars.filter((star) => star.projected?.inFrame);
  const meanAltitude =
    visibleStars.reduce((total, star) => total + star.altitude, 0) / visibleStars.length;

  const meanAzimuth = averageAngles(visibleStars.map((star) => star.azimuth));
  let labelPosition = null;

  if (onScreenStars.length >= 2) {
    labelPosition = {
      x: onScreenStars.reduce((total, star) => total + star.projected.x, 0) / onScreenStars.length,
      y: onScreenStars.reduce((total, star) => total + star.projected.y, 0) / onScreenStars.length,
    };
  }

  return {
    ...constellation,
    visibleCount: visibleStars.length,
    onScreenCount: onScreenStars.length,
    meanAltitude,
    meanAzimuth,
    labelPosition,
  };
}

function renderVisibleConstellations(snapshot) {
  const constellations = snapshot.visibleConstellations.slice(0, 8);

  if (constellations.length === 0) {
    refs.visibleConstellations.innerHTML = `
      <div class="empty-card">
        Nessuna costellazione principale e ben visibile ora. Ruota il telefono o cambia altezza del campo visivo.
      </div>
    `;
    refs.listMeta.textContent = "nessuna rilevata";
    return;
  }

  refs.listMeta.textContent = `${constellations.length} suggerite`;
  refs.visibleConstellations.innerHTML = constellations
    .map((constellation, index) => {
      const emphasis =
        constellation.onScreenCount >= 2
          ? "dentro al frame"
          : `verso ${directionFromAzimuth(constellation.meanAzimuth)}`;

      return `
        <article class="constellation-card">
          <p class="constellation-title">
            <strong>${constellation.name}</strong>
            <span class="constellation-rank">#${index + 1}</span>
          </p>
          <p class="constellation-meta">
            ${emphasis}, altezza media ${Math.round(constellation.meanAltitude)} deg, ${constellation.visibleCount} stelle sopra l'orizzonte.
          </p>
        </article>
      `;
    })
    .join("");
}

function updateStats(view, now, snapshot) {
  refs.azimuthValue.textContent = `${directionFromAzimuth(view.azimuth)} ${formatAngle(view.azimuth)}`;
  refs.altitudeValue.textContent = formatSignedAngle(view.altitude);
  refs.coordsValue.textContent =
    state.location.source === "gps"
      ? `${state.location.label}${state.location.accuracy ? ` / +- ${Math.round(state.location.accuracy)} m` : ""}`
      : state.location.label;
  refs.modeValue.textContent = view.modeLabel;
  refs.timeValue.textContent = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const centered = snapshot.visibleConstellations.find(
    (constellation) => constellation.onScreenCount >= 2,
  );

  if (centered) {
    refs.stageNote.textContent = `${centered.name} e nel frame. Trascina leggermente per rifinire l'overlay.`;
  } else if (state.view.mode === "manual") {
    refs.stageNote.textContent =
      "Modalita manuale: trascina in orizzontale e verticale per cercare il cielo giusto.";
  } else if (state.sensors.rank > 0) {
    refs.stageNote.textContent =
      "Sensori attivi. Se l'overlay non coincide, trascina per applicare una correzione.";
  } else {
    refs.stageNote.textContent =
      "Attiva sensori e camera oppure usa la vista manuale per iniziare.";
  }
}

function updateBadges() {
  const gpsTone =
    state.permissions.geolocation === "granted"
      ? "ok"
      : state.permissions.geolocation === "denied"
        ? "warn"
        : state.permissions.geolocation === "unsupported"
          ? "error"
          : "pending";

  setBadge(
    refs.locationBadge,
    state.permissions.geolocation === "granted"
      ? "GPS attivo"
      : state.permissions.geolocation === "denied"
        ? "GPS fallback"
        : state.permissions.geolocation === "unsupported"
          ? "GPS assente"
          : "GPS in attesa",
    gpsTone,
  );

  const orientationTone =
    state.sensors.rank > 0
      ? "ok"
      : state.permissions.orientation === "denied"
        ? "warn"
        : state.permissions.orientation === "unsupported"
          ? "error"
          : "pending";

  const orientationLabel =
    state.sensors.rank > 0
      ? state.sensors.source === "compass"
        ? "Bussola attiva"
        : state.sensors.source === "absolute"
          ? "Orientamento attivo"
          : "Sensore relativo"
      : state.permissions.orientation === "denied"
        ? "Bussola non concessa"
        : state.permissions.orientation === "unsupported"
          ? "Sensore assente"
          : "Bussola in attesa";

  setBadge(refs.orientationBadge, orientationLabel, orientationTone);

  const cameraTone =
    state.camera.active && state.camera.visible
      ? "ok"
      : state.permissions.camera === "denied"
        ? "warn"
        : state.permissions.camera === "unsupported"
          ? "error"
          : state.camera.active
            ? "warn"
            : "pending";

  const cameraLabel =
    state.camera.active && state.camera.visible
      ? "Camera attiva"
      : state.camera.active && !state.camera.visible
        ? "Camera nascosta"
        : state.permissions.camera === "denied"
          ? "Camera non concessa"
          : state.permissions.camera === "unsupported"
            ? "Camera assente"
            : "Camera in attesa";

  setBadge(refs.cameraBadge, cameraLabel, cameraTone);
}

function setBadge(element, text, tone) {
  element.textContent = text;
  element.className = `badge is-${tone}`;
}

function updateControls() {
  refs.toggleModeButton.textContent =
    state.view.mode === "sensor" ? "Usa trascinamento" : "Usa sensori";
  refs.toggleCameraButton.textContent = state.camera.visible
    ? "Nascondi camera"
    : "Mostra camera";
  refs.fovValue.textContent = `${Math.round(state.view.fieldOfView)} deg`;
}

function toggleMode() {
  if (state.view.mode === "sensor") {
    const currentView = getCurrentView();
    state.view.mode = "manual";
    state.view.manualAzimuth = currentView.azimuth;
    state.view.manualAltitude = currentView.altitude;
    refs.statusMessage.textContent =
      "Modalita manuale attiva. Trascina il cielo per cercare le costellazioni.";
  } else {
    state.view.mode = "sensor";
    refs.statusMessage.textContent = buildStatusSummary();
  }

  updateControls();
  saveSettings();
}

function resetOffsets() {
  if (state.view.mode === "sensor") {
    state.view.headingOffset = 0;
    state.view.altitudeOffset = 0;
    refs.statusMessage.textContent = "Offset sensori azzerati.";
  } else {
    state.view.manualAzimuth = 180;
    state.view.manualAltitude = 42;
    refs.statusMessage.textContent = "Vista manuale reimpostata.";
  }

  saveSettings();
}

function toggleCameraVisibility() {
  state.camera.visible = !state.camera.visible;
  syncCameraVisibility();
  updateBadges();
  updateControls();
  saveSettings();
}

function syncCameraVisibility() {
  document.body.classList.toggle("camera-hidden", !state.camera.visible);
}

function handleFovChange(event) {
  state.view.fieldOfView = Number(event.target.value);
  updateControls();
  saveSettings();
}

function handlePointerDown(event) {
  state.drag.active = true;
  state.drag.pointerId = event.pointerId;
  state.drag.lastX = event.clientX;
  state.drag.lastY = event.clientY;
  refs.canvas.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!state.drag.active || state.drag.pointerId !== event.pointerId) {
    return;
  }

  const dx = event.clientX - state.drag.lastX;
  const dy = event.clientY - state.drag.lastY;

  if (state.view.mode === "sensor") {
    state.view.headingOffset = normalizeDegrees(state.view.headingOffset - dx * 0.16);
    state.view.altitudeOffset = clamp(state.view.altitudeOffset + dy * 0.12, -35, 35);
  } else {
    state.view.manualAzimuth = normalizeDegrees(state.view.manualAzimuth - dx * 0.16);
    state.view.manualAltitude = clamp(state.view.manualAltitude + dy * 0.12, -10, 89);
  }

  state.drag.lastX = event.clientX;
  state.drag.lastY = event.clientY;
  saveSettings();
}

function handlePointerEnd(event) {
  if (state.drag.pointerId !== event.pointerId) {
    return;
  }

  state.drag.active = false;
  state.drag.pointerId = null;
}

function buildStatusSummary() {
  const parts = [];

  parts.push(
    state.location.source === "gps"
      ? "Geolocalizzazione attiva."
      : "Geolocalizzazione non disponibile, uso Roma.",
  );

  if (state.sensors.source === "compass") {
    parts.push("Bussola disponibile.");
  } else if (state.sensors.source === "absolute") {
    parts.push("Orientamento assoluto disponibile.");
  } else if (state.sensors.source === "relative") {
    parts.push("Orientamento relativo disponibile.");
  } else {
    parts.push("Sensori non disponibili, passa a manuale.");
  }

  parts.push(
    state.camera.active
      ? state.camera.visible
        ? "Camera posteriore attiva."
        : "Camera acquisita ma nascosta."
      : "Camera non attiva.",
  );

  return parts.join(" ");
}

function equatorialToHorizontal(raHours, decDeg, latDeg, lonDeg, date) {
  const localSidereal = localSiderealTimeDegrees(date, lonDeg);
  const hourAngle = normalizeDegrees(localSidereal - raHours * 15) * DEG_TO_RAD;
  const dec = decDeg * DEG_TO_RAD;
  const lat = latDeg * DEG_TO_RAD;

  const sinAlt =
    Math.sin(dec) * Math.sin(lat) +
    Math.cos(dec) * Math.cos(lat) * Math.cos(hourAngle);
  const altitude = Math.asin(clamp(sinAlt, -1, 1));

  const east = -Math.cos(dec) * Math.sin(hourAngle);
  const north =
    Math.sin(dec) * Math.cos(lat) -
    Math.cos(dec) * Math.cos(hourAngle) * Math.sin(lat);

  return {
    azimuth: normalizeDegrees(Math.atan2(east, north) * RAD_TO_DEG),
    altitude: altitude * RAD_TO_DEG,
  };
}

function julianDate(date) {
  return date.getTime() / 86_400_000 + 2440587.5;
}

function localSiderealTimeDegrees(date, longitude) {
  const jd = julianDate(date);
  const daysSinceJ2000 = jd - 2451545.0;
  const gmstHours = 18.697374558 + 24.06570982441908 * daysSinceJ2000;
  return normalizeDegrees(gmstHours * 15 + longitude);
}

function horizontalToVector(azimuthDeg, altitudeDeg) {
  const azimuth = azimuthDeg * DEG_TO_RAD;
  const altitude = altitudeDeg * DEG_TO_RAD;

  return {
    x: Math.cos(altitude) * Math.sin(azimuth),
    y: Math.cos(altitude) * Math.cos(azimuth),
    z: Math.sin(altitude),
  };
}

function buildCameraBasis(azimuthDeg, altitudeDeg) {
  const forward = normalizeVector(horizontalToVector(azimuthDeg, altitudeDeg));
  let right = normalizeVector(cross(forward, { x: 0, y: 0, z: 1 }));

  if (length(right) < 0.001) {
    right = normalizeVector(cross(forward, { x: 0, y: 1, z: 0 }));
  }

  const up = normalizeVector(cross(right, forward));

  return {
    forward,
    right,
    up,
  };
}

function projectVector(vector, basis, width, height, fovHorizontalDeg) {
  const camX = dot(vector, basis.right);
  const camY = dot(vector, basis.up);
  const camZ = dot(vector, basis.forward);

  if (camZ <= 0.03) {
    return null;
  }

  const fovH = fovHorizontalDeg * DEG_TO_RAD;
  const aspect = width / Math.max(height, 1);
  const fovV = 2 * Math.atan(Math.tan(fovH / 2) / aspect);

  const nx = camX / (camZ * Math.tan(fovH / 2));
  const ny = camY / (camZ * Math.tan(fovV / 2));

  const x = (nx * 0.5 + 0.5) * width;
  const y = (0.5 - ny * 0.5) * height;

  return {
    x,
    y,
    nx,
    ny,
    camZ,
    inFrame: Math.abs(nx) <= 1.06 && Math.abs(ny) <= 1.06,
  };
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function normalizeVector(vector) {
  const vectorLength = length(vector);
  if (vectorLength === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: vector.x / vectorLength,
    y: vector.y / vectorLength,
    z: vector.z / vectorLength,
  };
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(vector) {
  return Math.sqrt(dot(vector, vector));
}

function averageAngles(angles) {
  const sum = angles.reduce(
    (accumulator, angle) => {
      const radians = angle * DEG_TO_RAD;
      accumulator.x += Math.cos(radians);
      accumulator.y += Math.sin(radians);
      return accumulator;
    },
    { x: 0, y: 0 },
  );

  return normalizeDegrees(Math.atan2(sum.y, sum.x) * RAD_TO_DEG);
}

function directionFromAzimuth(angle) {
  const normalized = normalizeDegrees(angle);

  if (normalized >= 337.5 || normalized < 22.5) {
    return "N";
  }
  if (normalized < 67.5) {
    return "NE";
  }
  if (normalized < 112.5) {
    return "E";
  }
  if (normalized < 157.5) {
    return "SE";
  }
  if (normalized < 202.5) {
    return "S";
  }
  if (normalized < 247.5) {
    return "SO";
  }
  if (normalized < 292.5) {
    return "O";
  }
  return "NO";
}

function formatAngle(angle) {
  return `${Math.round(normalizeDegrees(angle))} deg`;
}

function formatSignedAngle(angle) {
  const rounded = Math.round(angle);
  return `${rounded >= 0 ? "+" : ""}${rounded} deg`;
}

function formatCoordinates(latitude, longitude) {
  return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

function normalizeDegrees(angle) {
  return ((angle % 360) + 360) % 360;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveSettings() {
  const payload = {
    mode: state.view.mode,
    manualAzimuth: state.view.manualAzimuth,
    manualAltitude: state.view.manualAltitude,
    headingOffset: state.view.headingOffset,
    altitudeOffset: state.view.altitudeOffset,
    fieldOfView: state.view.fieldOfView,
    cameraVisible: state.camera.visible,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Ignored: the app can work without persistence.
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    return;
  }

  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}
