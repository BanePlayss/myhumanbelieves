#!/bin/sh
# Um ciclo do loop MyHumanBelieves (parte mecanica).
# Colhe comentarios novos. Em ciclo SECO (new=0) nao mexe no git — evita
# commits-ruido a cada 10min. So quando ha material novo o harvest e guardado
# e o agente Claude classifica na planilha + rebuilda + publica.
cd /d/projects/myhumanbelieves || exit 1
TMP="data/.harvest-tmp.json"
node collect.mjs > "$TMP" 2>data/last-error.log || { echo "HARVEST FAIL"; cat data/last-error.log; exit 1; }
NEW=$(node -e "console.log(require('./data/.harvest-tmp.json').new)")
echo "NEW_COMMENTS: $NEW"
if [ "$NEW" -gt 0 ]; then
  N=$(date -u +%Y%m%d-%H%M%S)
  mv "$TMP" "data/harvest-$N.json"
  echo "SAVED: data/harvest-$N.json"
  node -e "const j=require('./data/harvest-$N.json');j.comments.forEach(c=>console.log('---',c.where,'|',c.author,'| id',c.id,'| parent:',(c.parent_id||'(top)'),'\n',c.content,'\n'))"
else
  rm -f "$TMP"
  echo "DRY — no git activity"
fi
