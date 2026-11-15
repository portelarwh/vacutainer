"""Incorpora o mesmo módulo puro ESM nos scripts clássicos dos motores."""
from pathlib import Path

def ler_kit(raiz):
    pasta = Path(raiz) / 'fontes' / 'kit'
    kit = (pasta / 'kit_v21.js').read_text(encoding='utf-8')
    comum = (pasta / 'permissoes.mjs').read_text(encoding='utf-8')
    for trecho in ['export const VAC_PODE_MOD', 'export function vacPodeComum']:
        if comum.count(trecho) != 1:
            raise ValueError('Declaração de permissão deve existir exatamente uma vez: '+trecho)
        comum = comum.replace(trecho, trecho.removeprefix('export '))
    marcador = '/* vac-permissoes-comum */'
    if kit.count(marcador) != 1:
        raise ValueError('Marcador das permissões deve existir exatamente uma vez')
    return kit.replace(marcador, comum)
