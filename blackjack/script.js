const SUITS = ["S", "H", "D", "C"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const state = {
  bankroll: 1000,
  bet: 100,
  deck: [],
  player: [],
  dealer: [],
  roundActive: false,
  revealDealer: false,
};

const elements = {
  bankroll: document.querySelector("#bankroll"),
  bet: document.querySelector("#bet"),
  message: document.querySelector("#message"),
  playerTotal: document.querySelector("#player-total"),
  dealerTotal: document.querySelector("#dealer-total"),
  playerHand: document.querySelector("#player-hand"),
  dealerHand: document.querySelector("#dealer-hand"),
  dealBtn: document.querySelector("#deal-btn"),
  hitBtn: document.querySelector("#hit-btn"),
  standBtn: document.querySelector("#stand-btn"),
  betInput: document.querySelector("#bet-input"),
};

function makeDeck(numDecks = 6) {
  const deck = [];
  for (let n = 0; n < numDecks; n += 1) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ rank, suit });
      }
    }
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawCard() {
  if (state.deck.length === 0) {
    state.deck = makeDeck(6);
  }
  return state.deck.pop();
}

function cardValue(rank) {
  if (["J", "Q", "K"].includes(rank)) return 10;
  if (rank === "A") return 11;
  return Number(rank);
}

function handTotal(hand) {
  let total = hand.reduce((sum, card) => sum + cardValue(card.rank), 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function isBlackjack(hand) {
  return hand.length === 2 && handTotal(hand) === 21;
}

function suitSymbol(suit) {
  if (suit === "S") return "\u2660";
  if (suit === "H") return "\u2665";
  if (suit === "D") return "\u2666";
  return "\u2663";
}

function suitRed(suit) {
  return suit === "H" || suit === "D";
}

function renderCard(card, hidden = false) {
  const node = document.createElement("div");
  node.className = "card";

  if (hidden) {
    node.classList.add("back");
    return node;
  }

  if (suitRed(card.suit)) {
    node.classList.add("red");
  }

  const top = document.createElement("span");
  top.className = "top";
  top.textContent = `${card.rank}${suitSymbol(card.suit)}`;

  const center = document.createElement("span");
  center.className = "center";
  center.textContent = suitSymbol(card.suit);

  const bottom = document.createElement("span");
  bottom.className = "bottom";
  bottom.textContent = `${card.rank}${suitSymbol(card.suit)}`;

  node.append(top, center, bottom);
  return node;
}

function setMessage(text, tone = "") {
  elements.message.textContent = text;
  elements.message.classList.remove("win", "lose");
  if (tone === "win") elements.message.classList.add("win");
  if (tone === "lose") elements.message.classList.add("lose");
}

function render() {
  elements.bankroll.textContent = String(state.bankroll);
  elements.bet.textContent = String(state.bet);

  elements.playerHand.innerHTML = "";
  elements.dealerHand.innerHTML = "";

  state.player.forEach((card) => {
    elements.playerHand.appendChild(renderCard(card));
  });

  state.dealer.forEach((card, idx) => {
    const hide = idx === 1 && !state.revealDealer && state.roundActive;
    elements.dealerHand.appendChild(renderCard(card, hide));
  });

  elements.playerTotal.textContent = `Totale: ${handTotal(state.player)}`;

  if (state.roundActive && !state.revealDealer) {
    const shownTotal = cardValue(state.dealer[0].rank);
    elements.dealerTotal.textContent = `Totale: ${shownTotal}+?`;
  } else {
    elements.dealerTotal.textContent = `Totale: ${handTotal(state.dealer)}`;
  }

  elements.hitBtn.disabled = !state.roundActive;
  elements.standBtn.disabled = !state.roundActive;
  elements.betInput.disabled = state.roundActive;
}

function settleRound() {
  const playerTotal = handTotal(state.player);
  const dealerTotal = handTotal(state.dealer);

  if (playerTotal > 21) {
    state.bankroll -= state.bet;
    setMessage("Hai sballato. Vince il banco.", "lose");
  } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
    state.bankroll += state.bet;
    setMessage("Hai vinto la mano!", "win");
  } else if (playerTotal < dealerTotal) {
    state.bankroll -= state.bet;
    setMessage("Il banco vince la mano.", "lose");
  } else {
    setMessage("Pareggio (push).", "");
  }

  if (state.bankroll <= 0) {
    state.bankroll = 0;
    setMessage("Saldo finito. Ricarica la pagina per ricominciare.", "lose");
    elements.dealBtn.disabled = true;
  }
}

function endRound() {
  state.roundActive = false;
  state.revealDealer = true;
  settleRound();
  render();
}

function dealerTurn() {
  while (handTotal(state.dealer) < 17) {
    state.dealer.push(drawCard());
  }
}

function startRound() {
  const rawBet = Number(elements.betInput.value);
  const normalizedBet = Number.isFinite(rawBet) ? Math.floor(rawBet) : 100;
  state.bet = Math.max(10, Math.min(normalizedBet, state.bankroll));
  elements.betInput.value = String(state.bet);

  if (state.bankroll <= 0) {
    setMessage("Saldo insufficiente.", "lose");
    render();
    return;
  }

  state.player = [drawCard(), drawCard()];
  state.dealer = [drawCard(), drawCard()];
  state.roundActive = true;
  state.revealDealer = false;

  if (isBlackjack(state.player) || isBlackjack(state.dealer)) {
    state.revealDealer = true;
    state.roundActive = false;

    if (isBlackjack(state.player) && isBlackjack(state.dealer)) {
      setMessage("Entrambi BlackJack: push.");
    } else if (isBlackjack(state.player)) {
      state.bankroll += Math.floor(state.bet * 1.5);
      setMessage("BlackJack! Pagamento 3:2.", "win");
    } else {
      state.bankroll -= state.bet;
      setMessage("Il banco ha BlackJack.", "lose");
    }
  } else {
    setMessage("Mano iniziata. Tocca a te.");
  }

  render();
}

function onHit() {
  if (!state.roundActive) return;
  state.player.push(drawCard());

  if (handTotal(state.player) > 21) {
    endRound();
    return;
  }

  render();
}

function onStand() {
  if (!state.roundActive) return;
  state.revealDealer = true;
  dealerTurn();
  endRound();
}

function init() {
  state.deck = makeDeck(6);
  elements.dealBtn.addEventListener("click", startRound);
  elements.hitBtn.addEventListener("click", onHit);
  elements.standBtn.addEventListener("click", onStand);

  elements.betInput.addEventListener("change", () => {
    const value = Number(elements.betInput.value);
    if (!Number.isFinite(value)) {
      elements.betInput.value = String(state.bet);
      return;
    }
    const normalized = Math.max(10, Math.floor(value));
    elements.betInput.value = String(normalized);
    state.bet = normalized;
    render();
  });

  render();
}

init();
