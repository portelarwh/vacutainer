# Primeiro uso da plataforma (pasta nova, sem dados)

Vale para instalar a plataforma pela primeira vez: pasta nova, nenhum cadastro, nenhuma pessoa cadastrada. Tudo é cadastrado na **Administração**; as outras páginas só leem. Fórmulas e cálculos não mudam.

## 1. Preparar
1. Crie uma pasta na rede (ex.: `Vacutainer`) e copie o `Plataforma.html` para ela. A pasta externa `IMAGENS/Marca` (fonte e logos) é opcional ([MARCA](MARCA.md)).
2. Abra o `Plataforma.html` no Chrome ou no Edge.

## 2. Criar o cadastro inicial
1. Clique em **Conectar pasta da linha** e escolha a pasta.
2. A tela mostra "Cadastro não encontrado". Clique em **Criar o cadastro inicial (primeiro administrador)**.
3. Informe o ID (matrícula), o nome completo e uma senha de 6 números (não todos iguais, nem em sequência). A plataforma cria `00. Bases/vacutainer-cadastros.json` (rev 1) vazio, com os perfis padrão e você como administrador. Só o hash da senha é gravado.
4. A tela volta para a entrada: entre com o ID e a senha.

Esta é a única gravação permitida sem login, e só enquanto a pasta não tem cadastro. Depois disso, toda gravação exige entrar com ID e senha ([CLAUDE](../CLAUDE.md), contrato 4).

## 3. Cadastrar (Administração), nesta ordem
Cada tabela tem **⇩ Modelo** (planilha com o nome técnico na 1ª linha e a aba Campos) e **⇧ Importar planilha** (prévia: novo, alterado, igual, erro; só o marcado é gravado). Se não tiver a planilha, use **+ Novo**.

| # | Onde | O que | Observação |
|---|---|---|---|
| 1 | Planta e linha › Linhas | linha, unidade, setor | |
| 2 | Produto › Famílias | famílias e cores | |
| 3 | Equipamentos › Equipamentos | máquinas e a posição na linha | uma por linha com papel `oee` (ou o ponto da linha é criado sozinho) |
| 4 | Produto › Catálogos | catálogo, PPH, tubos por caixa, caixas por lote | cria UMA vigência; mudança de PPH depois é vigência nova pela ficha |
| 5 | Produto › Materiais e BOM | materiais; BOM pela importação CS12 | |
| 6 | Equipamentos › Componentes e Modos de falha | | opcional no início |
| 7 | Turnos e metas › Turnos | horário, dias, vigência | passando da meia-noite, use 24 h+ (ex.: 30:00) |
| 8 | Turnos e metas › Metas de OEE | meta por catálogo/família, com vigência | sem meta, a capacidade não fecha |
| 9 | Paradas e perdas › Códigos de parada | código, categoria, pilar, descrição, vigência | lote por planilha em ⇩ Exportar para editar |
| 10 | Equipamentos › Tags da linha do tempo | tag → estado macro, com vigência | opcional; sem tag vale o mapeamento inicial |
| 11 | Planta e linha › Calendário | feriados e dias extras | |
| 12 | Sistema › Parâmetros | Parâmetros gerais (fuso, unidade, setor, planta do SAP), Produção (unidade, arredondamento, cobertura, abono padrão, Problemas de QN…), Gel | campo vazio = padrão do cálculo |
| 13 | Pessoas e acesso | usuários e perfis | quem se cadastra sozinho entra como Consulta; o administrador muda o perfil |
| 14 | Configuração › Logo | logo único (grava `Logo.png` na pasta) | |

## 4. Abrir as páginas
Na primeira abertura, cada página pergunta **Criar base nesta pasta?**: responda **Criar base**. A base guarda só o que se lança (não os cadastros). Se aparecer o aviso de cadastro ausente ou ilegível na Produção, o cadastro não foi lido: confira a pasta.

## 5. Conferir antes de usar
- Produção abre sem aviso de cadastro; linha, catálogo e turno aparecem nos filtros.
- Lançar um turno de teste e ver o OEE; o SQDCP segue A4 paisagem.
- Administração › Auditoria mostra quem gravou o quê.
- Backup diário em `00. Backups/<módulo>`.

## Limites conhecidos
- Uso com duas estações na mesma pasta de rede (SMB) ainda precisa de teste real ([PENDENCIAS](../PENDENCIAS.md): H01/H02).
- Cadastro inicial pelo navegador exige permissão de escrita na pasta (o navegador pergunta ao conectar).
- A base de um módulo criada antes da base limpa abre só para consulta; use uma pasta nova.

Teste que prova este roteiro: `testes/plataforma/primeiro-uso.cjs`.
