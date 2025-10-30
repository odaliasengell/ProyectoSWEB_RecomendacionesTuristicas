/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PYTHON_API_URL: string;
  readonly VITE_GOLANG_API_URL: string;
  readonly VITE_TYPESCRIPT_API_URL: string;
  readonly VITE_GRAPHQL_API_URL: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
