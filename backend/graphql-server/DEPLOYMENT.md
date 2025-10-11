# 🚀 Guía de Despliegue - Servidor GraphQL

## 📦 Preparación para Producción

### 1. Compilar el Proyecto

```bash
cd backend/graphql-server
npm run build
```

Esto generará la carpeta `dist/` con el código JavaScript compilado.

### 2. Configurar Variables de Entorno

Crea un archivo `.env` para producción:

```env
NODE_ENV=production
PORT=4000

# URLs de producción de los microservicios
TYPESCRIPT_API_URL=https://api-typescript.tusitio.com
PYTHON_API_URL=https://api-python.tusitio.com
GOLANG_API_URL=https://api-golang.tusitio.com

# Caché más largo en producción (10 minutos)
CACHE_TTL=600
```

### 3. Instalar Solo Dependencias de Producción

```bash
npm ci --only=production
```

## 🐳 Despliegue con Docker

### Dockerfile

Crea un archivo `Dockerfile` en `backend/graphql-server/`:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar código compilado del stage anterior
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 4000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Comando de inicio
CMD ["node", "dist/server.js"]
```

### docker-compose.yml

Para desplegar junto con los otros microservicios:

```yaml
version: '3.8'

services:
  graphql-server:
    build:
      context: ./backend/graphql-server
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - TYPESCRIPT_API_URL=http://typescript-api:3000
      - PYTHON_API_URL=http://python-api:8000
      - GOLANG_API_URL=http://golang-api:8080
      - CACHE_TTL=600
    depends_on:
      - typescript-api
      - python-api
      - golang-api
    networks:
      - turismo-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000/.well-known/apollo/server-health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  turismo-network:
    driver: bridge
```

### Construir y Ejecutar

```bash
# Construir imagen
docker build -t graphql-server:latest .

# Ejecutar contenedor
docker run -d \
  --name graphql-server \
  -p 4000:4000 \
  -e TYPESCRIPT_API_URL=http://host.docker.internal:3000 \
  -e PYTHON_API_URL=http://host.docker.internal:8000 \
  -e GOLANG_API_URL=http://host.docker.internal:8080 \
  graphql-server:latest

# Ver logs
docker logs -f graphql-server
```

## ☁️ Despliegue en la Nube

### Heroku

1. **Crear Procfile**:
```
web: node dist/server.js
```

2. **Configurar buildpack**:
```bash
heroku buildpacks:set heroku/nodejs
```

3. **Configurar variables de entorno**:
```bash
heroku config:set NODE_ENV=production
heroku config:set TYPESCRIPT_API_URL=https://tu-api-typescript.herokuapp.com
heroku config:set PYTHON_API_URL=https://tu-api-python.herokuapp.com
heroku config:set GOLANG_API_URL=https://tu-api-golang.herokuapp.com
```

4. **Desplegar**:
```bash
git push heroku main
```

### AWS (Elastic Beanstalk)

1. **Instalar EB CLI**:
```bash
pip install awsebcli
```

2. **Inicializar aplicación**:
```bash
eb init -p node.js graphql-server
```

3. **Crear entorno**:
```bash
eb create graphql-production
```

4. **Configurar variables**:
```bash
eb setenv NODE_ENV=production \
  TYPESCRIPT_API_URL=https://... \
  PYTHON_API_URL=https://... \
  GOLANG_API_URL=https://...
```

5. **Desplegar**:
```bash
eb deploy
```

### Google Cloud Platform (Cloud Run)

1. **Construir imagen**:
```bash
gcloud builds submit --tag gcr.io/[PROJECT-ID]/graphql-server
```

2. **Desplegar**:
```bash
gcloud run deploy graphql-server \
  --image gcr.io/[PROJECT-ID]/graphql-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars TYPESCRIPT_API_URL=https://...,PYTHON_API_URL=https://...,GOLANG_API_URL=https://...
```

### Azure (Container Instances)

1. **Login**:
```bash
az login
```

2. **Crear container registry**:
```bash
az acr create --resource-group myResourceGroup \
  --name graphqlregistry --sku Basic
