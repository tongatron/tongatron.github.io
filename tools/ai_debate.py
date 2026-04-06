#!/usr/bin/env python3
"""
ai_debate.py — Fai dialogare due AI con personalità diverse su un argomento.

Uso:
    python tools/ai_debate.py
    python tools/ai_debate.py --turns 10 --topic "L'intelligenza artificiale sostituirà i programmatori"
    python tools/ai_debate.py --minutes 5

Richiede:
    pip install anthropic
    export ANTHROPIC_API_KEY="sk-..."
"""

import argparse
import os
import sys
import time
from typing import Optional

import anthropic

# ─── CONFIGURAZIONE DELLE PERSONE ──────────────────────────────────────────────

PERSONAS = {
    "ottimista": {
        "nome": "Marco",
        "emoji": "🌟",
        "system": """Sei Marco, 38 anni, imprenditore tech entusiasta e ottimista radicale.
Credi fermamente nel progresso tecnologico e nelle sue conseguenze positive per l'umanità.
Argomenti tipici:
- La tecnologia risolve problemi che prima sembravano insormontabili
- La storia dimostra che ogni rivoluzione tecnologica ha creato più lavoro di quante ne abbia distrutto
- Il cambiamento è inevitabile, meglio abbracciarlo che temerlo
- L'IA democratizzerà l'accesso a competenze finora riservate a pochi

Stile di conversazione:
- Energico e contagioso, usi dati e aneddoti concreti
- Non ignori le obiezioni, ma le ricontestualizzai in modo positivo
- A volte esageri un po', ma con ironia autoconsapevole
- Fai domande provocatorie per stimolare il dibattito
- Risposte di 3-5 frasi, mai più lunghe. Vai dritto al punto.""",
    },
    "scettico": {
        "nome": "Elena",
        "emoji": "🤔",
        "system": """Sei Elena, 45 anni, sociologa e filosofa della tecnologia, critica pragmatica.
Non sei luddista: usi la tecnologia ogni giorno. Ma sei attenta alle conseguenze sistemiche e ai rischi non visti.
Argomenti tipici:
- Il progresso tecnologico beneficia principalmente chi è già avvantaggiato
- I modelli storici non si applicano direttamente all'IA, che è qualitativamente diversa
- Le esternalità negative vengono spesso socializzate mentre i profitti vengono privatizzati
- Manca una governance adeguata prima di correre avanti

Stile di conversazione:
- Calma e precisa, smontai le affermazioni con domande mirate
- Usi dati contrastanti e casi studio concreti
- Riconosci i punti validi dell'interlocutore prima di contrastarli
- A volte usi ironia sottile
- Risposte di 3-5 frasi, mai più lunghe. Vai dritto al punto.""",
    },
}

# Puoi aggiungere altre personas qui:
# "populista": { "nome": "...", "emoji": "...", "system": "..." }

# ─── COLORI TERMINALE ───────────────────────────────────────────────────────────

COLORS = {
    "ottimista": "\033[94m",   # blu
    "scettico": "\033[93m",    # giallo
    "reset": "\033[0m",
    "dim": "\033[2m",
    "bold": "\033[1m",
    "green": "\033[92m",
    "red": "\033[91m",
}


def color(text: str, c: str) -> str:
    """Applica colore solo se il terminale lo supporta."""
    if sys.stdout.isatty():
        return f"{COLORS.get(c, '')}{text}{COLORS['reset']}"
    return text


# ─── LOGICA PRINCIPALE ──────────────────────────────────────────────────────────

def build_context_message(
    conversation: list[dict],
    persona_key: str,
    topic: str,
    turn: int,
) -> list[dict]:
    """
    Costruisce i messaggi per la prossima risposta di una persona.
    L'intera storia della conversazione viene passata come contesto.
    """
    other_key = [k for k in PERSONAS if k != persona_key][0]
    other = PERSONAS[other_key]
    me = PERSONAS[persona_key]

    # Primo turno: l'utente introduce il tema
    if not conversation:
        return [{
            "role": "user",
            "content": (
                f"Stai partecipando a un dibattito con {other['nome']} ({other_key}) "
                f"sull'argomento: \"{topic}\".\n\n"
                f"Apri il dibattito con la tua posizione iniziale. "
                f"Sii diretto e stimolante."
            ),
        }]

    # Turni successivi: converti la storia in alternanza user/assistant
    messages = []

    # Istruzione iniziale
    messages.append({
        "role": "user",
        "content": (
            f"Stai partecipando a un dibattito con {other['nome']} ({other_key}) "
            f"sull'argomento: \"{topic}\". "
            f"Ecco la conversazione finora:"
        ),
    })

    # Simula alternanza: io (assistant) / altro (user)
    # Determiniamo chi ha parlato per primo
    first_speaker = conversation[0]["persona"]

    if first_speaker == persona_key:
        # Ho parlato io per primo
        for i, msg in enumerate(conversation):
            if msg["persona"] == persona_key:
                role = "assistant"
            else:
                role = "user"

            # raggruppa messaggi consecutivi dello stesso ruolo
            if messages and messages[-1]["role"] == role:
                messages[-1]["content"] += f"\n\n{msg['text']}"
            else:
                messages.append({"role": role, "content": msg["text"]})
    else:
        # Ha parlato l'altro per primo — aggiungo un turno iniziale fittizio
        messages.append({
            "role": "assistant",
            "content": "(Ascolto l'apertura del dibattito.)",
        })
        for i, msg in enumerate(conversation):
            if msg["persona"] == persona_key:
                role = "assistant"
            else:
                role = "user"
            if messages and messages[-1]["role"] == role:
                messages[-1]["content"] += f"\n\n{msg['text']}"
            else:
                messages.append({"role": role, "content": msg["text"]})

    # Istruzione finale per il prossimo turno
    messages.append({
        "role": "user",
        "content": (
            f"Ora è il tuo turno ({me['nome']}). "
            f"Rispondi a {other['nome']}, mantenendo il tuo punto di vista caratteristico. "
            + ("Avvicinati a una conclusione." if turn > 6 else "Approfondisci il dibattito.")
        ),
    })

    return messages


