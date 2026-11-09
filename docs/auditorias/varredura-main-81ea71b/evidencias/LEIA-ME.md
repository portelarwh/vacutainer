# Método e evidências

Código auditado: `81ea71bb82cc62f08360684c7ce1a5df54697202`. Os 257 arquivos rastreados foram copiados para uma execução isolada. Não foram usados arquivos da pasta de produção da fábrica.

## Resultados

- Suíte original `node testes/tudo.js`: 31 previstas; 29 aprovadas; `trelatorios` aprovada com Excel do Paradas não verificado em dois temas, por falta de `paginas/lib/xlsx.full.min.js`; `tmeta` não executada por falta do pacote npm `xlsx`; zero falhas reportadas. `tz` passou sem repetição.
- Os 30 processos de teste executados geraram 726 linhas explícitas de `ok`. Testes antigos que só imprimem resultados continuam com essa limitação; não converter saída zero em cobertura integral de todos os fluxos.
- `tpendencias`: 50 checagens explícitas; `tcorrecoes`: 14, incluindo ausência de erro de página; `tvisual`: 223. Os logs e `suites.json` conservam as contagens por processo.
- Oito cenários adicionais reproduziram os cinco achados NV-01–NV-05. **`reproduzido:true` significa defeito observado**, não aprovação. Código zero das sondas significa conclusão do script.
- Três builds determinísticos: código zero, nenhuma diferença nos 257 arquivos comparados.

| Arquivo | Finalidade |
|---|---|
| manifesto-inicial.json | SHA inicial e SHA-256 dos 257 arquivos originais |
| executar-suites.py, rastrear-suites.cjs | Execução da suíte existente e captura das saídas, sem editar os testes |
| suites.json, execucao-suites.json, tudo.log e t*.log | Resultados, códigos, tempos, não verificados e saídas originais |
| adaptador-browser.cjs | Seleção do Chromium instalado e HTTP local dos mesmos arquivos |
| sondas-adicionais.cjs, sondas.json, sondas.log | S01–S04: troca de pasta, edições simultâneas, cache e contingência |
| sonda-saude.cjs, saude.json, saude.log | S05: indicador do Portal versus snapshot pendente real |
| verificar-builds.py, builds.json, aplicar_kit21.log, build.log, gerar_paginas.log | Builds em cópia temporária e comparação de hashes |
| tvisual.json, capturas/ | Medições das oito páginas e duas capturas inspecionadas; dados fictícios |
| gerar_pdf.py | Geração do PDF a partir do diagnóstico Markdown |
| verificacao-final.json | Verificação de integridade e consistência do pacote |

## Condições de execução

Chromium em Linux com Playwright. O ambiente bloqueia a abertura direta de `file://`; um preload externo serve os mesmos arquivos por HTTP de loopback e troca só a URL de navegação. Alguns testes já criam seu próprio HTTP. O adaptador não é parte da aplicação nem proposta de servidor para a fábrica.

As sondas de arquivos usam OPFS, o sistema de arquivos privado do navegador. Em S01 os arquivos A e B são lidos e gravados de verdade por `Store.usar`/`save`. Apenas `IDB.set('pasta', handle)` é contornado, porque o handle OPFS não reproduz a persistência do seletor de pasta externo neste Chromium; o restante da persistência não é substituído.

Em S02 duas páginas compartilham o mesmo contexto/IndexedDB. A leitura remota é substituída por uma promessa controlável que termina com `NotReadableError`. Isso permite posicionar as duas edições antes da formação da primeira pendência. A persistência do snapshot é a da aplicação. Renderizações posteriores foram dispensadas nessa sonda; o teste não afirma sucesso na interface nem reproduz duas estações físicas.

Em S03 são usadas duas pastas reais `RaizA/Linha` e `RaizB/Linha`. A segunda tem JSON inválido para exercitar a cópia de contingência. Em S04 a falha é injetada só em `indexedDB.open('vac-fila')`; o aviso de proteção indisponível é observado e registrado. Em S05 uma alteração local normal do Portal produz o snapshot pendente que o indicador deixa de contar.

Os testes não certificam acesso Windows/SMB, bloqueio corporativo, política de permissões, disponibilidade de biblioteca na fábrica ou uso simultâneo entre computadores. Essa é a etapa H do plano.

## Como repetir

Use uma worktree/cópia do SHA examinado e outra pasta para evidências. Instale ou utilize Playwright e um Chromium compatível com seu ambiente. Para os testes que consultam histórico, disponibilize também o repositório Git original.

Se `file://` funcionar no seu navegador, os testes nativos podem ser executados sem o adaptador. Neste ambiente Linux, a execução usada foi equivalente a:

```sh
export VAC_AUDIT_ROOT=/workspace/verificacao-main-81ea71b
export VAC_AUDIT_GIT_DIR=/workspace/vacutainer/.git
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
python /workspace/varredura-vacutainer-81ea71b/evidencias/executar-suites.py
node --require /workspace/varredura-vacutainer-81ea71b/evidencias/adaptador-browser.cjs /workspace/varredura-vacutainer-81ea71b/evidencias/sondas-adicionais.cjs
node --require /workspace/varredura-vacutainer-81ea71b/evidencias/adaptador-browser.cjs /workspace/varredura-vacutainer-81ea71b/evidencias/sonda-saude.cjs
python /workspace/varredura-vacutainer-81ea71b/evidencias/verificar-builds.py
```

Adapte os caminhos dos scripts à pasta onde estiverem, o executável de Chromium do adaptador e a worktree de origem no verificador de builds. Os scripts escrevem seus resultados na própria pasta de evidências; ao contra-analisar, copie-os para uma pasta temporária para não sobrescrever este registro. Os parâmetros de ambiente foram acrescentados ao empacotar para facilitar repetição; os caminhos padrão reproduzem os da execução registrada.

`SHA256SUMS.txt`, no nível acima, verifica o conteúdo deste pacote. O manifesto inicial serve para comparar os arquivos do código examinado; não é uma lista apenas dos arquivos novos de documentação.
