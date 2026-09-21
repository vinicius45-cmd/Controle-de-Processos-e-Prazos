import { api } from '../config/api';
import { FormCadastro, Processo } from '../types';

const STORAGE_KEY = 'processos_cadastrados';

const lerLocalmente = (): Processo[] => {
  const conteudo = localStorage.getItem(STORAGE_KEY);
  if (!conteudo) return [];
  try {
    return JSON.parse(conteudo) as Processo[];
  } catch {
    return [];
  }
};

const salvarLocalmente = (processos: Processo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(processos));
};

export const ProcessoService = {
  async listar(): Promise<Processo[]> {
    try {
      const { data } = await api.get<Processo[]>('/processos');
      return data;
    } catch {
      return lerLocalmente();
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
    } catch {
      const idProcesso = processo.id || Date.now().toString();
      const processoLocal: Processo = { ...processo, id: String(idProcesso), idProcesso };
      const processos = lerLocalmente().filter((item) => String(item.id) !== String(idProcesso));
      salvarLocalmente([...processos, processoLocal]);
      return processoLocal;
    }
  },

};

export default ProcessoService;