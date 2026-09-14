import { useCallback, useEffect, useState } from 'react';
import TipoAssuntoService from '../services/TipoAssuntoService';
import TipoDocumentoService from '../services/TipoDocumentoService';
import { TipoAssunto, TipoDocumento } from '../types';

export const useTiposProcesso = (idUnidade?: number | null) => {
  const [tiposAssunto, setTiposAssunto] = useState<TipoAssunto[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);

  const carregarTipos = useCallback(async () => {
    const [assuntos, documentos] = await Promise.all([
      TipoAssuntoService.listar(idUnidade ?? undefined),
      TipoDocumentoService.listar()
    ]);
    setTiposAssunto(assuntos);
    setTiposDocumento(documentos);
  }, [idUnidade]);

  useEffect(() => { void carregarTipos(); }, [carregarTipos]);
  return { tiposAssunto, tiposDocumento };
};

export default useTiposProcesso;