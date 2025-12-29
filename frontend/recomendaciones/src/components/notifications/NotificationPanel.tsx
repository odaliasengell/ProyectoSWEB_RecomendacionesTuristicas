import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './NotificationPanel.css';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface PaymentNotification {
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  item_name: string;
  item_type: 'tour' | 'servicio';
  created_at: string;
}

interface WebSocketMessage {
  type: 'payment_confirmation' | 'reservation_update' | 'partner_notification' | 'system_message';
  data: any;
}

export const NotificationPanel: React.FC = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Conectar WebSocket para recibir notificaciones en tiempo real
  useEffect(() => {
    if (!user || !token) return;

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user, token]);

  // Contar notificaciones no leídas
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const connectWebSocket = () => {
    try {
      // Conectar al WebSocket server (puerto 8080 según la arquitectura)
      const websocket = new WebSocket(`ws://localhost:8080?token=${token}`);
      
      websocket.onopen = () => {
        console.log('🔌 WebSocket conectado para notificaciones');
        setIsConnected(true);
        
        // Enviar mensaje de identificación
        websocket.send(JSON.stringify({
          type: 'auth',
          data: {
            user_id: user.id,
            token: token
          }
        }));
      };

      websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
        }
      };

      websocket.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setIsConnected(false);
        
        // Reconectar después de 5 segundos
        setTimeout(() => {
          if (user && token) {
            connectWebSocket();
          }
        }, 5000);
      };

      websocket.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
        setIsConnected(false);
      };

      setWs(websocket);
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('📨 Mensaje WebSocket recibido:', message);

    switch (message.type) {
      case 'payment_confirmation':
        handlePaymentConfirmation(message.data);
        break;
      
      case 'reservation_update':
        handleReservationUpdate(message.data);
        break;
      
      case 'partner_notification':
        handlePartnerNotification(message.data);
        break;
      
      case 'system_message':
        handleSystemMessage(message.data);
        break;
      
      default:
        console.log('Tipo de mensaje no reconocido:', message.type);
    }
  };

  const handlePaymentConfirmation = (data: PaymentNotification) => {
    const notification: Notification = {
      id: `payment_${data.payment_id}`,
      type: data.status === 'success' ? 'success' : 'error',
      title: data.status === 'success' ? '✅ Pago Confirmado' : '❌ Error en Pago',
      message: data.status === 'success' 
        ? `Tu pago de $${(data.amount / 100).toFixed(2)} por "${data.item_name}" ha sido confirmado.`
        : `Hubo un error procesando tu pago de $${(data.amount / 100).toFixed(2)} por "${data.item_name}".`,
      timestamp: new Date(),
      read: false,
      action: data.status === 'success' ? {
        label: 'Ver detalles',
        onClick: () => {
          window.open(`/dashboard?tab=${data.item_type === 'tour' ? 'reservas' : 'contrataciones'}`, '_blank');
        }
      } : undefined
    };

    addNotification(notification);
  };

  const handleReservationUpdate = (data: any) => {
    const notification: Notification = {
      id: `reservation_${data.id}`,
      type: 'info',
      title: '📅 Actualización de Reserva',
      message: `Tu reserva para "${data.tour_name}" ha sido actualizada.`,
      timestamp: new Date(),
      read: false,
      action: {
        label: 'Ver reserva',
        onClick: () => {
          window.open('/mis-reservas', '_blank');
        }
      }
    };

    addNotification(notification);
  };

  const handlePartnerNotification = (data: any) => {
    const notification: Notification = {
      id: `partner_${data.id}`,
      type: 'info',
      title: '🤝 Notificación de Partner',
      message: data.message || 'Has recibido una notificación de un servicio asociado.',
      timestamp: new Date(),
      read: false
    };

    addNotification(notification);
  };

  const handleSystemMessage = (data: any) => {
    const notification: Notification = {
      id: `system_${Date.now()}`,
      type: data.level || 'info',
      title: data.title || '🔔 Mensaje del Sistema',
      message: data.message,
      timestamp: new Date(),
      read: false
    };

    addNotification(notification);
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Mantener máximo 50 notificaciones
    
    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Permiso de notificaciones:', permission);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': 
      default: return 'ℹ️';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-panel">
      {/* Botón de notificaciones */}
      <button
        className={`notification-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificaciones"
      >
        <div className="notification-icon">
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        
        {/* Indicador de conexión */}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
        </div>
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notificaciones</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read" 
                  onClick={markAllAsRead}
                  title="Marcar todo como leído"
                >
                  ✓
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  className="clear-all" 
                  onClick={clearAll}
                  title="Limpiar todo"
                >
                  🗑️
                </button>
              )}
              <button 
                className="close-panel" 
                onClick={() => setIsOpen(false)}
                title="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notifications-icon">🔕</span>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      <span className="notification-type-icon">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <span className="title-text">{notification.title}</span>
                      <span className="notification-time">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    
                    {notification.action && (
                      <div className="notification-action">
                        <button 
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action!.onClick();
                          }}
                        >
                          {notification.action.label}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button
                    className="remove-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    title="Eliminar notificación"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer con información de conexión */}
          <div className="notification-footer">
            <span className={`connection-info ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 En línea' : '🔴 Desconectado'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};