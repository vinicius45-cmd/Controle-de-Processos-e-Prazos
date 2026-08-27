import { useState, useCallback } from 'react';
import { OperadoraService } from '../services/OperadoraService';
import { Operadora } from '../types';

export const useOperadoras = () => {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<Operadora[]>([]);

  const carregar = useCallback(async (filtro: string) => {
    setLoading(true);
    try {
      const res = await OperadoraService.listar(filtro);
      setDados(res);
    } catch (err) {
      // Erro formatado e capturado pelo Interceptor do Axios
    } finally {
      setLoading(false);
    }
  }, []);

  const cadastrar = useCallback(async (nome: string) => {
    setLoading(true);
    try {
      await OperadoraService.cadastrar(nome);
      // Recarrega a lista para mostrar a nova operadora inserida
      const res = await OperadoraService.listar('');
      setDados(res);
      return true;
    } catch (err) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { dados, loading, carregar, cadastrar };
};
export default useOperadoras;
