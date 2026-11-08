**Diagnóstico do Vacutainer — 08/11/2026**

Referência: `portelarwh/vacutainer`, branch `main`, commit `e0435136359847e07a2a775a1d7eea31371495b8`.

- `diagnostico-completo.pdf`: documento de 18 páginas para leitura e compartilhamento; referências de código levam ao commit analisado no GitHub.
- `diagnostico-completo.md`: documento editável com referências locais às linhas de código.
- `evidencias/reproducoes.json`: resultados dos cenários adicionais que sustentam os achados.
- `evidencias/suites.json`: resultado das oito suítes existentes executadas; sete delas imprimiram 477 verificações positivas no total, além das sondagens de `tpg`.
- `evidencias/vac-t*.log`: saídas completas dessas suítes.
- `evidencias/*.png`: telas com dados fictícios usadas na inspeção visual.

Os scripts em `evidencias/` registram a instrumentação usada neste ambiente. Exigem Playwright, Chromium e a cópia do projeto em `/workspace/vacutainer`; os caminhos podem ser adaptados para outro ambiente. Não são alterações nem testes adicionados ao repositório do produto.

Ordem dos scripts dos cenários adicionais: `vac-audit.cjs`, `vac-extra.cjs`, `vac-offline.cjs`, todos com o adaptador `vac-browser.cjs` pré-carregado. O último script abre uma página nova e usa `context.setOffline(true)` antes de carregar a biblioteca de Excel; é o resultado final da verificação offline. As suítes existentes também usaram o adaptador para servir os arquivos por HTTP local, pois o Chromium do ambiente bloqueia navegação `file://`.

Os scripts gravaram o JSON intermediário em `/tmp/vac-audit-evidencias.json`; a cópia final está em `evidencias/reproducoes.json`. O gerador `gerar_pdf.py` usa ReportLab e fontes DejaVu para gerar o PDF a partir do Markdown.

Não foram alterados os arquivos da aplicação, gravados dados reais ou publicados commits. A revisão não teve acesso à pasta de rede corporativa, ao SAP real ou a duas estações reais. As gravações dos cenários usaram simulações/OPFS. O documento diferencia defeitos reproduzidos, pendências anteriores e propostas futuras.
