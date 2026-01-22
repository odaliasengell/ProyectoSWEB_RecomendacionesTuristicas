/**
 * WebSocketStatus.tsx - Semana 4 (Mejorado)
 * Abigail Plua - Indicador visual del estado de conexión WebSocket
 * Sistema de Recomendaciones Turísticas
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import './WebSocketStatus.css';

interface WebSocketStatusProps {
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  onClick?: () => void;
  className?: string;
}

interface ConnectionStats {
  connectedAt?: Date;
  lastMessageAt?: Date;
  messagesReceived: number;
  reconnectAttempts: number;
  uptime: string;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  showDetails = false,
  position = 'inline',
  onClick,
  className = ''
}) => {
  const { isConnected, lastMessage, messageHistory } = useWebSocket();
  const [stats, setStats] = useState<ConnectionStats>({
    messagesReceived: 0,
    reconnectAttempts: 0,
    uptime: '0s'
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');

  // Actualizar estadísticas
  useEffect(() => {
    if (isConnected) {
      const connectedAt = stats.connectedAt || new Date();
      
      setStats(prev => ({
        ...prev,
        connectedAt,
        messagesReceived: messageHistory.length,
        lastMessageAt: lastMessage ? new Date() : prev.lastMessageAt
      }));

      // Calcular calidad de conexión
      const now = new Date();
      if (lastMessage && stats.lastMessageAt) {
        const timeSinceLastMessage = now.getTime() - stats.lastMessageAt.getTime();
        if (timeSinceLastMessage < 30000) { // 30 segundos
          setConnectionQuality('excellent');
        } else if (timeSinceLastMessage < 60000) { // 1 minuto
          setConnectionQuality('good');
        } else {
          setConnectionQuality('poor');
        }
      } else if (isConnected) {
        setConnectionQuality('good');
      }
    } else {
      setConnectionQuality('disconnected');
      setStats(prev => ({
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + (prev.connectedAt ? 1 : 0),
        connectedAt: undefined
      }));
    }
  }, [isConnected, lastMessage, messageHistory.length]);

  // Actualizar uptime cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      if (stats.connectedAt && isConnected) {
        const now = new Date();
        const diff = now.getTime() - stats.connectedAt.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        let uptime = '';
        if (hours > 0) {
          uptime = `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
          uptime = `${minutes}m ${seconds % 60}s`;
        } else {
          uptime = `${seconds}s`;
        }
        
        setStats(prev => ({ ...prev, uptime }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.connectedAt, isConnected]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showDetails) {
      setIsExpanded(!isExpanded);
    }
  };

  const getStatusIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'poor': return '🟠';
      case 'disconnected': return '🔴';
      default: return '⚫';
    }
  };

  const getStatusText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'poor': return 'Conexión Lenta';
      case 'disconnected': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  const formatLastMessage = () => {
    if (!stats.lastMessageAt) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - stats.lastMessageAt.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div 
      className={`websocket-status ${position} ${connectionQuality} ${isExpanded ? 'expanded' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* Indicador principal */}
      <div className="status-indicator">
        <div className="status-dot">
          <span className="status-icon">{getStatusIcon()}</span>
          <div className={`pulse-ring ${isConnected ? 'active' : ''}`} />
        </div>
        
        <span className="status-label">
          {position === 'inline' ? `WebSocket: ${getStatusText()}` : getStatusText()}
        </span>
      </div>

      {/* Panel de detalles */}
      {showDetails && (isExpanded || position === 'inline') && (
        <div className="status-details">
          <div className="details-header">
            <h4>Estado WebSocket</h4>
            <span className={`quality-badge ${connectionQuality}`}>
              {getStatusText()}
            </span>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Estado:</span>
              <span className={`detail-value ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '✅ Conectado' : '❌ Desconectado'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Tiempo:</span>
              <span className="detail-value">{stats.uptime}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Mensajes:</span>
              <span className="detail-value">{stats.messagesReceived}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Último:</span>
              <span className="detail-value">{formatLastMessage()}</span>
            </div>

            {stats.reconnectAttempts > 0 && (
              <div className="detail-item">
                <span className="detail-label">Reconexiones:</span>
                <span className="detail-value">{stats.reconnectAttempts}</span>
              </div>
            )}
          </div>

          {/* Últimos mensajes */}
          {messageHistory.length > 0 && (
            <div className="recent-messages">
              <h5>Últimos mensajes:</h5>
              <div className="messages-list">
                {messageHistory.slice(-3).map((msg, index) => (
                  <div key={index} className="message-item">
                    <span className="message-type">{msg.type}</span>
                    <span className="message-time">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="status-actions">
            <button 
              className="action-button diagnostics"
              onClick={(e) => {
                e.stopPropagation();
                console.log('📊 [WebSocket Diagnostics]', {
                  isConnected,
                  connectionQuality,
                  stats,
                  messageHistory: messageHistory.slice(-5),
                  lastMessage
                });
              }}
            >
              🔍 Diagnóstico
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;
