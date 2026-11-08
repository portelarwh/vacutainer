**Evidências desta revisão — 08/11/2026**

`manifesto-inicial.json` registra os hashes dos 106 arquivos originais e do pacote anterior antes desta etapa. `verificacao-final.json` registra a conferência de integridade, o escopo efetivamente executado e os IDs preservados/acrescentados. `SHA256SUMS.txt`, na raiz do pacote, permite conferir a entrega completa.

`verificar-outro-agente.log` e `resultado-original-outro-agente.json` são as saídas do script original de c3ae4b0, sem edição. O script mistura inspeção estática e navegador; suas marcações não equivalem a dez bugs reproduzidos. Ele também grava JSON em testes/saida/ e usa armazenamento temporário do navegador, por isso foi executado somente numa cópia isolada.

`verificacao-complementar.cjs`, `.log` e `.json` contêm os cenários adicionais. O teste do preço intercepta a persistência; a gravação nunca chega a uma base real. Demais dados de teste são fictícios e pertencem a contextos isolados.

Para repetir **no ambiente em que esta execução foi feita**, a aplicação arquivada foi extraída em `/workspace/verificacao-isolada-c3ae4b0`. Os três arquivos originais do outro agente foram copiados para `docs/auditorias/diagnostico-2026-11-08/` dessa cópia. Com Playwright disponível no NODE_PATH e Chromium em `/usr/bin/chromium`, os comandos utilizados têm esta forma:

```sh
node --require /workspace/revisao-final-vacutainer/evidencias/adaptador-browser.cjs /workspace/verificacao-isolada-c3ae4b0/docs/auditorias/diagnostico-2026-11-08/reproducoes/verificar.js
node --require /workspace/revisao-final-vacutainer/evidencias/adaptador-browser.cjs /workspace/revisao-final-vacutainer/evidencias/verificacao-complementar.cjs
```

O adaptador escolhe o Chromium instalado e substitui file:// por HTTP local sobre a mesma cópia. Foi necessário porque file:// é bloqueado neste navegador. Esse HTTP serve apenas à reprodução, não é proposta de servidor para o sistema. O ambiente exige autorização de execução fora do sandbox para abrir navegador/porta local.

Os caminhos absolutos dos scripts e o executável do navegador refletem esta execução. Em outro ambiente, adapte uma cópia dos scripts externos, o caminho de saída e a instalação do Playwright; preserve os arquivos originais do outro agente. Nunca aponte para pastas reais de produção. Reproduções complementares geram saída e substituem seu próprio JSON se executadas novamente.

`gerar_pdf.py` produz o PDF do parecer a partir do Markdown, usando ReportLab e fontes DejaVu. `parecer-pdf-texto.txt` é a extração textual do PDF para conferência. Resultados de suítes anteriores estão apenas no material histórico; não foram reexecutados nesta etapa.
