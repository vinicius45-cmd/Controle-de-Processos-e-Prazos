import React, { ComponentType, Suspense } from 'react';

interface ContentAreaProps {
  fallback: React.ReactNode;
  viewComponent: ComponentType<Record<string, never>> | null;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ fallback, viewComponent: ViewComponent }) => {
  return (
    <main className="app-content" id="conteudo-principal">
      <Suspense fallback={fallback}>
        {ViewComponent ? (
          <ViewComponent />
        ) : (
          <section className="app-content__empty">
            <h2>Nenhum módulo selecionado</h2>
            <p>Escolha um item no menu lateral para iniciar a navegação.</p>
          </section>
        )}
      </Suspense>
    </main>
  );
};

export default ContentArea;
