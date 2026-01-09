import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { WebSocketMessage } from '../../services/websocket.service';
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

export const NotificationPanel: React.FC = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // WebSocket usando nuestro hook personalizado - Semana 3
  const { 
    isConnected, 
    lastMessage,
    subscribe 
  } = useWebSocket({ 
    autoConnect: true, 
    subscribeToAll: true,
    onMessage: handleWebSocketMessage 
  });

  // Contar notificaciones no leídas
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Handler para mensajes WebSocket - Semana 3 mejorado
  function handleWebSocketMessage(message: WebSocketMessage) {
    console.log('📨 [NotificationPanel] Mensaje recibido:', message);

    switch (message.type) {
      case 'payment_confirmation':
        handlePaymentConfirmation(message.data);
        break;
      
      case 'tour_purchased':
        handleTourPurchased(message.data);
        break;
      
      case 'reserva_confirmada':
        handleReservaConfirmada(message.data);
        break;
      
      case 'partner_notification':
        handlePartnerNotification(message.data);
        break;
      
      case 'reservation_update':
        handleReservationUpdate(message.data);
        break;
      
      case 'system_message':
        handleSystemMessage(message.data);
        break;
      
      default:
        console.log('Tipo de mensaje no reconocido:', message.type);
    }
  }

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

    setNotifications(prev => [notification, ...prev]);
  };

  // Nuevo handler para tours comprados - Semana 3
  const handleTourPurchased = (data: any) => {
    const notification: Notification = {
      id: `tour_${data.tour_id}_${Date.now()}`,
      type: 'success',
      title: '🎯 Tour Adquirido',
      message: `¡Has adquirido "${data.tour_name || 'Tour'}" por $${data.amount || 0}! Se ha notificado al grupo partner para completar tu experiencia.`,
      timestamp: new Date(),
      read: false,
      action: {
        label: 'Ver reservas',
        onClick: () => {
          window.open('/dashboard?tab=reservas', '_blank');
        }
      }
    };

    setNotifications(prev => [notification, ...prev]);
  };

  // Nuevo handler para reservas confirmadas del partner - Semana 3
  const handleReservaConfirmada = (data: any) => {
    const notification: Notification = {
      id: `reserva_${data.reservation_id}_${Date.now()}`,
      type: 'info',
      title: '🏨 Reserva Confirmada - Partner',
      message: `¡El grupo Reservas ULEAM ha confirmado tu reserva! Tu itinerario está completo y listo para disfrutar.`,
      timestamp: new Date(),
      read: false,
      action: {
        label: 'Ver itinerario',
        onClick: () => {
          window.open(`/dashboard?tab=reservas&id=${data.reservation_id}`, '_blank');
        }
      }
    };

    setNotifications(prev => [notification, ...prev]);
  };

  const handlePartnerNotification = (data: any) => {
    const notification: Notification = {
      id: `partner_${Date.now()}`,
      type: 'info',
      title: '🤝 Actualización del Partner',
      message: data.message || `Actualización de ${data.partner_name || 'nuestro socio comercial'}: ${data.event_type || 'evento'}`,
      timestamp: new Date(),
      read: false,
      action: data.action_url ? {
        label: 'Ver detalles',
        onClick: () => {
          window.open(data.action_url, '_blank');
        }
      } : undefined
    };

    setNotifications(prev => [notification, ...prev]);
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

    setNotifications(prev => [notification, ...prev]);
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

    setNotifications(prev => [notification, ...prev]);
  };

  // Helper para agregar notificaciones con notificación del navegador
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