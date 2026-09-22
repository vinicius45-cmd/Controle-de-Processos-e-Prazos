import { api, isMockApi } from '../config/api';
import { FormCadastro, Processo } from '../types';

const STORAGE_KEY = 'processos_cadastrados';

const lerLocalmente = (): Processo[] => {
  const conteudo = localStorage.getItem(STORAGE_KEY);
  if (!conteudo) return [];
  try {
    return JSON.parse(conteudo) as Processo[];
  } catch (error) {
    if (!isMockApi) throw error;
    return [];
  }
};

const salvarLocalmente = (processos: Processo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(processos));
};

export const ProcessoService = {
  async listarPorUnidade(idUnidade: number, termo = ''): Promise<Processo[]> {
    try {
      const { data } = await api.get<Processo[]>(`/processos/unidade/${idUnidade}`, { params: termo ? { termo } : undefined });
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      return lerLocalmente().filter((processo) => (
        processo.idUnidade === idUnidade &&
        (!termo || `${processo.processoINCRA} ${processo.assunto}`.toLowerCase().includes(termo.toLowerCase()))
      ));
    }
  },

  async salvar(processo: FormCadastro): Promise<Processo> {
    const payload = {
      processoExternalId: processo.processoINCRA || processo.requerimento,
      idEnte: processo.idEnte,
      idUnidade: processo.idUnidade,
      idTipoAssunto: processo.idTipoAssunto,
      idTipoDocumento: processo.idTipoDocumento,
      idTipoSituacaoProcesso: processo.idTipoSituacaoProcesso,
      dsAssunto: processo.assunto,
      dtEntrada: processo.dataEntrada,
      dtPrazoAreaTecnica: processo.prazoAreaTecnica || null,
      dtPrazoFinal: processo.prazoFinal,
      blEspecial: processo.especial ? 'S' : 'N',
      dsObservacao: processo.observacao,
      situacaoProcesso: processo.situacaoProcesso,
      responsavel: processo.responsavel
    };

    try {
      const { data } = processo.id
        ? await api.patch<Processo>(`/processos/${processo.id}`, payload)
        : await api.post<Processo>('/processos', payload);
      return data;
    } catch (error) {
      if (!isMockApi) throw error;
      const idProcesso = processo.id || Date.now().toString();
      const processoLocal: Processo = { ...processo, id: String(idProcesso), idProcesso };
      const processos = lerLocalmente().filter((item) => String(item.id) !== String(idProcesso));
      salvarLocalmente([...processos, processoLocal]);
      return processoLocal;
    }
  },

};

export default ProcessoService;