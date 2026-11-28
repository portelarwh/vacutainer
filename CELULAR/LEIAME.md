# CELULAR · app "Meu Turno"

App de celular para o operador lançar a produção do turno. É **independente da [Plataforma](../Plataforma.html)**: os celulares não acessam o servidor da linha, então o app não lê nem grava as bases. Ele usa a mesma lógica da plataforma e entrega o resultado por **WhatsApp**, **PDF** ou, desde a versão 0.4, **de volta para a plataforma** (QR pela webcam ou arquivo).

Arquivo único: [index.html](index.html), HTML, CSS e JavaScript nativos, sem internet (embute a biblioteca de QR qrcode-generator, licença MIT). Teste: `npm run test:celular` ([testes/celular/meu-turno.cjs](../testes/celular/meu-turno.cjs)) e, com a plataforma, [testes/plataforma/mt-celular.cjs](../testes/plataforma/mt-celular.cjs).

## Gerado pela plataforma (0.4 · MT-01, 22/11/2026)

- O mesmo arquivo está dentro do `Plataforma.html` (bloco `celular/meu-turno`). **Ao mudar este `index.html`, atualize o bloco:** `node scripts/bloco.mjs celular/meu-turno CELULAR/index.html` (o teste `mt-celular` reprova se os dois forem diferentes).
- **Administração › Apps de celular › Gerar MeuTurno.html** embute o cadastro de hoje: linha, turnos (vigência do dia), catálogos com a meta por hora (PPH × OEE meta mais específica; sem meta de OEE, o PPH), equipamentos, tipos de parada e pessoas (só ID, nome e turno). Cada nome vai com o código do cadastro. Envie o arquivo aos celulares; quando o cadastro mudar, gere de novo e reenvie com o mesmo nome (o histórico do celular continua).
- No app gerado, o operador escolhe o nome na lista (o turno guarda o ID) e cada parada guarda o código do tipo e da máquina.
- **Relatório do turno › Enviar para a plataforma:** mostra o QR (partes de até 450 caracteres, compactadas, que passam sozinhas) e baixa o arquivo `.mt.json` com o mesmo conteúdo.
- Na plataforma, **Produção › Lançamento › Importar do celular** lê os QR pela webcam (ou abre o arquivo), mostra a prévia e grava hora a hora, paradas (tipo e máquina), scrap, operador e observações pelas ações normais do Lançamento. Hora vazia no celular não muda o que está lançado; reimportar não duplica paradas. O gel do celular não é gravado (é da Gestão de Gel).

## Um app só: Linha no celular (APP-CEL fase 2, 27/11/2026)

- [linha.html](linha.html) é o lançador (bloco `celular/linha`; ao mudar, `node scripts/bloco.mjs celular/linha CELULAR/linha.html`). No repositório ele é só o modelo e avisa que o arquivo é gerado pela plataforma.
- **Administração › Apps de celular › Gerar Linha.html** junta os dois apps já configurados com o cadastro: **Operação** (Meu Turno, este `index.html`) e **Manutenção** (`manutencao.html`). No celular, a pessoa abre o arquivo e escolhe o módulo; na tela inicial de cada módulo, **Trocar de módulo** volta à escolha. Opcional: "Abrir direto no último módulo usado".
- Cada módulo é o mesmo app de sempre e guarda os próprios dados (chaves `mt.` e `mm.`); o lançador só escolhe qual abrir (substitui a página pelo módulo; trocar recarrega). Os arquivos separados `MeuTurno.html` e `Manutencao.html` continuam disponíveis.
- Para quem já usa os arquivos separados: abra o `Linha.html` no Chrome, do mesmo jeito; antes, por segurança, use **Exportar histórico**. Se o celular abrir o arquivo por outro caminho (outro app de arquivos), os dados podem ficar em outro lugar: o histórico exportado volta por Importar histórico.
- Teste: [testes/plataforma/app-cel-linha.cjs](../testes/plataforma/app-cel-linha.cjs).

