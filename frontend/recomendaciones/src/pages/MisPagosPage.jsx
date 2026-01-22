import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  createPayment,
  getMyPayments,
  formatPaymentStatus,
  getPaymentStatusClass,
  formatPaymentProvider,
  checkHealth
} from '../services/paymentService';

const MisPagosPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serviceHealthy, setServiceHealthy] = useState(false);
  
  // Estado para nuevo pago
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    description: '',
    provider: 'mock',
    order_id: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    checkServiceHealth();
    loadPayments();
  }, [isAuthenticated]);

  const checkServiceHealth = async () => {
    try {
      await checkHealth();
      setServiceHealthy(true);
    } catch (error) {
      console.error('Payment Service no disponible:', error);
      setServiceHealthy(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyPayments();
      setPayments(data);
    } catch (err) {
      setError(err.message || 'Error al cargar pagos');
      console.error('Error cargando pagos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      setCreateError('El monto debe ser mayor a 0');
      return;
    }
    
    try {
      setCreating(true);
      setCreateError('');
      setCreateSuccess('');
      
      const paymentData = {
        amount: parseFloat(newPayment.amount),
        currency: 'USD',
        provider: newPayment.provider,
        description: newPayment.description || 'Pago de prueba',
        order_id: newPayment.order_id || null,
        metadata: {
          created_from: 'frontend',
          user_email: user?.email || ''
        }
      };
      
      const result = await createPayment(paymentData);
      setCreateSuccess('¡Pago creado exitosamente!');
      
      // Limpiar formulario
      setNewPayment({
        amount: '',
        description: '',
        provider: 'mock',
        order_id: ''
      });
      
      // Recargar lista de pagos
      setTimeout(() => {
        loadPayments();
        setShowNewPayment(false);
        setCreateSuccess('');
      }, 1500);
      
    } catch (err) {
      setCreateError(err.message || 'Error al crear pago');
      console.error('Error creando pago:', err);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
              <p className="mt-2 text-gray-600">
                Historial de pagos y transacciones
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Estado del servicio */}
              <div className="flex items-center">
                <span className={`h-3 w-3 rounded-full ${serviceHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="ml-2 text-sm text-gray-600">
                  {serviceHealthy ? 'Servicio activo' : 'Servicio inactivo'}
                </span>
              </div>
              
              {/* Botón crear pago */}
              <button
                onClick={() => setShowNewPayment(!showNewPayment)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Pago de Prueba
              </button>
            </div>
          </div>
        </div>

        {/* Formulario de nuevo pago */}
        {showNewPayment && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Crear Pago de Prueba</h2>
            
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor
                  </label>
                  <select
                    value={newPayment.provider}
                    onChange={(e) => setNewPayment({...newPayment, provider: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mock">Mock (Simulado - siempre exitoso)</option>
                    <option value="stripe">Stripe</option>
                    <option value="mercadopago">MercadoPago</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tour a Galápagos, Reserva de hotel, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID de Orden (opcional)
                </label>
                <input
                  type="text"
                  value={newPayment.order_id}
                  onChange={(e) => setNewPayment({...newPayment, order_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="booking_123, order_456, etc."
                />
              </div>
              
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {createError}
                </div>
              )}
              
              {createSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {createSuccess}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewPayment(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Procesando...' : 'Crear Pago'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Lista de pagos */}
        {payments.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay pagos</h3>
            <p className="mt-2 text-gray-500">Aún no has realizado ningún pago.</p>
            <button
              onClick={() => setShowNewPayment(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Pago de Prueba
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Externo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {payment.description || 'Sin descripción'}
                        </div>
                        {payment.order_id && (
                          <div className="text-xs text-gray-500 mt-1">
                            Orden: {payment.order_id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatPaymentProvider(payment.provider)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(payment.status)}`}>
                          {formatPaymentStatus(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {payment.external_id ? (
                          <span className="truncate max-w-xs block" title={payment.external_id}>
                            {payment.external_id.substring(0, 20)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        {payments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-500 mb-1">Total Pagos</div>
              <div className="text-2xl font-bold text-gray-900">{payments.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-500 mb-1">Total Gastado</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-500 mb-1">Completados</div>
              <div className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'completed').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-500 mb-1">Pendientes</div>
              <div className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.status === 'pending' || p.status === 'processing').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPagosPage;
