import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import '../styles/Relatorios.css';

type RelatorioSubAba =
  | 'visaoGeral'
  | 'atrasados'
  | 'prazos'
  | 'porOrgao'
  | 'porResponsavel'
  | 'assinatura';

type StatusProcesso =
  | 'Atrasado'
  | 'Vence Hoje'
  | 'Próximo do prazo'
  | 'Para Assinatura'
  | 'Especial'
  | 'OK';

interface ProcessoRelatorio {
  id: number;
  assunto: string;
  orgao: string;
  responsavel: string;
  status: StatusProcesso;
  diasRestantes: number;
}

interface MetricaGrafico {
  label: string;
  valor: number;
  porcentagem: number;
  cor: string;
}

interface BarraGrafico {
  label: string;
  valor: number;
  altura: number;
  cor: string;
}

const abas: Array<{ id: RelatorioSubAba; label: string }> = [
  { id: 'visaoGeral', label: 'Visão Geral' },
  { id: 'atrasados', label: 'Atrasados' },
  { id: 'prazos', label: 'Prazos' },
  { id: 'porOrgao', label: 'Por Órgão' },
  { id: 'porResponsavel', label: 'Por Responsável' },
  { id: 'assinatura', label: 'Assinatura' }
];

const processosRelatorio: ProcessoRelatorio[] = [
  { id: 1, assunto: 'Solicitação de Informação', orgao: 'Secretaria de Saúde', responsavel: 'João da Silva', status: 'Atrasado', diasRestantes: -3 },
  { id: 2, assunto: 'Análise Técnica', orgao: 'Secretaria de Educação', responsavel: 'Maria Santos', status: 'Atrasado', diasRestantes: -1 },
  { id: 3, assunto: 'Parecer Técnico', orgao: 'Secretaria de Obras', responsavel: 'Carlos Lima', status: 'Vence Hoje', diasRestantes: 0 },
  { id: 4, assunto: 'Solicitação de Documentos', orgao: 'Secretaria de Administração', responsavel: 'Juliana Alves', status: 'Próximo do prazo', diasRestantes: 3 },
  { id: 5, assunto: 'Minuta de Resposta', orgao: 'Secretaria de Planejamento', responsavel: 'João da Silva', status: 'Para Assinatura', diasRestantes: 5 },
  { id: 6, assunto: 'Processo Especial', orgao: 'Gabinete do Prefeito', responsavel: 'Maria Santos', status: 'Especial', diasRestantes: 15 },
  { id: 7, assunto: 'Informações Gerais', orgao: 'Secretaria de Finanças', responsavel: 'Carlos Lima', status: 'OK', diasRestantes: 21 },
  { id: 8, assunto: 'Acompanhamento de Obras', orgao: 'Secretaria de Obras', responsavel: 'Paulo Costa', status: 'Próximo do prazo', diasRestantes: 2 },
  { id: 9, assunto: 'Requisição de Dados', orgao: 'Secretaria de Saúde', responsavel: 'Ana Beatriz', status: 'Vence Hoje', diasRestantes: 0 },
  { id: 10, assunto: 'Aprovação Final', orgao: 'Secretaria de Administração', responsavel: 'Renato Silva', status: 'Para Assinatura', diasRestantes: 4 },
  { id: 11, assunto: 'Auditoria Operacional', orgao: 'Secretaria de Finanças', responsavel: 'Maria Santos', status: 'OK', diasRestantes: 10 },
  { id: 12, assunto: 'Revisão de Documentação', orgao: 'Secretaria de Educação', responsavel: 'Lucas Mendes', status: 'Especial', diasRestantes: 7 },
  { id: 13, assunto: 'Resposta Legislativa', orgao: 'Secretaria de Saúde', responsavel: 'João da Silva', status: 'OK', diasRestantes: 12 },
  { id: 14, assunto: 'Parecer de Fiscalização', orgao: 'Secretaria de Obras', responsavel: 'Paulo Costa', status: 'Próximo do prazo', diasRestantes: 4 },
  { id: 15, assunto: 'Plano de Mobilidade', orgao: 'Secretaria de Administração', responsavel: 'Ana Beatriz', status: 'Atrasado', diasRestantes: -2 }
];

