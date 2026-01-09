/**
 * Hook personalizado para WebSocket - Semana 3
 * Abigail Plua - Integración con grupo partner (Reservas ULEAM 2025)
 * Reutilizable en ChatBot y NotificationPanel
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { webSocketService, WebSocketMessage } from '../services/websocket.service';
import { useAuth } from '../contexts/AuthContext';

export interface WebSocketNotification {
  amount: number;
  type: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  subscribeToAll?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const handlersRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());

  // Función para conectar
  const connect = useCallback(async () => {
    if (!user || !token) {
      console.warn('🚨 [useWebSocket] No hay usuario o token para conectar');
      return;
    }

    setConnectionStatus('connecting');

    try {
      await webSocketService.connect(user.id);
      setIsConnected(true);
      setConnectionStatus('connected');
      options.onConnect?.();
    } catch (error) {
      console.error('🚨 [useWebSocket] Error conectando:', error);
      setConnectionStatus('error');
    }
  }, [user, token, options.onConnect]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    options.onDisconnect?.();
  }, [options.onDisconnect]);

  // Handler universal de mensajes
  const messageHandler = useCallback((message: WebSocketMessage) => {
    console.log('📨 [ChatBot] Mensaje recibido:', message);
    
    setLastMessage(message);
    setMessageHistory(prev => [...prev.slice(-49), message]); // Mantener últimos 50 mensajes

    // Convertir WebSocketMessage a WebSocketNotification para backward compatibility
    const notification: WebSocketNotification = {
      type: message.type,
      message: message.data?.message || getMessageText(message),
      amount: message.data?.amount || 0,
      data: message.data,
      timestamp: message.timestamp || new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Máximo 100

    // Ejecutar callback personalizado
    options.onMessage?.(message);

    // Ejecutar todos los handlers registrados
    handlersRef.current.forEach(handler => handler(message));
  }, [options.onMessage]);

  // Helper para generar mensaje de texto basado en tipo
  const getMessageText = (message: WebSocketMessage): string => {
    switch (message.type) {
      case 'payment_confirmation':
        return `✅ Pago confirmado por ${message.data?.amount || 0} ${message.data?.currency || 'USD'}`;
      case 'tour_purchased':
        return `🎯 Tour adquirido: ${message.data?.tour_name || 'Sin nombre'}`;
      case 'reserva_confirmada':
        return `🏨 Reserva confirmada por el grupo partner`;
      case 'partner_notification':
        return `🤝 Notificación del partner: ${message.data?.event_type || 'evento'}`;
      default:
        return `📨 ${message.type} recibido`;
    }
  };

  // Configurar WebSocket token
  useEffect(() => {
    if (token) {
      webSocketService['token'] = token;
    }
  }, [token]);

  // Auto conectar si está habilitado
  useEffect(() => {
    if (options.autoConnect && user && token && !isConnected) {
      connect();
    }

    return () => {
      if (options.autoConnect) {
        disconnect();
      }
    };
  }, [options.autoConnect, user, token, connect, disconnect, isConnected]);

  // Suscribirse a mensajes
  useEffect(() => {
    if (options.subscribeToAll) {
      webSocketService.subscribe('*', messageHandler);
    }

    return () => {
      if (options.subscribeToAll) {
        webSocketService.unsubscribe('*', messageHandler);
      }
    };
  }, [messageHandler, options.subscribeToAll]);

  // Verificar estado de conexión periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = webSocketService.isConnected();
      if (connected !== isConnected) {
        setIsConnected(connected);
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Función para enviar mensajes
  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    return webSocketService.sendMessage(message as WebSocketMessage);
  }, []);

  // Función para suscribirse a tipos específicos de mensajes
  const subscribe = useCallback((messageType: string, handler: (message: WebSocketMessage) => void) => {
    webSocketService.subscribe(messageType, handler);
    handlersRef.current.add(handler);

    return () => {
      webSocketService.unsubscribe(messageType, handler);
      handlersRef.current.delete(handler);
    };
  }, []);

  // Filtrar mensajes por tipo
  const getMessagesByType = useCallback((type: string) => {
    return messageHistory.filter(msg => msg.type === type);
  }, [messageHistory]);

  // Obtener último mensaje de un tipo específico
  const getLastMessageByType = useCallback((type: string) => {
    const filtered = messageHistory.filter(msg => msg.type === type);
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }, [messageHistory]);

  // Función para limpiar notificaciones (backward compatibility)
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setMessageHistory([]);
  }, []);

  return {
    // Estado
    isConnected,
    connectionStatus,
    lastMessage,
    messageHistory,
    notifications, // Para backward compatibility
    reconnectCount: 0, // Para backward compatibility
    
    // Acciones
    connect,
    disconnect,
    sendMessage,
    subscribe,
    clearNotifications,
    
    // Helpers
    getMessagesByType,
    getLastMessageByType,
    
    // Métodos específicos para el negocio
    sendTourPurchased: webSocketService.sendTourPurchased.bind(webSocketService),
    sendPaymentConfirmation: webSocketService.sendPaymentConfirmation.bind(webSocketService),
  };
};

export default useWebSocket;
