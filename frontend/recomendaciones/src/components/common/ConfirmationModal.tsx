/**
 * ConfirmationModal.tsx - Semana 4
 * Abigail Plua - Modal reutilizable para confirmaciones
 * Sistema de Recomendaciones Turísticas
 */

import React, { useEffect, useState } from 'react';
import './ConfirmationModal.css';

export interface ConfirmationData {
  id: string;
  type: 'payment' | 'tour' | 'reservation' | 'partner' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: Date;
  autoClose?: number; // segundos para auto-cerrar
  actions?: ConfirmationAction[];
}

export interface ConfirmationAction {
  label: string;
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  onClick: () => void | Promise<void>;
  loading?: boolean;
}

interface ConfirmationModalProps {
  confirmation: ConfirmationData | null;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (action: ConfirmationAction) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  confirmation,
  isOpen,
  onClose,
  onAction
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Animación de entrada/salida
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // Duración de animación
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-close timer
  useEffect(() => {
    if (isOpen && confirmation?.autoClose) {
      setTimeLeft(confirmation.autoClose);
      
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            onClose();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [isOpen, confirmation?.autoClose, onClose]);

  // Handler para acciones
  const handleAction = async (action: ConfirmationAction) => {
    setActionLoading(action.label);
    try {
      await action.onClick();
      onAction?.(action);
    } finally {
      setActionLoading(null);
    }
  };

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isVisible || !confirmation) {
    return null;
  }

  const getModalIcon = () => {
    switch (confirmation.type) {
      case 'payment': return '💳';
      case 'tour': return '🎯';
      case 'reservation': return '🏨';
      case 'partner': return '🤝';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': 
      default: return 'ℹ️';
    }
  };

  const getModalClass = () => {
    return `confirmation-modal ${confirmation.type} ${isOpen ? 'open' : 'closing'}`;
  };

  const formatDetails = () => {
    if (!confirmation.details) return null;
    
    return Object.entries(confirmation.details).map(([key, value]) => (
      <div key={key} className="detail-item">
        <span className="detail-key">{key}:</span>
        <span className="detail-value">{String(value)}</span>
      </div>
    ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={getModalClass()} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">
            {getModalIcon()}
          </div>
          <div className="modal-title-section">
            <h2 className="modal-title">{confirmation.title}</h2>
            {confirmation.timestamp && (
              <span className="modal-timestamp">
                {confirmation.timestamp.toLocaleString()}
              </span>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <div className="modal-message">
            {confirmation.message}
          </div>

          {confirmation.details && (
            <div className="modal-details">
              <h4>Detalles:</h4>
              <div className="details-grid">
                {formatDetails()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {/* Auto-close timer */}
          {timeLeft && (
            <div className="auto-close-timer">
              Cerrando automáticamente en {timeLeft}s
              <div 
                className="timer-progress" 
                style={{
                  width: `${(timeLeft / (confirmation.autoClose || 1)) * 100}%`
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            {confirmation.actions && confirmation.actions.length > 0 ? (
              confirmation.actions.map((action, index) => (
                <button
                  key={index}
                  className={`modal-action ${action.variant}`}
                  onClick={() => handleAction(action)}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === action.label ? (
                    <span className="loading-spinner">⟳</span>
                  ) : (
                    action.label
                  )}
                </button>
              ))
            ) : (
              <button className="modal-action primary" onClick={onClose}>
                Cerrar
              </button>
            )}
          </div>
        </div>

        {/* Indicador de tipo */}
        <div className={`modal-type-indicator ${confirmation.type}`} />
      </div>
    </div>
  );
};

export default ConfirmationModal;