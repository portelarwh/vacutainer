# Plataforma Vacutainer

Produto único: `dist/Plataforma.html`, aberto no Chrome/Edge sem API, servidor interno ou internet. Bases e backups permanecem na pasta de rede. **O corte não foi executado:** depende da homologação descrita em [CORTE.md](docs/CORTE.md).

Os nove motores vêm da árvore atual de `fontes/` e `paginas/`, compilada pelo build da raiz antes do empacotamento. Eles conservam cálculos, formulários, transações, importadores e contratos de dados. Não há uma cópia antiga mantida em paralelo. Alterar uma regra significa alterar sua fonte e reconstruir a plataforma.

O manifesto em `src/generated/manifest.json` registra o commit de compilação, último commit das fontes, arquivos modificados e versão/hash de cada motor. Os HTML de `paginas/` são fontes e referências de testes; não são artefatos distribuídos na linha.

## Compilar e verificar

```sh
npm install
npm ci --prefix nova-plataforma
npm run build --prefix nova-plataforma
npm test
npm run test:all --prefix nova-plataforma
```

O primeiro comando instala os testes dos motores na raiz. O build da plataforma executa o build da raiz automaticamente. O CI mantém as 67 suítes da raiz, em quatro partes, e as da plataforma no mesmo workflow.

Demonstração: botão da tela inicial ou `Plataforma.html?demo=1`; dados fictícios separados das bases reais. `tests/pasta.cjs` gera suas próprias bases fictícias pelas factories e exports atuais, não reutiliza o antigo cenário de demonstração.

## Integração

- Casca React/TypeScript: navegação, busca, consulta de exports, relatório comum, saúde dos dados e seleção da pasta.
- `vacPagina`: contrato público dos motores, aplicado pelo kit. Abas e comandos vêm do motor; a ponte não usa eval.
- Login com senha e sessão `vac.sessao` pelo vacLogin; ações controladas pelo vacTravas. Sem sessão, consulta. Permissão do navegador/pasta continua necessária.
- Versão da base maior que a do motor: somente leitura. Falha ao consultar pendência bloqueia troca de pasta.
- Escopos persistentes por handle, com isSameEntry; consulta de fila durável mesmo sem módulo aberto.
- Bibliotecas locais incorporadas. Cadastros só são mantidos pelo Portal; cada motor grava sua base e outros leem exports.

OSM, MES, AM/TPM e Projetos mantêm as decisões e amostras pendentes. Nenhuma regra técnica foi inventada nesta integração. Conversão para React será gradual, começando por telas que só leem exports; formulários de gravação continuam nos motores até teste de paridade.

Evidências da rodada: [ACOMPANHAMENTO.md](docs/pr76/ACOMPANHAMENTO.md). Arquitetura: [ARQUITETURA.md](docs/ARQUITETURA.md). Instalação: `fontes/guia/guia_modelo.html` na raiz do repositório.
