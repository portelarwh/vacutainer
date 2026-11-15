# Validação da revisão PR76 — 14/11/2026

Esta rodada usa exclusivamente dados fictícios, factories dos motores atuais e pastas OPFS temporárias. Nenhuma base real foi lida ou gravada.

## Evidências automatizadas

- Build: TypeScript estrito, Vite, artefato único e verificador dos nove motores descomprimidos; SHA-256, tamanho e dependências externas conferidos.
- Contrato: nove motores publicam vacPagina; as rotas publicadas são comparadas com os botões da casca. Teste de navegação visita as abas dos nove motores, inclusive Linha 360° e as telas de planejamento de Projetos.
- Persistência: bases geradas pelas factories/exports atuais de Portal, Produção, Waste, Gel, Paradas, Equipamentos, Iniciativas e Linha 360°. Abrir → gravar → reler preserva todas as chaves publicadas e a versão de cada módulo. Produção preservou as 29 chaves atuais, incluindo os campos citados na revisão.
- Versão: os oito módulos recusam escrita em base futura. Teste adicional protege arquivos auxiliares do Portal/Produção. Sem sessão, a tentativa de escrita física também é recusada.
- Login/permissões: as mesmas suítes tlogin e tpermissoes da raiz executam dentro da plataforma: senha inicial/provisória, bloqueio, autocadastro fictício, sessão compartilhada/expirada e Consulta/Liderança.
- Pasta/fila: A → B → A mantém escopo, preferências e fila. Troca recusada com fila durável e nenhum módulo aberto; erro na consulta do contrato também bloqueia troca.
- Ciclo de vida: teste confirma descarte dos oito motores ao trocar de pasta. A configuração está em useEffect e o callback ref é estável.
- Impressão: Ctrl+P e botão encaminham ao módulo ativo; cabeçalho e impressão são produzidos pelo motor.
- Interface/offline: ação fictícia criada no Planner e mantida durante navegação; Ctrl K, relatórios, nove módulos, temas e tela de 390 px. SheetJS 0.20.3 carrega sob demanda, sem CDN. Nenhuma requisição externa no teste offline.

A suíte da raiz permanece com 67 testes em quatro partes do mesmo CI. A execução por HTTP local aprovou os 67 casos; o teste de Meta foi repetido depois de configurar fs no adapter Node da SheetJS. As referências numéricas de produção, MUV, gel, paradas, turnos e SQDCP continuam nos testes dos motores.

Os registros e resultados finais ficam em [pr76/ACOMPANHAMENTO.md](pr76/ACOMPANHAMENTO.md). Imagens de navegador ficam em testes-saida/ (fora do Git). O manifesto registra commit real de compilação, commit das fontes e alterações locais, sem assumir que um snapshot antigo corresponde à main.

## Reproduzir

```sh
npm install
npm ci --prefix nova-plataforma
npm run build --prefix nova-plataforma
npm test
npm run test:all --prefix nova-plataforma
```

Se file:// for bloqueado neste ambiente, a alternativa explícita para a suíte da raiz é:

```sh
VAC_TEST_HTTP=1 NODE_OPTIONS="--require ./testes/http-local.cjs" npm test
```

Isso serve o mesmo conteúdo por HTTP local e não homologa file://. O Chromium pode vir do Playwright, de /usr/bin/chromium ou da variável CHROMIUM_PATH.

## NÃO VERIFICADO

- Abertura direta de Plataforma.html por file:// no Chrome/Edge corporativo. O Chromium gerenciado retorna ERR_BLOCKED_BY_ADMINISTRATOR; a política não foi alterada.
- Pasta SMB e comportamento de gravação, perda de rede/permissão e recuperação na estação corporativa.
- Duas estações simultâneas, alterando registros diferentes e depois o mesmo registro.
- Impressora física, Outlook corporativo e documentos em caminhos da rede.

Esses itens exigem homologação autorizada. **Corte NÃO EXECUTADO.** Roteiro e retorno seguro em [CORTE.md](CORTE.md). Não se recomenda baixar apenas a versão do aplicativo sobre bases já atualizadas.

## Limites de produto

Sem conversão de motores para React ou mudança das regras de jornada/madrugada, OSM, MES, AM/TPM e Projetos. A próxima conversão começa por telas que só leem exports; formulários de gravação permanecem nos motores até paridade demonstrada.
