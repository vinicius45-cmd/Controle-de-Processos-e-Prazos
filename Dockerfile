# Estágio 1: Build da aplicação React
FROM node:20-alpine AS build

WORKDIR /app

# Copia arquivos de dependência primeiro para aproveitar o cache de camadas do Docker
COPY package*.json ./

# Instala dependências limpas
RUN npm ci

# Copia todos os fontes do projeto
COPY . .

# Argumentos de Build para injetar variáveis de ambiente no build do Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Executa o build de produção da aplicação
RUN npm run build

# Estágio 2: Servir os arquivos estáticos compilados via Nginx
FROM nginx:1.25-alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração otimizada do Nginx com suporte a SPA Routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados do estágio anterior para a pasta do servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
