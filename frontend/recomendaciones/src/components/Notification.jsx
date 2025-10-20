import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const Notification = ({ 
  message, 
  type = 'info', // 'success', 'error', 'info', 'warning'
  duration = 5000, 
  onClose,
  show = false 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#10b981',
          text: 'white',
          border: '#059669'
        };
      case 'error':
        return {
          bg: '#ef4444',
          text: 'white',
          border: '#dc2626'
        };
      case 'warning':
        return {
          bg: '#f59e0b',
          text: 'white',
          border: '#d97706'
        };
      default:
        return {
          bg: '#3b82f6',
          text: 'white',
          border: '#2563eb'
        };
    }
  };

  const colors = getColors();

  const notificationStyle = {
    position: 'fixed',
    top: '2rem',
    right: '2rem',
    background: colors.bg,
    color: colors.text,
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    zIndex: 1000,
    maxWidth: '400px',
    animation: isVisible ? 'slideInRight 0.3s ease-out' : 'slideOutRight 0.3s ease-in',
    fontSize: '0.9rem',
    fontWeight: '500'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: colors.text,
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '0.25rem',
    marginLeft: 'auto',
    opacity: 0.8,
    transition: 'opacity 0.2s ease'
  };

  return (
    <>
      <div style={notificationStyle}>
        {getIcon()}
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          style={closeButtonStyle}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.8'}
        >
          <X size={16} />
        </button>
      </div>

      {/* CSS para animaciones */}
      <style jsx="true">{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Notification;