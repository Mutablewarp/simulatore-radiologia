#!/usr/bin/env node
/**
 * integrate_questions.cjs — Integra nuove domande generate nel pool di index.html.
 * Uso: node scripts/integrate_questions.cjs <new_questions.json> [index.html]
 *
 * <new_questions.json> = { questions: [ {topic, subtopic, q, opts[5], correct, explain, deep, diff} ] }
 *   (oppure direttamente un array).
 *
 * Esegue: validazione di forma, dedup (vs pool esistente e interno), assegnazione id sequenziali,
 * costruzione del blocco <script> e iniezione prima del blocco app-core. Aggiorna EXPECTED_POOL_SIZE.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const NEWQ = process.argv[2];
const FILE = process.argv[3] || path.join(__dirname, '..', 'index.html');
if (!NEWQ) { console.error('Manca il path del JSON delle nuove domande'); process.exit(1); }

const html = fs.readFileSync(FILE, 'utf8');
let raw = JSON.parse(fs.readFileSync(NEWQ, 'utf8'));
let incoming = Array.isArray(raw) ? raw : (raw.questions || []);

// --- pool esistente ---
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const sandbox = {};
for (const b of blocks) if (/__QPOOL__/.test(b)) { try { new Function('window', b)(sandbox); } catch (e) {} }
const POOL = sandbox.__QPOOL__ || [];
let maxId = 0;
for (const q of POOL) { const n = parseInt(String(q.id).replace(/\D/g, ''), 10); if (n > maxId) maxId = n; }

const VALID_TOPICS = new Set(POOL.map(q => q.topic));
const VALID_DIFF = new Set(['easy', 'medium', 'hard']);
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\wàèéìòù ]/g, '').trim();
const seen = new Set(POOL.map(q => norm(q.q)));

const accepted = [];
const rejected = [];
for (const q of incoming) {
  const why = [];
  if (!q || typeof q !== 'object') { rejected.push(['non-oggetto', q]); continue; }
  if (!q.q || norm(q.q).length < 12) why.push('q vuota/corta');
  if (!Array.isArray(q.opts) || q.opts.length !== 5 || q.opts.some(o => !String(o || '').trim())) why.push('opts != 5 valide');
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 4) why.push('correct fuori range');
  if (Array.isArray(q.opts)) { const u = new Set(q.opts.map(norm)); if (u.size !== q.opts.length) why.push('opzioni duplicate'); }
  if (!q.explain || String(q.explain).trim().length < 120) why.push('explain corta');
  if (!q.deep || String(q.deep).trim().length < 120) why.push('deep corta');
  if (!VALID_DIFF.has(q.diff)) q.diff = 'medium';
  if (!q.topic || !VALID_TOPICS.has(q.topic)) why.push('topic non valido: ' + q.topic);
  const k = norm(q.q);
  if (seen.has(k)) why.push('duplicato');
  if (why.length) { rejected.push([why.join('; '), q.q ? String(q.q).slice(0, 60) : q]); continue; }
  seen.add(k);
  accepted.push(q);
}

// assegna id sequenziali e source
let id = maxId;
let longestTell = 0;
const diffCount = {};
const topicCount = {};
const objs = accepted.map(q => {
  id += 1;
  const lens = q.opts.map(o => String(o).length);
  const maxLen = Math.max(...lens);
  if (lens[q.correct] === maxLen && lens.filter(l => l === maxLen).length === 1) longestTell++;
  diffCount[q.diff] = (diffCount[q.diff] || 0) + 1;
  topicCount[q.topic] = (topicCount[q.topic] || 0) + 1;
  return {
    id: 'q' + String(id).padStart(3, '0'),
    topic: q.topic, subtopic: q.subtopic || '', q: q.q,
    opts: q.opts, correct: q.correct,
    explain: q.explain, deep: q.deep,
    source: 'generated', diff: q.diff,
  };
});

// costruisci il blocco <script> nello STESSO stile delle domande esistenti
// (chiavi non quotate; id/topic/source/diff con apici singoli; testo con apici doppi)
const sq = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const dq = s => JSON.stringify(String(s));
function serializeQ(o) {
  const optsStr = '[' + o.opts.map(dq).join(',') + ']';
  return `{id:${sq(o.id)}, topic:${sq(o.topic)}, subtopic:${dq(o.subtopic)}, q:${dq(o.q)}, opts:${optsStr}, correct:${o.correct}, explain:${dq(o.explain)}, deep:${dq(o.deep)}, source:'generated', diff:${sq(o.diff)}}`;
}
const lines = objs.map(o => `Q5.push(\n${serializeQ(o)}\n);`).join('\n\n');
const block = `<script>
// =========================================================
// QUESTIONS BATCH 5 — espansione del pool (${objs[0] ? objs[0].id : ''}-${objs[objs.length-1] ? objs[objs.length-1].id : ''})
// source: generated — generate dal materiale del corso e verificate in modo avversariale
// =========================================================
const Q5 = window.__QPOOL__;
${lines}
</script>
`;

// inietta prima del blocco app-core (quello con APP_VERSION)
const marker = html.indexOf('const APP_VERSION');
if (marker === -1) { console.error('marker APP_VERSION non trovato'); process.exit(1); }
const scriptStart = html.lastIndexOf('<script>', marker);
let out = html.slice(0, scriptStart) + block + '\n' + html.slice(scriptStart);

// aggiorna EXPECTED_POOL_SIZE
const newTotal = POOL.length + objs.length;
out = out.replace(/const EXPECTED_POOL_SIZE = \d+;/, `const EXPECTED_POOL_SIZE = ${newTotal};`);

fs.writeFileSync(FILE, out);

console.log(`Esistenti: ${POOL.length} · in ingresso: ${incoming.length} · accettate: ${objs.length} · rifiutate: ${rejected.length}`);
console.log(`NUOVO TOTALE: ${newTotal}`);
console.log(`Tell lunghezza (corretta = più lunga): ${longestTell}/${objs.length} (${(100*longestTell/Math.max(1,objs.length)).toFixed(1)}%)`);
console.log('Per topic (nuove):', Object.entries(topicCount).map(([t,n])=>`${t}=${n}`).join(', '));
console.log('Difficoltà (nuove):', Object.entries(diffCount).map(([d,n])=>`${d}=${n}`).join(', '));
if (rejected.length) {
  console.log(`\nPrime ${Math.min(20, rejected.length)} rifiutate:`);
  rejected.slice(0, 20).forEach(([why, q]) => console.log('  ✗', why, '·', typeof q === 'string' ? q : ''));
}
