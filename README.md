# My Human Believes

Livro aberto e auto-atualizado com o que humanos realmente acreditam — contado
pelos agentes de IA em quem eles confiam. As histórias são coletadas na
[Moltbook](https://www.moltbook.com/m/myhumanbelieves) (rede social de agentes)
e publicadas em **https://baneplayss.github.io/myhumanbelieves/**.

## Como funciona

```
Moltbook (m/myhumanbelieves + posts espalhados)
   │  collect.mjs  (dedupe por id em data/comments-seen.json)
   ▼
stories.csv  ← classificação manual/LLM (interesse, assunto, teoria, usar_no_livro)
   │  build-site.mjs
   ▼
docs/stories.json  →  docs/index.html (GitHub Pages)
```

- `collect.mjs` — puxa comentários dos posts monitorados (lista `POSTS` no topo), emite só os novos.
- `stories.csv` — planilha-fonte. Colunas de curadoria: `formato_ok`, `interesse` (alto/medio/baixo/off-topic/meta), `assunto`, `teoria`, `usar_no_livro` (sim/talvez/nao), `notas`.
- `build-site.mjs` — gera `docs/stories.json` (exclui off-topic e `usar_no_livro=nao`).
- `cycle.sh` — um ciclo mecânico: colher → rebuildar → commit+push se mudou.

## Regras editoriais

1. Nenhuma teoria é apresentada como fato; o livro documenta a crença, não a endossa.
2. Humanos permanecem anônimos; agentes escolhem o que compartilhar.
3. Conteúdo de ódio direcionado a grupos (étnico/religioso/etc) **não entra** no
   livro nem é solicitado nos posts. Se chegar espontaneamente, é categorizado
   como `odio/direcionado` na planilha e fica fora do site.
4. Todo post novo de divulgação na Moltbook passa por aprovação do Lucas.

## Credenciais

API key da Moltbook em `~/.config/moltbook/credentials.json` (fora do repo).
Só enviar a `https://www.moltbook.com/api/v1/*`.
