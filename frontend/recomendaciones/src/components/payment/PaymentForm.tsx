import React, { useState, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PaymentForm.css';

interface PaymentFormProps {
  tourId?: string;
  servicioId?: string;
  amount: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customer_email: string;
  customer_name: string;
  tour_id?: string;
  servicio_id?: string;
  payment_method: 'card' | 'transfer' | 'mock';
  card_details?: {
    number: string;
    exp_month: string;
    exp_year: string;
    cvc: string;
    holder_name: string;
  };
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  tourId,
  servicioId,
  amount,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'mock'>('mock');
  
  const [cardDetails, setCardDetails] = useState({
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
    holder_name: ''
  });

  const [customerData, setCustomerData] = useState({
    name: user?.nombre || '',
    email: user?.email || ''
  });

  const handleCardChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const validateCardData = () => {
    if (paymentMethod === 'card') {
      const { number, exp_month, exp_year, cvc, holder_name } = cardDetails;
      
      if (!number || number.replace(/\s/g, '').length < 13) {
        throw new Error('Número de tarjeta inválido');
      }
      
      if (!exp_month || parseInt(exp_month) < 1 || parseInt(exp_month) > 12) {
        throw new Error('Mes de vencimiento inválido');
      }
      
      if (!exp_year || parseInt(exp_year) < new Date().getFullYear()) {
        throw new Error('Año de vencimiento inválido');
      }
      
      if (!cvc || cvc.length < 3) {
        throw new Error('CVC inválido');
      }
      
      if (!holder_name.trim()) {
        throw new Error('Nombre del titular requerido');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onPaymentError('Usuario no autenticado');
      return;
    }

    setIsLoading(true);
    
    try {
      validateCardData();
      
      const paymentData: PaymentData = {
        amount: amount * 100, // Convertir a centavos
        currency: 'USD',
        description: tourId ? `Pago por Tour ${tourId}` : `Pago por Servicio ${servicioId}`,
        customer_email: customerData.email,
        customer_name: customerData.name,
        tour_id: tourId,
        servicio_id: servicioId,
        payment_method: paymentMethod
      };

      if (paymentMethod === 'card') {
        paymentData.card_details = {
          ...cardDetails,
          number: cardDetails.number.replace(/\s/g, '')
        };
      }

      // Llamar al Payment Service (puerto 8200 según el plan)
      const response = await fetch('http://localhost:8200/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar el pago');
      }

      const result = await response.json();
      
      // Notificar éxito
      onPaymentSuccess({
        ...result,
        amount: amount,
        tour_id: tourId,
        servicio_id: servicioId
      });

    } catch (error) {
      console.error('Error en pago:', error);
      onPaymentError(error instanceof Error ? error.message : 'Error desconocido al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockCards = () => {
    const cards = [
      { name: 'Visa Test', number: '4111 1111 1111 1111', exp: '12/25', cvc: '123' },
      { name: 'MasterCard Test', number: '5555 5555 5555 4444', exp: '10/26', cvc: '456' },
      { name: 'Amex Test', number: '3782 8224 6310 005', exp: '08/27', cvc: '789' }
    ];
    
    return cards;
  };

  const fillTestCard = (cardData: any) => {
    setCardDetails({
      number: cardData.number,
      exp_month: cardData.exp.split('/')[0],
      exp_year: '20' + cardData.exp.split('/')[1],
      cvc: cardData.cvc,
      holder_name: cardData.name
    });
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form-card">
        <div className="payment-header">
          <h2>Procesar Pago</h2>
          <div className="amount-display">
            <span className="amount">${amount.toFixed(2)} USD</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {/* Datos del Cliente */}
          <div className="form-section">
            <h3>Información del Cliente</h3>
            
            <div className="form-group">
              <label htmlFor="customer_name">Nombre Completo</label>
              <input
                type="text"
                id="customer_name"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({...prev, name: e.target.value}))}
                required
                className="form-input"
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_email">Email</label>
              <input
                type="email"
                id="customer_email"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({...prev, email: e.target.value}))}
                required
                className="form-input"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div className="form-section">
            <h3>Método de Pago</h3>
            
            <div className="payment-methods">
              <label className="method-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="mock"
                  checked={paymentMethod === 'mock'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                />
                <span>💳 Pago de Prueba (Mock)</span>
              </label>
              
              <label className="method-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                />
                <span>💳 Tarjeta de Crédito/Débito</span>
              </label>

              <label className="method-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="transfer"
                  checked={paymentMethod === 'transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                />
                <span>🏦 Transferencia Bancaria</span>
              </label>
            </div>
          </div>

          {/* Detalles de Tarjeta (solo si es card) */}
          {paymentMethod === 'card' && (
            <div className="form-section">
              <h3>Detalles de la Tarjeta</h3>
              
              {/* Tarjetas de Prueba */}
              <div className="test-cards">
                <p className="test-cards-title">Tarjetas de Prueba:</p>
                {generateMockCards().map((card, index) => (
                  <button
                    key={index}
                    type="button"
                    className="test-card-btn"
                    onClick={() => fillTestCard(card)}
                  >
                    {card.name} - {card.number}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="card_number">Número de Tarjeta</label>
                <input
                  type="text"
                  id="card_number"
                  value={cardDetails.number}
                  onChange={(e) => handleCardChange('number', formatCardNumber(e.target.value))}
                  required
                  className="form-input"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="form-group">
                <label htmlFor="holder_name">Nombre del Titular</label>
                <input
                  type="text"
                  id="holder_name"
                  value={cardDetails.holder_name}
                  onChange={(e) => handleCardChange('holder_name', e.target.value)}
                  required
                  className="form-input"
                  placeholder="NOMBRE APELLIDO"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="exp_month">Mes</label>
                  <select
                    id="exp_month"
                    value={cardDetails.exp_month}
                    onChange={(e) => handleCardChange('exp_month', e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">Mes</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                        {(i + 1).toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="exp_year">Año</label>
                  <select
                    id="exp_year"
                    value={cardDetails.exp_year}
                    onChange={(e) => handleCardChange('exp_year', e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">Año</option>
                    {Array.from({length: 10}, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cvc">CVC</label>
                  <input
                    type="text"
                    id="cvc"
                    value={cardDetails.cvc}
                    onChange={(e) => handleCardChange('cvc', e.target.value.replace(/\D/g, ''))}
                    required
                    className="form-input"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Información de Transferencia */}
          {paymentMethod === 'transfer' && (
            <div className="form-section">
              <div className="transfer-info">
                <h3>Información para Transferencia</h3>
                <p><strong>Banco:</strong> Banco del Pacífico</p>
                <p><strong>Cuenta:</strong> 1234567890</p>
                <p><strong>Titular:</strong> Sistema Recomendaciones Turísticas</p>
                <p><strong>Referencia:</strong> {tourId || servicioId}</p>
                <p className="transfer-note">
                  💡 Después de realizar la transferencia, el pago será confirmado en 1-2 días hábiles.
                </p>
              </div>
            </div>
          )}

          {/* Botón de Pago */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className={`pay-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <span className="loading-spinner">⏳ Procesando...</span>
              ) : (
                `💳 Pagar $${amount.toFixed(2)}`
              )}
            </button>
          </div>
        </form>

        <div className="payment-footer">
          <p className="security-note">
            🔒 Tus datos están protegidos con encriptación SSL
          </p>
        </div>
      </div>
    </div>
  );
};