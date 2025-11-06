/**
 * Componente para mostrar notificaciones en tiempo real
 * recibidas desde el servidor WebSocket
 */

import React from 'react';
import { WebSocketNotification } from '../../hooks/useWebSocket';

interface NotificationItemProps {
  notification: WebSocketNotification;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      usuario_registrado: '👤',
      usuario_inicio_sesion: '🔐',
      reserva_creada: '🎫',
      servicio_contratado: '🛎️',
      recomendacion_creada: '⭐',
      tour_creado: '🗺️',
      servicio_creado: '🎨',
      destino_creado: '📍',
      guia_creado: '👨‍🏫',
    };
    return icons[type] || '🔔';
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded shadow-sm mb-3 animate-fade-in">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-2xl">{getIcon(notification.type)}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">
              {getTypeLabel(notification.type)}
            </p>
            <p className="mt-1 text-gray-700">{notification.message}</p>
            
            {notification.data && Object.keys(notification.data).length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                  Ver detalles
                </summary>
                <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(notification.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end ml-4">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatTime(notification.timestamp)}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-2 text-gray-400 hover:text-gray-600"
              aria-label="Cerrar notificación"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface NotificationPanelProps {
  notifications: WebSocketNotification[];
  onClear?: () => void;
  maxHeight?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClear,
  maxHeight = '400px',
}) => {
  const [hiddenIds, setHiddenIds] = React.useState<Set<number>>(new Set());

  const handleClose = (index: number) => {
    setHiddenIds((prev) => new Set([...prev, index]));
  };

  const visibleNotifications = notifications.filter((_, index) => !hiddenIds.has(index));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="mr-2">🔔</span>
          Notificaciones en Tiempo Real
          {visibleNotifications.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {visibleNotifications.length}
            </span>
          )}
        </h2>
        
        {visibleNotifications.length > 0 && onClear && (
          <button
            onClick={() => {
              onClear();
              setHiddenIds(new Set());
            }}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div
        className="space-y-3 overflow-y-auto"
        style={{ maxHeight }}
      >
        {visibleNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
            <p className="mt-2">No hay notificaciones aún</p>
            <p className="text-sm mt-1">
              Las notificaciones aparecerán aquí en tiempo real
            </p>
          </div>
        ) : (
          visibleNotifications.map((notification, index) => (
            <NotificationItem
              key={`${notification.timestamp}-${index}`}
              notification={notification}
              onClose={() => handleClose(index)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
