const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const wheelOrder = Array.from({ length: 37 }, (_, i) => i);
const wheelStep = 360 / wheelOrder.length;
const wheelSpinDurationMs = 4400;

const state = {
  balance: 1000,
  chipValue: 10,
  bets: [],
  history: [],
  isSpinning: false,
  wheelRotation: 0,
  ballAngle: 0,
  ballRafId: null
};

const el = {
  balance: document.getElementById("balance"),
  lastResult: document.getElementById("last-result"),
  drawnNumber: document.getElementById("drawn-number"),
  chipValue: document.getElementById("chip-value"),
  betPreview: document.getElementById("bet-preview"),
  betPreviewKind: document.getElementById("bet-preview-kind"),
  betPreviewDetails: document.getElementById("bet-preview-details"),
  betPreviewTotal: document.getElementById("bet-preview-total"),
  betPreviewWin: document.getElementById("bet-preview-win"),
  betPreviewProb: document.getElementById("bet-preview-prob"),
  spinBtn: document.getElementById("spin-btn"),
  clearBetsBtn: document.getElementById("clear-bets-btn"),
  resultModal: document.getElementById("result-modal"),
  resultModalNumber: document.getElementById("result-modal-number"),
  resultModalWin: document.getElementById("result-modal-win"),
  resultModalNet: document.getElementById("result-modal-net"),
  resultModalClose: document.getElementById("result-modal-close"),
  wheelResult: document.getElementById("wheel-result"),
  wheelResultNumber: document.getElementById("wheel-result-number"),
  wheelTagColor: document.getElementById("wheel-tag-color"),
  wheelTagParity: document.getElementById("wheel-tag-parity"),
  wheelTagDozen: document.getElementById("wheel-tag-dozen"),
  wheelTagRange: document.getElementById("wheel-tag-range"),
  wheel: document.getElementById("wheel"),
  ball: document.getElementById("ball"),
  numberBets: document.getElementById("number-bets"),
  outsideBets: document.getElementById("outside-bets"),
  historyList: document.getElementById("history-list")
};

function getColor(number) {
  if (number === 0) return "verde";
  return redNumbers.has(number) ? "rosso" : "nero";
}

function formatMoney(amount) {
  return `€ ${amount.toFixed(2)}`;
}

function buildNumberButtons() {
  for (let i = 0; i <= 36; i += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(i);
    button.dataset.betType = "number";
    button.dataset.betValue = String(i);

    const color = i === 0 ? "green" : redNumbers.has(i) ? "red" : "black";
    button.classList.add(color);
    el.numberBets.appendChild(button);
  }
}

function buildWheel() {
  wheelOrder.forEach((number, index) => {
    const node = document.createElement("div");
    node.dataset.slotIndex = String(index);
    node.dataset.number = String(number);
    node.classList.add("wheel-number");
    node.classList.add(number === 0 ? "green" : redNumbers.has(number) ? "red" : "black");
    node.textContent = String(number);
    el.wheel.appendChild(node);
  });

  placeWheelNumbers();
}

function placeWheelNumbers() {
  const wheelRadius = el.wheel.clientWidth / 2;
  const slotRadius = wheelRadius - 28;
  const center = wheelRadius;

  el.wheel.querySelectorAll(".wheel-number").forEach((node) => {
    const index = Number(node.dataset.slotIndex);
    const angle = (index * wheelStep - 90) * (Math.PI / 180);
    const x = center + slotRadius * Math.cos(angle);
    const y = center + slotRadius * Math.sin(angle);
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  });

  positionBall(state.ballAngle);
}

function getBetCategoryLabel() {
  if (state.bets.length === 0) return "Nessuna";

  const hasNumberBet = state.bets.some((bet) => bet.type === "number");
  const hasOutsideBet = state.bets.some((bet) => bet.type !== "number");

  if (hasNumberBet && hasOutsideBet) return "Mista (Numero + Esterne)";
  if (hasNumberBet) return "Numero singolo";
  return "Puntate esterne";
}

function getBetDetailLabel(bet) {
  if (bet.type === "number") return `Numero ${bet.value}`;
  if (bet.type === "color") return bet.value[0].toUpperCase() + bet.value.slice(1);
  if (bet.type === "parity") return bet.value[0].toUpperCase() + bet.value.slice(1);
  if (bet.type === "dozen") return `${bet.value}a Dozzina`;
  return `${bet.type}:${bet.value}`;
}

function calculatePreviewStats() {
  let winningOutcomes = 0;
  let maxPayout = 0;

  for (let n = 0; n <= 36; n += 1) {
    let payoutForNumber = 0;

    state.bets.forEach((bet) => {
      if (isWinningBet(bet, n)) {
        payoutForNumber += bet.amount * getPayoutMultiplier(bet.type);
      }
    });

    if (payoutForNumber > 0) {
      winningOutcomes += 1;
      if (payoutForNumber > maxPayout) {
        maxPayout = payoutForNumber;
      }
    }
  }

  return {
    maxPayout,
    winProbability: (winningOutcomes / 37) * 100
  };
}

