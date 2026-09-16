/**
 * Dados fictícios usados apenas pela camada visual (AppHeader, /design-system)
 * enquanto a autenticação real não existe. Mantidos centralizados aqui de
 * propósito — nenhum componente deve hardcodar "João Silva" ou similar.
 *
 * Será removido/substituído por dados reais de sessão do Supabase Auth na
 * etapa de autenticação.
 */
export const DEMO_USER = {
  nome: "Vitor Sena",
  papel: "Aluno · Senac",
  iniciais: "VS",
} as const;
