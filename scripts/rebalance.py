#!/usr/bin/env python3
"""
Rebalance la posizione dell'opzione corretta in un range di domande
in modo che sia uniformemente distribuita su A/B/C/D/E.

Per default opera su tutte le domande con id >= q281 (nuove dopo v1.0).
Specifica --from N --to M per limitare ad un range custom.

Usage:
  python3 scripts/rebalance.py                     # rebalance default range
  python3 scripts/rebalance.py --from 321 --to 500 # rebalance solo le nuove v2
  python3 scripts/rebalance.py --check             # solo report, no modifiche
"""

import argparse
import json
import random
import re
import sys
from pathlib import Path

DEFAULT_FILE = Path(__file__).resolve().parent.parent / "index.html"


def parse_args():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--file", default=str(DEFAULT_FILE), help="Path al file index.html")
    ap.add_argument("--from", dest="qfrom", type=int, default=321, help="qid minimo (incluso, default 321)")
    ap.add_argument("--to", dest="qto", type=int, default=10000, help="qid massimo (incluso, default 10000)")
    ap.add_argument("--seed", type=int, default=42, help="Seed random per riproducibilità")
    ap.add_argument("--check", action="store_true", help="Solo report, no modifiche")
    return ap.parse_args()


def main():
    args = parse_args()
    file_path = Path(args.file)
    if not file_path.exists():
        print(f"❌ File non trovato: {file_path}")
        sys.exit(1)

    content = file_path.read_text()
    lines = content.split("\n")

    # Trova domande in range
    candidates = []
    for i, line in enumerate(lines):
        m = re.match(r"^\s*\{id:'(q\d+)',", line)
        if not m:
            continue
        qid = m.group(1)
        qnum = int(qid[1:])
        if not (args.qfrom <= qnum <= args.qto):
            continue
        opts_match = re.search(r'opts:\[(".*?")\]', line)
        correct_match = re.search(r"correct:(\d+)", line)
        if not opts_match or not correct_match:
            continue
        try:
            opts = json.loads("[" + opts_match.group(1) + "]")
        except Exception:
            continue
        if len(opts) != 5:
            print(f"⚠️  {qid} ha {len(opts)} opzioni (atteso 5) — skip")
            continue
        candidates.append({
            "line_idx": i,
            "qid": qid,
            "qnum": qnum,
            "opts": opts,
            "current_correct": int(correct_match.group(1)),
            "opts_match": opts_match,
            "line": line,
        })

    if not candidates:
        print(f"Nessuna domanda trovata nel range q{args.qfrom}-q{args.qto}")
        sys.exit(0)

    n = len(candidates)
    print(f"Trovate {n} domande nel range q{args.qfrom}-q{args.qto}")

    # Distribuzione corrente
    current_dist = [0] * 5
    for c in candidates:
        current_dist[c["current_correct"]] += 1
    print("\nDistribuzione corrente (A,B,C,D,E):")
    for i, c in enumerate(current_dist):
        pct = 100 * c / n
        print(f"  {'ABCDE'[i]}: {c:3d} ({pct:5.1f}%)")

    if args.check:
        return

    # Costruisci target uniforme
    random.seed(args.seed)
    base = n // 5
    rem = n % 5
    target = []
    for pos in range(5):
        target += [pos] * (base + (1 if pos < rem else 0))
    random.shuffle(target)

    # Applica permutazione
    modified = 0
    new_dist = [0] * 5
    for c, new_correct in zip(candidates, target):
        current_correct = c["current_correct"]
        if new_correct == current_correct:
            new_dist[new_correct] += 1
            continue

        correct_option = c["opts"][current_correct]
        other_options = [c["opts"][j] for j in range(5) if j != current_correct]
        new_opts = [None] * 5
        new_opts[new_correct] = correct_option
        idx = 0
        for j in range(5):
            if j == new_correct:
                continue
            new_opts[j] = other_options[idx]
            idx += 1

        # Riscrivi la linea
        new_opts_str = ",".join(json.dumps(o, ensure_ascii=False) for o in new_opts)
        new_line = c["line"][:c["opts_match"].start()] + f"opts:[{new_opts_str}]" + c["line"][c["opts_match"].end():]
        new_line = re.sub(r"correct:\d+", f"correct:{new_correct}", new_line)
        lines[c["line_idx"]] = new_line
        modified += 1
        new_dist[new_correct] += 1

    # Salva
    file_path.write_text("\n".join(lines))

    print(f"\nDomande modificate: {modified}/{n}")
    print("\nNuova distribuzione (A,B,C,D,E):")
    for i, c in enumerate(new_dist):
        pct = 100 * c / n
        print(f"  {'ABCDE'[i]}: {c:3d} ({pct:5.1f}%)")
    print("\n✓ rebalance completato")


if __name__ == "__main__":
    main()
