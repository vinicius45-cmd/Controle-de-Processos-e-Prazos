import { useState, useEffect } from 'react';
import { Validador } from '../types';
import { ValidadorService } from '../services/ValidadorService';

export function useValidadores() {
  const [validadores, setValidadores] = useState<Validador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Busca os dados assim que a tela abre
  useEffect(() => {
    ValidadorService.getValidadores()
      .then(dados => setValidadores(dados))
      .finally(() => setLoading(false));
  }, []);

  return { validadores, setValidadores, loading };
}