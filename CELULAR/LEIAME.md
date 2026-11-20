# CELULAR · app "Meu Turno"

App de celular para o operador lançar a produção do turno. É **independente da [Plataforma](../Plataforma.html)**: os celulares não acessam o servidor da linha, então o app não lê nem grava as bases. Ele usa a mesma lógica da plataforma e entrega o resultado por **WhatsApp** ou **PDF**.

Arquivo único: [index.html](index.html), HTML, CSS e JavaScript nativos, sem biblioteca externa e sem internet. Teste: `npm run test:celular` ([testes/celular/meu-turno.cjs](../testes/celular/meu-turno.cjs)).

## Telas

| Tela | O que faz |
|---|---|
| Início | "Lançar meu turno" (o turno sai da hora do celular; o 3º turno, que cruza a meia-noite, fica no dia em que começou), Histórico e Gel na ordem. |
| Meu turno | Operador, catálogo, lote e OP. Hora a hora com plano, acumulado e cor (verde ≥ 100%, amarelo ≥ 90%, vermelho abaixo). Paradas por hora (minutos, motivo, máquina e nota). Scrap total ou por máquina. Gel, quando o catálogo tem gel: aplicado (kg), purga, sobra no barril e outros (g), teórico e real ÷ teórico. Foto do quadro. Observações. |
| Fechar turno | Resumo e avisos. Hora sem lançamento vai como "não informado", nunca como zero; operador e lote são obrigatórios. |
| Relatório | Imagem (cartão 1080 × 1350) com o texto pelo compartilhar do celular; WhatsApp só com o texto; PDF A4 (com a foto do quadro). Reabrir só no mesmo dia. |
| Histórico | Por turno ou por período (7 dias, 30 dias, mês ou datas), com filtro de turno, paradas por motivo, WhatsApp e PDF do período. Exportar e importar histórico (.json). |
| Gel na ordem | g/tubo do catálogo (ou digitado) × quantidade da ordem (tubos ou mil) = gel para apontar sem perda. Opcional: perda prevista e quanto já foi apontado. |
| Configuração | Linha, turnos, sobra final que junta à hora anterior, catálogos (meta em mil/h e gel em g/tubo), máquinas e motivos. "Compartilhar configuração" gera um .json que o operador abre em "Receber configuração". |

## Regras (as mesmas da plataforma)

- Intervalos de hora cheia. A sobra do fim do turno até o limite configurado (padrão 45 min, como no quadro: 21:00–22:45) junta à hora anterior.
- Plano do intervalo = meta do catálogo (mil/h) × minutos ÷ 60. Produção em mil tubos; scrap em tubos; % de scrap = scrap ÷ (produção × 1000 + scrap).
- Gel teórico = tubos × g/tubo. "Gel na ordem": 800 tubos × 0,834 g = 667,2 g.

## Dados e limites

- Os dados ficam só no celular: turnos no armazenamento do navegador e fotos no IndexedDB. Limpar os dados do navegador apaga o histórico; use "Exportar histórico" como cópia.
- **A foto do quadro não preenche os números.** Ela vai como evidência no PDF. Ler a escrita à mão exige um serviço de leitura de imagem com internet, que o app não tem (ver [PENDENCIAS](../PENDENCIAS.md), CEL-02).
- O compartilhar com imagem depende do navegador (Chrome no Android). Sem ele, o app salva a imagem e abre o WhatsApp com o texto.
- Um catálogo por turno; uma troca no meio do turno fica para uma próxima versão.
- A configuração do repositório é fictícia (TESTE). O cadastro real é feito no próprio app pelo responsável e enviado por arquivo; ele não entra no repositório.
