# Simulatore Radiologia

Mille domande a risposta multipla per preparare l'esame universitario di Diagnostica per Immagini. Un solo file HTML che apri nel browser. Funziona offline e salva i progressi sul tuo dispositivo.

**▶ Provalo ora: [simulatore-radiologia](https://mutablewarp.github.io/simulatore-radiologia/)**

![Home](docs/screenshots/home.png)

## Cosa fa

Apri la pagina e scegli come allenarti. In modalità studio rispondi e leggi subito perché la risposta è giusta e perché le altre no. In modalità esame parte un timer da 30 minuti senza feedback, e alla consegna vedi il voto in trentesimi. Le flashcard ti ripropongono più spesso le domande che sbagli.

Ogni domanda ha una spiegazione e un approfondimento clinico con i riferimenti alle linee guida. Le cinque opzioni hanno lunghezza simile, così non indovini scegliendo la più lunga: per rispondere devi sapere la materia.

| Studio | Esame |
|---|---|
| ![Studio](docs/screenshots/study.png) | ![Esame](docs/screenshots/exam.png) |

## Come usarlo

Tre strade, dalla più semplice.

1. **Online.** Apri [il link](https://mutablewarp.github.io/simulatore-radiologia/) e basta. Niente da installare. I progressi restano nel browser che usi.
2. **File da condividere.** Scarica `index.html`, aprilo con doppio click. Va anche senza connessione. Rinominalo e passalo a un compagno: a lui basta un doppio click.
3. **In locale con un server.** Utile su Safari, dove il salvataggio è limitato aprendo il file con `file://`.

```bash
python3 -m http.server 8765 --bind 127.0.0.1
open http://127.0.0.1:8765/index.html
```

Su macOS puoi anche fare doppio click su `Avvia Simulatore.command`: apre il Terminale, avvia il server e lancia il browser da solo.

## Cosa contiene

- 1000 domande su 21 aree, da Radiobiologia e fisica delle radiazioni a TC, RM, ecografia, medicina nucleare e radiologia per organo.
- Spiegazione e approfondimento per ognuna, con i riferimenti alle classificazioni e linee guida internazionali (ACR, RECIST 1.1, LI-RADS, BI-RADS, PI-RADS, Bosniak, Fleischner, AJCC 8ª ed., ASAS).
- Difficoltà regolabile. L'app parte sul livello esame e tiene a mente le domande già viste per non ripeterle a ogni sessione.

## Studiare e simulare

- **Esame ufficiale**: 30 domande in 30 minuti, voto in trentesimi arrotondato per eccesso, soglia 18, lode con il punteggio pieno.
- **Mock**: mini quiz da 15, esame completo da 60, sprint sulle domande difficili.
- **Sessione su misura**: scegli aree, difficoltà e numero di domande, oppure filtra solo gli errori o quelle da ripassare.
- **Flashcard** con ripetizione dilazionata (algoritmo SM-2 adattato): tornano quando stai per dimenticarle.

## Progressi e analisi

L'app misura come vai e ti dice dove insistere. Trovi le statistiche per area, lo streak dei giorni di studio, la copertura del pool, il tempo medio per domanda e l'andamento delle ultime sessioni. La vista "Punti deboli" individua da sola le aree con l'accuratezza più bassa e prepara una sessione mirata.

Per tenerti in pista ci sono XP, livelli a tema carriera radiologica, medaglie e un obiettivo giornaliero. Il "Palazzo della memoria" associa a ogni area un'ancora mnemonica (un luogo e un'immagine) e segue quanto l'hai consolidata.

## I tuoi dati restano tuoi

I progressi vivono nel `localStorage` del browser, sul tuo dispositivo. Nessun account, nessun server, nessuna telemetria. Dall'header esporti un backup `.json` e lo reimporti su un altro browser o computer. Se i dati salvati si rovinano, l'app li recupera da uno snapshot di sicurezza invece di perderli, e se chiudi il browser durante un esame ti chiede se riprenderlo.

## Scorciatoie da tastiera

| Tasto | Azione |
|---|---|
| `1`–`5` | Rispondi A–E |
| `Enter` | Vai alla domanda successiva |
| `F` | Segna/togli il flag dalla domanda |
| `D` | Mostra o nascondi l'approfondimento |
| `/` | Vai alla barra di ricerca |
| `?` | Mostra le scorciatoie |

## Sotto il cofano

Tutto sta in `index.html`: markup, CSS e JavaScript, senza CDN né font remoti. Le domande vivono in alcuni blocchi `<script>` che riempiono il pool; logica di ripetizione dilazionata, salvataggio e rendering stanno in un blocco finale. Il tema chiaro e quello scuro hanno il contrasto verificato, e l'interfaccia regge fino al telefono.

```
index.html                 il simulatore completo, da condividere
dist/index.html            copia per il deploy statico
Avvia Simulatore.command   launcher macOS
docs/screenshots/          le immagini di questa pagina
scripts/, validate.sh      validazione del pool e utilità di sviluppo
DESIGN.md, CHANGELOG.md     sistema di design e storico versioni
```

Per validare il pool dopo una modifica: `./validate.sh` (controlla parsing, duplicati e distribuzioni).

## Tema scuro

![Tema scuro](docs/screenshots/home-dark.png)

## Licenza

[CC BY-NC-SA 4.0](LICENSE). Usalo e modificalo per studiare, cita la fonte, niente uso commerciale.
