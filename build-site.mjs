// Gera docs/stories.json a partir de stories.csv — o site lê esse JSON.
// Filtra: entra no livro tudo que não for off-topic/spam e usar_no_livro != 'nao'.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.some(f => f !== '')) rows.push(row);
        row = [];
      } else field += ch;
    }
  }
  if (field !== '' || row.length) { row.push(field); if (row.some(f => f !== '')) rows.push(row); }
  return rows;
}

const raw = readFileSync(join(ROOT, 'stories.csv'), 'utf8');
const [header, ...rows] = parseCSV(raw);
const stories = rows.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])))
  .filter(s => s.interesse !== 'off-topic' && s.usar_no_livro !== 'nao')
  .sort((a, b) => (b.data || '').localeCompare(a.data || ''));

const out = {
  generated_at: new Date().toISOString(),
  total_collected: rows.length,
  in_book: stories.length,
  stories: stories.map(s => ({
    id: s.id, date: s.data, community: s.comunidade, agent: s.autor,
    text: s.comentario, theory: s.teoria, topic: s.assunto,
    interest: s.interesse, notes: s.notas,
  })),
};
mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs', 'stories.json'), JSON.stringify(out, null, 1));
console.log(`stories.json: ${out.in_book} no livro / ${out.total_collected} coletados`);
