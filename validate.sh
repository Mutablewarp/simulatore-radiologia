#!/usr/bin/env bash
# Valida l'integrità di index.html prima di commit/deploy.
# Controlli:
#   1. Tutti i blocchi <script> parsano come JavaScript valido
#   2. Nessun qid duplicato
#   3. Conteggio totale e per topic
#   4. Distribuzione difficoltà
#   5. Distribuzione posizione corretta (cerchiamo uniformità)
#   6. Nessun riferimento "aequora" (sanity check legato al progetto sorella)
#
# Exit 0 se tutto OK, 1 se errori, 2 se warning.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILE="$SCRIPT_DIR/index.html"
EXIT_CODE=0

if [ ! -f "$FILE" ]; then
  echo "❌ index.html non trovato"
  exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
echo "  VALIDAZIONE: index.html"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# --- 1. JS parsing ---
echo "1️⃣  Parsing JavaScript dei blocchi <script>…"
if ! command -v node >/dev/null 2>&1; then
  echo "   ⚠️  Node.js non installato — skip parse check"
  echo "      Install: brew install node"
else
  # new Function COMPILA senza eseguire: stub e stripping dei listener non servono
  # (e lo stripping con regex creava falsi errori sui listener arrow multilinea).
  if ! PARSE_RESULT=$(node -e "
const fs = require('fs');
const html = fs.readFileSync('$FILE', 'utf8');
const scripts = [...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)];
let ok = 0, fail = 0;
scripts.forEach((m, i) => {
  try {
    new Function(m[1]);
    ok++;
  } catch (e) {
    fail++;
    console.error('   Block ' + i + ' FAIL:', e.message.substring(0, 200));
  }
});
console.log('   ✓ Blocchi OK: ' + ok + ' · Falliti: ' + fail);
process.exit(fail > 0 ? 1 : 0);
" 2>&1); then
    EXIT_CODE=1
  fi
  echo "$PARSE_RESULT"
fi
echo ""

# --- 2. Duplicate qids ---
echo "2️⃣  Controllo duplicati qid…"
# Ancorato a "{id:'qNNN'" (sintassi degli oggetti domanda, senza spazio dopo la graffa):
# evita il falso positivo sull'id del badge 'q250' che è scritto "{ id:'q250'".
DUPS=$(grep -oE "\{id:'q[0-9]+'" "$FILE" | sort | uniq -d)
if [ -n "$DUPS" ]; then
  echo "   ❌ qid DUPLICATI:"
  echo "$DUPS" | sed 's/^/      /'
  EXIT_CODE=1
else
  TOTAL=$(grep -cE "\{id:'q[0-9]+'" "$FILE")
  echo "   ✓ Nessun duplicato. Totale: $TOTAL domande"
fi
echo ""

# --- 3. Riferimenti aequora (sanity check) ---
echo "3️⃣  Sanity check (no riferimenti progetto sorella)…"
AEQ=$(grep -c -i "aequora" "$FILE" || true)
if [ "$AEQ" -gt 0 ]; then
  echo "   ❌ Trovati $AEQ riferimenti 'aequora' — pulire"
  EXIT_CODE=1
else
  echo "   ✓ Pulito"
fi
echo ""

# --- 4 + 5 + 6. Distribuzioni via Python ---
if command -v python3 >/dev/null 2>&1; then
  python3 <<PYEOF
import re

with open("$FILE") as f:
    content = f.read()

print("4️⃣  Distribuzione per topic:")
topics = {}
for m in re.finditer(r"\{id:'q\d+', topic:'([^']+)',", content):
    t = m.group(1)
    topics[t] = topics.get(t, 0) + 1
for t in sorted(topics, key=lambda k: -topics[k]):
    bar = "█" * (topics[t] // 2)
    print(f"   {t:25s} {topics[t]:3d}  {bar}")
print()

print("5️⃣  Distribuzione difficoltà:")
diffs = {}
for m in re.finditer(r"diff:'(\w+)'", content):
    d = m.group(1)
    diffs[d] = diffs.get(d, 0) + 1
total = sum(diffs.values())
for d in ['easy', 'medium', 'hard']:
    c = diffs.get(d, 0)
    pct = 100 * c / total if total else 0
    print(f"   {d:10s} {c:3d} ({pct:5.1f}%)")
print()

print("6️⃣  Distribuzione posizione corretta (uniformità target ~20% ciascuna):")
counts = [0] * 5
for m in re.finditer(r"\{id:'q\d+',[^\n]+?correct:(\d+)", content):
    counts[int(m.group(1))] += 1
total = sum(counts)
warn = False
for i, c in enumerate(counts):
    pct = 100 * c / total if total else 0
    flag = " ⚠️ " if pct > 30 or pct < 10 else "  "
    if pct > 30 or pct < 10:
        warn = True
    bar = "█" * int(pct / 3)
    print(f"   {'ABCDE'[i]}:{flag}{c:3d} ({pct:5.1f}%) {bar}")
if warn:
    print("   ⚠️  Distribuzione sbilanciata — esegui 'python3 scripts/rebalance.py'")
PYEOF
else
  echo "   ⚠️  python3 non installato — skip distribuzione"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
if [ $EXIT_CODE -eq 0 ]; then
  echo "  ✅ VALIDAZIONE OK"
else
  echo "  ❌ VALIDAZIONE FALLITA — risolvi gli errori prima di committare"
fi
echo "═══════════════════════════════════════════════════════════════"

exit $EXIT_CODE
