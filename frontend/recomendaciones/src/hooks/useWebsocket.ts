import { useEffect, useRef, useState } from 'react';
import { io as socketIO } from 'socket.io-client';

const WEBSOCKET_URL = (import.meta as any).env.VITE_WEBSOCKET_URL || 'http://localhost:4001';

/**
 * Hook mejorado para conectarse al WebSocket en tiempo real
 */
export function useWebsocket(rooms: string[] = ['admin_panel']) {
  const socketRef = useRef<any>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Crear conexión a WebSocket
    const socket = socketIO(WEBSOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Evento de conexión
    socket.on('connect', () => {
      console.log('✅ Conectado al WebSocket');
      setConnected(true);

      // Unirse a las salas especificadas
      rooms.forEach((room: string) => {
        socket.emit('join_room', room);
        console.log(`📍 Unido a la sala: ${room}`);
      });
    });

    // Evento de desconexión
    socket.on('disconnect', () => {
      console.log('❌ Desconectado del WebSocket');
      setConnected(false);
    });

    // Escuchar cualquier evento
    socket.on('*', (eventData: any) => {
      console.log('📨 Evento recibido:', eventData);
      setMessages((m: any[]) => [
        { ...eventData, timestamp: new Date().toISOString(), id: Date.now() },
        ...m.slice(0, 99)
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [rooms.join(',')]);

  const send = (payload: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('message', payload);
    }
  };

  const emit = (event: string, data: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  };

  return { connected, messages, send, emit, on, socket: socketRef.current };
}

export default useWebsocket;
