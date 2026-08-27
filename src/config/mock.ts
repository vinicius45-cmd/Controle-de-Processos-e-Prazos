import { CdpUsuario, Operadora } from '../types';

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
