# Design

Sistema visivo del Simulatore Radiologia (v5.1). Register: **product** (l'interfaccia
serve il compito: studiare e simulare l'esame). Direzione: **clinico-minimale**, chiaro
pulito, densità equilibrata. Tutto vive nel singolo `index.html` (blocco `<style>`), offline.

## Theme

Strumento medicale moderno: bianco puro, inchiostro caldo, un accento terracotta che fa
tutto il lavoro. Niente texture, niente decorazione: l'attenzione è sulla domanda. Tema
scuro "sala di lettura" disponibile col toggle (fondo caldo scuro, non nero).

## Color (OKLCH)

Token in `:root` (chiaro) e `.dark` (scuro). Strategia: **Restrained** (un accento ≤ 10%).

- `--bg` bianco puro `oklch(1 0 0)` · `--bg-soft` neutro tenue · `--bg-elev` superfici.
- `--text` `oklch(0.25 0.018 45)` · `--text-soft` · `--text-faint` (meta).
- `--primary` terracotta `oklch(0.53 0.128 42)` → azioni primarie, selezione, link, barre.
  `--on-primary` bianco (contrasto ≥ 5.6:1). `--primary-soft` per fondi tenui/tag topic.
- `--accent` ambra `oklch(0.56 0.122 70)` → SOLO flag, streak, avvisi timer.
- `--success` verde / `--danger` rosso → SOLO stati semantici (corretto/errato/scaduto).
- `--border` / `--border-strong` per i bordi (mai side-stripe).

Contrasto verificato a campione (pixel reali): corpo ≥ 5:1, primario-testo ≥ 4.9:1 in
entrambi i temi.

## Typography

- Famiglia di sistema: `--font-sans` (-apple-system / SF Pro / system-ui) + `--font-mono`
  (SF Mono / ui-monospace) per timer, percentuali, numeri tabulari. Niente font remoti.
- Scala fissa in rem, passo ~1.125–1.2 (`--fs-xs` 11.5px → `--fs-3xl` 28px). Pesi 450–700.
- Titoli `letter-spacing: -0.015em`, `text-wrap: balance`; prosa `text-wrap: pretty`, ≤ 72ch.

## Spacing & shape

- Spaziatura su griglia 4px: `--s1` 4 → `--s9` 56.
- Raggi: `--r-sm` 7 / `--r-md` 10 / `--r-lg` 14 / `--r-full`.
- Ombre solo su oggetti elevati: card domanda, overlay, toast (`--shadow-card`, `--shadow-pop`).

## Components

Vocabolario coerente su tutte le viste:
- **Bottoni** `.btn` (+ `-primary` / `-ghost` / `-danger` / `-accent` / `-sm` / `-lg` / `-block`):
  stati default/hover/active/disabled.
- **Opzioni** `.q-option`: default/hover/selected/correct/wrong/disabled, target ≥ 44px,
  tasto-lettera monospazio, segno ✓/✗ a fine riga.
- **Tag** `.tag` (`-topic` primary-soft, `-easy/-medium/-hard` semantici, `-source-real`).
- **Chip** `.chip` per i filtri (toggle `.active`).
- **Mappa esame** `.exam-cell` (`.answered` / `.current` / flag).
- **Stat / chart / heatmap**: barre su `--primary`, numeri tabulari.
- **Hero** gamification su griglia `1fr auto auto` (livello+XP / streak / anello obiettivo).
- **Overlay** level-up/badge e **toast** su superfici elevate.

## Layout

- Shell centrata `max-width: 1080px`; vista domanda `max-width: 760px` (riga di lettura comoda).
- Header sticky con nav centrale; su < 900px il nav va a capo e scrolla, la search si stringe;
  su < 560px brand-sub e save-status si nascondono, padding ridotto.
- Griglie responsive senza breakpoint dove possibile: `repeat(auto-fit, minmax(...))`.
- z-index semantico: header → shortcuts → overlay → toast.

## Motion

- 140–200 ms, `--ease-out` cubic-bezier(0.22,1,0.36,1). Solo stato/feedback/reveal.
- Ingresso vista (`view-enter`) e feedback risposta minimi; fiamma streak con flicker tenue.
- `@media (prefers-reduced-motion: reduce)`: animazioni azzerate, niente flicker.
