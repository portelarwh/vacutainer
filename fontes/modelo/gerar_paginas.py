"""Gera as páginas em construção (Equipamentos, Projetos; Iniciativas saiu na 1.0.0, 08/11/2026) a partir de fontes/modelo/pagina-em-construcao.html
e roda o fontes/kit/aplicar_kit21.py em seguida (kit v2.1, catálogo de sistemas, padrão visual e bases iguais às outras páginas).
Uso (na raiz do projeto): python fontes/modelo/gerar_paginas.py
Especificação: docs/paginas-construcao.md. Quando uma página começar de verdade (v1.0), tire-a da lista PAGINAS
e passe a editar o HTML dela direto (registrar no CLAUDE.md)."""
import os, json, subprocess, sys
RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MODELO = os.path.join(RAIZ, 'fontes', 'modelo', 'pagina-em-construcao.html')
DOCS_PLANO = 'docs/plano-evolucao-plataforma.md'

PAGINAS = [
 {'arquivo': 'Equipamentos.html',
  'page': {'id': 'equip', 'titulo': 'Equipamentos · Máquinas da linha e manutenção', 'tituloCurto': 'Equipamentos',
           'subtitulo': 'Máquinas da linha e manutenção', 'versao': '0.1.3', 'baseFile': 'equipamentos-base.json',
           'backupDir': '00. Backups/Equipamentos', 'estado': 'construcao',
           'estadoNota': 'Ficha e indicadores por máquina, relatórios das máquinas e manutenção.'},
  'plano': {
   'nota': 'Ficha e indicadores de cada máquina da linha, relatórios das máquinas, OEE próprio por máquina e a manutenção (preventiva, ordens de serviço e TPM).',
   'entrega': 'Fase 5 do plano de evolução (depois de Produção e Paradas). O OEE oficial continua sendo o da Linha, na Produção.',
   'docs': [DOCS_PLANO + ' § 6.4', 'docs/paginas-construcao.md § 5.3'],
   'contagens': [{'tipo': 'equipamentos', 'rot': 'Equipamentos cadastrados'}, {'tipo': 'componentes', 'rot': 'Componentes cadastrados'}],
   'hoje': [{'txt': 'Ficha do equipamento (fotos, documentos, componentes)', 'portal': 'cadastros/equipamentos', 'obs': 'no Portal'},
            {'txt': 'MTBF, MTTR e disponibilidade por máquina', 'pagina': 'paradas', 'hash': 'aba=equip', 'obs': 'em Paradas › Equipamentos'},
            {'txt': 'Matriz de paradas por máquina', 'portal': 'cadastros/matriz', 'obs': 'no Portal'}],
   'abas': [
    {'id': 'maquina', 'aba': 'Máquina', 'grupo': 'Operação',
     'itens': ['Ficha do cadastro: fotos, documentos, componentes e dados técnicos', 'Indicadores da máquina (OEE próprio, D, P, tempo parado)', 'Eventos de parada da máquina (do Paradas)'],
     'fonte': 'Equipamentos e componentes: cadastro do Portal. Eventos e MTBF/MTTR: Paradas (exports).'},
    {'id': 'relatorios', 'aba': 'Relatórios de máquina', 'grupo': 'Análise',
     'itens': ['Importação do relatório de cada máquina', 'Tempo em cada estado: Produzindo · Parada · Ociosa · Bloqueada', 'OEE próprio por máquina (sem Ociosa e Bloqueada) e gargalo do dia'],
     'fonte': 'Relatórios exportados de cada máquina (amostras ainda pendentes).'},
    {'id': 'intervalos', 'aba': 'Intervalos anormais', 'grupo': 'Análise',
     'itens': ['Intervalos sem produção encontrados nos relatórios', 'Sugestão de parada para o Paradas validar'],
     'fonte': 'Relatórios de máquina; as sugestões vão para o Paradas.'},
    {'id': 'comparativo', 'aba': 'Comparativo', 'grupo': 'Análise',
     'itens': ['Máquinas lado a lado', 'Tendência por mês', 'Semáforo pela meta do cadastro']},
    {'id': 'preventiva', 'aba': 'Plano preventivo', 'grupo': 'Manutenção',
     'itens': ['Plano preventivo e preditivo por máquina e componente', 'Próximas intervenções e atrasadas']},
    {'id': 'os', 'aba': 'Ordens de serviço', 'grupo': 'Manutenção',
     'itens': ['Ordens de serviço abertas e fechadas', 'Ligação com os eventos de quebra do Paradas']},
    {'id': 'tpm', 'aba': 'TPM', 'grupo': 'Manutenção',
     'itens': ['Pilares do TPM e etiquetas', 'Priorização pelas falhas recorrentes do Paradas']}]}},
 {'arquivo': 'Projetos.html',
  'page': {'id': 'projetos', 'titulo': 'Projetos · Projetos de melhoria e investimentos', 'tituloCurto': 'Projetos',
           'subtitulo': 'Projetos de melhoria e investimentos', 'versao': '0.1.3', 'baseFile': 'projetos-base.json',
           'backupDir': '00. Backups/Projetos', 'estado': 'construcao',
           'estadoNota': 'Escopo a desenhar: projetos de melhoria, projetos grandes e compra de máquina.'},
  'plano': {
   'nota': 'Projetos de melhoria, projetos grandes e compra de máquina. Escopo ainda não definido: esta lista de abas é provisória.',
   'entrega': 'Depois das outras fases do plano de evolução; o escopo será desenhado antes.',
   'docs': [DOCS_PLANO, 'docs/paginas-construcao.md § 5.5'],
   'hoje': [{'txt': 'Ações de perdas', 'pagina': 'perdas', 'hash': 'aba=acoes', 'obs': 'no Waste'},
            {'txt': 'Ações de paradas', 'pagina': 'paradas', 'hash': 'aba=acoes', 'obs': 'em Paradas'}],
   'abas': [
    {'id': 'lista', 'aba': 'Projetos', 'grupo': 'Operação', 'itens': ['Lista e ficha do projeto: tipo, dono, ganho esperado, prazo', 'Situação de cada projeto']},
    {'id': 'cronograma', 'aba': 'Cronograma', 'grupo': 'Gestão', 'itens': ['Marcos e prazos', 'Atrasos']},
    {'id': 'acoes', 'aba': 'Ações', 'grupo': 'Gestão', 'itens': ['Ações dos projetos', 'Ligação com Waste, Paradas e Produção']},
    {'id': 'relatorios', 'aba': 'Relatórios', 'grupo': 'Gestão', 'itens': ['Resumo para a diretoria']}]}}]

