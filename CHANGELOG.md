# Changelog

Tutte le modifiche significative al simulatore sono documentate qui.

Il formato segue [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) e il versioning segue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.2.0] — 2026-06-19

### Aggiunto — espansione del pool
- **+203 nuove domande** (q621–q823) generate per topic e verificate in modo avversariale (un revisore medico per lotto che scarta o corregge le domande dubbie). Pool da 620 a **823 domande**. Generazione orchestrata con un workflow multi-agente (88 agenti).
- Copertura ampliata su: Radiobiologia, Raggi X, TC, RM, Ecografia, Mezzi di contrasto, RX torace, Torace, Addome, Neuroradiologia, Vascolare, Mammella, Urologico.
- Nuovo `scripts/integrate_questions.cjs`: integrazione deterministica (validazione di forma, dedup vs pool esistente, assegnazione id, iniezione del lotto) nello stile del pool.

### Cambiato — privacy / igiene del repository
- **Branding reso generico**: rimossi dai testi visibili e dai commenti i riferimenti a docente/canale/sede; l'app è ora "Simulatore Radiologia · Diagnostica per Immagini". I contenuti delle domande (medicina) sono invariati.
- Rimossi dai file riferimenti ad account/deploy personali e al nome dell'autore (LICENSE, footer, README, CHANGELOG, CONTRIBUTING, SECURITY, launcher, deploy.sh).
- Screenshot rigenerati con il nuovo branding e il conteggio aggiornato.

### Nota
- Tetto obiettivo 1000 domande: questa release si ferma a 823 (limite tecnico di generazione raggiunto a metà run); le restanti sono pianificate per una release successiva, con un passaggio di ribilanciamento delle lunghezze delle opzioni sul nuovo lotto.

## [5.1.0] — 2026-06-12

Redesign completo dell'interfaccia, da zero. Obiettivo richiesto: un simulatore **ben proporzionato, armonico ed efficiente**. Via il vecchio tema "sala di refertazione" (carta crema, texture a griglia, grana film, serif editoriale): nuovo design system clinico-minimale costruito con il workflow `impeccable`.

### Cambiato — nuova grafica "Strumento clinico"
- **Design system da zero** (foglio di stile riscritto interamente): palette OKLCH con bianco puro (niente più effetto "carta"), inchiostro caldo ad alto contrasto e **un solo primario terracotta** per azioni e selezione; ambra riservata a flag/streak/avvisi-timer; verde e rosso solo come stati semantici (giusto/sbagliato).
- **Scala tipografica e spaziatura armoniche**: tipo su passo 1.125–1.2 (niente più clamp fluidi), spaziatura su griglia 4px, raggi e ombre coerenti. La domanda è l'elemento dominante della pagina; tutto il resto è gerarchicamente sotto.
- **Tipografia di sistema** (SF Pro / system-ui + mono per i dati): zero font remoti, coerente con l'architettura offline single-file.
- **Componenti ridisegnati**: opzioni di risposta con stati chiari (default/hover/selezionata/corretta/errata) e target touch ≥ 44px; card domanda con ombra leggera; mappa esame con celle stato (risposta/corrente/flag) leggibili; hero gamification ricomposto su griglia; statistiche, esplora, traguardi e palazzo della memoria riallineati allo stesso vocabolario.
- **Tema scuro "sala di lettura"** ribilanciato: fondo caldo scuro (non nero puro), contrasti verificati, accento terracotta che regge.
- Texture decorative del vecchio tema (grana, griglia, scout-line, sfondo hero) **rimosse**.

### Tecnico / verifica
- Contrasto verificato per pixel campionati nel browser reale: testo bianco su primario 5.6:1, primario come testo ≥ 4.9:1, corpo ≥ 5:1 in entrambi i temi (≥ WCAG AA). Primario portato a OKLCH L0.53 per dare margine sopra la soglia 4.5:1.
- Collaudo visivo reale (Claude Preview) su home, studio, esame (chiaro+scuro), risultato, statistiche, e mobile 390px; tutte le 8 viste renderizzano senza eccezioni.
- Regressione funzionale: riconfermati i 12 controlli chiave della v5.0 (default durata esame, consegna idempotente, snapshot/recovery, error boundary, voto in trentesimi) — tutti verdi dopo il redesign.
- `prefers-reduced-motion` e tutte le funzionalità v5.0 preservate. APP_VERSION 5.1.0.

## [5.0.0] — 2026-06-11

