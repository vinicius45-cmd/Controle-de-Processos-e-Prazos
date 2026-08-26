import React from 'react';
import { useValidadores } from '../hooks/useValidadores';

// ATENÇÃO: Verifique no projeto como as permissões são importadas (pode ser um hook como useAuth)
// Abaixo criamos funções fictícias para simular o comportamento exigido pelo desafio
const temLeitura = (recurso: string) => true; // Simula permissão de ver a tela
const temEscrita = (recurso: string) => true; // Simula permissão de clicar no botão

export const ValidadorList: React.FC = () => {
  const { validadores, setValidadores, loading } = useValidadores();

  // Regra 1: Se não tiver permissão de LEITURA, bloqueia a tela inteira
  if (!temLeitura('/validadores')) {
    return (
      <div style={{ padding: '20px', color: 'red', margin: '20px', border: '1px solid red' }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão de leitura para visualizar esta tela.</p>
      </div>
    );
  }

  // Função reativa para mudar o status na tela ao clicar
  const alternarStatus = (id: number) => {
    setValidadores(antigos =>
      antigos.map(v => v.idValidador === id ? { ...v, status: v.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' } : v)
    );
  };

  if (loading) return <p style={{ padding: '20px' }}>Carregando dados dos validadores...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Consulta de Validadores Eletrônicos</h1>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }} border={1}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>ID</th>
            <th>Número de Série</th>
            <th>Prefixo do Ônibus</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {validadores.map(v => (
            <tr key={v.idValidador} style={{ textAlign: 'center' }}>
              <td>{v.idValidador}</td>
              <td>{v.numeroSerie}</td>
              <td>{v.prefixoOnibus}</td>
              <td>{v.status}</td>
              <td>
                {/* Regra 2: O botão só funciona se tiver permissão de ESCRITA */}
                <button 
                  disabled={!temEscrita('/validadores')}
                  onClick={() => alternarStatus(v.idValidador)}
                  style={{ padding: '5px 10px', cursor: temEscrita('/validadores') ? 'pointer' : 'not-allowed' }}
                >
                  Alternar Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ValidadorList; // Export padrão para funcionar com o Lazy Load do passo seguinte