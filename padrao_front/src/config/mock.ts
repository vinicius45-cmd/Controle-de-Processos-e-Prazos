import { CdpUsuario, DistribuicaoSituacao, Ente, Operadora, ProcessoDistribuicao, ProcessoSituacao, TipoAssunto, TipoDocumento, TipoSituacaoDistribuicao, TipoSituacaoProcesso, Unidade, UnidadeHierarquia } from '../types';

export const MOCK_CDP_USERS: CdpUsuario[] = [
  {
    idUsuario: 10,
    nickname: 'admin',
    ativo: 'S',
    pessoaAd: {
      nome: 'Super Administrador',
      email: 'admin@semob.df.gov.br',
      matriculaEmail: 'admin@semob.df.gov.br',
      matriculaPessoaAd: '9999-9',
      cargo: 'Administrador de Redes',
      departamento: 'TI/SEMOB',
      telefone: '61 99999-9999',
      ativo: 'S'
    }
  },
  {
    idUsuario: 21,
    nickname: 'auditor.silva',
    ativo: 'S',
    pessoaAd: {
      nome: 'Silva de Souza (Auditor)',
      email: 'silva@semob.df.gov.br',
      matriculaEmail: 'silva@semob.df.gov.br',
      matriculaPessoaAd: '1234-5',
      cargo: 'Auditor de Transportes',
      departamento: 'COFIS/SEMOB',
      telefone: '61 98888-8888',
      ativo: 'S'
    }
  },
  {
    idUsuario: 42,
    nickname: 'preposto.carvalho',
    ativo: 'S',
    pessoaAd: {
      nome: 'Carvalho dos Reis (Operadora)',
      email: 'carvalho@pioneira.com.br',
      matriculaEmail: 'carvalho@pioneira.com.br',
      matriculaPessoaAd: '8877-6',
      cargo: 'Preposto da Viação',
      departamento: 'Viação Pioneira',
      telefone: '61 97777-7777',
      ativo: 'S'
    }
  },
  {
    idUsuario: 99,
    nickname: 'sem.acesso',
    ativo: 'S',
    pessoaAd: {
      nome: 'Usuário Sem Acessos',
      email: 'sem.acesso@semob.df.gov.br',
      matriculaEmail: 'sem.acesso@semob.df.gov.br',
      matriculaPessoaAd: '0000-0',
      cargo: 'Visitante Externo',
      departamento: 'Portaria',
      telefone: '61 96666-6666',
      ativo: 'S'
    }
  }
];

