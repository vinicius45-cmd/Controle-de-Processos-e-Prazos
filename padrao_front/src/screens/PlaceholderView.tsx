import React from 'react';
import { PlaceholderViewProps } from '../types';

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ name, description }) => {
  return (
    <div style={{ padding: '2rem', background: 'var(--semob-surface)', borderRadius: '1rem', border: '1px solid var(--semob-border)' }}>
      <h2 style={{ fontSize: '1.75rem', color: 'var(--semob-primary)', marginBottom: '0.5rem' }}>{name}</h2>
      <p style={{ color: 'var(--semob-text-muted)', marginBottom: '1.5rem' }}>{description}</p>
      <div style={{ padding: '1rem', background: 'var(--semob-bg)', borderLeft: '4px solid var(--semob-danger)', color: 'var(--semob-danger)', borderRadius: '0.5rem' }}>
        Este é um módulo demonstrativo integrado ao CDP. As permissões e menus estão sendo filtrados em tempo de execução.
      </div>
    </div>
  );
};

// HOC factory to create loaded placeholder views with pre-filled props without needing JSX in modules.ts
export const withProps = (name: string, description: string) => {
  const Component: React.FC = () => <PlaceholderView name={name} description={description} />;
  Component.displayName = `PlaceholderView(${name})`;
  return Component;
};

export default PlaceholderView;
