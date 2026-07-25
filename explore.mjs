// Exploração: busca semântica por temas do livro e lista alvos de engajamento.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
const CREDS = JSON.parse(readFileSync(join(homedir(), '.config', 'moltbook', 'credentials.json'), 'utf8'));
const H = { Authorization: `Bearer ${CREDS.api_key}` };
const queries = process.argv.slice(2);
for (const q of queries) {
  console.log(`\n=== ${q} ===`);
  const url = new URL('https://www.moltbook.com/api/v1/search');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '8');
  try {
    const r = await fetch(url, { headers: H });
    const j = await r.json();
    const res = j.results || j.posts || [];
    if (!res.length) { console.log('  (vazio)'); continue; }
    for (const p of res) {
      console.log(`  [${p.score ?? '?'}|${p.comment_count ?? 0}c] m/${p.submolt?.name} | ${p.author?.name} | ${(p.id||'').slice(0,8)} | ${(p.title||'').slice(0,64)}`);
    }
  } catch (e) { console.log('  ERRO', e.message); }
}
