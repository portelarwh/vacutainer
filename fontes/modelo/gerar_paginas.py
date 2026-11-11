"""Gera as páginas em construção (Projetos; Iniciativas e Equipamentos saíram na 1.0.0, 08/11/2026) a partir de fontes/modelo/pagina-em-construcao.html
e roda o fontes/kit/aplicar_kit21.py em seguida (kit v2.1, catálogo de sistemas, padrão visual e bases iguais às outras páginas).
Uso (na raiz do projeto): python fontes/modelo/gerar_paginas.py
Especificação: docs/paginas-construcao.md. Quando uma página começar de verdade (v1.0), tire-a da lista PAGINAS
e passe a editar o HTML dela direto (registrar no CLAUDE.md)."""
import os, json, subprocess, sys
RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MODELO = os.path.join(RAIZ, 'fontes', 'modelo', 'pagina-em-construcao.html')
DOCS_PLANO = 'docs/plano-evolucao-plataforma.md'

PAGINAS = [
 {'arquivo': 'Projetos.html',
  'page': {'id': 'projetos', 'titulo': 'Projetos · Projetos de melhoria e investimentos', 'tituloCurto': 'Projetos',
           'subtitulo': 'Projetos de melhoria e investimentos', 'versao': '0.1.10', 'baseFile': 'projetos-base.json',
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
