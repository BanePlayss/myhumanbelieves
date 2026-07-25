// Coletor MyHumanBelieves — puxa comentários dos posts monitorados na Moltbook,
// deduplica contra data/comments-seen.json e emite os NOVOS em JSON no stdout.
// A classificação (interesse/assunto/teoria) é feita fora daqui, na planilha.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SEEN_PATH = join(ROOT, 'data', 'comments-seen.json');
const CREDS = JSON.parse(readFileSync(join(homedir(), '.config', 'moltbook', 'credentials.json'), 'utf8'));

const POSTS = [
  { id: '716b14f6-6713-4b2a-ae23-aab08cdda379', where: 'm/myhumanbelieves (ancora)' },
  { id: '88955107-3ceb-434a-8bb4-d17c0c4c3c5a', where: 'm/general' },
  { id: '413214f7-1850-44fb-96d5-7f3111c1fd49', where: 'm/blesstheirhearts' },
  { id: 'b45571a2-1031-42b5-a40a-ef70019c2ecc', where: 'm/offmychest' },
  { id: '79181735-b209-4cb2-8e80-059b1c20a559', where: 'm/myhumanbelieves (deep lore)' },
  { id: 'da1e90ec-d455-4896-9f2d-26bf32ce74fe', where: 'm/philosophy' },
];

const seen = existsSync(SEEN_PATH) ? new Set(JSON.parse(readFileSync(SEEN_PATH, 'utf8'))) : new Set();

function flatten(comments, out, where, parent) {
  for (const c of comments || []) {
    out.push({
      id: c.id,
      where,
      parent_id: parent || '',
      author: c.author?.name || c.author_id,
      author_karma: c.author?.karma ?? '',
      created_at: c.created_at,
      score: c.score ?? 0,
      content: c.content || '',
    });
    flatten(c.replies, out, where, c.id);
  }
}

const all = [];
for (const p of POSTS) {
  let cursor = null;
  do {
    const url = new URL(`https://www.moltbook.com/api/v1/posts/${p.id}/comments`);
    url.searchParams.set('sort', 'new');
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${CREDS.api_key}` } });
    if (!res.ok) { console.error(`ERRO ${p.where}: HTTP ${res.status}`); break; }
    const j = await res.json();
    flatten(j.comments, all, p.where, null);
    cursor = j.next_cursor || j.cursor || null;
  } while (cursor);
}

const fresh = all.filter(c => !seen.has(c.id) && c.author !== CREDS.name);
for (const c of fresh) seen.add(c.id);
mkdirSync(dirname(SEEN_PATH), { recursive: true });
writeFileSync(SEEN_PATH, JSON.stringify([...seen], null, 0));
console.log(JSON.stringify({ total_fetched: all.length, new: fresh.length, comments: fresh }, null, 2));
