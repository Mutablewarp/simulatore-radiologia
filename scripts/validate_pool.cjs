#!/usr/bin/env node
/**
 * validate_pool.cjs — Validazione deterministica del pool domande in index.html.
 * Estrae i blocchi <script> che popolano window.__QPOOL__ e verifica l'integrità
 * di ogni domanda. Exit code 1 se ci sono errori bloccanti.
 *
 * Uso: node scripts/validate_pool.cjs [path/to/index.html]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');

const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const sandbox = {};
for (const b of blocks) {
  if (/__QPOOL__/.test(b)) {
    try {
      new Function('window', b)(sandbox);
    } catch (e) {
      console.error('ERRORE eval blocco script:', e.message);
      process.exit(1);
    }
  }
}
const POOL = sandbox.__QPOOL__ || [];

const VALID_DIFF = new Set(['easy', 'medium', 'hard']);
const errors = [];
const warnings = [];
const ids = new Map();
const normTexts = new Map();
const topics = new Map();
const diffs = new Map();
let longestTell = 0;

const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[^\wàèéìòù ]/g, '').trim();

for (const q of POOL) {
  const tag = q.id || '(senza id)';
  if (!q.id || !/^q\d{3,}$/.test(q.id)) errors.push(`${tag}: id mancante o malformato`);
  if (ids.has(q.id)) errors.push(`${tag}: id duplicato (visto a indice ${ids.get(q.id)})`);
  ids.set(q.id, ids.size);

  if (!q.q || String(q.q).trim().length < 10) errors.push(`${tag}: testo domanda vuoto/troppo corto`);
  if (!Array.isArray(q.opts) || q.opts.length !== 5) {
    errors.push(`${tag}: opts non è un array di 5 (${Array.isArray(q.opts) ? q.opts.length : typeof q.opts})`);
  } else {
    q.opts.forEach((o, i) => {
      if (!o || !String(o).trim()) errors.push(`${tag}: opzione ${i} vuota`);
    });
    const uniq = new Set(q.opts.map(norm));
    if (uniq.size !== q.opts.length) errors.push(`${tag}: opzioni duplicate`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 4) {
      errors.push(`${tag}: indice correct fuori range (${q.correct})`);
    } else {
      const lens = q.opts.map(o => String(o).length);
      const maxLen = Math.max(...lens);
      if (lens[q.correct] === maxLen && lens.filter(l => l === maxLen).length === 1) longestTell++;
    }
  }
  if (!q.explain || String(q.explain).trim().length < 100) warnings.push(`${tag}: spiegazione corta (<100 char)`);
  if (!q.deep || String(q.deep).trim().length < 100) warnings.push(`${tag}: deep dive corto/assente`);
  if (!VALID_DIFF.has(q.diff)) errors.push(`${tag}: difficoltà non valida (${q.diff})`);
  if (!q.topic || !String(q.topic).trim()) errors.push(`${tag}: topic mancante`);

  const nt = norm(q.q) + '|' + norm((q.opts || []).join(''));
  if (normTexts.has(nt)) warnings.push(`${tag}: possibile duplicato di ${normTexts.get(nt)}`);
  else normTexts.set(nt, q.id);

  topics.set(q.topic, (topics.get(q.topic) || 0) + 1);
  diffs.set(q.diff, (diffs.get(q.diff) || 0) + 1);
}

// Coerenza topic: i topic del pool devono coincidere con TOPIC_LABELS nell'app
const labelsMatch = html.match(/const TOPIC_LABELS = \{([\s\S]*?)\};/);
if (labelsMatch) {
  const labelKeys = new Set([...labelsMatch[1].matchAll(/['"]?([A-Za-zÀ-ù ]+?)['"]?\s*:/g)].map(m => m[1].trim()));
  for (const t of topics.keys()) {
    if (!labelKeys.has(t)) warnings.push(`topic "${t}" nel pool ma assente in TOPIC_LABELS`);
  }
}

console.log(`Pool: ${POOL.length} domande`);
console.log(`Topic (${topics.size}):`, [...topics.entries()].map(([t, n]) => `${t}=${n}`).join(', '));
console.log(`Difficoltà:`, [...diffs.entries()].map(([d, n]) => `${d}=${n}`).join(', '));
console.log(`"Tell" lunghezza (corretta strettamente più lunga): ${longestTell}/${POOL.length} (${(100 * longestTell / POOL.length).toFixed(1)}%)`);
console.log(`\nErrori bloccanti: ${errors.length}`);
errors.slice(0, 40).forEach(e => console.log('  ✗ ' + e));
console.log(`Warning: ${warnings.length}`);
warnings.slice(0, 40).forEach(w => console.log('  ⚠ ' + w));
if (warnings.length > 40) console.log(`  … e altri ${warnings.length - 40}`);

process.exit(errors.length ? 1 : 0);
