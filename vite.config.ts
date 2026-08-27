import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redireciona chamadas locais para o backend homologado da SEMOB
      '/api-semob': {
        target: 'https://homologacao.semob.df.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-semob/, '/api')
      },
      // Bypass de CORS para barramentos locais (ex: Spring Boot rodando na máquina)
      '/operadoras': {
        target: 'http://localhost:3333',
        changeOrigin: true
      },
      // Bypass de CORS para o CDP rodando localmente (seu backend)
      '/CDP/api': {
        target: 'http://localhost:3000', // Altere para a porta correta que seu npm run start:dev usar
        changeOrigin: true
      }
    }
  }
});