```

3. **Construir y pushear**:
```bash
az acr build --registry graphqlregistry \
  --image graphql-server:latest .
```

4. **Desplegar**:
```bash
az container create --resource-group myResourceGroup \
  --name graphql-server \
  --image graphqlregistry.azurecr.io/graphql-server:latest \
  --dns-name-label graphql-turismo \
  --ports 4000 \
  --environment-variables \
    NODE_ENV=production \
    TYPESCRIPT_API_URL=https://... \
    PYTHON_API_URL=https://... \
    GOLANG_API_URL=https://...
```

## 🔐 Seguridad en Producción

### 1. CORS

Actualiza `server.ts` para configurar CORS:

```typescript
import cors from 'cors';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageDisabled(), // Deshabilitar Apollo Studio en prod
  ],
});

// Configurar CORS
const corsOptions = {
  origin: ['https://tu-frontend.com'],
  credentials: true,
};
```

### 2. Rate Limiting

Instalar y configurar:

```bash
npm install graphql-rate-limit
```

```typescript
import { createRateLimitDirective } from 'graphql-rate-limit';

const rateLimitDirective = createRateLimitDirective({
  identifyContext: (ctx) => ctx.id,
});
```

### 3. Query Complexity

```bash
npm install graphql-query-complexity
```

```typescript
import queryComplexity from 'graphql-query-complexity';

plugins: [
  {
    requestDidStart: () => ({
      didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          query: document,
          variables: request.variables,
        });
        if (complexity > 1000) {
          throw new Error(`Query too complex: ${complexity}`);
        }
      },
    }),
  },
];
```

### 4. Autenticación

```typescript
context: async ({ req }) => {
  const token = req.headers.authorization || '';
  const user = await validateToken(token);
  return { user, dataSources };
},
```

## 📊 Monitoreo

### Apollo Studio

1. Crear cuenta en [Apollo Studio](https://studio.apollographql.com)
2. Obtener API Key
3. Configurar en el servidor:

```typescript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginUsageReporting({
      sendVariableValues: { all: true },
    }),
  ],
});

process.env.APOLLO_KEY = 'tu-apollo-key';
process.env.APOLLO_GRAPH_REF = 'tu-graph@production';
```

### Logging con Winston

```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}
```

## 🔄 CI/CD

### GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy GraphQL Server

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/graphql-server/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      working-directory: backend/graphql-server
      run: npm ci
    
    - name: Run tests
      working-directory: backend/graphql-server
      run: npm test
    
    - name: Build
      working-directory: backend/graphql-server
      run: npm run build
    
    - name: Deploy to production
      run: |
        # Tu script de despliegue aquí
```

## 📈 Escalabilidad

### Redis como Caché Distribuido

Para múltiples instancias del servidor:

```bash
npm install redis
```

```typescript
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

await redisClient.connect();
```

### Load Balancer

Configurar Nginx como load balancer:

```nginx
upstream graphql_backend {
    server graphql1:4000;
    server graphql2:4000;
    server graphql3:4000;
}

server {
    listen 80;
    server_name graphql.tusitio.com;

    location / {
        proxy_pass http://graphql_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ✅ Checklist de Despliegue

- [ ] Compilar código TypeScript
- [ ] Configurar variables de entorno de producción
- [ ] Deshabilitar Apollo Studio en producción
- [ ] Configurar CORS con dominios específicos
- [ ] Implementar rate limiting
- [ ] Configurar query complexity limits
- [ ] Implementar autenticación si es necesario
- [ ] Configurar logging apropiado
- [ ] Setup de monitoreo (Apollo Studio, etc.)
- [ ] Configurar health checks
- [ ] Probar en staging antes de producción
- [ ] Documentar proceso de rollback
- [ ] Configurar backups si aplica
- [ ] SSL/TLS configurado
- [ ] Secrets en variables de entorno, no en código

---

**¡Tu servidor GraphQL está listo para producción! 🚀**