const statusColors: Record<StatusProcesso, string> = {
  Atrasado: '#ef4444',
  'Vence Hoje': '#f97316',
  'Próximo do prazo': '#22c55e',
  'Para Assinatura': '#f59e0b',
  Especial: '#8b5cf6',
  OK: '#2563eb'
};

const getPercentual = (valor: number, total: number): number => {
  if (!total) return 0;
  return Math.round((valor / total) * 100);
};

const getDonutGradient = (metrics: MetricaGrafico[]): string => {
  let start = 0;
  const stops = metrics.map((item) => {
    const end = start + item.porcentagem;
    const segment = `${item.cor} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${stops.join(', ')})`;
};

const buildProcessosPorSituacao = (processos: ProcessoRelatorio[]): MetricaGrafico[] => {
  const total = processos.length;
  const statusLabels: Record<StatusProcesso, string> = {
    Atrasado: 'Atrasados',
    'Vence Hoje': 'Vence hoje',
    'Próximo do prazo': 'Próx. 5 dias',
    'Para Assinatura': 'Para assinatura',
    Especial: 'Especiais',
    OK: 'Em dia'
  };

  const agrupado = processos.reduce<Record<StatusProcesso, number>>((acc, processo) => {
    acc[processo.status] = (acc[processo.status] ?? 0) + 1;
    return acc;
  }, {
    Atrasado: 0,
    'Vence Hoje': 0,
    'Próximo do prazo': 0,
    'Para Assinatura': 0,
    Especial: 0,
    OK: 0
  });

  return Object.entries(agrupado)
    .filter(([, valor]) => valor > 0)
    .map(([status, valor]) => ({
      label: statusLabels[status as StatusProcesso],
      valor,
      porcentagem: getPercentual(valor, total),
      cor: statusColors[status as StatusProcesso]
    }));
};

const buildPrazos = (processos: ProcessoRelatorio[]): MetricaGrafico[] => {
  const total = processos.length;
  const agrupado = {
    vencidos: processos.filter((processo) => processo.diasRestantes < 0).length,
    venceHoje: processos.filter((processo) => processo.diasRestantes === 0).length,
    proximos5: processos.filter((processo) => processo.diasRestantes > 0 && processo.diasRestantes <= 5).length,
    depois5: processos.filter((processo) => processo.diasRestantes > 5).length
  };

  return [
    { label: 'Vencidos', valor: agrupado.vencidos, porcentagem: getPercentual(agrupado.vencidos, total), cor: '#ef4444' },
    { label: 'Vence hoje', valor: agrupado.venceHoje, porcentagem: getPercentual(agrupado.venceHoje, total), cor: '#f97316' },
    { label: 'Próx. 5 dias', valor: agrupado.proximos5, porcentagem: getPercentual(agrupado.proximos5, total), cor: '#22c55e' },
    { label: 'Após 5 dias', valor: agrupado.depois5, porcentagem: getPercentual(agrupado.depois5, total), cor: '#2563eb' }
  ];
};

const buildBarChart = (processos: ProcessoRelatorio[], keySelector: (processo: ProcessoRelatorio) => string, corPadrao: string): BarraGrafico[] => {
  const agrupado = processos.reduce<Record<string, number>>((acc, processo) => {
    const key = keySelector(processo);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const filtered = Object.entries(agrupado)
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6);

  const maxValor = Math.max(...filtered.map((item) => item.valor), 1);

  return filtered.map((item, index) => ({
    label: item.label,
    valor: item.valor,
    altura: Math.max((item.valor / maxValor) * 100, 18),
    cor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#a5b4fc', '#c7d2fe'][index] ?? corPadrao
  }));
};

const Relatorios: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<RelatorioSubAba>('visaoGeral');

  const relatorioDados = useMemo(() => {
    const total = processosRelatorio.length;
    const situacao = buildProcessosPorSituacao(processosRelatorio);
    const prazos = buildPrazos(processosRelatorio);
    const orgaos = buildBarChart(processosRelatorio, (processo) => processo.orgao, '#2563eb');
    const responsaveis = buildBarChart(processosRelatorio, (processo) => processo.responsavel, '#10b981');

    return { total, situacao, prazos, orgaos, responsaveis };
  }, []);

  const renderDonutCard = (titulo: string, metricas: MetricaGrafico[]) => (
    <article className="relatorios-card" key={titulo}>
      <div className="relatorios-card__header">
        <span>{titulo}</span>
      </div>
      <div className="relatorios-card__body relatorios-card--row">
        <div className="relatorios-donut">
          <div className="relatorios-donut__pie" style={{ background: getDonutGradient(metricas) }} />
          <div className="relatorios-donut__center">{relatorioDados.total}</div>
        </div>
        <div className="relatorios-legend">
          {metricas.map((item) => (
            <div className="relatorios-legend__row" key={item.label}>
              <span className="relatorios-legend__dot" style={{ backgroundColor: item.cor }} />
              <span className="relatorios-legend__label">{item.label}</span>
              <span className="relatorios-legend__value">
                {item.valor} <strong>{item.porcentagem}%</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="relatorios-card__footer">Total: {relatorioDados.total}</div>
    </article>
  );

  const renderAbaContent = () => {
    switch (abaAtiva) {
      case 'atrasados':
        return (
          <>
            {renderDonutCard('Processos por Situação', relatorioDados.situacao)}
            <article className="relatorios-card relatorios-card--list">
              <div className="relatorios-card__header">
                <span>Prioridade de Atraso</span>
              </div>
              <div className="relatorios-card__body relatorios-card__body--list">
                {processosRelatorio
                  .filter((processo) => processo.diasRestantes < 0)
                  .slice(0, 5)
                  .map((processo) => (
                    <div key={processo.id} className="relatorios-list-item">
                      <div>
                        <strong>{processo.assunto}</strong>
                        <span>{processo.orgao}</span>
                      </div>
                      <span className="relatorios-list-item__badge">{Math.abs(processo.diasRestantes)} dias</span>
                    </div>
                  ))}
              </div>
            </article>
          </>
        );
      case 'prazos':
        return (
          <>
            {renderDonutCard('Prazos', relatorioDados.prazos)}
            <article className="relatorios-card">
              <div className="relatorios-card__header">
                <span>Prazo por responsável</span>
              </div>
              <div className="relatorios-card__body relatorios-card__body--bars">
                {relatorioDados.responsaveis.map((item) => (
                  <div className="relatorios-bar-column" key={item.label}>
                    <span className="relatorios-bar-column__value">{item.valor}</span>
                    <div className="relatorios-bar-column__track">
                      <div className="relatorios-bar-column__fill" style={{ height: `${item.altura}%`, backgroundColor: item.cor }} />
                    </div>
                    <span className="relatorios-bar-column__label">{item.label}</span>
                  </div>
                ))}
              </div>
            </article>
          </>
        );
      case 'porOrgao':
        return (
          <>
            <article className="relatorios-card relatorios-card--wide">
              <div className="relatorios-card__header">
                <span>Processos por Órgão de Origem</span>
              </div>
              <div className="relatorios-card__body relatorios-card__body--bars">
                {relatorioDados.orgaos.map((item) => (
                  <div className="relatorios-bar-column" key={item.label}>
                    <span className="relatorios-bar-column__value">{item.valor}</span>
                    <div className="relatorios-bar-column__track">
                      <div className="relatorios-bar-column__fill" style={{ height: `${item.altura}%`, backgroundColor: item.cor }} />
                    </div>
                    <span className="relatorios-bar-column__label">{item.label}</span>
                  </div>
                ))}
              </div>
            </article>
          </>
        );
      case 'porResponsavel':
        return (
          <>
            <article className="relatorios-card relatorios-card--wide">
              <div className="relatorios-card__header">
                <span>Processos por Responsável</span>
              </div>
              <div className="relatorios-card__body relatorios-card__body--bars">
                {relatorioDados.responsaveis.map((item) => (
                  <div className="relatorios-bar-column" key={item.label}>
                    <span className="relatorios-bar-column__value">{item.valor}</span>
                    <div className="relatorios-bar-column__track">
                      <div className="relatorios-bar-column__fill" style={{ height: `${item.altura}%`, backgroundColor: item.cor }} />
                    </div>
                    <span className="relatorios-bar-column__label">{item.label}</span>
                  </div>
                ))}
              </div>
            </article>
          </>
        );
      case 'assinatura':
        return (
          <>
            {renderDonutCard('Documentos em Assinatura', [
              { label: 'Para assinatura', valor: 5, porcentagem: 33, cor: '#f59e0b' },
              { label: 'Em revisão', valor: 4, porcentagem: 27, cor: '#2563eb' },
              { label: 'Atrasados', valor: 3, porcentagem: 20, cor: '#ef4444' },
              { label: 'Concluídos', valor: 3, porcentagem: 20, cor: '#22c55e' }
            ])}
            <article className="relatorios-card relatorios-card--list">
              <div className="relatorios-card__header">
                <span>Fila de assinatura</span>
              </div>
              <div className="relatorios-card__body relatorios-card__body--list">
                {processosRelatorio
                  .filter((processo) => processo.status === 'Para Assinatura')
                  .slice(0, 5)
                  .map((processo) => (
                    <div key={processo.id} className="relatorios-list-item">
                      <div>
                        <strong>{processo.assunto}</strong>
                        <span>{processo.responsavel}</span>
                      </div>
                      <span className="relatorios-list-item__badge">{processo.diasRestantes} dias</span>
                    </div>
                  ))}
              </div>
            </article>
          </>
        );
      case 'visaoGeral':
      default:
        return (
          <>
            {renderDonutCard('Processos por Situação', relatorioDados.situacao)}
            <article className="relatorios-card">
              <div className="relatorios-card__header">
                <span>Processos por Órgão de Origem</span>
              </div>
              <div className="relatorios-card__body relatorios-card__body--bars">
                {relatorioDados.orgaos.map((item) => (
                  <div className="relatorios-bar-column" key={item.label}>
                    <span className="relatorios-bar-column__value">{item.valor}</span>
                    <div className="relatorios-bar-column__track">
                      <div className="relatorios-bar-column__fill" style={{ height: `${item.altura}%`, backgroundColor: item.cor }} />
                    </div>
                    <span className="relatorios-bar-column__label">{item.label}</span>
                  </div>
                ))}
              </div>
            </article>
            {renderDonutCard('Prazos', relatorioDados.prazos)}
          </>
        );
    }
  };

  return (
    <section className="relatorios-page" aria-label="Relatórios">
      <div className="relatorios-header-row">
        <div className="relatorios-title-group">
          <h1>Relatórios</h1>
        </div>

        <div className="relatorios-actions-group">
          <button type="button" className="relatorios-action-button relatorios-action-button--dropdown">
            Exportar
            <ChevronDown size={16} />
          </button>
          <div className="relatorios-filter">
            01/05/2024 - 31/05/2024
          </div>
        </div>
      </div>

      <div className="relatorios-tabs" role="tablist" aria-label="Sub-abas de relatórios">
        {abas.map((aba) => (
          <button
            key={aba.id}
            type="button"
            className={`relatorios-tab ${abaAtiva === aba.id ? 'relatorios-tab--active' : ''}`}
            onClick={() => setAbaAtiva(aba.id)}
            aria-selected={abaAtiva === aba.id}
          >
            {aba.label}
          </button>
        ))}
      </div>

      <div className="relatorios-grid">{renderAbaContent()}</div>
    </section>
  );
};

export default Relatorios;
