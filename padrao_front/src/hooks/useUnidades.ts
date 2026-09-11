import { useCallback, useEffect, useState } from 'react';
import UnidadeService from '../services/UnidadeService';
import { Unidade } from '../types';

export const useUnidades = () => {
  const [dados, setDados] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async (filtro = '') => {
    setLoading(true);
    try {
      setDados(await UnidadeService.listar(filtro));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  return { dados, loading, carregar };
};

export default useUnidades;