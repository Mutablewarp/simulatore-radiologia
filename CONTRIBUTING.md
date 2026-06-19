# Come contribuire al Simulatore Radiologia

Grazie per voler migliorare il simulatore! Questo documento descrive come contribuire in modo che le modifiche restino consistenti.

## Tipi di contributi accettati

| Tipo | Esempi |
|---|---|
| 🐛 Bug report | Comportamento errato, errore JS, layout rotto |
| 📚 Correzione contenuti | Risposta sbagliata, spiegazione inaccurata, refuso |
| ➕ Nuove domande | Argomenti non coperti, casi reali d'esame |
| ✨ Feature | UI, statistiche, modalità di studio |
| 📖 Documentazione | README, commenti nel codice |

## Setup locale

```bash
git clone <URL-DEL-REPOSITORY>
cd simulatore-radiologia

# Avvia in browser
./Avvia\ Simulatore.command
# oppure: doppio click su "Avvia Simulatore.command" dal Finder

# Valida JS prima di committare
./validate.sh
```

## Stile delle domande

Ogni domanda nel pool segue questa struttura JS:

```js
{
  id: 'q321',                          // progressivo qNNN, MAI riusare
  topic: 'TC',                         // uno dei topic ammessi (vedi sotto)
  subtopic: 'Cardio-TC',               // libero ma descrittivo
  q: "Domanda chiara e specifica?",    // termina con punto interrogativo
  opts: [                              // ESATTAMENTE 5 opzioni
    "Opzione A breve",
    "Opzione B breve",
    "Opzione C breve",
    "Opzione D corretta dettagliata",
    "Opzione E breve"
  ],
  correct: 3,                          // indice 0-4 (qui = D)
  explain: "Spiegazione esaustiva 4-8 righe che chiarisce perché la risposta è corretta E perché le altre sono sbagliate. Cita numeri concreti (HU, kV, mSv) e criteri specifici.",
  deep: "Approfondimento opzionale ma raccomandato 4-10 righe: fisiopatologia, meccanismi, classificazioni, varianti, diagnosi differenziale, pitfall clinici. Stile mini-paragrafo di manuale.",
  source: 'generated',                 // 'real' (compito reale verificato), 'word' (file Word fonte), 'generated' (nuova)
  diff: 'medium'                       // 'easy' | 'medium' | 'hard'
}
```

### Topic ammessi (esatti, case-sensitive)

`Radiobiologia`, `Raggi X`, `TC`, `RM`, `Ecografia`, `Mdc`, `Nucleare`, `RX Torace`, `Toracico`, `Addome`, `Neuro`, `Vascolare`, `Urologico`, `Mammella`, `Muscoloscheletrico`, `Interventistica`, `Pediatrica`, `Ginecologia`, `Endocrino`, `Emergenze`, `Generale`.

Se serve un topic nuovo, discutilo prima in una issue.

### Regole tassative

1. **5 opzioni**, una sola corretta
2. **Distrattori plausibili**: niente opzioni assurde tipo "Solo per RX" se il tema è RM
3. **Lunghezza opzioni simile**: evita di rendere la corretta riconoscibile per lunghezza
4. **Position uniformity**: il batch finale viene rebalanciato (vedi `scripts/rebalance.py`) per distribuire uniformemente correct fra A/B/C/D/E
5. **Italiano corretto**, terminologia medica accurata
6. **Acronimi sciolti** la prima volta (es. "EP — Embolia Polmonare")
7. **Numeri concreti**: kV, mAs, HU, mSv, Gy, %, cm, MHz dove rilevanti
8. **Source `real`** solo se la domanda viene da un compito fotografato verificato

## Stile commit

Seguiamo Conventional Commits:

```
<tipo>(<scope>): <descrizione breve>

<body opzionale con dettagli>
```

Tipi: `feat`, `fix`, `docs`, `content`, `refactor`, `chore`, `deploy`.

Esempi buoni:
- `content(neuro): add 10 questions on diffusion imaging`
- `fix(exam): timer continua dopo abbandono`
- `docs(readme): aggiungi link Cloudflare Pages`
- `feat(stats): grafico trend ultima 30 sessioni`

## Validazione

Prima di aprire una PR, esegui:

```bash
./validate.sh
```

Lo script controlla:
- Tutti i blocchi `<script>` parsano in JS
- Nessun qid duplicato
- Distribuzione bilanciata della posizione corretta
- Conteggio per topic e difficoltà

## Pull Request

1. Crea un branch: `git checkout -b feature/nome-feature` o `content/topic-batch`
2. Apri PR con descrizione delle modifiche
3. Attendi review (almeno un OK)
4. Squash + merge

## Disclaimer medico

Tutto il materiale è didattico. Se identifichi un errore clinico-radiologico, apri una issue marcata `medical-accuracy`.

## Codice di condotta

Sii cortese, costruttivo, rispettoso. Le critiche vanno alle idee, mai alle persone.
