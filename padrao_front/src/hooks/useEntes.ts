import { useCallback, useEffect, useState } from 'react';
import EnteService from '../services/EnteService';
import { Ente } from '../types';

export const useEntes = () => {
  const [dados, setDados] = useState<Ente[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async (filtro = '') => {
    setLoading(true);
    try {
      setDados(await EnteService.listar(filtro));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return { dados, loading, carregar };
};

export default useEntes;