**Vacutainer — roteiro de homologação na pasta da linha**

Referência: 8cad6a6. Este é um roteiro a executar pelo responsável/usuários, não resultado de teste na rede. Nenhuma base real foi acessada nesta auditoria. Use uma pasta de homologação com cópia autorizada e dados de teste; não remova arquivos reais para reproduzir falhas.

**Registro mínimo por caso:** data, HTML/versão, navegador, estação, pasta, usuário/área, ação, resultado esperado/observado, evidência e responsável. Use `NÃO EXECUTADO`, `APROVADO`, `REPROVADO` ou `BLOQUEADO`; ausência de erro na tela não basta para aprovar gravação.

**1. Instalação e bases novas**

1. Conferir versões: Portal 1.9.0, Produção 2.4.15, Waste 1.8.21, Gel 2.09, Paradas 1.0.20, Iniciativas/Equipamentos 1.0.1 e Projetos 0.1.4, ou registrar a entrega posterior testada.
2. Conectar cada módulo à mesma pasta de homologação. Criar uma ação e uma OS identificadas como teste.
3. Confirmar fisicamente `00. Bases/iniciativas-base.json` e `00. Bases/equipamentos-base.json`. Não deve surgir uma segunda base divergente na raiz.
4. Fechar/reabrir e conferir IDs, descrição, responsável, histórico, revisão e exports. Confirmar que outra página apenas consulta o resumo.
5. Criar Backup agora e conferir nome, conteúdo e pasta do módulo. Executar uma restauração pelo procedimento autorizado numa cópia, não sobre a base de produção.

**2. Usuário e Área**

1. No Portal, preencher Área em pelo menos dois usuários da mesma equipe e um de outra. Conferir o código estável e o nome cadastrado.
2. Criar ação com responsável, outra com apoio e outra sem responsável.
3. Conferir Minhas, Minha equipe e Sem responsável, incluindo o contador de atrasadas.
4. Trocar a pessoa pelo botão Entrar e escolher Ficar no Portal sem navegar: os itens devem mudar imediatamente. Este caso reproduz AT-10 na versão auditada e precisa ser repetido após a correção.
5. Trocar o usuário em outra aba e voltar. Registrar como nomes livres, renomeação e homônimos devem ser tratados; não pressupor autenticação central.

**3. Paradas → Planner → ficha/OS**

1. Abrir um evento com equipamento, código e ordem conhecidos. Usar + Ação no Planner.
2. Conferir os campos antes de criar: origem, fotografia, período, minutos, ocorrência, vínculos e endereço de retorno.
3. Criar a ação, conferir a base de Iniciativas e verificar a mesma ação em Minha fila e na ficha da ordem. O Paradas não deve escrever na base de Iniciativas.
4. Repetir o encaminhamento para conferir o aviso de ação parecida, sem criar duplicata involuntária.
5. Abrir uma OS pelo evento. Confirmar ID, equipamento e referência. Voltar ao evento e ver a OS publicada por Equipamentos.
6. Registrar anomalia e cancelar o formulário opcional da OS: a anomalia deve continuar. Abrir sua pendência pelo Portal em janela nova: a máquina alvo deve estar selecionada (AT-05).
7. Criar ação de uma reunião/grupo de paradas com duas ordens. Conferir todos os vínculos e reconsulta em navegador limpo (AT-07/09/12).

**4. Duas abas e duas estações — casos distintos**

**Duas abas do mesmo módulo:** abrir ambas antes de qualquer edição, ficar sem conexão à pasta de homologação e criar registros diferentes. Fechar/reabrir em ambas as ordens; tudo deve permanecer pendente e sincronizar uma única vez. A versão auditada perde uma alteração nesse caso (AT-01).

**Duas estações:**

1. A e B leem a mesma revisão. Criam registros diferentes e gravam próximas no tempo.
2. Reabrir nas duas e conferir fisicamente o arquivo, não apenas as telas. Contar IDs/auditorias e procurar perda/duplicação.
3. Repetir mudando campos diferentes da mesma ação. Ambas as mudanças devem ser preservadas.
4. Mudar o mesmo campo: registrar qual regra de conflito foi aplicada e se o histórico explica as duas tentativas.
5. Repetir com falha de leitura, escrita e confirmação, garantindo pendência recuperável e ausência de sucesso falso.
6. Repetir com A fechada depois de confirmar e B gravando sobre uma leitura anterior. Retomar A após mais de 30 minutos. A estratégia atual tem uma janela de reconferência limitada; este é um caso de risco a investigar, não aprovação presumida.
7. Conferir que o teste não depende de uma releitura imediata que o operador não faria normalmente.

Uma aprovação de duas estações neste roteiro é uma evidência da configuração testada, não prova matemática de transação distribuída. Registrar navegador, servidor de arquivos e condições.

**5. Recuperação e troca de pasta**

- Em cópia descartável, retirar uma base já lida, depois tentar Gravar agora. Exigir preservação da cópia/pendência e decisão de recuperação. Na versão auditada a base pode ser recriada vazia (AT-02).
- Apresentar um arquivo de formato/versão desconhecidos: não deve haver escrita (AT-03).
- Trocar entre duas pastas de homologação e consultar a ficha. Dado e indicação de origem devem pertencer à pasta selecionada (AT-08).
- Verificar o comportamento quando o armazenamento local fica indisponível/cheio. Não declarar alteração protegida se ela só está na memória.

**6. Virada do dia, relatórios e falta de internet**

- Manter a aba aberta de um dia para o outro, inclusive após suspensão do computador. Conferir prazo vencido, vigência da TAG e exports sem fazer edição (AT-04).
- Conferir reunião dia/turno, granularidades, todas as ordens do grupo e ausência de dado fora da janela. Fora de cobertura deve ser indisponível, não zero (AT-06).
- Exportar PDF/texto e, com SheetJS local instalado, Excel; comparar números, filtros, fontes e comentários longos.
- Desconectar internet mantendo a pasta acessível. Conferir importação/exportação Excel, PDF local, mensagens e versão real da biblioteca. E3b não é aprovado só porque PDF funciona.
- Conferir cópia com imagens no Outlook desktop/web da empresa.

**Saída da homologação:** lista de aprovados/reprovados/bloqueados, correções necessárias e limites de uso do piloto. Não fechar automaticamente itens que aguardam amostra OSM, SQL MES ou padrões técnicos.
