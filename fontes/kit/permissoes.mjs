// Regra pura compartilhada pelos motores e pela casca. Ausência preserva o contrato do kit;
// a exigência de sessão válida pertence à camada de acesso, não muda esta regra.
export const VAC_PODE_MOD = Object.freeze({ linha: 'equip' });
export function vacPodeComum(cadastro, usuario, modulo, acao = 'ver') {
  const perfil = cadastro && usuario ? (cadastro.perfis || []).find(p => p.codigo === usuario.perfil) : null;
  const alvo = VAC_PODE_MOD[modulo] || modulo;
  if (!perfil || !perfil.permissoes || !perfil.permissoes[alvo]) return true;
  return perfil.permissoes[alvo][acao] !== false;
}
