/**
 * Demo.tsx - Semana 4
 * Abigail Plua - Componente de demostración para las mejoras
 * Sistema de Recomendaciones Turísticas
 */

import React, { useState } from 'react';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { ChatBot } from '../chat/ChatBot';
import { WebSocketStatus } from '../common/WebSocketStatus';
import { useConfirmation } from '../../hooks/useConfirmation';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const Demo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  
  const {
    showTourPurchaseConfirmation,
    showPartnerReservationConfirmation,
    showSystemNotification
  } = useConfirmation();

  const demoTourPurchase = () => {
    showTourPurchaseConfirmation({
      tour_id: 'tour_demo_001',
      tour_name: 'Aventura en Montañita',
      amount: 120,
      user_id: 'user_demo',
      partner_notified: true
    });
  };

  const demoPartnerReservation = () => {
    showPartnerReservationConfirmation({
      reservation_id: 'res_demo_' + Date.now(),
      partner_id: 'Reservas ULEAM',
      status: 'confirmado',
      details: {
        'Hotel': 'Hotel Paradise',
        'Habitación': 'Suite Deluxe',
        'Check-in': '2026-02-01',
        'Noches': '3'
      }
    });
  };

  const demoSystemNotification = () => {
    showSystemNotification({
      title: '🔄 Sistema Actualizado',
      message: 'El sistema de recomendaciones ha sido actualizado con nuevas funcionalidades de la Semana 4. ¡Disfruta de las mejoras!',
      type: 'success',
      autoClose: 8
    });
  };

  const simulateWebSocketMessage = (type: string) => {
    // Simular mensaje WebSocket (normalmente vendría del servidor)
    const event = new CustomEvent('websocket-demo', {
      detail: {
        type,
        data: {
          amount: 8500,
          currency: 'USD',
          status: 'success',
          item_name: 'Tour de Prueba WebSocket',
          item_type: 'tour',
          tour_id: 'tour_ws_001',
          tour_name: 'Tour WebSocket Demo',
          user_id: 'demo_user',
          reservation_id: 'ws_res_001',
          partner_id: 'WebSocket Partner'
        }
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
          🎯 Demo - Semana 4 Completada
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Abigail Plua - UI de confirmación + Mensajes WebSocket mejorados
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Estado de WebSocket */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
            🔌 Estado de Conexión
          </h3>
          <WebSocketStatus 
            showDetails={true} 
            position="inline" 
          />
        </div>

        {/* Componentes Implementados */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
            ✅ Componentes Completados
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1rem', lineHeight: '1.6' }}>
            <li>📋 ConfirmationModal</li>
            <li>🔄 ConfirmationService</li>
            <li>🔔 NotificationPanel mejorado</li>
            <li>💬 ChatBot con acciones rápidas</li>
            <li>📊 WebSocketStatus avanzado</li>
          </ul>
        </div>
      </div>

      {/* Botones de demostración */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
          🎮 Probar Confirmaciones
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          
          <button
            onClick={demoTourPurchase}
            style={{
              padding: '0.75rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🎯 Tour Adquirido
          </button>
          
          <button
            onClick={demoPartnerReservation}
            style={{
              padding: '0.75rem 1rem',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🏨 Reserva Partner
          </button>
          
          <button
            onClick={demoSystemNotification}
            style={{
              padding: '0.75rem 1rem',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔔 Notificación Sistema
          </button>
        </div>
      </div>

      {/* Simulación de WebSocket */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
          📡 Simular Mensajes WebSocket
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <button
            onClick={() => simulateWebSocketMessage('tour_purchased')}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Tour WebSocket
          </button>
          
          <button
            onClick={() => simulateWebSocketMessage('reserva_confirmada')}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Reserva WebSocket
          </button>
        </div>
      </div>

      {/* Instrucciones */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0c4a6e' }}>
          📋 Instrucciones de Prueba
        </h3>
        <ol style={{ margin: 0, paddingLeft: '1rem', lineHeight: '1.6', color: '#0c4a6e' }}>
          <li>Haz clic en los botones de arriba para ver las confirmaciones modales</li>
          <li>Abre el panel de notificaciones (🔔) en la esquina superior derecha</li>
          <li>Abre el ChatBot (🤖) en la esquina inferior derecha</li>
          <li>Observa las acciones rápidas que aparecen después de las confirmaciones</li>
          <li>Prueba los filtros en el panel de notificaciones</li>
          <li>Verifica el estado de WebSocket en tiempo real</li>
        </ol>
      </div>

      {/* Componentes integrados */}
      <NotificationPanel />
      <ChatBot />
    </div>
  );
};

export default Demo;