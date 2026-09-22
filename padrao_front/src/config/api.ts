import axios from 'axios';

export const isMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';
const cdpBaseURL = import.meta.env.DEV
  ? '/cdp'
  : (import.meta.env.VITE_CDP_API_URL || 'https://dev-sismob.semob.df.gov.br');

const criarCliente = (baseURL: string) => {
  const client = axios.create({ baseURL, timeout: 10000 });

  client.interceptors.request.use((config) => {
    if (isMockApi) {
      throw new Error('API mock habilitada');
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  return client;
};

export const api = criarCliente(import.meta.env.VITE_API_URL);
export const cdpApi = criarCliente(cdpBaseURL);

