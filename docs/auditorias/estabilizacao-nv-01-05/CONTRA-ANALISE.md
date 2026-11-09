# Pedido de contra-análise

Revise a implementação dos cinco achados NV-01–NV-05 no repositório `portelarwh/vacutainer`, branch `codex/correcoes-nv-01-05`, baseada na main `81ea71bb82cc62f08360684c7ce1a5df54697202`. Informe o SHA da implementação examinado. A publicação foi autorizada explicitamente em 09/11/2026. Acesse a [branch de entrega](https://github.com/portelarwh/vacutainer/tree/codex/correcoes-nv-01-05).

Nesta etapa, apenas revise. Não implemente, não altere HTMLs/fontes/bases, não faça commit nem abra PR. Use uma cópia isolada e dados fictícios.

Leia:

- `CLAUDE.md` e `docs/auditorias/registro-decisoes.md`, seção NV;
- `docs/estabilizacao-nv-01-05.md`;
- `docs/auditorias/estabilizacao-nv-01-05/LEIA-ME.md` e `evidencias/resultados-consolidados.json`;
- `testes/tnv.js` e o diff da implementação em relação a `81ea71b`.

A auditoria original está na branch `codex/varredura-main-81ea71b`, pasta `docs/auditorias/varredura-main-81ea71b/`, commit `d5d399423fa2a4a96cd98e9ea7fbb3bcc9403477`.

Para cada NV, conclua corrigido, corrigido em parte ou não corrigido, com arquivo/função/linha e reprodução independente. Avalie especialmente:

1. Origem por handle, pastas homônimas, migração de legado e filas órfãs de duas origens. Nada pode migrar silenciosamente nem ser descartado.
2. Web Locks, snapshot com aba dona, retomada após fechamento, duas abas simultâneas, falhas de leitura/gravação e navegador sem suporte.
3. Cache persistido da ficha, origem desconhecida e leitura offline da própria pasta.
4. Reservas por operação, limpeza somente da cópia aceita, IndexedDB bloqueado, recuperação mista, migração da chave antiga e download sem limpar a fila.
5. Saúde dos dados: cópias inteiras, fila do cadastro, reservas e estado desconhecido, incluindo o relatório.

Rode `node testes/tnv.js` e os testes pertinentes da suíte existente. Confira os três builds e mantenha a distinção entre aprovação, parcial e não verificado. A suíte inicial teve falhas que foram corrigidas nas expectativas e verificações; confira os logs da consolidação, sem aceitar automaticamente o resumo.

Respeite propriedade das bases, exports, vigências, códigos como texto, fontes da Produção e kit comum. Sem API ou servidor; perfis não são autenticação. Não reabra decisões recusadas sem fato novo.

Entregue parecer por achado, regressões/riscos restantes, ajustes mínimos e critérios para homologação H. Testes locais não equivalem a duas estações reais. Ao terminar, aguarde a decisão do responsável sobre próximas alterações ou merge.