function renderBetPreview() {
  const totalBet = state.bets.reduce((sum, bet) => sum + bet.amount, 0);
  const kind = getBetCategoryLabel();
  const detailLabels = [...new Set(state.bets.map(getBetDetailLabel))];
  const details = detailLabels.length === 0 ? "-" : detailLabels.join(", ");
  const stats = calculatePreviewStats();
  el.betPreviewKind.textContent = kind;
  el.betPreviewDetails.textContent = `Dettaglio: ${details}`;
  el.betPreviewTotal.textContent = `Totale: ${formatMoney(totalBet)}`;
  el.betPreviewWin.textContent = `Possibile vincita: ${formatMoney(stats.maxPayout)}`;
  el.betPreviewProb.textContent = `Probabilità: ${stats.winProbability.toFixed(2)}%`;
  el.betPreview.classList.toggle("ready", state.bets.length > 0);
}

function openResultModal(resultNumber, color, totalWin, net) {
  const netLabel = `${net >= 0 ? "+" : "-"}${formatMoney(Math.abs(net))}`;
  el.resultModalNumber.textContent = `Numero: ${resultNumber} (${color})`;
  el.resultModalWin.textContent = `Vincita totale: ${formatMoney(totalWin)}`;
  el.resultModalNet.textContent = `Netto turno: ${netLabel}`;
  el.resultModal.classList.remove("hidden");
}

function closeResultModal() {
  el.resultModal.classList.add("hidden");
}

function getResultFeatures(number) {
  if (number === 0) {
    return {
      color: "verde",
      parity: "zero",
      dozen: "zero",
      range: "zero"
    };
  }

  return {
    color: getColor(number),
    parity: number % 2 === 0 ? "pari" : "dispari",
    dozen: `${Math.ceil(number / 12)}a dozzina`,
    range: number <= 18 ? "basso (1-18)" : "alto (19-36)"
  };
}

function highlightWinningWheelNumber(number) {
  el.wheel.querySelectorAll(".wheel-number.hit").forEach((node) => {
    node.classList.remove("hit");
  });

  const winningNode = el.wheel.querySelector(`.wheel-number[data-number="${number}"]`);
  if (!winningNode) return;

  winningNode.classList.remove("hit");
  void winningNode.offsetWidth;
  winningNode.classList.add("hit");
}

function renderWheelResult(number) {
  const features = getResultFeatures(number);
  const colorClass = features.color === "rosso" ? "red" : features.color === "nero" ? "black" : "green";

  el.wheelResultNumber.classList.remove("red", "black", "green");
  el.wheelResultNumber.classList.add(colorClass);
  el.wheelResultNumber.textContent = `Numero ${number}`;

  el.wheelTagColor.textContent = `Colore: ${features.color}`;
  el.wheelTagParity.textContent = `Parità: ${features.parity}`;
  el.wheelTagDozen.textContent = `Dozzina: ${features.dozen}`;
  el.wheelTagRange.textContent = `Range: ${features.range}`;

  el.wheelResult.classList.remove("show");
  void el.wheelResult.offsetWidth;
  el.wheelResult.classList.add("show");
}

function renderHistory() {
  el.historyList.innerHTML = "";

  if (state.history.length === 0) {
    el.historyList.innerHTML = "<li>Nessun giro effettuato.</li>";
    return;
  }

  state.history.slice(0, 12).forEach((row) => {
    const item = document.createElement("li");
    item.textContent = row;
    el.historyList.appendChild(item);
  });
}

function updateStatus() {
  el.balance.textContent = formatMoney(state.balance);
}

function describeBet(bet) {
  if (bet.type === "number") return `Numero ${bet.value} (36x)`;
  if (bet.type === "color") return `${bet.value[0].toUpperCase() + bet.value.slice(1)} (2x)`;
  if (bet.type === "parity") return `${bet.value[0].toUpperCase() + bet.value.slice(1)} (2x)`;
  if (bet.type === "dozen") return `${bet.value}a dozzina (3x)`;
  return `${bet.type}:${bet.value}`;
}

function addBet(type, value) {
  if (state.isSpinning) return;

  const amount = Number(el.chipValue.value);

  if (!Number.isFinite(amount) || amount <= 0) {
    window.alert("Inserisci un valore fiches valido.");
    return;
  }

  if (amount > state.balance) {
    window.alert("Saldo insufficiente per questa puntata.");
    return;
  }

  state.balance -= amount;
  state.bets.push({ type, value, amount });
  state.chipValue = amount;

  updateStatus();
  renderBetPreview();
}

function isWinningBet(bet, number) {
  if (bet.type === "number") return Number(bet.value) === number;
  if (bet.type === "color") return number !== 0 && getColor(number) === bet.value;
  if (bet.type === "parity") return number !== 0 && (number % 2 === 0 ? "pari" : "dispari") === bet.value;

  if (bet.type === "dozen") {
    if (number === 0) return false;
    const dozen = Math.ceil(number / 12);
    return String(dozen) === bet.value;
  }

  return false;
}

