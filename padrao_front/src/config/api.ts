import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Intercepta e formata com base no padrão SISMOB Backend
    const apiError = error.response?.data?.message || "Erro interno na comunicação com a SEMOB";
    
    // Disparar um Toast/Alerta padronizado
    console.error('[API Error]:', apiError);
    
    return Promise.reject(new Error(apiError));
  }
);
