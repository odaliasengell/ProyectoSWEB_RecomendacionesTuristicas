/**
 * Hook personalizado para conectarse al servidor WebSocket
 * y recibir notificaciones en tiempo real
 * 
 * Uso:
 * const { isConnected, notifications } = useWebSocket((data) => {
 *   console.log('Notificación recibida:', data);
 *   toast.info(data.message);
 * });
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const WEBSOCKET_URL = 'ws://localhost:8080/ws';
const RECONNECT_DELAY = 3000; // 3 segundos
const MAX_RECONNECT_ATTEMPTS = 10;

export interface WebSocketNotification {
  type: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (
  onMessage?: (data: WebSocketNotification) => void,
  options: UseWebSocketOptions = {}
) => {
  const {
    autoConnect = true,
    onOpen,
    onClose,
    onError,
    maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const shouldReconnect = useRef(true);

  const connect = useCallback(() => {
    if (reconnectCount >= maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
      return;
    }

    try {
      console.log('🔄 Conectando al WebSocket...');
      ws.current = new WebSocket(WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        setReconnectCount(0);
        if (onOpen) onOpen();
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketNotification = JSON.parse(event.data);
          console.log('📨 Notificación recibida:', data);
          
          // Agregar a la lista de notificaciones
          setNotifications((prev) => [data, ...prev].slice(0, 100)); // Máximo 100
          
          // Llamar callback del usuario
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('❌ Error al parsear mensaje WebSocket:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
        if (onError) onError(error);
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setIsConnected(false);
        if (onClose) onClose();
        
        // Intentar reconectar si está habilitado
        if (shouldReconnect.current && reconnectCount < maxReconnectAttempts) {
          reconnectTimeout.current = setTimeout(() => {
            console.log(`🔄 Intentando reconectar... (intento ${reconnectCount + 1}/${maxReconnectAttempts})`);
            setReconnectCount((prev) => prev + 1);
            connect();
          }, RECONNECT_DELAY);
        }
      };
    } catch (error) {
      console.error('❌ Error al crear conexión WebSocket:', error);
    }
  }, [reconnectCount, maxReconnectAttempts, onMessage, onOpen, onClose, onError]);

  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando WebSocket...');
    shouldReconnect.current = false;
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-conectar al montar el componente
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [autoConnect, connect]);

  return {
    isConnected,
    reconnectCount,
    notifications,
    connect,
    disconnect,
    clearNotifications,
  };
};

export default useWebSocket;