def js(o): return json.dumps(o, ensure_ascii=False, separators=(',', ':'))
# PAGE como objeto JS (chaves sem aspas), para o Portal › Versões achar versao:'…' e estado:'…' no texto do HTML
def jsobj(o): return '{' + ','.join(k + ':' + json.dumps(v, ensure_ascii=False) for k, v in o.items()) + '}'

def gerar():
    # duas fases (07/11/2026): monta as 3 páginas na memória; grava só se todas passarem. Se o aplicar_kit21.py falhar depois,
    # devolve o conteúdo anterior das páginas (nada fica pela metade)
    m = open(MODELO, encoding='utf-8').read()
    saida = []
    for p in PAGINAS:
        pg = p['page']; s = m
        cab = pg['titulo'].upper()
        for k, v in [('@@TITULO@@', pg['tituloCurto']), ('@@CAB@@', cab), ('@@PAGE@@', jsobj(pg)),
                     ('@@PLANO@@', js(p['plano']).replace('</', '<\\/'))]:
            if k not in s: raise SystemExit('ERRO: ' + k + ' não achado no modelo')
            s = s.replace(k, v)
        saida.append((os.path.join(RAIZ, 'paginas', p['arquivo']), p['arquivo'], s))
    antes = {fn: (open(fn, encoding='utf-8', newline='').read() if os.path.exists(fn) else None) for fn, _, _ in saida}
    for fn, nome, s in saida:
        open(fn, 'w', encoding='utf-8', newline='\n').write(s); print('gerada', nome)
    r = subprocess.run([sys.executable, os.path.join(RAIZ, 'fontes', 'kit', 'aplicar_kit21.py')])
    if r.returncode:
        for fn, s0 in antes.items():
            if s0 is None: os.remove(fn)
            else: open(fn, 'w', encoding='utf-8', newline='').write(s0)
        raise SystemExit('ERRO no aplicar_kit21.py: as páginas geradas voltaram ao que eram')

if __name__ == '__main__':
    gerar()
