// Implementación mínima de cliente WebSocket (browser)
const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8080';

export function createWebSocket(path = '/') {
  const url = WS_URL.endsWith('/') ? WS_URL.slice(0, -1) + path : WS_URL + path;
  const ws = new WebSocket(url);
  return ws;
}

export default createWebSocket;
