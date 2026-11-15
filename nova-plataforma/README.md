# Plataforma Vacutainer

Comece por [docs/COMECE-AQUI.md](docs/COMECE-AQUI.md): documentos obrigatórios, marca, componentes existentes, comandos e forma de trabalho entre agentes. A pasta pertence ao repositório portelarwh/vacutainer e depende das fontes da raiz.


Produto único: `dist/Plataforma.html`, aberto no Chrome/Edge sem API, servidor interno ou internet. Bases e backups permanecem na pasta de rede. **O corte não foi executado:** depende da homologação descrita em [CORTE.md](docs/CORTE.md).

Os nove motores vêm da árvore atual de `fontes/` e `paginas/`, compilada pelo build da raiz antes do empacotamento. Eles conservam cálculos, formulários, transações, importadores e contratos de dados. Não há uma cópia antiga mantida em paralelo. Alterar uma regra significa alterar sua fonte e reconstruir a plataforma.

O manifesto em `src/generated/manifest.json` registra `sourceRevision` (último commit das fontes), `enginesSha256` (conteúdo empacotado), arquivos modificados e versão/hash de cada motor. Os HTML de `paginas/` são fontes e referências de testes; não são artefatos distribuídos na linha.

## Compilar e verificar

```sh
npm install
npm ci --prefix nova-plataforma
npm run check:setup --prefix nova-plataforma
npm run build --prefix nova-plataforma
npm test
npm run test:all --prefix nova-plataforma
```

Use um checkout com histórico Git completo; se estiver raso, execute `git fetch --unshallow` antes de compilar. `npm run test:reprodutibilidade --prefix nova-plataforma` compara dois builds completos.

O primeiro comando instala os testes dos motores na raiz. O build da plataforma executa o build da raiz automaticamente. O CI mantém as 67 suítes da raiz, em quatro partes, e as da plataforma no mesmo workflow.

Demonstração: botão da tela inicial ou `Plataforma.html?demo=1`; dados fictícios separados das bases reais. `tests/pasta.cjs` gera bases preenchidas a partir de `fontes/kit/demo_cenario.json`, carregadas pelos adaptadores e exports dos motores atuais. Compara o documento inteiro na conexão e após alterações reais nos oito módulos.

## Integração

- Casca React/TypeScript: navegação, busca, consulta de exports, relatório comum, saúde dos dados e seleção da pasta.
- `vacPagina`: contrato público dos motores, aplicado pelo kit. Abas e comandos vêm do motor; a ponte não usa eval.
- Login com senha e sessão `vac.sessao` pelo vacLogin; ações controladas pelo vacTravas. Sem sessão, consulta. Permissão do navegador/pasta continua necessária.
- Versão da base maior que a do motor: somente leitura. Falha ao consultar pendência bloqueia troca de pasta.
- Escopos persistentes por handle, com isSameEntry; consulta de fila durável mesmo sem módulo aberto.
- Bibliotecas locais incorporadas. Cadastros só são mantidos pelo Portal; cada motor grava sua base e outros leem exports.

OSM, MES, AM/TPM e Projetos mantêm as decisões e amostras pendentes. Nenhuma regra técnica foi inventada nesta integração. Conversão para React será gradual, começando por telas que só leem exports; formulários de gravação continuam nos motores até teste de paridade.

Evidências atuais: [N1–N6](docs/pr76/segunda-rodada/RESULTADO.md). Arquitetura: [ARQUITETURA.md](docs/ARQUITETURA.md). Guia auxiliar: `dist/Instalacao-Plataforma.html`, gerado de `fontes/guia/guia_plataforma.html`. O guia operacional da raiz permanece preservado até o corte.


## Base visual para as próximas melhorias

Referência: [marca BD](docs/BD_Dashboard_Brand_Guidelines.md). Aplicação e contraste: [Design System](docs/DESIGN_SYSTEM.md). Fonte única: `src/design/brand.css`, usada na casca e nos módulos incorporados. O layout da casca está em `src/style.css`.

[Plano por jornada](docs/PLANO-DE-MELHORIAS.md) e [ambiguidades conhecidas](docs/PENDENCIAS-DOCUMENTAIS.md) permitem continuar sem inventar regras ou repetir propostas antigas. O roteiro mantém a distinção entre fundação pronta, telas futuras e homologação corporativa pendente.
