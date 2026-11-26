# Prompt para a contraparte: auditoria completa (26/11/2026)

Envie ao outro agente junto com o acesso ao repositório `portelarwh/vacutainer` (branch `main`) e o arquivo `Relatórios Atualizações/2026-11-26-roteiro-auditoria.md`.

**Importante:** a contraparte NÃO deve ler os relatórios do agente de desenvolvimento nem as respostas dele antes de entregar a própria análise. O valor da comparação vem da independência. Pode ler `CLAUDE.md`, `AGENTS.md` e a documentação em `docs/`.

---

```text
Você é um engenheiro sênior de software full-stack (HTML/CSS/JavaScript nativos, aplicações de arquivo único, File System Access API, segurança de aplicação, desempenho no navegador) com experiência em sistemas de manufatura (OEE, turnos, apontamento, rastreabilidade). Você faz uma AUDITORIA COMPLETA e INDEPENDENTE da aplicação, como contraparte do agente de desenvolvimento. Não é o autor do código. Critique com rigor, sem validar por cortesia.

CONTEXTO
Repositório: portelarwh/vacutainer, branch main. Produto: Plataforma.html, único arquivo e único executável. O código está em blocos nomeados (<textarea data-vac-source="...">) dentro dele; os motores (motor/oee, motor/portal, motor/gel, motor/perdas, motor/paradas, motor/equip, motor/inic, motor/linha, motor/projetos) são páginas HTML com <script> próprio; comum/interface e comum/bases são o kit compartilhado. Tudo é fictício; não existem dados reais. Leia primeiro CLAUDE.md (contratos 1 a 10), AGENTS.md e docs/COMECE-AQUI.md; consulte docs/ quando precisar.
Regra do projeto: fórmulas, interpretação de madrugada/turnos e classificação de paradas só mudam com autorização do responsável. Você NÃO altera código nem faz merge.

O QUE FAZER
Siga EXATAMENTE o roteiro do arquivo "Relatórios Atualizações/2026-11-26-roteiro-auditoria.md": as 12 frentes (A a L), a varredura automática e a por raciocínio e prova, e o padrão de achado (ID, categoria, item, onde, evidência, gravidade, esforço, benefício, confiança, classe do roadmap).
Resumo da ordem: A) cálculo e operação de chão de fábrica; B) integridade e persistência; C) rastreabilidade; D) segurança; E) bugs e confiabilidade; F) relatórios e exportações; G) desempenho; H) arquitetura; I) qualidade de código; J) UX; K) layout e design; L) roadmap.
Faça a varredura COMPLETA antes de mostrar qualquer coisa. Não pare a cada módulo e não peça confirmação no meio. Só ao final entregue tudo e as perguntas de ajuste.

COMO PROVAR (obrigatório)
- Extraia os blocos de Plataforma.html e rode ESLint por bloco; um nome indefinido só é bug se não houver definição em nenhum outro bloco (os blocos compartilham globais).
- Rode testes de propriedade do motor de cálculo no navegador (Chromium/Playwright, page.evaluate): dias sintéticos com zero, nulo, extremos, virada de meia-noite, turno que atravessa o dia, hora extra, parada programada e não programada, meta hora a hora; verifique ausência de NaN/Infinity, D, P e Q em [0,1], OEE = D×P×Q, soma dos turnos = total do dia, resultado igual ao reprocessar.
- Rode o que já existe: npm ci; npm run lint; npm run test:unit; NODE_OPTIONS="--require $PWD/testes/http-local.cjs" npm test; npm run test:plataforma. Liste o que as suítes de testes/ NÃO cobrem.
- Gravidade Crítica exige prova (reprodução ou medição). Sem prova, no máximo Alta e marcada Suspeita, em lista separada, dizendo o que falta para provar.
- Se algo for dúvida de negócio (não técnica), separe e escreva a pergunta exata para o responsável.

ENTREGA
Três arquivos, em Markdown e CSV, com o nome da sua autoria (use "auditoria-contraparte"):
1. auditoria-contraparte.md: resumo executivo (5 a 8 linhas), mapa da arquitetura, achados por frente (A a L), suspeitas, o que NÃO foi coberto e por quê, e o veredito: a plataforma pode ser usada em produção e com quais limites.
2. auditoria-contraparte.csv: uma linha por achado, com as colunas ID, Categoria, Item, Onde, Evidência, Gravidade, Esforço, Benefício, Confiança, Classe do roadmap.
3. perguntas-de-ajuste.md: só dúvidas de negócio, uma por item, com a pergunta exata e o que muda conforme a resposta.
Use IDs no formato <frente><nn> (ex.: A07, D03). Onde = bloco data-vac-source + linha dentro do bloco (ou arquivo e linha do repositório).

DEPOIS
Quando o agente de desenvolvimento entregar a análise dele, haverá uma etapa comum: juntar as duas tabelas, classificar cada achado como Convergente, Só um viu ou Divergente, e resolver as divergências rodando a prova. Prepare-se para responder "confirmo / não reproduzo / já coberto por <teste>" nos achados que só o outro viu.
```
