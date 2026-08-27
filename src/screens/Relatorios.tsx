import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import '../styles/Relatorios.css';

type RelatorioSubAba =
  | 'visaoGeral'
  | 'atrasados'
  | 'prazos'
  | 'porOrgao'
  | 'porResponsavel'
  | 'assinatura';

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

const processosPorSituacao: MetricaGrafico[] = [
  { label: 'Em andamento', valor: 880, porcentagem: 71, cor: '#2563eb' },
  { label: 'Atrasados', valor: 32, porcentagem: 3, cor: '#ef4444' },
  { label: 'Para assinatura', valor: 27, porcentagem: 2, cor: '#f59e0b' },
  { label: 'Finalizados', valor: 245, porcentagem: 20, cor: '#22c55e' },
  { label: 'Especiais', valor: 11, porcentagem: 1, cor: '#8b5cf6' }
];

const processosPorOrgao: BarraGrafico[] = [
  { label: 'Saúde', valor: 320, altura: 100, cor: '#2563eb' },
  { label: 'Educação', valor: 280, altura: 88, cor: '#3b82f6' },
  { label: 'Obras', valor: 210, altura: 66, cor: '#60a5fa' },
  { label: 'Finanças', valor: 180, altura: 56, cor: '#93c5fd' },
  { label: 'Administração', valor: 150, altura: 47, cor: '#a5b4fc' },
  { label: 'Outros', valor: 108, altura: 34, cor: '#c7d2fe' }
];

const prazos: MetricaGrafico[] = [
  { label: 'Vencidos', valor: 32, porcentagem: 3, cor: '#ef4444' },
  { label: 'Vence hoje', valor: 15, porcentagem: 1, cor: '#f97316' },
  { label: 'Próx. 5 dias', valor: 48, porcentagem: 4, cor: '#22c55e' },
  { label: 'Após 5 dias', valor: 1153, porcentagem: 92, cor: '#2563eb' }
];

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

const Relatorios: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<RelatorioSubAba>('visaoGeral');

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

      <div className="relatorios-grid">
        <article className="relatorios-card">
          <div className="relatorios-card__header">
            <span>Processos por Situação</span>
          </div>
          <div className="relatorios-card__body relatorios-card--row">
            <div className="relatorios-donut">
              <div className="relatorios-donut__pie" style={{ background: getDonutGradient(processosPorSituacao) }} />
              <div className="relatorios-donut__center">1.248</div>
            </div>
            <div className="relatorios-legend">
              {processosPorSituacao.map((item) => (
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
          <div className="relatorios-card__footer">Total: 1.248</div>
        </article>

        <article className="relatorios-card">
          <div className="relatorios-card__header">
            <span>Processos por Órgão de Origem</span>
          </div>
          <div className="relatorios-card__body relatorios-card__body--bars">
            {processosPorOrgao.map((item) => (
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

        <article className="relatorios-card">
          <div className="relatorios-card__header">
            <span>Prazos</span>
          </div>
          <div className="relatorios-card__body relatorios-card--row">
            <div className="relatorios-donut">
              <div className="relatorios-donut__pie" style={{ background: getDonutGradient(prazos) }} />
              <div className="relatorios-donut__center">1.248</div>
            </div>
            <div className="relatorios-legend">
              {prazos.map((item) => (
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
          <div className="relatorios-card__footer">Total: 1.248</div>
        </article>
      </div>
    </section>
  );
};

export default Relatorios;
