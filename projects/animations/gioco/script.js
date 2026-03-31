const consolePanel = document.getElementById("consolePanel");
const consoleToggle = document.getElementById("consoleToggle");
const stopAnimationButton = document.getElementById("stopAnimation");
const closePanelButton = document.getElementById("closePanel");
const menuButtons = [...document.querySelectorAll("[data-animation-target]")];
const consolePanels = {
  letters: document.getElementById("lettersConsole"),
  ascii: document.getElementById("asciiConsole"),
};
const scenes = {
  letters: document.getElementById("lettersScene"),
  ascii: document.getElementById("asciiScene"),
};

const letterController = window.createLetterWallController({
  wall: document.getElementById("wall"),
  phraseInput: document.getElementById("lettersPhraseInput"),
  exposureTimeInput: document.getElementById("lettersExposureTime"),
  exposureValue: document.getElementById("lettersExposureValue"),
  toggleDrop: document.getElementById("lettersToggleDrop"),
  toggleScramble: document.getElementById("lettersToggleScramble"),
  toggleHighlight: document.getElementById("lettersToggleHighlight"),
  applyButton: document.getElementById("lettersApplyPhrases"),
  resetButton: document.getElementById("lettersResetPhrases"),
  statusEl: document.getElementById("lettersStatus"),
  messageEl: document.getElementById("lettersMessage"),
});

const asciiController = window.createAsciiLabController({
  stage: document.getElementById("asciiStage"),
  screen: document.getElementById("asciiScreen"),
  uploadInput: document.getElementById("asciiImageUpload"),
  toggleMotionButton: document.getElementById("asciiToggleMotion"),
  nextButton: document.getElementById("asciiNextSource"),
  resetImagesButton: document.getElementById("asciiResetImages"),
  columnsRange: document.getElementById("asciiColumnsRange"),
  speedRange: document.getElementById("asciiSpeedRange"),
  contrastRange: document.getElementById("asciiContrastRange"),
  columnsValue: document.getElementById("asciiColumnsValue"),
  speedValue: document.getElementById("asciiSpeedValue"),
  contrastValue: document.getElementById("asciiContrastValue"),
  phraseInput: document.getElementById("asciiPhraseInput"),
  applyPhrasesButton: document.getElementById("asciiApplyPhrases"),
  clearPhrasesButton: document.getElementById("asciiClearPhrases"),
  statusEl: document.getElementById("asciiStatus"),
  messageEl: document.getElementById("asciiMessage"),
});

let currentTarget = "letters";
let currentAsciiMode = "bloom";

function syncInterfaceActions() {
  closePanelButton.disabled = consolePanel.classList.contains("is-collapsed");
}

function setConsoleOpen(isOpen) {
  consolePanel.classList.toggle("is-collapsed", !isOpen);
  consoleToggle.setAttribute("aria-expanded", String(isOpen));
  syncInterfaceActions();
}

function setActiveConsolePanel(target) {
  Object.entries(consolePanels).forEach(([key, panel]) => {
    panel.classList.toggle("is-hidden", key !== target);
  });
}

function setActiveScene(target) {
  Object.entries(scenes).forEach(([key, scene]) => {
    scene.classList.toggle("scene--hidden", key !== target);
    scene.classList.toggle("scene--active", key === target);
  });
}

function updateMenuState(target, asciiMode) {
  menuButtons.forEach((button) => {
    const buttonTarget = button.dataset.animationTarget;
    const buttonMode = button.dataset.asciiMode || "";
    const isActive =
      buttonTarget === "letters"
        ? target === "letters"
        : target === "ascii" && buttonMode === asciiMode;
    button.classList.toggle("is-active", isActive);
  });
}

function activateLetters() {
  currentTarget = "letters";
  setActiveScene("letters");
  setActiveConsolePanel("letters");
  updateMenuState("letters", currentAsciiMode);
  asciiController.deactivate();
  letterController.activate();
}

function activateAscii(mode) {
  currentTarget = "ascii";
  currentAsciiMode = mode || currentAsciiMode;
  setActiveScene("ascii");
  setActiveConsolePanel("ascii");
  updateMenuState("ascii", currentAsciiMode);
  letterController.deactivate();

  window.requestAnimationFrame(() => {
    asciiController.activate(currentAsciiMode);
  });
}

function stopCurrentAnimation() {
  if (currentTarget === "letters") {
    letterController.deactivate();
    return;
  }

  asciiController.deactivate();
}

consoleToggle.addEventListener("click", () => {
  const shouldOpen = consolePanel.classList.contains("is-collapsed");
  setConsoleOpen(shouldOpen);
});
stopAnimationButton.addEventListener("click", stopCurrentAnimation);
closePanelButton.addEventListener("click", () => {
  setConsoleOpen(false);
});

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.animationTarget;
    if (target === "letters") {
      activateLetters();
      return;
    }

    activateAscii(button.dataset.asciiMode || "bloom");
  });
});

window.addEventListener("resize", () => {
  letterController.resize();
  asciiController.resize();
});

setConsoleOpen(false);
activateLetters();
