# Provas da análise comum (26/11/2026)

Reproduzem, sobre um SHA escolhido, os achados da contraparte. Dados exclusivamente fictícios (demonstração e pasta em OPFS).

Preparar um SHA (exemplo `a9d28b5` e a main atual):

```sh
git worktree add /tmp/wt-aud a9d28b5 && git worktree add --detach /tmp/wt-main origin/main
for w in /tmp/wt-aud /tmp/wt-main; do (cd $w && ln -s <repo>/node_modules node_modules && mkdir -p .test-cache && node testes/plataforma/generate-fixtures.cjs); done
node scripts/auditoria/comum/b01.cjs /tmp/wt-aud      # um script por achado; o argumento é o worktree
```

`h.cjs` abre a Produção em modo demonstração; `h2.cjs` abre um módulo numa pasta OPFS fictícia carregada com as bases do próprio SHA.
Mapa: a01 (A01 da contraparte), b01–b04, f01b (F01 e F02), f03, p1 (A04, F04 parcial e G03), p2 (F04), c01 (C01), e02c/e02d (E02), k03 (K03).
