#!/usr/bin/env python3
import random
from dataclasses import dataclass

SUITS = ["♠", "♥", "♦", "♣"]
RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]


def card_value(rank: str) -> int:
    if rank in {"J", "Q", "K"}:
        return 10
    if rank == "A":
        return 11
    return int(rank)


@dataclass(frozen=True)
class Card:
    rank: str
    suit: str

    def __str__(self) -> str:
        return f"{self.rank}{self.suit}"


class Deck:
    def __init__(self, num_decks: int = 1):
        if num_decks < 1:
            raise ValueError("num_decks deve essere >= 1")
        self.cards = [Card(rank, suit) for _ in range(num_decks) for suit in SUITS for rank in RANKS]
        random.shuffle(self.cards)

    def draw(self) -> Card:
        if not self.cards:
            raise RuntimeError("Mazzo finito")
        return self.cards.pop()


class Hand:
    def __init__(self):
        self.cards = []

    def add(self, card: Card) -> None:
        self.cards.append(card)

    def total(self) -> int:
        total = sum(card_value(c.rank) for c in self.cards)
        aces = sum(1 for c in self.cards if c.rank == "A")
        while total > 21 and aces > 0:
            total -= 10
            aces -= 1
        return total

    def is_blackjack(self) -> bool:
        return len(self.cards) == 2 and self.total() == 21

    def is_bust(self) -> bool:
        return self.total() > 21

    def __str__(self) -> str:
        return " ".join(str(c) for c in self.cards)


def deal_initial(deck: Deck):
    player = Hand()
    dealer = Hand()
    player.add(deck.draw())
    dealer.add(deck.draw())
    player.add(deck.draw())
    dealer.add(deck.draw())
    return player, dealer


def dealer_turn(deck: Deck, dealer: Hand):
    while dealer.total() < 17:
        dealer.add(deck.draw())


def settle(player: Hand, dealer: Hand) -> str:
    if player.is_bust():
        return "dealer"
    if dealer.is_bust():
        return "player"
    if player.total() > dealer.total():
        return "player"
    if player.total() < dealer.total():
        return "dealer"
    return "push"


def play_interactive(num_decks: int = 6):
    deck = Deck(num_decks)
    player, dealer = deal_initial(deck)

    print("\n=== BlackJack ===")
    print(f"Banco mostra: {dealer.cards[0]}")
    print(f"La tua mano: {player} (totale: {player.total()})")

    if player.is_blackjack() or dealer.is_blackjack():
        print(f"Banco: {dealer} (totale: {dealer.total()})")
        if player.is_blackjack() and dealer.is_blackjack():
            print("Pareggio (entrambi BlackJack)")
        elif player.is_blackjack():
            print("Hai vinto con BlackJack!")
        else:
            print("Il banco ha BlackJack. Hai perso.")
        return

    while True:
        choice = input("Hit o Stand? [h/s]: ").strip().lower()
        if choice not in {"h", "s"}:
            print("Scelta non valida. Usa 'h' o 's'.")
            continue

        if choice == "h":
            card = deck.draw()
            player.add(card)
            print(f"Hai pescato: {card}")
            print(f"La tua mano: {player} (totale: {player.total()})")
            if player.is_bust():
                print("Sballato! Hai perso.")
                return
        else:
            break

    dealer_turn(deck, dealer)
    print(f"\nBanco: {dealer} (totale: {dealer.total()})")
    print(f"Tu:    {player} (totale: {player.total()})")

    outcome = settle(player, dealer)
    if outcome == "player":
        print("Hai vinto!")
    elif outcome == "dealer":
        print("Hai perso.")
    else:
        print("Pareggio (push).")


def simulate_one(num_decks: int = 6, stop_at: int = 17) -> str:
    """Simula una partita automatica con strategia semplice: pesca finché < stop_at."""
    deck = Deck(num_decks)
    player, dealer = deal_initial(deck)

    if player.is_blackjack() or dealer.is_blackjack():
        if player.is_blackjack() and dealer.is_blackjack():
            return "push"
        return "player" if player.is_blackjack() else "dealer"

    while player.total() < stop_at:
        player.add(deck.draw())
        if player.is_bust():
            return "dealer"

    dealer_turn(deck, dealer)
    return settle(player, dealer)


def run_batch(games: int, num_decks: int = 6, stop_at: int = 17):
    results = {"player": 0, "dealer": 0, "push": 0}
    for _ in range(games):
        results[simulate_one(num_decks=num_decks, stop_at=stop_at)] += 1

    print("\n=== Risultati Simulazione ===")
    print(f"Partite: {games}")
    print(f"Vittorie giocatore: {results['player']} ({results['player'] / games:.2%})")
    print(f"Vittorie banco:     {results['dealer']} ({results['dealer'] / games:.2%})")
    print(f"Pareggi:            {results['push']} ({results['push'] / games:.2%})")


def main():
    print("Scegli modalità:")
    print("1) Partita interattiva")
    print("2) Simulazione automatica")

    mode = input("Selezione [1/2]: ").strip()
    if mode == "1":
        play_interactive()
        return

    if mode == "2":
        games_raw = input("Numero partite da simulare (es. 10000): ").strip()
        stop_raw = input("Soglia strategia (pesca finché totale < X, default 17): ").strip()

        games = int(games_raw) if games_raw else 10000
        stop_at = int(stop_raw) if stop_raw else 17

        if games < 1:
            raise ValueError("Il numero di partite deve essere >= 1")
        if not 12 <= stop_at <= 20:
            raise ValueError("La soglia X deve essere tra 12 e 20")

        run_batch(games=games, stop_at=stop_at)
        return

    print("Modalità non valida. Riprova.")


if __name__ == "__main__":
    main()
