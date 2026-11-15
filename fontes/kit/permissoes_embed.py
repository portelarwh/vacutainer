"""Incorpora o mesmo módulo puro ESM nos scripts clássicos dos motores."""
from pathlib import Path

def ler_permissoes(raiz):
    pasta = Path(raiz) / 'fontes' / 'kit'
    comum = (pasta / 'permissoes.mjs').read_text(encoding='utf-8')
    for trecho in ['export const VAC_PODE_MOD', 'export function vacPodeComum']:
        if comum.count(trecho) != 1:
            raise ValueError('Declaração de permissão deve existir exatamente uma vez: '+trecho)
        comum = comum.replace(trecho, trecho.removeprefix('export '))
    return comum

def ler_kit(raiz):
    return (Path(raiz) / 'fontes' / 'kit' / 'kit_v21.js').read_text(encoding='utf-8')
