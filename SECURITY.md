# Sicurezza

Questa è un'applicazione client-side che gira esclusivamente nel browser dell'utente. Non c'è backend, non c'è database remoto, non vengono trasmessi dati personali.

## Cosa salva l'app

Tutto in `localStorage` del browser, locale al device:
- Progressi di studio (risposte, tempi, accuratezza per qid)
- Errori commessi (con timestamp)
- Domande flagged
- Impostazioni personali (tema, modalità spiegazione)
- Statistiche aggregate

Nessun dato lascia mai il browser, eccetto quando l'utente esporta manualmente un backup `.json`.

## Cosa NON salva l'app

- Nessun dato personale identificabile (nome, email, ID studente)
- Nessuna telemetria o analytics
- Nessuna chiamata di rete (il file è 100% self-contained)
- Nessun cookie

## Backup files

I file `radiologia-progressi-AAAA-MM-GG.json` esportati dall'utente contengono solo dati di studio. Non hanno PII. Sono esclusi dal git via `.gitignore`.

## Deploy statico (CDN)

Se distribuito tramite una CDN statica (es. Cloudflare Pages, Netlify), il singolo file `index.html` viene servito così com'è. La CDN può raccogliere analytics di rete standard (IP, user-agent) come per qualsiasi sito; non c'è tracking aggiuntivo da parte dell'app.

## Segnalazione vulnerabilità

Se identifichi un problema di sicurezza (XSS, esecuzione di codice arbitrario, leak di dati locale-cross-origin), non aprire una issue pubblica.

Contatta privatamente tramite GitHub (private message all'autore della repo) o apri una issue marcata come `security` con descrizione minimal.

## Vulnerabilità conosciute

Nessuna al momento. L'app non accetta input arbitrari da rete e tutti i template literal HTML usano `esc()` per sanitizzare prima dell'inserimento.
