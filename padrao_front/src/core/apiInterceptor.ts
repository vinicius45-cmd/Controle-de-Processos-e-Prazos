import { api } from '../config/api';

/**
 * Registra cabeçalhos e configurações dinâmicas de segurança
 * que devem ser enviadas com cada requisição para as APIs da SEMOB.
 */
export const setupApiInterceptors = (
  tokenProvider: () => string | null,
  userIdProvider: () => string | null
) => {
  // Request Interceptor
  api.interceptors.request.use(
    (config) => {
      const token = tokenProvider();
      const userId = userIdProvider();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (userId && config.headers) {
        config.headers['x-user-id'] = userId;
      }

      // Audit logs
      console.log(`[HTTP Request] ${config.method?.toUpperCase()} -> ${config.url}`);
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  api.interceptors.response.use(
    (response) => {
      // Se a resposta for HTML (comum em servidores SPA de dev quando o endpoint não existe)
      const contentType = response.headers?.['content-type'];
      if (
        (contentType && String(contentType).includes('text/html')) ||
        (typeof response.data === 'string' && response.data.trim().startsWith('<!'))
      ) {
        console.warn('[HTTP Response] Detectada resposta HTML SPA no interceptor. Tratando como erro de endpoint offline.');
        return Promise.reject(new Error('Fallback HTML detectado em vez de JSON da API'));
      }
      return response;
    },
    (error) => {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        console.warn('[HTTP Response] Sessão inválida ou expirada. Disparando evento de expiração...');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
      
      const apiError = error.response?.data?.message || 
                       error.response?.data?.erro || 
                       "Erro interno na comunicação com a SEMOB";
      
      console.error('[API Error]:', apiError);
      return Promise.reject(new Error(apiError));
    }
  );
};
export default setupApiInterceptors;
