import { useCallback, useEffect, useState } from 'react';
import TipoSituacaoProcessoService from '../services/TipoSituacaoProcessoService';
import { TipoSituacaoProcesso } from '../types';

export const useTiposSituacaoProcesso = () => {
  const [tiposSituacaoProcesso, setTiposSituacaoProcesso] = useState<TipoSituacaoProcesso[]>([]);

  const carregar = useCallback(async () => {
    setTiposSituacaoProcesso(await TipoSituacaoProcessoService.listar());
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  return { tiposSituacaoProcesso, carregar };
};

export default useTiposSituacaoProcesso;
