import React, { useMemo, useState } from 'react';
import { AlertTriangle, Bell, Clock3 } from 'lucide-react';
import '../styles/Alertas.css';

type TipoAlerta = 'critico' | 'atencao' | 'informativo';

type FiltroAlerta = 'Ver todos' | 'Não lidos' | 'Críticos';

interface AlertaSistema {
  id: string;
  tipo_criticidade: TipoAlerta;
  titulo: string;
  descricao: string;
  data_envio: string;
  id_processo: string;
  lido: boolean;
}

const filtroOpcoes: FiltroAlerta[] = ['Ver todos', 'Não lidos', 'Críticos'];

const iconesPorTipo: Record<TipoAlerta, React.ElementType> = {
  critico: AlertTriangle,
  atencao: Clock3,
  informativo: Bell
};

const classeCorPorTipo: Record<TipoAlerta, string> = {
  critico: 'alertas-card__stripe--critico',
  atencao: 'alertas-card__stripe--atencao',
  informativo: 'alertas-card__stripe--informativo'
};

const alertasMock: AlertaSistema[] = [
  {
    id: 'a1',
    tipo_criticidade: 'critico',
    titulo: 'Prazo estourado pela Área Técnica',
    descricao: 'O processo precisa ser assinado imediatamente para evitar novas multas.',
    data_envio: 'há 10 min',
    id_processo: '0001234/2024-10',
    lido: false
  },
  {
    id: 'a2',
    tipo_criticidade: 'atencao',
    titulo: 'Documento vence hoje',
    descricao: 'A assinatura do despacho decisório é necessária até o final do expediente.',
    data_envio: 'há 1 hora',
    id_processo: '0004321/2024-01',
    lido: false
  },
  {
    id: 'a3',
    tipo_criticidade: 'informativo',
    titulo: 'Sistema atualizado',
    descricao: 'A interface de assinatura digital recebeu melhorias de desempenho.',
    data_envio: 'Ontem',
    id_processo: '0009876/2024-09',
    lido: true
  },
  {
    id: 'a4',
    tipo_criticidade: 'atencao',
    titulo: 'Assinatura pendente de revisão',
    descricao: 'O documento está aguardando validação de conformidade antes da assinatura final.',
    data_envio: 'há 2 dias',
    id_processo: '0005566/2024-04',
    lido: true
  },
  {
    id: 'a5',
    tipo_criticidade: 'critico',
    titulo: 'Processo com prazo expirado',
    descricao: 'O processo encontra-se em situação crítica e precisa de tratamento urgente.',
    data_envio: 'há 3 dias',
    id_processo: '0007788/2024-11',
    lido: false
  }
];

const Alertas: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaSistema[]>(alertasMock);
  const [filtroSelecionado, setFiltroSelecionado] = useState<FiltroAlerta>('Ver todos');

  const alertasFiltrados = useMemo(() => {
    if (filtroSelecionado === 'Ver todos') {
      return alertas;
    }

    if (filtroSelecionado === 'Não lidos') {
      return alertas.filter((alerta) => !alerta.lido);
    }

    return alertas.filter((alerta) => alerta.tipo_criticidade === 'critico');
  }, [alertas, filtroSelecionado]);

  const marcarTodosComoLidos = (): void => {
    setAlertas((current) => current.map((alerta) => ({ ...alerta, lido: true })));
  };

  const IconeTipoAlerta = (tipo: TipoAlerta): React.ElementType => iconesPorTipo[tipo];

  return (
    <section className="alertas-page" aria-label="Alertas">
      <div className="alertas-header-row">
        <h1>Alertas</h1>

        <div className="alertas-actions">
          <button type="button" className="alertas-button alertas-button--secondary" onClick={marcarTodosComoLidos}>
            Marcar todos como lidos
          </button>
          <div className="alertas-filter-group">
            {filtroOpcoes.map((opcao) => (
              <button
                key={opcao}
                type="button"
                className={`alertas-button alertas-button--filter ${filtroSelecionado === opcao ? 'alertas-button--active' : ''}`}
                onClick={() => setFiltroSelecionado(opcao)}
              >
                {opcao}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="alertas-list">
        {alertasFiltrados.map((alerta) => {
          const Icone = IconeTipoAlerta(alerta.tipo_criticidade);
          return (
            <article key={alerta.id} className="alertas-card">
              <div className={`alertas-card__stripe ${classeCorPorTipo[alerta.tipo_criticidade]}`} />
              <div className="alertas-card__content">
                <div className="alertas-card__leading">
                  <div className="alertas-card__icon">
                    <Icone size={18} />
                  </div>
                  <div>
                    <p className="alertas-card__processo">
                      <strong>Processo SEI Nº {alerta.id_processo}</strong>
                    </p>
                    <h2 className="alertas-card__title">{alerta.titulo}</h2>
                    <p className="alertas-card__description">{alerta.descricao}</p>
                  </div>
                </div>
                <div className="alertas-card__meta">
                  <span className="alertas-card__time">{alerta.data_envio}</span>
                  {!alerta.lido && <span className="alertas-card__unread-indicator" />}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Alertas;
