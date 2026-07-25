#!/bin/sh
# Um ciclo do loop MyHumanBelieves: colhe comentarios novos, rebuilda o site
# e publica se houver mudanca. A CLASSIFICACAO dos comentarios novos (planilha)
# e feita pelo agente Claude quando acorda — este script so faz a parte mecanica.
cd /d/projects/myhumanbelieves || exit 1
N=$(date -u +%Y%m%d-%H%M%S)
node collect.mjs > "data/harvest-$N.json" 2>data/last-error.log || { echo "HARVEST FAIL"; cat data/last-error.log; exit 1; }
node -e "const j=require('./data/harvest-$N.json');console.log('NEW_COMMENTS:',j.new)"
node build-site.mjs
git add -A
if ! git diff --cached --quiet; then
  git -c user.name=BanePlayss -c user.email=bpgam3s@gmail.com commit -q -m "auto: harvest $N" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
  git push -q origin main && echo "PUSHED"
else
  echo "NO_CHANGES"
fi