function getPayoutMultiplier(type) {
  if (type === "number") return 36;
  if (type === "dozen") return 3;
  return 2;
}

function setInputsDisabled(disabled) {
  state.isSpinning = disabled;
  el.spinBtn.disabled = disabled;
  el.clearBetsBtn.disabled = disabled;
  el.chipValue.disabled = disabled;
}

function animateWheelToNumber(resultNumber) {
  const index = wheelOrder.indexOf(resultNumber);
  const targetAngle = 360 - index * wheelStep;
  const extraTurns = 7 * 360;
  state.wheelRotation += extraTurns + targetAngle - (state.wheelRotation % 360);
  el.wheel.style.transform = `rotate(${state.wheelRotation}deg)`;
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function positionBall(angle) {
  const wheelRadius = el.wheel.clientWidth / 2;
  const trackRadius = wheelRadius - 14;
  const center = wheelRadius;
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = center + trackRadius * Math.cos(radians);
  const y = center + trackRadius * Math.sin(radians);
  el.ball.style.left = `${x}px`;
  el.ball.style.top = `${y}px`;
}

function animateBallToWinningSlot() {
  if (state.ballRafId) {
    window.cancelAnimationFrame(state.ballRafId);
    state.ballRafId = null;
  }

  const startAngle = state.ballAngle;
  const finalAngle = 0;
  const currentNormalized = normalizeAngle(startAngle);
  const toFinalCounterClockwise = -((currentNormalized - finalAngle + 360) % 360);
  const turns = 11 * 360;
  const targetAngle = startAngle + toFinalCounterClockwise - turns;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / wheelSpinDurationMs, 1);
    const eased = 1 - (1 - t) ** 3;
    state.ballAngle = startAngle + (targetAngle - startAngle) * eased;
    positionBall(state.ballAngle);

    if (t < 1) {
      state.ballRafId = window.requestAnimationFrame(step);
      return;
    }

    state.ballAngle = finalAngle;
    positionBall(state.ballAngle);
    state.ballRafId = null;
  }

  state.ballRafId = window.requestAnimationFrame(step);
}

function finishRound(resultNumber) {
  const color = getColor(resultNumber);

  let totalWin = 0;
  let winningBets = 0;

  state.bets.forEach((bet) => {
    if (isWinningBet(bet, resultNumber)) {
      winningBets += 1;
      totalWin += bet.amount * getPayoutMultiplier(bet.type);
    }
  });

  state.balance += totalWin;

  const totalBet = state.bets.reduce((sum, bet) => sum + bet.amount, 0);
  const net = totalWin - totalBet;
  const netLabel = `${net >= 0 ? "+" : ""}${formatMoney(net)}`;
  const summary = `N.${resultNumber} ${color} | Vincite: ${winningBets} | Totale: ${formatMoney(totalWin)} | Netto: ${netLabel}`;

  el.lastResult.textContent = net >= 0 ? `Vinto ${formatMoney(net)}` : `Perso ${formatMoney(Math.abs(net))}`;
  el.drawnNumber.textContent = `${resultNumber} (${color})`;
  renderWheelResult(resultNumber);
  highlightWinningWheelNumber(resultNumber);
  openResultModal(resultNumber, color, totalWin, net);

  state.history.unshift(summary);
  state.bets = [];

  updateStatus();
  renderHistory();
  renderBetPreview();

  if (state.balance <= 0) {
    state.isSpinning = false;
    el.spinBtn.disabled = true;
    el.clearBetsBtn.disabled = true;
    el.chipValue.disabled = true;
    window.alert("Hai finito il saldo. Ricarica la pagina per una nuova sessione.");
    return;
  }

  setInputsDisabled(false);
}

function spinRoulette() {
  if (state.bets.length === 0) {
    window.alert("Piazza almeno una puntata prima di girare.");
    return;
  }

  setInputsDisabled(true);
  const resultNumber = Math.floor(Math.random() * 37);
  animateWheelToNumber(resultNumber);
  animateBallToWinningSlot();
  window.setTimeout(() => finishRound(resultNumber), wheelSpinDurationMs);
}

function clearBets() {
  if (state.isSpinning) return;
  const refund = state.bets.reduce((sum, bet) => sum + bet.amount, 0);
  state.balance += refund;
  state.bets = [];
  updateStatus();
  renderBetPreview();
}

el.outsideBets.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  addBet(target.dataset.betType, target.dataset.betValue);
});

el.numberBets.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  addBet(target.dataset.betType, target.dataset.betValue);
});

el.spinBtn.addEventListener("click", spinRoulette);
el.clearBetsBtn.addEventListener("click", clearBets);
el.resultModalClose.addEventListener("click", closeResultModal);

el.resultModal.addEventListener("click", (event) => {
  if (event.target === el.resultModal) {
    closeResultModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeResultModal();
  }
});

buildNumberButtons();
buildWheel();
updateStatus();
renderBetPreview();
renderHistory();

window.addEventListener("resize", placeWheelNumbers);