export const getMockPermissionTree = (idUsuario: number) => {
  if (idUsuario === 10) {
    return {
      sistemas: [
        {
          idSistema: 1,
          nome: 'SISMOB',
          sigla: 'SISMOB',
          modulos: [
            { idModulo: 1, nome: 'Dashboard', rota: 'dashboard', ativo: 'S' },
            { idModulo: 2, nome: 'SUOP', rota: 'suop', ativo: 'S', servicos: [
              { idServico: 11, nome: 'Operadoras Menu', endpoint: 'suop-agencies', dsTipo: 'ESCRITA', ativo: 'S' },
              { idServico: 12, nome: 'Linhas Menu', endpoint: 'suop-routes', dsTipo: 'ESCRITA', ativo: 'S' },
              { idServico: 13, nome: 'Veículos Menu', endpoint: 'suop-vehicles', dsTipo: 'ESCRITA', ativo: 'S' },
              { idServico: 14, nome: 'Consulta Operadoras API', endpoint: '/operadoras', dsTipo: 'ESCRITA', ativo: 'S' }
            ]},
            { idModulo: 3, nome: 'Fiscalização', rota: 'sif-menu', ativo: 'S', servicos: [
              { idServico: 21, nome: 'Auto Menu', endpoint: 'sif-fiscalizacao', dsTipo: 'ESCRITA', ativo: 'S' },
              { idServico: 22, nome: 'Validadores Menu', endpoint: 'sif-validador', dsTipo: 'ESCRITA', ativo: 'S' }
            ]},
            { idModulo: 4, nome: 'Controle de Acesso', rota: 'cdp', ativo: 'S', servicos: [
              { idServico: 31, nome: 'Sistemas', endpoint: 'cdp-sistemas', dsTipo: 'ESCRITA', ativo: 'S' },
              { idServico: 32, nome: 'Usuários', endpoint: 'cdp-usuarios', dsTipo: 'ESCRITA', ativo: 'S' },
              { idServico: 33, nome: 'Perfis', endpoint: 'cdp-grupos', dsTipo: 'ESCRITA', ativo: 'S' }
            ]}
          ]
        }
      ]
    };
  } else if (idUsuario === 21) {
    return {
      sistemas: [
        {
          idSistema: 1,
          nome: 'SISMOB',
          sigla: 'SISMOB',
          modulos: [
            { idModulo: 1, nome: 'Dashboard', rota: 'dashboard', ativo: 'S' },
            { idModulo: 2, nome: 'SUOP', rota: 'suop', ativo: 'S', servicos: [
              { idServico: 11, nome: 'Operadoras Menu', endpoint: 'suop-agencies', dsTipo: 'ESCRITA', ativo: 'S' },
              { idServico: 12, nome: 'Linhas Menu', endpoint: 'suop-routes', dsTipo: 'LEITURA', ativo: 'S' },
              { idServico: 13, nome: 'Veículos Menu', endpoint: 'suop-vehicles', dsTipo: 'LEITURA', ativo: 'S' },
              { idServico: 14, nome: 'Consulta Operadoras API', endpoint: '/operadoras', dsTipo: 'ESCRITA', ativo: 'S' }
            ]},
            { idModulo: 3, nome: 'Fiscalização', rota: 'sif-menu', ativo: 'S', servicos: [
              { idServico: 21, nome: 'Auto Menu', endpoint: 'sif-fiscalizacao', dsTipo: 'LEITURA', ativo: 'S' },
              { idServico: 22, nome: 'Validadores Menu', endpoint: 'sif-validador', dsTipo: 'LEITURA', ativo: 'S' }
            ]}
          ]
        }
      ]
    };
  } else if (idUsuario === 42) {
    return {
      sistemas: [
        {
          idSistema: 1,
          nome: 'SISMOB',
          sigla: 'SISMOB',
          modulos: [
            { idModulo: 1, nome: 'Dashboard', rota: 'dashboard', ativo: 'S' },
            { idModulo: 2, nome: 'SUOP', rota: 'suop', ativo: 'S', servicos: [
              { idServico: 11, nome: 'Operadoras Menu', endpoint: 'suop-agencies', dsTipo: 'LEITURA', ativo: 'S' },
              { idServico: 14, nome: 'Consulta Operadoras API', endpoint: '/operadoras', dsTipo: 'LEITURA', ativo: 'S' }
            ]}
          ]
        }
      ]
    };
  }
  return { sistemas: [] };
};

export const localMockOperadoras: Operadora[] = [
  { idOperadora: 101, nmOperadora: 'TCB - Sociedade de Transportes Coletivos de Brasília' },
  { idOperadora: 202, nmOperadora: 'Viação Piracicabana' },
  { idOperadora: 303, nmOperadora: 'Viação Marechal' },
  { idOperadora: 404, nmOperadora: 'Urbi Mobilidade Urbana' },
  { idOperadora: 505, nmOperadora: 'Viação Pioneira' }
];

export const localMockEntes: Ente[] = [
  { idEnte: 1, nmEnte: 'Tribunal de Contas do Distrito Federal', sgEnte: 'TCDF', blAtivo: 'S' },
  { idEnte: 2, nmEnte: 'Câmara Legislativa do Distrito Federal', sgEnte: 'CLDF', blAtivo: 'S' },
  { idEnte: 3, nmEnte: 'Ministério Público do Distrito Federal e Territórios', sgEnte: 'MPDFT', blAtivo: 'S' },
  { idEnte: 4, nmEnte: 'Secretaria de Estado de Mobilidade do Distrito Federal', sgEnte: 'SEMOB', blAtivo: 'S' }
];

export const localMockUnidades: Unidade[] = [
  { idUnidade: 1, nmUnidade: 'Subsecretaria de Operações', sgUnidade: 'SUOP', blAtivo: 'S', idUnidadeSuperior: null },
  { idUnidade: 2, nmUnidade: 'Subsecretaria de Regulação', sgUnidade: 'SUTER', blAtivo: 'S', idUnidadeSuperior: null },
  { idUnidade: 3, nmUnidade: 'Subsecretaria de Fiscalização', sgUnidade: 'SUFISA', blAtivo: 'S', idUnidadeSuperior: null },
  { idUnidade: 4, nmUnidade: 'Coordenação de Processos da SUOP', sgUnidade: 'CP-SUOP', blAtivo: 'S', idUnidadeSuperior: 1 },
  { idUnidade: 5, nmUnidade: 'Coordenação de Processos da SUFISA', sgUnidade: 'CP-SUFISA', blAtivo: 'S', idUnidadeSuperior: 3 }
];

