# Ferramenta "Comparar importação" (11/11/2026)

`ferramentas/Comparar-importacao.html` é uma página só para desenvolvimento. Não vai para a pasta da rede. Ela prepara o pedido de atualização de um importador sem expor os dados da linha.

## Uso

1. Abrir o arquivo no navegador (duplo clique). A página não usa a rede e não grava nada.
2. Escolher a tabela de importação (14 tipos):
   - Produção: MB51, COOIS, CSV do MES, plano do PCP colado, aba CALC, histórico RELATÓRIO e aba PARADAS;
   - Waste: KKBC_ORD;
   - Paradas: Forms de paradas;
   - Gestão de Gel: estoque de LPs e histórico de transações de LP;
   - Portal: Meta OEE e CS12;
   - Iniciativas: Ações.
3. Colar a tabela exatamente como vem do SAP, do Excel ou do CSV, ou abrir um .txt/.csv. Para Excel, copiar a aba e colar.
4. Escrever, se quiser, o que mudou ou o que é preciso.
5. Copiar o prompt e colar na conversa.

## O que ela faz

- **Formato atual:** o `REF` traz, para cada tabela, o formato e os nomes de coluna que a página reconhece hoje. São os mesmos aliases dos importadores:
  - `DEFAULT_ALIAS` do Waste;
  - `MB51`/`COOIS` de `ordens_servico.js`;
  - `COLS` e `TXCOLS` do Gel;
  - cabeçalho do Forms no Paradas;
  - `COLS` da CS12 no Portal;
  - `REL_FIELDS`, `parseParadas` e `parseCalcPlans` da Produção;
  - `ImpAcoes` de Iniciativas.
- **Leitura da tabela colada:** a ferramenta reconhece o separador (lista do SAP com `|`, tab, `;` ou `,`) e acha a linha de títulos. Em seguida compara coluna por coluna e mostra três coisas:
  - as colunas reconhecidas e o campo de cada uma;
  - as colunas novas;
  - as colunas esperadas que não vieram, marcando as obrigatórias.

  Também informa o formato dos valores: data, número BR ou US, sinal no fim, código e texto.
- **Descaracterização:** a mesma troca vale para a página inteira.
  - Códigos, ordens, lotes, LPs e documentos viram outros com o mesmo formato. O ".0000" do catálogo do MES fica.
  - Descrições viram "TUBO EDTA 01", guardando as palavras-chave do produto. A opção "Manter descrições" deixa as descrições originais.
  - Nomes viram "Pessoa 01", e e-mails viram `pessoa01@exemplo.com`.
  - Valores e quantidades são multiplicados por fatores sorteados a cada vez que a página abre. O fator não sai no texto.
  - Datas, horas, unidades, status e percentuais ficam como vieram, porque é o formato que o importador precisa ler.
  - Nas listas do SAP, as linhas fora da tabela (Ordem, Material, Denominação, Quantidade, Usuário) também são trocadas.
- **Conferência:** antes de copiar, a ferramenta avisa se algum código de 6 ou mais caracteres do original ainda aparece na amostra.

## Manutenção

Quando um importador mudar, atualize o `REF` daquela tabela nesta ferramenta. O teste `testes/tcomparar.js` confere a ferramenta com:
- as amostras de `testes/amostras` (MB51, COOIS, CS12);
- listas sintéticas: KKBC_ORD com coluna nova e negativo no fim, MES e Ações.