## Pacote do dia (Linha no celular 0.3, Meu Turno 0.7 · APP-CEL fase 3, parte 2, 28/11/2026)

- Na plataforma: **Administração › Apps de celular › Enviar o dia ao celular (QR)** (ou o arquivo `dia-linha.json`). O pacote sai dos exports já publicados, sem cálculo novo: **ordens e lotes** em aberto (Produção), **plano e meta** (plano do mês e meta de hoje por turno), **ações abertas** (Iniciativas, atrasadas primeiro) e o **resumo de ontem** (OEE, produção, meta e scrap do dia e dos turnos). O que não foi publicado vai como ausente e aparece como "—", nunca como zero.
- No celular: **Linha.html › Atualizar cadastro ou dia** recebe o pacote; o botão **Dia dd/mm** mostra os quatro blocos (só consulta). Na **Operação**, as ordens do dia viram a lista do campo **Lote**; escolher o lote preenche a OP quando ela está vazia.
- Teste: [testes/plataforma/app-cel-dia.cjs](../testes/plataforma/app-cel-dia.cjs).

## Cadastro da plataforma para o celular, sem reenviar o app (Linha no celular 0.2 · APP-CEL fase 3, 28/11/2026)

- Na plataforma: **Administração › Apps de celular › Enviar cadastro ao celular (QR)** mostra o cadastro em QR (as partes se alternam na tela) e **Baixar arquivo (.json)** salva o mesmo pacote (`cadastro-linha.json`).
- No celular: **Linha.html › Atualizar cadastro** liga a câmera e lê as partes (em qualquer ordem) ou abre o arquivo. Grava a configuração da Operação em `mt.cfg` e a da Manutenção em `mm.cfg`; os módulos abrem com o cadastro novo e os turnos e atendimentos do celular continuam. Arquivo que não é o cadastro é recusado com aviso.
- Formato: o mesmo do celular para a plataforma (`MT1:id:k/n:` + `Z` deflate-raw em base64). O Linha.html gerado leva o leitor jsQR (biblioteca/jsqr, Apache 2.0), cerca de 270 KB; o gerador de QR da plataforma é o mesmo do app (qrcode-generator, MIT), lido do modelo do Meu Turno.
- Ainda a testar no celular real: a câmera com o app aberto direto do arquivo no Chrome do Android. Sem câmera, o caminho é o arquivo pelo WhatsApp.
- Teste: [testes/plataforma/app-cel-qr.cjs](../testes/plataforma/app-cel-qr.cjs).

## Mensagem do WhatsApp editável (0.5 · APP-CEL fase 1, 27/11/2026)

- **Administração › Apps de celular › Mensagem do WhatsApp:** modelo com marcadores entre chaves e prévia com valores fictícios. Fica em `parametros.celular.mensagemWhats` e vai embutido no app gerado (`CFG.modeloWa`). Depois de salvar, gere o `MeuTurno.html` de novo e reenvie.
- Marcadores: `{linha}`, `{turno}`, `{data}`, `{operador}`, `{catalogo}`, `{lote}`, `{op}`, `{producao}`, `{plano}`, `{unidade}`, `{aderencia}`, `{semaforo}`, `{paradas_min}`, `{paradas_motivos}`, `{scrap}`, `{gel}`, `{hora_a_hora}`, `{obs}`. Marcador desconhecido fica como está.
- Sem modelo (vazio), o app usa a mensagem padrão de sempre (`txtWA`).
- O rodapé da tela inicial mostra a data e a revisão do cadastro embutido (ex.: "cadastro de 27/11/2026 (rev 8)"), para saber quando a base do celular está velha.
- Teste: [testes/plataforma/app-cel-whats.cjs](../testes/plataforma/app-cel-whats.cjs).

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

## Distribuição (decisão do responsável, 20/11/2026)

