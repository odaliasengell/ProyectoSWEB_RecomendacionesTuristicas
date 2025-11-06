/**
 * Componente que muestra el estado de conexión del WebSocket
 */

import React from 'react';

interface WebSocketStatusProps {
  isConnected: boolean;
  reconnectCount?: number;
  showLabel?: boolean;
  className?: string;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  isConnected,
  reconnectCount = 0,
  showLabel = true,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
        isConnected
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      } ${className}`}
    >
      {/* Indicador visual */}
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        } ${isConnected ? 'animate-pulse' : ''}`}
      />
      
      {/* Texto de estado */}
      {showLabel && (
        <span>
          {isConnected
            ? 'Conectado'
            : reconnectCount > 0
            ? `Reconectando (${reconnectCount})`
            : 'Desconectado'}
        </span>
      )}
    </div>
  );
};

export default WebSocketStatus;
