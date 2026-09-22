const baseUrl = process.env.GEPROC_BASE_URL || 'https://dev-sismob.semob.df.gov.br/geproc/api';
const token = process.env.GEPROC_TOKEN;
const email = process.env.GEPROC_EMAIL;
const password = process.env.GEPROC_PASSWORD;
const processId = process.env.GEPROC_PROCESS_ID;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const text = await response.text();
  let body = text;
  try { body = text ? JSON.parse(text) : null; } catch {}
  return { status: response.status, body };
};

const ensureOk = (name, result) => {
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`${name}: HTTP ${result.status} - ${typeof result.body === 'string' ? result.body : JSON.stringify(result.body)}`);
  }
  const count = Array.isArray(result.body) ? ` (${result.body.length} registros)` : '';
  console.log(`OK ${name}: HTTP ${result.status}${count}`);
};

const run = async () => {
  let accessToken = token;
  if (!accessToken && email && password) {
    const login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    ensureOk('POST /auth/login', login);
    accessToken = login.body?.token;
    if (!accessToken) throw new Error('Login respondeu sem token.');
  }

  if (!accessToken) {
    throw new Error('Defina GEPROC_TOKEN ou GEPROC_EMAIL e GEPROC_PASSWORD para executar o teste autenticado.');
  }

  const originalToken = token;
  process.env.GEPROC_TOKEN = accessToken;
  const domainPaths = [
    '/dom-entes',
    '/dom-tipo-assunto',
    '/dom-tipo-documento',
    '/dom-tipo-situacao-processo',
    '/dom-tipo-situacao-distribuicao',
    '/unidades',
    '/unidades/ativas'
  ];

  for (const path of domainPaths) {
    const result = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` }
    }).then(async (response) => ({ status: response.status, body: await response.text() }));
    if (result.status < 200 || result.status >= 300) throw new Error(`GET ${path}: HTTP ${result.status} - ${result.body}`);
    console.log(`OK GET ${path}: HTTP ${result.status}`);
  }

  if (processId) {
    const process = await fetch(`${baseUrl}/processos/${processId}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` } });
    if (!process.ok) throw new Error(`GET /processos/${processId}: HTTP ${process.status}`);
    console.log(`OK GET /processos/${processId}: HTTP ${process.status}`);
    const situations = await fetch(`${baseUrl}/processos-situacoes/processo/${processId}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` } });
    if (!situations.ok) throw new Error(`GET /processos-situacoes/processo/${processId}: HTTP ${situations.status}`);
    console.log(`OK GET /processos-situacoes/processo/${processId}: HTTP ${situations.status}`);
  }

  if (originalToken) process.env.GEPROC_TOKEN = originalToken;
  console.log('Integração Geproc concluída.');
};

run().catch((error) => {
  console.error(`FALHA: ${error.message}`);
  process.exitCode = 1;
});
