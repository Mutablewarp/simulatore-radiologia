#!/usr/bin/env bash
# Launcher del Simulatore di Radiologia
# Doppio click su questo file dal Finder per avviare.
# Cerca una porta libera tra 8765-8785 (evita conflitto con altri progetti).
# Apre il browser di default sull'URL servito.
#
# Compatibile macOS e Linux. Su Windows, vedi README.md.

set -euo pipefail

# Vai nella cartella dove si trova questo script (gestisce path con spazi)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Verifica che index.html esista
if [ ! -f "index.html" ]; then
  echo ""
  echo "❌ ERRORE: index.html non trovato in $(pwd)"
  echo ""
  echo "Il file index.html deve trovarsi nella stessa cartella di questo script."
  echo "Hai forse spostato il file? Riposiziona index.html accanto al launcher."
  echo ""
  echo "Premi Invio per chiudere questa finestra..."
  read -r
  exit 1
fi

# Cerca python3 in posizioni standard (alcune installazioni non sono in PATH)
PYTHON=""
for candidate in python3 python /usr/local/bin/python3 /opt/homebrew/bin/python3 /usr/bin/python3; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PYTHON="$candidate"
    break
  fi
done

if [ -z "$PYTHON" ]; then
  echo ""
  echo "❌ ERRORE: Python 3 non trovato sul sistema."
  echo ""
  echo "Opzioni per risolvere:"
  echo "  1) Installa Python 3 da https://www.python.org/downloads/"
  echo "  2) Su macOS: 'brew install python3'"
  echo "  3) ALTERNATIVA SENZA INSTALLARE NULLA: doppio click direttamente su"
  echo "     index.html — si apre nel browser. Su Safari il localStorage può"
  echo "     essere limitato; usa Chrome/Firefox se preferisci questa via."
  echo ""
  echo "Premi Invio per chiudere..."
  read -r
  exit 1
fi

# Trova una porta libera nell'intervallo 8765-8785
PORT=""
for p in 8765 8766 8767 8768 8769 8770 8771 8772 8773 8774 8775 8776 8777 8778 8779 8780 8781 8782 8783 8784 8785; do
  if command -v lsof >/dev/null 2>&1; then
    if ! lsof -i ":$p" -t >/dev/null 2>&1; then
      PORT=$p
      break
    fi
  else
    # Fallback per sistemi senza lsof: usa netstat o nc
    if ! (echo "" >/dev/tcp/127.0.0.1/$p) 2>/dev/null; then
      PORT=$p
      break
    fi
  fi
done

if [ -z "$PORT" ]; then
  echo ""
  echo "❌ ERRORE: nessuna porta libera nel range 8765-8785."
  echo ""
  echo "Hai forse molti server in esecuzione? Prova a chiudere altri Terminal."
  echo "Oppure apri direttamente index.html con un doppio click."
  echo ""
  echo "Premi Invio per chiudere..."
  read -r
  exit 1
fi

URL="http://127.0.0.1:${PORT}/index.html"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   📚  SIMULATORE RADIOLOGIA — Diagnostica per Immagini      ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
printf "║   Server attivo su:  %-39s ║\n" "$URL"
echo "║                                                              ║"
echo "║   Il browser si aprirà tra 1 secondo.                        ║"
echo "║                                                              ║"
echo "║   Per FERMARE:                                               ║"
echo "║     • Premi Ctrl+C in questa finestra                        ║"
echo "║     • Oppure chiudi il Terminale                             ║"
echo "║                                                              ║"
echo "║                                                              ║"
echo "║   I progressi sono salvati nel browser (localStorage).       ║"
echo "║   Esporta un backup .json ogni tanto da Impostazioni.        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Apri il browser dopo un breve delay (macOS / Linux / fallback)
(
  sleep 1
  if command -v open >/dev/null 2>&1; then
    open "$URL"          # macOS
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL"      # Linux
  else
    echo "Apri manualmente: $URL"
  fi
) &

# Avvia il server (in foreground, così Ctrl+C lo ferma)
exec "$PYTHON" -m http.server "$PORT" --bind 127.0.0.1