export const localMockUnidadesHierarquia: UnidadeHierarquia[] = [
  { idUnidadeHierarquia: 1, idUnidade: 1, idUnidadeSuperior: null, dtInicioVigencia: '2026-01-01', dtFimVigencia: null, blVigente: 'S' },
  { idUnidadeHierarquia: 2, idUnidade: 2, idUnidadeSuperior: null, dtInicioVigencia: '2026-01-01', dtFimVigencia: null, blVigente: 'S' },
  { idUnidadeHierarquia: 3, idUnidade: 4, idUnidadeSuperior: 1, dtInicioVigencia: '2026-01-01', dtFimVigencia: null, blVigente: 'S' },
  { idUnidadeHierarquia: 4, idUnidade: 5, idUnidadeSuperior: 3, dtInicioVigencia: '2026-01-01', dtFimVigencia: null, blVigente: 'S' }
];

export const localMockTiposAssunto: TipoAssunto[] = [
  { idTipoAssunto: 1, idUnidade: 1, nmTipoAssunto: 'Ofício', blAtivo: 'N' },
  { idTipoAssunto: 2, idUnidade: 1, nmTipoAssunto: 'Requerimento', blAtivo: 'S' },
  { idTipoAssunto: 3, idUnidade: 3, nmTipoAssunto: 'Denúncia', blAtivo: 'S' },
  { idTipoAssunto: 4, idUnidade: 3, nmTipoAssunto: 'Indicação', blAtivo: 'S' },
  { idTipoAssunto: 5, idUnidade: 2, nmTipoAssunto: 'Despacho', blAtivo: 'S' }
];

export const localMockTiposDocumento: TipoDocumento[] = [
  { idTipoDocumento: 1, nmTipoDocumento: 'Ofício', blAtivo: 'S' },
  { idTipoDocumento: 2, nmTipoDocumento: 'Memorando', blAtivo: 'S' },
  { idTipoDocumento: 3, nmTipoDocumento: 'Despacho', blAtivo: 'S' },
  { idTipoDocumento: 4, nmTipoDocumento: 'Resposta SEI', blAtivo: 'S' }
];

export const localMockTiposSituacaoDistribuicao: TipoSituacaoDistribuicao[] = [
  { idTipoSituacaoDistribuicao: 1, nmTipoSituacaoDistribuicao: 'Aguardando', blSituacaoFinal: 'N', blAtivo: 'S' },
  { idTipoSituacaoDistribuicao: 2, nmTipoSituacaoDistribuicao: 'Respondido', blSituacaoFinal: 'N', blAtivo: 'S' },
  { idTipoSituacaoDistribuicao: 3, nmTipoSituacaoDistribuicao: 'Concluído', blSituacaoFinal: 'S', blAtivo: 'S' },
  { idTipoSituacaoDistribuicao: 4, nmTipoSituacaoDistribuicao: 'Cancelado', blSituacaoFinal: 'S', blAtivo: 'S' }
];

export const localMockTiposSituacaoProcesso: TipoSituacaoProcesso[] = [
  { idTipoSituacaoProcesso: 1, nmTipoSituacaoProcesso: 'Aberto', blSituacaoFinal: 'N', blAtivo: 'S' },
  { idTipoSituacaoProcesso: 2, nmTipoSituacaoProcesso: 'Em análise', blSituacaoFinal: 'N', blAtivo: 'S' },
  { idTipoSituacaoProcesso: 3, nmTipoSituacaoProcesso: 'Aguardando retorno', blSituacaoFinal: 'N', blAtivo: 'S' },
  { idTipoSituacaoProcesso: 4, nmTipoSituacaoProcesso: 'Para assinatura', blSituacaoFinal: 'N', blAtivo: 'S' },
  { idTipoSituacaoProcesso: 5, nmTipoSituacaoProcesso: 'Concluído', blSituacaoFinal: 'S', blAtivo: 'S' },
  { idTipoSituacaoProcesso: 6, nmTipoSituacaoProcesso: 'Cancelado', blSituacaoFinal: 'S', blAtivo: 'S' }
];

export const localMockProcessosSituacoes: ProcessoSituacao[] = [
  { idProcessoSituacao: 1, idProcesso: '1', idTipoSituacaoProcesso: 3, dtInicio: '2026-06-04', dtFim: null, dsObservacao: 'Aguardando retorno da unidade.' }
];

export const localMockProcessosDistribuicoes: ProcessoDistribuicao[] = [
  { idDistribuicao: 1, idProcesso: '1', idUnidade: 1, dtDistribuicao: '2026-06-05', dtRecebimento: '2026-06-06', dtConclusao: null, dsObservacao: 'Distribuição inicial.' }
];

export const localMockDistribuicoesSituacoes: DistribuicaoSituacao[] = [
  { idDistribuicaoSituacao: 1, idDistribuicao: 1, idTipoSituacaoDistribuicao: 1, dtInicio: '2026-06-05', dtFim: null }
];