Versione focalizzata su **stabilità e affidabilità** + allineamento al **formato d'esame reale** della prova scritta. Audit multi-agente del codice (6 dimensioni, verifica avversariale dei finding) + ricerca del formato d'esame ufficiale.

### Aggiunto — affidabilità
- **Recupero da stato corrotto**: se i dati salvati non si caricano, il blob corrotto viene messo in quarantena (chiave `_corrupt`) e lo stato viene ripristinato dallo **snapshot di sicurezza** ("ultimo stato buono", aggiornato al massimo una volta l'ora). Prima: perdita silenziosa di tutti i progressi al primo salvataggio successivo.
- **Error boundary globale**: `window.onerror`/`unhandledrejection` + try/catch attorno a ogni vista → mai più pagina bianca; schermata di recupero con "Torna alla home / Esporta backup / Ricarica".
- **Self-test del pool al boot**: se un blocco di domande non si carica (file troncato), avviso esplicito e **disattivazione della pulizia distruttiva** delle card (che prima avrebbe cancellato i progressi delle domande "mancanti").
- **Flush automatico** dei dati su `pagehide`/`visibilitychange` (chiusura tab, passaggio in background — soprattutto mobile).
- **Guardia multi-scheda**: avviso se un'altra scheda del simulatore sovrascrive i progressi.

### Corretto — bug confermati dall'audit
- **Esame con auto-consegna immediata** (HIGH): "Nuova sessione" dalla schermata risultati di un esame partiva con durata 0 → il timer consegnava forzatamente dopo 1 secondo registrando uno 0% in cronologia. Ora ogni esame senza durata esplicita riceve un default sicuro (1 min/domanda, min 10).
- **Doppia consegna esame**: `finishExam` ora è idempotente — SR, statistiche e XP non possono più essere applicati due volte.
- **Recovery fantasma**: abbandonare un esame (Annulla o navigazione) non rimuoveva lo snapshot di recovery → al riavvio l'app proponeva di "riprendere" un esame abbandonato di proposito. Ora ogni percorso di uscita pulisce lo snapshot (`clearExamSession`).
- **Timer in background**: se il tempo scade mentre la tab è sospesa/throttled, l'esame viene consegnato al ritorno in foreground (listener `visibilitychange` + rete di sicurezza in render).
- **Filtro "Solo SR-dovute"** includeva tutte le domande mai viste invece dei soli ripassi scaduti (predicato allineato a `dueCount`).
- **Import backup**: ora validato nella forma PRIMA di toccare lo stato, con conferma annullabile, card sanificate (niente NaN nello scheduler), salvataggio di sicurezza pre-import e **rollback automatico** se l'import fallisce a metà. Prima un JSON parsabile ma malformato poteva corrompere i progressi senza rimedio.
- **Backup incompleto**: l'export non includeva XP/livelli/badge/obiettivo (`state.game`), né `recentlyShown` e impostazioni → il ripristino su nuovo dispositivo azzerava la gamification. Ora il backup (v3) è completo.
- **Recovery esame**: l'indice domanda e le risposte dello snapshot vengono sanificati; il cronometro della domanda riparte da zero (prima il primo `timeMs` post-recovery includeva tutto il tempo offline e falsava SR e statistiche).
- **Streak**: visualizzazione corretta a 0 quando la catena è spezzata (prima mostrava l'ultimo valore); accredito del giorno anche per sessioni che attraversano la mezzanotte; orologio spostato indietro non gonfia/spezza più la streak.
- **Scorciatoie tastiera**: ignorati i tasti con modificatori (Cmd/Ctrl/Alt — niente più flag accidentale con Cmd+F) e l'Enter su un bottone focalizzato (niente doppio avanzamento in esame).
- **Ricerca**: l'evidenziazione non corrompe più le entità HTML (cercare "amp"/"quot" rompeva il markup).
- **errorLog/history** con cap anche nel percorso esame (prima crescita illimitata dello storage).
- `validate.sh`: rimossi un falso errore di parsing (stripping regex dei listener) e un falso duplicato (id badge `q250`); exit code corretto.

### Aggiunto — formato esame ufficiale
- **Preset "Esame ufficiale"**: 30 domande in **30 minuti**, primo preset di default sia nel mock che nel setup esame. Formato della prova scritta: *risposta multipla con una sola corretta, 30 minuti, voto in trentesimi, soglia 18/30*.
- **Voto in trentesimi** nella schermata risultati di ogni esame: scala 0–30 arrotondata per eccesso, soglia 18 evidenziata, lode con punteggio pieno.
- Nota informativa sul formato d'esame nella schermata "Simula esame".

### Tecnico
- Nuovo `scripts/validate_pool.cjs`: validatore deterministico del pool (id, opzioni, indici, spiegazioni, topic, tell di lunghezza) — 620 domande, 0 errori.
- Nuovo `scripts/dev_server.cjs`: mini-server statico Node senza dipendenze per sviluppo/test.
- Suite di test runtime nel browser reale: 25+ assert su default durata esame, doppia consegna, recovery fantasma, sanificazione snapshot, error boundary, validazione import, quarantena+ripristino da stato corrotto, voto in trentesimi, streak.
- APP_VERSION 5.0.0.

## [4.1.0] — 2026-06-09

### Migliorato
- **Domande molto meno indovinabili**: nell'analisi del pool, nell'84% delle domande la risposta corretta era l'opzione **più lunga** (e nel 73% ≥1,6× i distrattori) → si poteva indovinare scegliendo "la più lunga" senza sapere la materia. I distrattori di **528 domande** sono stati riscritti per essere plausibili, medicalmente concreti ma sbagliati, e **di lunghezza pari alla corretta**. Risultato: "corretta = più lunga" sceso dall'84% al **32%** (vicino al 20% del caso) e rapporto di lunghezza da 8,06 a **1,01**. Ora servono ragionamento e conoscenza per rispondere.
- Lavoro orchestrato con **60 agenti** (riscrittura + verifica medica avversariale che ha controllato resti *una sola* risposta corretta e che nessun distrattore fosse accidentalmente vero — 271 casi corretti).

### Tecnico
- Integrazione precisa per qid (sostituzione del solo array `opts`/`correct`); explain e deep invariati.
- Test runtime con 620 domande: tutte le viste, sessione completa, mock esame, ripasso ancorato, anti-freeze.
- APP_VERSION 4.1.0.

## [4.0.0] — 2026-06-08

Versione focalizzata sulla **preparazione all'esame**: contenuti più ricchi e difficili, niente più ripetizioni, grafica ridisegnata. Lavoro orchestrato con 32 agenti (arricchimento + generazione + verifica medica avversariale) fondato sul materiale reale del corso (DOCX di domande reali + PDF "Domande+Risposte" di 82 pagine).

### Aggiunto
- **+120 nuove domande livello-esame** (q501-q620), tutte hard o medium, generate dal materiale reale del corso e **verificate in modo avversariale** (i revisori hanno corretto errori fattuali: es. resa del tubo di Coolidge, lesione di Hill-Sachs postero-laterale, staging Ficat-Arlet). Pool totale: **620 domande**.
- **Anti-ripetizione**: il simulatore ricorda le ultime ~140 domande proposte e dà priorità a quelle nuove/non recenti con campionamento pesato → 0 sovrapposizione tra sessioni consecutive.
- **Preferenza di difficoltà** (impostazione "Livello difficoltà"): *Esame* (default, favorisce hard/medium) · Bilanciato · Graduale.
- **Restyling completo "sala di refertazione"**: tipografia editoriale (serif display da rivista medica + sans umanista + mono per i dati), palette ricca (tema chiaro "carta", tema scuro "negativoscopio" con accento fosforo), texture a griglia tecnica + grana film, "scout line" sulla card domanda, animazioni d'ingresso staggered, micro-interazioni sulle opzioni.

### Migliorato
- **Tutte le spiegazioni ora esaustive**: le 218 domande con spiegazione scarna (e le 199 senza approfondimento) sono state riscritte fondandole sul PDF-chiave del corso. Ora **tutte le 620** hanno explain (media ~760 caratteri) + deep dive (media ~1080) — prima il 40% era senza approfondimento e il 21% aveva spiegazioni sotto i 200 caratteri.

### Tecnico
- `recentlyShown` e le nuove impostazioni persistiti nel backup (retro-compatibile).
- Test runtime esteso con 620 domande: render di tutte le viste, sessione completa, mock esame, ripasso ancorato, e verifica anti-freeze dei conteggi per ogni n.
- APP_VERSION 4.0.0.

## [3.0.0] — 2026-05-29

### Aggiunto
- **Sistema di gamification stile videogioco** per motivare lo studio quotidiano:
  - **XP e 15 livelli** a tema carriera radiologica (Matricola → Specializzando R1-R5 → Radiologo → Primario → Leggenda)
  - **Barra XP** animata con shimmer e transizioni
  - **Streak gamificata** con **fiamma animata** (3 livelli di intensità: 1+, 7+, 30+ giorni) e record
  - **Obiettivo giornaliero** con anello di progresso SVG e celebrazione al raggiungimento
  - **Sistema combo**: risposte corrette di fila → moltiplicatore XP + feedback "in fiamme"
  - **22 medaglie/achievement** sbloccabili (streak, combo, sessioni perfette, maestria d'area, gufo notturno, ancoraggio, livelli…)
  - **Animazioni celebrative**: overlay di level-up, sblocco medaglia, obiettivo + **confetti**
  - Vista **Traguardi** dedicata con livello, statistiche di gioco e galleria medaglie
- **Sistema di ancoraggio mentale (metodo dei loci / palazzo della memoria)**:
  - **Ancora mnemonica per ognuna delle 21 aree** (luogo + immagine vivida + gancio sintetico) mostrata durante studio/ripasso per favorire la memoria a lungo termine
  - **Misuratore di "forza di ancoraggio"** per ogni concetto (0-100%), derivato da ripetizioni spaziate, facilità e accuratezza
  - **Ripasso ancorato**: sessione SR che dà priorità ai concetti con ancoraggio più debole e rinforza con l'ancora mnemonica
  - Vista **Palazzo della Memoria** con tutte le ancore e il livello di consolidamento per area

### Corretto
- **CRITICO — freeze del browser** (`composeSession`): loop infinito quando il numero di domande richiesto era inferiore al numero di topic (es. sessione da 12/15/20 con 21 aree). Si attivava su "Sessione veloce", "Mini quiz" e ripasso ancorato, bloccando l'app. Aggiunte guardie anti-loop; ora ogni `n` produce esattamente il numero richiesto.

### Tecnico
- Stato `game` (xp, badge, obiettivo giornaliero, combo record) persistito nel backup con retro-compatibilità
- Test di esecuzione runtime esteso (render di tutte le viste + sessione simulata + percorsi gamification)

## [2.0.0] — 2026-05-29

### Aggiunto
- **Pool a 500 domande** (+180 nuove q321-q500) distribuite proporzionalmente sui 21 topic
- File standard repo: `LICENSE` (CC BY-NC-SA 4.0), `CONTRIBUTING.md`, `CHANGELOG.md`, `SECURITY.md`
- Script `validate.sh` per contributors (parsing JS, controllo duplicati, distribuzione)
- Script `deploy.sh` per re-deploy comodo su Cloudflare Pages
- Costante di versione `APP_VERSION` mostrata nel footer
- Avviso esplicito al boot se `localStorage` non disponibile (Safari privato)

### Migliorato
- `Avvia Simulatore.command` ora rileva configurazioni anomale e suggerisce alternative
- Documentazione completa con linee guida contributori

## [1.1.0] — 2026-05-28

### Aggiunto
- **Pool 320 domande** (+40 nuove q281-q320) in topic sotto-rappresentati: Endocrino, Raggi X, Ginecologia, Emergenze
- **Costruttore sessione personalizzata** con multi-filtro topic + difficoltà + SR/errori/flagged
- **Vista "Punti deboli"**: analisi automatica top topic con accuratezza più bassa
- **Mock exam preset** (4 configurazioni: mini quiz, compito tipo, esame completo, sprint hard)
- **Grafico SVG trend** accuratezza ultime 30 sessioni
- **Search highlight** nei risultati del browser

### Migliorato
- Deploy statico su CDN (build in `dist/`)

## [1.0.0] — 2026-05-26

### Aggiunto
- Pool iniziale 280 domande (q001-q280)
- Spaced repetition (algoritmo SM-2 adattato)
- 3 modalità: studio, esame simulato, flashcard
- Crash recovery sessione esame via localStorage
- Backup/restore JSON
- Statistiche per topic, streak, storico
- Dark mode, ricerca, scorciatoie tastiera
- Mobile-friendly (tap target ≥40px)
- Launcher `.command` per macOS
- Repository GitHub privata

### Risolto
- 14 errori medici fattuali identificati dalla review critica (q221-q280)
- Bias posizione corretta nelle nuove domande (12/12/12/12/12)
- Bug `_endTime` mai assegnato
- Card orfane non pulite dopo import
- Persistenza sessione esame mancante
