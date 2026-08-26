import { useAuth } from './useAuth';
import { useModules } from './useModules';

export const useSemAcesso = () => {
  const { estaAutenticado, usuario } = useAuth();
  const { modulos } = useModules();

  if (!estaAutenticado || !usuario) {
    return { bloqueado: false };
  }

  // Se o usuário está logado, verificamos os módulos reais
  // (excluindo os públicos como 'dash' e 'apps')
  const modulosReais = modulos.filter(
    (mod) => mod.id !== 'dash' && mod.id !== 'apps'
  );

  // Se o usuário não possui módulos reais E suas rotas permitidas do CDP estão vazias
  const semRotasCDP = !usuario.rotasPermitidas || usuario.rotasPermitidas.length === 0;
  const bloqueado = modulosReais.length === 0 && semRotasCDP;

  return { bloqueado };
};
export default useSemAcesso;