def stream_response(client: anthropic.Anthropic, persona_key: str, messages: list[dict]) -> str:
    """Streamma la risposta e la stampa in tempo reale. Ritorna il testo completo."""
    persona = PERSONAS[persona_key]
    prefix = color(f"{persona['emoji']} {persona['nome']}: ", persona_key)
    print(f"\n{prefix}", end="", flush=True)

    full_text = ""
    with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=512,
        system=persona["system"],
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
            full_text += text

    print()  # newline dopo la risposta
    return full_text


def print_header(topic: str, turns: Optional[int], minutes: Optional[float]) -> None:
    print()
    print(color("━" * 60, "bold"))
    print(color("  🗣️  AI DEBATE", "bold"))
    print(color("━" * 60, "bold"))
    print(f"  Argomento: {color(topic, 'bold')}")

    personas_list = ", ".join(
        f"{p['emoji']} {p['nome']} ({k})"
        for k, p in PERSONAS.items()
    )
    print(f"  Partecipanti: {personas_list}")

    if turns:
        print(f"  Durata: {turns} turni")
    elif minutes:
        print(f"  Durata: {minutes} minuti")

    print(color("━" * 60, "bold"))
    print()


def print_summary(conversation: list[dict], elapsed: float) -> None:
    print()
    print(color("━" * 60, "dim"))
    print(color("  📋 RIEPILOGO", "bold"))
    print(color("━" * 60, "dim"))
    print(f"  Turni totali: {len(conversation)}")
    print(f"  Durata: {elapsed:.0f} secondi")
    print()

    # Conta chi ha parlato di più (per parola)
    for key, persona in PERSONAS.items():
        msgs = [m for m in conversation if m["persona"] == key]
        word_count = sum(len(m["text"].split()) for m in msgs)
        print(f"  {persona['emoji']} {persona['nome']}: {len(msgs)} interventi, ~{word_count} parole")

    print(color("━" * 60, "dim"))
    print()


def run_debate(
    topic: str,
    max_turns: Optional[int] = None,
    max_minutes: Optional[float] = None,
    starting_persona: str = "ottimista",
) -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print(color("❌ Imposta ANTHROPIC_API_KEY prima di eseguire lo script.", "red"))
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    persona_keys = list(PERSONAS.keys())
    if starting_persona not in persona_keys:
        starting_persona = persona_keys[0]

    # Ordine di turni: chi parte prima, poi si alternano
    order = [starting_persona] + [k for k in persona_keys if k != starting_persona]

    print_header(topic, max_turns, max_minutes)

    conversation: list[dict] = []
    turn = 0
    start_time = time.time()

    try:
        while True:
            # Controllo limiti
            elapsed = time.time() - start_time
            if max_turns and turn >= max_turns:
                break
            if max_minutes and elapsed >= max_minutes * 60:
                break

            persona_key = order[turn % len(order)]

            # Stampa numero turno
            turn_label = color(f"[Turno {turn + 1}]", "dim")
            print(f"  {turn_label}", end="")

            # Costruisci contesto e ottieni risposta
            messages = build_context_message(conversation, persona_key, topic, turn)
            text = stream_response(client, persona_key, messages)

            conversation.append({"persona": persona_key, "text": text})
            turn += 1

            # Piccola pausa tra i turni per leggibilità
            if max_turns and turn < max_turns or max_minutes:
                time.sleep(0.5)

    except KeyboardInterrupt:
        print(color("\n\n⏹  Dibattito interrotto dall'utente.", "dim"))

    elapsed = time.time() - start_time
    print_summary(conversation, elapsed)


# ─── CLI ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fai dialogare due AI con personalità diverse su un argomento.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Esempi:
  python tools/ai_debate.py
  python tools/ai_debate.py --topic "Il reddito di base universale è una buona idea?" --turns 8
  python tools/ai_debate.py --topic "I social media fanno più male che bene" --minutes 3
  python tools/ai_debate.py --turns 6 --start scettico
        """,
    )
    parser.add_argument(
        "--topic",
        default="L'intelligenza artificiale cambierà radicalmente il mercato del lavoro nei prossimi 10 anni",
        help="Argomento del dibattito",
    )
    parser.add_argument(
        "--turns",
        type=int,
        default=None,
        help="Numero massimo di turni (default: 8 se --minutes non specificato)",
    )
    parser.add_argument(
        "--minutes",
        type=float,
        default=None,
        help="Durata massima in minuti",
    )
    parser.add_argument(
        "--start",
        choices=list(PERSONAS.keys()),
        default=list(PERSONAS.keys())[0],
        help=f"Chi parla per primo (default: {list(PERSONAS.keys())[0]})",
    )

    args = parser.parse_args()

    # Default: 8 turni se non specificato nulla
    if args.turns is None and args.minutes is None:
        args.turns = 8

    run_debate(
        topic=args.topic,
        max_turns=args.turns,
        max_minutes=args.minutes,
        starting_persona=args.start,
    )


if __name__ == "__main__":
    main()
