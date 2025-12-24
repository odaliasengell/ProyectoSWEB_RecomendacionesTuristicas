/**
 * Página principal mejorada que integra todos los componentes
 * Semana 1: UI Base con Chat y Pagos preparatorios
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardV2 from '../components/dashboard/DashboardV2';
import ChatBot from '../components/common/ChatBot';
import PaymentForm from '../components/common/PaymentForm';
import './MainDashboardPage.css';

const MainDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    description: ''
  });

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    console.log('🔐 Usuario autenticado, cargando dashboard...');
  }, [navigate]);

  const handlePaymentSuccess = (result: any) => {
    console.log('✅ Pago exitoso:', result);
    setShowPaymentForm(false);
    
    // TODO Semana 2: Integrar con webhook notifications
    // Simular notificación WebSocket de pago exitoso
    const event = new CustomEvent('payment_success', {
      detail: {
        type: 'payment_success',
        message: `Pago de $${result.amount} procesado exitosamente`,
        amount: result.amount,
        transactionId: result.transactionId
      }
    });
    window.dispatchEvent(event);
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Error en pago:', error);
    // TODO: Mostrar notificación de error
    alert(`Error en el pago: ${error}`);
  };

  const handleTestPayment = () => {
    setPaymentData({
      amount: 299.99,
      description: 'Tour: Galápagos Adventure - 5 días / 4 noches'
    });
    setShowPaymentForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/');
  };

  return (
    <div className="main-dashboard-page">
      
      {/* Dashboard principal */}
      <DashboardV2 />

      {/* Floating Action Buttons */}
      <div className="floating-actions">
        
        {/* Test Payment Button */}
        <button 
          className="fab payment-fab"
          onClick={handleTestPayment}
          title="Probar módulo de pagos"
        >
          💳
        </button>

        {/* Logout Button */}
        <button 
          className="fab logout-fab"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          🚪
        </button>

      </div>

      {/* Chat Bot Component */}
      <ChatBot 
        isActive={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          amount={paymentData.amount}
          description={paymentData.description}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onCancel={() => setShowPaymentForm(false)}
        />
      )}

      {/* Development Status Indicator */}
      <div className="dev-status">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Semana 1 - UI Base Completada</span>
        </div>
      </div>

    </div>
  );
};

export default MainDashboardPage;