import { useEffect, useRef, useState } from 'react';
import createWebSocket from '../services/websocket/socket';

export function useWebsocket(path = '/') {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const ws = createWebSocket(path);
    wsRef.current = ws;

    ws.addEventListener('open', () => setConnected(true));
    ws.addEventListener('close', () => setConnected(false));
    ws.addEventListener('message', (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        setMessages((m: any[]) => [...m, data]);
      } catch (e) {
        setMessages((m: any[]) => [...m, ev.data]);
      }
    });

    return () => {
      try {
        ws.close();
      } catch (e) {
        // ignore
      }
    };
  }, [path]);

  const send = (payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
    }
  };

  return { connected, messages, send };
}

export default useWebsocket;