O arquivo `index.html` é enviado aos celulares (por exemplo, renomeado `MeuTurno.html`) e aberto direto, sem servidor e sem link: nenhum dado sai do celular a não ser pelo WhatsApp ou PDF que o operador envia. O teste é feito primeiro no celular do responsável.

- Abrir pelo **Chrome** (Android: tocar no arquivo › Abrir com › Chrome) e, se quiser, "Adicionar à tela inicial". Outros visualizadores de arquivo podem não guardar os dados; nesse caso a tela inicial avisa.
- Para atualizar, enviar o arquivo novo **no mesmo lugar e com o mesmo nome**; a versão aparece no rodapé da tela inicial. Antes, use "Exportar histórico" por segurança.
- iPhone: o app de Arquivos não executa o HTML; é preciso abrir no Safari (testar antes de distribuir).
- Validado no Chromium aberto como arquivo local: dados e foto continuam depois de fechar e reabrir. Não validado ainda: o celular real de cada operador.

## Configuração real (sem passar pelo repositório)

O repositório é público e só tem dados fictícios; o cadastro real nunca entra nele. O responsável faz o cadastro no próprio celular (⚙ Configuração › Salvar) e escolhe uma das formas:

1. **Gerar app com esta configuração** (recomendado): cria um `MeuTurno.html` com a configuração embutida. Envie esse arquivo aos operadores; eles só abrem no Chrome. Não leva o histórico de quem gerou. Num celular que já tinha o app, a configuração embutida mais nova substitui a antiga; o histórico do operador continua.
2. **Compartilhar configuração**: gera `configuracao-linha.json`; cada operador abre ⚙ › Receber configuração uma vez.

Para mudar um catálogo, meta ou turno depois, repita: salve, gere o app de novo e reenvie.

## Dados e limites

- Os dados ficam só no celular: turnos no armazenamento do navegador e fotos no IndexedDB. Limpar os dados do navegador apaga o histórico; use "Exportar histórico" como cópia.
- **A foto do quadro não preenche os números.** Ela vai como evidência no PDF. Ler a escrita à mão exige um serviço de leitura de imagem com internet, que o app não tem (ver [PENDENCIAS](../PENDENCIAS.md), CEL-02).
- O compartilhar com imagem depende do navegador (Chrome no Android). Sem ele, o app salva a imagem e abre o WhatsApp com o texto.
- Um catálogo por turno; uma troca no meio do turno fica para uma próxima versão.
- O turno guarda a meta, o gel e o nome do catálogo do momento em que foi lançado (versão 0.3): mudar a configuração depois não altera turnos já lançados nem os relatórios refeitos deles.
- A configuração do repositório é fictícia (TESTE). O cadastro real é feito no próprio app pelo responsável e enviado por arquivo; ele não entra no repositório.

## App Manutenção (MAN-01, 22/11/2026)

Arquivo único [manutencao.html](manutencao.html), no mesmo molde do Meu Turno, para o técnico registrar o **atendimento corretivo**: técnico (da lista), equipamento, modo de falha (ou "outro"), se parou a linha, início e fim, sintoma, causa, ação, peças e situação (concluído ou pendente). Gerado em **Administração › Apps de celular › Gerar Manutencao.html** com equipamentos, modos de falha e pessoas da manutenção (só ID, nome e turno). **Enviar para a plataforma** mostra o QR e baixa o `.mm.json`; em **Equipamentos › Ordens de serviço › Importar do celular** ele vira uma OS corretiva (concluída ou aberta) com o técnico (ID), detalhe e apontamento; importar de novo não duplica. Os dados ficam só no celular; a foto ainda não vai junto.

O mesmo arquivo está no bloco `celular/manutencao`: ao mudar `manutencao.html`, rode `node scripts/bloco.mjs celular/manutencao CELULAR/manutencao.html` (o teste `man-celular` confere).
