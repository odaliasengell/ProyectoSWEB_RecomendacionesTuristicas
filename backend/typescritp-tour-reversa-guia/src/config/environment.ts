import dotenv from 'dotenv';
dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/modulo_typescript',
    // Campos deprecados mantenidos por compatibilidad
    database: process.env.DB_DATABASE || 'modulo_typescript',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '27017'),
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
  },
  services: {
    pythonApi: process.env.PYTHON_API_URL || 'http://localhost:8000',
    golangApi: process.env.GOLANG_API_URL || 'http://localhost:8080',
    graphqlApi: process.env.GRAPHQL_API_URL || 'http://localhost:4000',
    websocketUrl: process.env.WEBSOCKET_URL || 'http://localhost:8081',
  },
};
