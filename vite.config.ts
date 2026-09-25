import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redireciona chamadas locais para o backend homologado da SEMOB
      '/api-semob': {
        target: 'https://dev-sismob.semob.df.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-semob/, '/api')
      },
      
    }
  }
});
