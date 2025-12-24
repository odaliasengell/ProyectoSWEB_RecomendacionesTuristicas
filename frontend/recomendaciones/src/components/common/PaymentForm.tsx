/**
 * Componente base para el módulo de pagos
 * Preparado para integración con Payment Service - Pilar 2
 */

import React, { useState, useEffect } from 'react';
import './PaymentForm.css';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'stripe' | 'mercadopago';
  name: string;
  icon: string;
  available: boolean;
}

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  paymentMethodId: string;
}

interface PaymentFormProps {
  amount: number;
  description: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  description,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: 'stripe', type: 'stripe', name: 'Stripe', icon: '💳', available: true },
    { id: 'mercadopago', type: 'mercadopago', name: 'MercadoPago', icon: '🏦', available: false },
    { id: 'mock', type: 'credit_card', name: 'Simulado (Desarrollo)', icon: '🎭', available: true }
  ]);
  
  const [selectedMethod, setSelectedMethod] = useState<string>('mock');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Cargar email del usuario logueado
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setCustomerEmail(user.email || '');
    }
  }, []);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setCurrentStep('details');
  };

  const handleProcessPayment = async () => {
    if (!customerEmail.trim()) {
      onPaymentError?.('Email requerido');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');

    const paymentData: PaymentData = {
      amount,
      currency: 'USD',
      description,
      customerEmail,
      paymentMethodId: selectedMethod
    };

    try {
      // TODO Semana 2: Integrar con Payment Service real
      // Por ahora simular el proceso
      console.log('🔄 Procesando pago:', paymentData);
      
      // Simular llamada a Payment Service
      await simulatePaymentProcess(paymentData);
      
      setCurrentStep('success');
      
      const result = {
        transactionId: `txn_${Date.now()}`,
        amount: amount,
        status: 'success',
        paymentMethod: selectedMethod,
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        onPaymentSuccess?.(result);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error en pago:', error);
      onPaymentError?.(error.message || 'Error al procesar el pago');
      setCurrentStep('details');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePaymentProcess = async (data: PaymentData): Promise<void> => {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simular posible error (10% de probabilidad)
    if (Math.random() < 0.1) {
      throw new Error('Pago rechazado por el banco');
    }
    
    // Simular webhook notification
    console.log('🔔 Simulando webhook de pago exitoso');
  };

  const formatCardNumber = (value: string) => {
    // Formatear número de tarjeta: 1234 5678 9012 3456
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    // Formatear fecha: MM/YY
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form">
        
        {/* Header */}
        <div className="payment-header">
          <h2 className="payment-title">💳 Procesamiento de Pago</h2>
          <div className="payment-amount">
            <span className="amount-label">Total a pagar:</span>
            <span className="amount-value">${amount.toFixed(2)}</span>
          </div>
          <p className="payment-description">{description}</p>
        </div>

        {/* Step 1: Selección de método */}
        {currentStep === 'method' && (
          <div className="payment-step">
            <h3 className="step-title">Selecciona método de pago</h3>
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  className={`payment-method-btn ${!method.available ? 'disabled' : ''}`}
                  onClick={() => method.available && handleMethodSelect(method.id)}
                  disabled={!method.available}
                >
                  <span className="method-icon">{method.icon}</span>
                  <span className="method-name">{method.name}</span>
                  {!method.available && <span className="coming-soon">Próximamente</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Detalles de pago */}
        {currentStep === 'details' && (
          <div className="payment-step">
            <h3 className="step-title">
              Detalles de pago - {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </h3>
            
            <form className="payment-details-form">
              <div className="form-group">
                <label htmlFor="email">Email de confirmación</label>
                <input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {selectedMethod !== 'mock' && (
                <>
                  <div className="form-group">
                    <label htmlFor="cardName">Nombre en la tarjeta</label>
                    <input
                      id="cardName"
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      placeholder="JOHN DOE"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber">Número de tarjeta</label>
                    <input
                      id="cardNumber"
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cardExpiry">Expiración</label>
                      <input
                        id="cardExpiry"
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: formatExpiry(e.target.value)})}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardCvc">CVC</label>
                      <input
                        id="cardCvc"
                        type="text"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '')})}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedMethod === 'mock' && (
                <div className="mock-payment-info">
                  <div className="mock-notice">
                    <span className="notice-icon">🎭</span>
                    <div className="notice-text">
                      <h4>Modo de desarrollo</h4>
                      <p>Este pago será simulado para propósitos de testing. No se realizará cargo real.</p>
                    </div>
                  </div>
                </div>
              )}

            </form>

            <div className="payment-actions">
              <button 
                className="back-btn"
                onClick={() => setCurrentStep('method')}
              >
                ← Cambiar método
              </button>
              <button 
                className="pay-btn"
                onClick={handleProcessPayment}
                disabled={!customerEmail.trim() || isProcessing}
              >
                Pagar ${amount.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Procesando */}
        {currentStep === 'processing' && (
          <div className="payment-step processing">
            <div className="processing-content">
              <div className="processing-spinner"></div>
              <h3>Procesando tu pago...</h3>
              <p>Por favor espera mientras verificamos tu información</p>
              <div className="processing-steps">
                <div className="process-step active">✓ Validando datos</div>
                <div className="process-step active">🔄 Contactando banco</div>
                <div className="process-step">⏳ Confirmando pago</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Éxito */}
        {currentStep === 'success' && (
          <div className="payment-step success">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h3>¡Pago exitoso!</h3>
              <p>Tu pago ha sido procesado correctamente</p>
              <div className="payment-summary">
                <div className="summary-item">
                  <span>Monto:</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Método:</span>
                  <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                </div>
                <div className="summary-item">
                  <span>Email:</span>
                  <span>{customerEmail}</span>
                </div>
              </div>
              <p className="success-note">
                Recibirás un email de confirmación en breve.
              </p>
            </div>
          </div>
        )}

        {/* Cancel button */}
        {currentStep !== 'processing' && currentStep !== 'success' && onCancel && (
          <button className="cancel-btn" onClick={onCancel}>
            Cancelar
          </button>
        )}

      </div>
    </div>
  );
};

export default PaymentForm;