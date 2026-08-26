import React, { useState } from 'react';
import { useOperadoras } from '../hooks/useOperadoras';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Popup } from '../components/Popup';
import { ShieldAlert, Plus, Search, Building, Lock } from 'lucide-react';

export const OperadoraList: React.FC = () => {
  const { dados, loading, carregar, cadastrar } = useOperadoras();
  const { temAcesso, temEscrita } = useAuth();
  
  const [filtro, setFiltro] = useState('');
  const [modalCadastroOpen, setModalCadastroOpen] = useState(false);
  const [novaOperadoraNome, setNovaOperadoraNome] = useState('');
  const [errorPopupOpen, setErrorPopupOpen] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);

  // CDP Permission Checks
  const temLeitura = temAcesso('/operadoras', 'LEITURA');
  const temModificacao = temEscrita('/operadoras');

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!temLeitura) {
      setErrorPopupOpen(true);
      return;
    }
    carregar(filtro);
  };

  const handleOpenCadastro = () => {
    if (!temModificacao) {
      setErrorPopupOpen(true);
      return;
    }
    setNovaOperadoraNome('');
    setModalCadastroOpen(true);
  };

  const handleSalvarOperadora = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaOperadoraNome.trim()) return;
    
    const ok = await cadastrar(novaOperadoraNome.trim());
    if (ok) {
      setModalCadastroOpen(false);
      setSuccessPopupOpen(true);
    }
  };

  // If user does not even have read permission for this list view
  if (!temLeitura) {
    return (
      <div style={{ padding: '2rem', background: 'var(--semob-surface)', borderRadius: '0.75rem', border: '1px solid var(--semob-danger)', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 1rem' }}>
          <ShieldAlert size={24} />
        </div>
        <h4 style={{ fontSize: '1rem', color: 'var(--semob-text)', marginBottom: '0.5rem' }}>Visualização Bloqueada pelo CDP</h4>
        <p style={{ color: 'var(--semob-text-muted)', fontSize: '0.82rem', maxWidth: '380px', margin: '0 auto' }}>
          Seu usuário atual não possui a permissão de leitura (<code style={{ color: 'var(--semob-danger)' }}>/operadoras</code>) configurada no Controle de Dados e Perfis.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', background: 'var(--semob-surface)', borderRadius: '1rem', border: '1px solid var(--semob-border)' }}>
      
      {/* Title with CDP Indicators */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--semob-text)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Building size={18} style={{ color: '#2563eb' }} />
          Consulta de Operadoras (API /operadoras)
        </h3>
        
        {/* Permission Badges */}
        <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.65rem', fontWeight: 'bold' }}>
          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            LEITURA: LIBERADA
          </span>
          {temModificacao ? (
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              ESCRITA: LIBERADA
            </span>
          ) : (
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={10} /> ESCRITA: BLOQUEADA
            </span>
          )}
        </div>
      </div>
      
      {/* Search Input Bar & Actions */}
      <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            type="text"
            placeholder="Filtrar por nome de operadora..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.25rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--semob-border)',
              background: 'var(--semob-bg)',
              color: 'var(--semob-text)',
              outline: 'none',
              fontSize: '0.85rem',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--semob-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--semob-border)'}
          />
        </div>
        
        <Button type="submit" loading={loading} variant="secondary" size="sm">
          Filtrar
        </Button>

        <Button
          type="button"
          onClick={handleOpenCadastro}
          variant={temModificacao ? 'primary' : 'outline'}
          size="sm"
          style={{ opacity: temModificacao ? 1 : 0.6 }}
        >
          <Plus size={16} style={{ marginRight: '0.25rem' }} />
          Novo
        </Button>
      </form>

      {/* Grid Results */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid rgba(59, 130, 246, 0.1)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : dados.length === 0 ? (
        <p style={{ color: 'var(--semob-text-muted)', fontSize: '0.82rem', margin: 0, textAlign: 'center', padding: '1rem 0' }}>
          Nenhuma operadora carregada. Clique em Filtrar ou crie uma nova!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {dados.map((op) => (
            <div
              key={op.idOperadora}
              style={{
                padding: '0.6rem 0.85rem',
                background: 'var(--semob-bg)',
                borderRadius: '0.5rem',
                borderLeft: '4px solid var(--semob-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--semob-border)'
              }}
            >
              <span style={{ color: 'var(--semob-text)', fontSize: '0.85rem', fontWeight: 600 }}>{op.nmOperadora}</span>
              <span style={{ color: 'var(--semob-text-muted)', fontSize: '0.75rem' }}>Código: {op.idOperadora}</span>
            </div>
          ))}
        </div>
      )}

      {/* POPUPS DIALOGS */}
      
      {/* 1. Create Modal Popup */}
      <Popup
        isOpen={modalCadastroOpen}
        onClose={() => setModalCadastroOpen(false)}
        title="Cadastrar Nova Operadora"
        variant="info"
        size="sm"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={() => setModalCadastroOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSalvarOperadora}>
              Salvar Operadora
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSalvarOperadora} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Nome da Operadora (Razão Social)</label>
            <input
              type="text"
              placeholder="Ex: Viação São José"
              value={novaOperadoraNome}
              onChange={(e) => setNovaOperadoraNome(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                background: 'var(--semob-bg)',
                border: '1px solid var(--semob-border)',
                borderRadius: '0.5rem',
                color: 'var(--semob-text)',
                outline: 'none',
                fontSize: '0.85rem'
              }}
              autoFocus
              required
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--semob-text-muted)' }}>
            A gravação desta entidade enviará uma chamada POST contendo o token de autorização e o ID do usuário ativo ao backend da SEMOB.
          </div>
        </form>
      </Popup>

      {/* 2. Success Feedback Popup */}
      <Popup
        isOpen={successPopupOpen}
        onClose={() => setSuccessPopupOpen(false)}
        title="Operadora Gravada"
        variant="success"
        size="sm"
        actions={
          <Button variant="primary" size="sm" onClick={() => setSuccessPopupOpen(false)}>
            Ok, Excelente!
          </Button>
        }
      >
        <div>
          A nova operadora foi registrada com sucesso no cache local da aplicação. 
          O grid de dados foi atualizado automaticamente.
        </div>
      </Popup>

      {/* 3. Error Access Denied Popup */}
      <Popup
        isOpen={errorPopupOpen}
        onClose={() => setErrorPopupOpen(false)}
        title="Ação Bloqueada pelo CDP"
        variant="danger"
        size="sm"
        actions={
          <Button variant="danger" size="sm" onClick={() => setErrorPopupOpen(false)}>
            Fechar Alerta
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            Você não possui privilégios de **Escrita (ESCRITA)** para o endpoint de cadastro de operadoras.
          </p>
          <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.25rem', borderLeft: '3px solid #ef4444', fontSize: '0.75rem', color: 'var(--semob-danger)' }}>
            <strong>Recurso:</strong> POST /operadoras <br />
            <strong>Ação Requerida:</strong> ESCRITA <br />
            <strong>Seu Nível Atual:</strong> LEITURA ou INEXISTENTE
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--semob-text-muted)' }}>
            Use o Painel Simulador CDP na aba do console de desenvolvedor para conceder permissão de escrita e testar este comportamento!
          </p>
        </div>
      </Popup>
    </div>
  );
};
export default OperadoraList;
