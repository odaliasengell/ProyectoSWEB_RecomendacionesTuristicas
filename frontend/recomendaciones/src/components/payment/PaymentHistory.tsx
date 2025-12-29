import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PaymentHistory.css';

interface Payment {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_method: string;
  item_type: 'tour' | 'servicio';
  item_id: string;
  item_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  transaction_id?: string;
  provider?: string;
  metadata?: any;
}

export const PaymentHistory: React.FC = () => {
  const { user, token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  useEffect(() => {
    if (user && token) {
      fetchPaymentHistory();
    }
  }, [user, token]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamar al payment service para obtener el historial
      const response = await fetch('http://localhost:8200/payment/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el historial de pagos');
      }

      const data = await response.json();
      setPayments(Array.isArray(data) ? data : data.payments || []);
      
    } catch (error) {
      console.error('Error cargando pagos:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      // En caso de error, mostrar datos de ejemplo
      setPayments(generateMockPayments());
    } finally {
      setLoading(false);
    }
  };

  const generateMockPayments = (): Payment[] => {
    return [
      {
        id: '1',
        payment_id: 'pay_123456789',
        amount: 15000, // $150.00
        currency: 'USD',
        status: 'success',
        payment_method: 'mock',
        item_type: 'tour',
        item_id: 'tour_1',
        item_name: 'Tour Galápagos Express',
        description: 'Pago por Tour Galápagos Express - 2 personas',
        created_at: new Date(Date.now() - 86400000).toISOString(), // Ayer
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        transaction_id: 'txn_987654321',
        provider: 'MockAdapter'
      },
      {
        id: '2',
        payment_id: 'pay_234567890',
        amount: 8500, // $85.00
        currency: 'USD',
        status: 'success',
        payment_method: 'card',
        item_type: 'servicio',
        item_id: 'servicio_5',
        item_name: 'Guía Turístico Personal',
        description: 'Contratación de guía para tour privado',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 días
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        transaction_id: 'txn_876543210'
      },
      {
        id: '3',
        payment_id: 'pay_345678901',
        amount: 25000, // $250.00
        currency: 'USD',
        status: 'pending',
        payment_method: 'transfer',
        item_type: 'tour',
        item_id: 'tour_3',
        item_name: 'Aventura Amazónica 5D/4N',
        description: 'Pago pendiente por transferencia bancaria',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora
        updated_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      case 'refunded': return '🔄';
      default: return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Exitoso';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      case 'refunded': return 'Reembolsado';
      default: return 'Desconocido';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'success': return 'status-success';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      case 'refunded': return 'status-refunded';
      default: return 'status-unknown';
    }
  };

  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleRefresh = () => {
    fetchPaymentHistory();
  };

  const handlePaymentAction = async (payment: Payment, action: 'retry' | 'cancel' | 'refund') => {
    try {
      const response = await fetch(`http://localhost:8200/payment/${payment.payment_id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchPaymentHistory(); // Recargar datos
      }
    } catch (error) {
      console.error(`Error al ${action} pago:`, error);
    }
  };

  if (loading) {
    return (
      <div className="payment-history">
        <div className="payment-loading">
          <div className="loading-spinner"></div>
          <p>Cargando historial de pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history">
      <div className="payment-header">
        <div className="header-left">
          <h2>💳 Historial de Pagos</h2>
          <p className="subtitle">Gestiona y revisa tus transacciones</p>
        </div>
        
        <div className="header-right">
          <button onClick={handleRefresh} className="refresh-btn" title="Actualizar">
            🔄
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-error">✕</button>
        </div>
      )}

      {/* Filtros */}
      <div className="payment-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({payments.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'success' ? 'active' : ''}`}
          onClick={() => setFilter('success')}
        >
          ✅ Exitosos ({payments.filter(p => p.status === 'success').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          ⏳ Pendientes ({payments.filter(p => p.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          ❌ Fallidos ({payments.filter(p => p.status === 'failed').length})
        </button>
      </div>

      {/* Lista de Pagos */}
      <div className="payments-list">
        {filteredPayments.length === 0 ? (
          <div className="no-payments">
            <div className="no-payments-icon">💳</div>
            <h3>No hay pagos para mostrar</h3>
            <p>
              {filter === 'all' 
                ? 'Aún no has realizado ningún pago.' 
                : `No hay pagos con estado "${getStatusText(filter)}".`
              }
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const { date, time } = formatDate(payment.created_at);
            
            return (
              <div key={payment.id} className="payment-card">
                <div className="payment-main">
                  <div className="payment-info">
                    <div className="payment-title">
                      <span className="item-type">
                        {payment.item_type === 'tour' ? '🎯' : '🔧'}
                      </span>
                      <h4>{payment.item_name}</h4>
                      <span className={`payment-status ${getStatusClass(payment.status)}`}>
                        {getStatusIcon(payment.status)} {getStatusText(payment.status)}
                      </span>
                    </div>
                    
                    <p className="payment-description">{payment.description}</p>
                    
                    <div className="payment-meta">
                      <div className="meta-item">
                        <span className="meta-label">ID de Pago:</span>
                        <span className="meta-value">{payment.payment_id}</span>
                      </div>
                      {payment.transaction_id && (
                        <div className="meta-item">
                          <span className="meta-label">ID Transacción:</span>
                          <span className="meta-value">{payment.transaction_id}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <span className="meta-label">Método:</span>
                        <span className="meta-value">
                          {payment.payment_method === 'mock' ? 'Prueba' : 
                           payment.payment_method === 'card' ? 'Tarjeta' :
                           payment.payment_method === 'transfer' ? 'Transferencia' : 
                           payment.payment_method}
                        </span>
                      </div>
                      {payment.provider && (
                        <div className="meta-item">
                          <span className="meta-label">Proveedor:</span>
                          <span className="meta-value">{payment.provider}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="payment-amount">
                    <div className="amount">{formatAmount(payment.amount, payment.currency)}</div>
                    <div className="payment-date">
                      <span className="date">{date}</span>
                      <span className="time">{time}</span>
                    </div>
                  </div>
                </div>
                
                {/* Acciones */}
                <div className="payment-actions">
                  {payment.status === 'failed' && (
                    <button 
                      onClick={() => handlePaymentAction(payment, 'retry')}
                      className="action-btn retry-btn"
                    >
                      🔄 Reintentar
                    </button>
                  )}
                  
                  {payment.status === 'pending' && (
                    <button 
                      onClick={() => handlePaymentAction(payment, 'cancel')}
                      className="action-btn cancel-btn"
                    >
                      ❌ Cancelar
                    </button>
                  )}
                  
                  {payment.status === 'success' && (
                    <>
                      <button 
                        onClick={() => window.open(`/receipt/${payment.payment_id}`, '_blank')}
                        className="action-btn receipt-btn"
                      >
                        📄 Recibo
                      </button>
                      <button 
                        onClick={() => handlePaymentAction(payment, 'refund')}
                        className="action-btn refund-btn"
                      >
                        💰 Reembolso
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => window.open(`/${payment.item_type}s/${payment.item_id}`, '_blank')}
                    className="action-btn view-item-btn"
                  >
                    👁️ Ver {payment.item_type === 'tour' ? 'Tour' : 'Servicio'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resumen */}
      {payments.length > 0 && (
        <div className="payment-summary">
          <h3>📊 Resumen de Pagos</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Pagado:</span>
              <span className="stat-value success">
                {formatAmount(
                  payments.filter(p => p.status === 'success')
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pendiente:</span>
              <span className="stat-value pending">
                {formatAmount(
                  payments.filter(p => p.status === 'pending')
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Transacciones:</span>
              <span className="stat-value">{payments.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};