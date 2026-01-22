import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { WebSocketMessage } from '../../services/websocket.service';
import { useConfirmation } from '../../hooks/useConfirmation';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { WebSocketStatus } from '../common/WebSocketStatus';
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
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'partner'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
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

  // Hook de confirmaciones - Semana 4
  const {
    currentConfirmation,
    isOpen: isConfirmationOpen,
    showPaymentConfirmation,
    showTourPurchaseConfirmation,
    showPartnerReservationConfirmation,
    showSystemNotification,
    close: closeConfirmation
  } = useConfirmation();

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

  const handlePaymentConfirmation = (data: PaymentNotification) => {
    // Mostrar confirmación modal - Semana 4
    showPaymentConfirmation({
      payment_id: data.payment_id,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: data.status === 'success' ? 'success' : 'failed',
      item_name: data.item_name,
      item_type: data.item_type
    });

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

  // Nuevo handler para tours comprados - Semana 4 mejorado
  const handleTourPurchased = (data: any) => {
    // Mostrar confirmación modal
    showTourPurchaseConfirmation({
      tour_id: data.tour_id,
      tour_name: data.tour_name || 'Tour',
      amount: data.amount || 0,
      user_id: data.user_id || user?.id || 'desconocido',
      partner_notified: data.partner_notified || true
    });

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

  // Nuevo handler para reservas confirmadas del partner - Semana 4 mejorado
  const handleReservaConfirmada = (data: any) => {
    // Mostrar confirmación modal
    showPartnerReservationConfirmation({
      reservation_id: data.reservation_id || 'unknown',
      partner_id: data.partner_id || 'Reservas ULEAM',
      status: data.status || 'confirmado',
      details: data.details || {}
    });

    const notification: Notification = {
      id: `reserva_${data.reservation_id}_${Date.now()}`,
      type: 'info',
      title: '🏨 Reserva Confirmada - Partner',
      message: `¡El grupo ${data.partner_id || 'Reservas ULEAM'} ha confirmado tu reserva! Tu itinerario está completo y listo para disfrutar.`,
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

  // Funciones de filtrado - Semana 4
  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    // Aplicar filtro
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'payment':
        filtered = filtered.filter(n => n.type === 'success' && (n.title.includes('Pago') || n.title.includes('Tour')));
        break;
      case 'partner':
        filtered = filtered.filter(n => n.title.includes('Partner') || n.title.includes('Reserva'));
        break;
      case 'all':
      default:
        // No filtrar
        break;
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      const timeA = a.timestamp.getTime();
      const timeB = b.timestamp.getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  };

  const getFilterCount = (filterType: typeof filter) => {
    switch (filterType) {
      case 'all': return notifications.length;
      case 'unread': return notifications.filter(n => !n.read).length;
      case 'payment': return notifications.filter(n => n.type === 'success' && (n.title.includes('Pago') || n.title.includes('Tour'))).length;
      case 'partner': return notifications.filter(n => n.title.includes('Partner') || n.title.includes('Reserva')).length;
      default: return 0;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <>
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
          
          {/* Indicador de conexión mejorado - Semana 4 */}
          <WebSocketStatus showDetails={false} position="inline" />
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

            {/* Filtros - Semana 4 */}
            <div className="notification-filters">
              <div className="filter-tabs">
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'unread', label: 'No leídas' },
                  { key: 'payment', label: 'Pagos' },
                  { key: 'partner', label: 'Partner' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    className={`filter-tab ${filter === key ? 'active' : ''}`}
                    onClick={() => setFilter(key as typeof filter)}
                  >
                    {label}
                    <span className="filter-count">{getFilterCount(key as typeof filter)}</span>
                  </button>
                ))}
              </div>
              
              <button
                className="sort-toggle"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                title={`Ordenar por ${sortOrder === 'newest' ? 'más antiguos' : 'más recientes'}`}
              >
                {sortOrder === 'newest' ? '↓' : '↑'}
              </button>
            </div>

            {/* Lista de notificaciones */}
            <div className="notifications-list">
              {filteredNotifications.length === 0 ? (
                <div className="no-notifications">
                  <span className="no-notifications-icon">🔕</span>
                  <p>
                    {filter === 'all' 
                      ? 'No tienes notificaciones'
                      : filter === 'unread'
                      ? 'No tienes notificaciones sin leer'
                      : `No tienes notificaciones de ${filter === 'payment' ? 'pagos' : 'partner'}`
                    }
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
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
              <WebSocketStatus showDetails={true} position="inline" />
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de confirmación - Semana 4 */}
      <ConfirmationModal
        confirmation={currentConfirmation}
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
      />
    </>
  );
};