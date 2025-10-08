import dotenv from 'dotenv';
dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'midb',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
  },
  services: {
    pythonApi: process.env.PYTHON_API_URL || 'http://localhost:5000',
    golangApi: process.env.GOLANG_API_URL || 'http://localhost:8080',
    graphqlApi: process.env.GRAPHQL_API_URL || 'http://localhost:4000',
    websocketUrl: process.env.WEBSOCKET_URL || 'http://localhost:8081',
  },
};
