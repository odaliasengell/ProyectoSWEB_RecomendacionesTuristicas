/**
 * Payment Service Client
 * Cliente para interactuar con el Payment Service (Puerto 8002)
 */

const PAYMENT_SERVICE_URL = 'http://localhost:8002';

/**
 * Obtiene el token de acceso del localStorage
 */
const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('🔑 Token desde localStorage:', token ? `${token.substring(0, 20)}...` : 'NO ENCONTRADO');
  return token;
};

/**
 * Headers comunes con autenticación
 */
const getAuthHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  console.log('📤 Headers enviados:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'NO AUTH' });
  return headers;
};

/**
 * Maneja errores de la API
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Error en la operación');
  }
  
  return data;
};

// ==================== Payment Operations ====================

/**
 * Crea un nuevo pago
 * @param {Object} paymentData - Datos del pago
 * @param {number} paymentData.amount - Monto del pago
 * @param {string} paymentData.currency - Moneda (default: USD)
 * @param {string} paymentData.provider - Proveedor (mock, stripe, mercadopago)
 * @param {string} paymentData.description - Descripción del pago
 * @param {string} paymentData.order_id - ID de la orden/reserva (opcional)
 * @param {Object} paymentData.metadata - Metadata adicional (opcional)
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        provider: paymentData.provider || 'mock',
        description: paymentData.description || '',
        order_id: paymentData.order_id || null,
        metadata: paymentData.metadata || {}
      })
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear pago:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un pago
 * @param {string} paymentId - ID del pago
 */
export const getPayment = async (paymentId) => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    throw error;
  }
};

/**
 * Obtiene todos los pagos del usuario autenticado
 */
export const getMyPayments = async () => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    throw error;
  }
};

/**
 * Reembolsa un pago (solo admin)
 * @param {string} paymentId - ID del pago
 * @param {Object} refundData - Datos del reembolso
 * @param {number} refundData.amount - Monto a reembolsar (opcional, por defecto total)
 * @param {string} refundData.reason - Razón del reembolso (opcional)
 */
export const refundPayment = async (paymentId, refundData = {}) => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(refundData)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al reembolsar pago:', error);
    throw error;
  }
};

// ==================== Partner Operations (Admin) ====================

/**
 * Registra un nuevo partner
 * @param {Object} partnerData - Datos del partner
 * @param {string} partnerData.name - Nombre del partner
 * @param {string} partnerData.webhook_url - URL del webhook
 * @param {Array} partnerData.subscribed_events - Eventos suscritos
 * @param {string} partnerData.contact_email - Email de contacto (opcional)
 * @param {string} partnerData.description - Descripción (opcional)
 */
export const registerPartner = async (partnerData) => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/partners/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(partnerData)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al registrar partner:', error);
    throw error;
  }
};

/**
 * Obtiene todos los partners (solo admin)
 * @param {boolean} isActive - Filtrar por estado activo (opcional)
 */
export const getPartners = async (isActive = null) => {
  try {
    const url = new URL(`${PAYMENT_SERVICE_URL}/partners/`);
    if (isActive !== null) {
      url.searchParams.append('is_active', isActive);
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener partners:', error);
    throw error;
  }
};

/**
 * Obtiene un partner específico (solo admin)
 * @param {string} partnerId - ID del partner
 */
export const getPartner = async (partnerId) => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/partners/${partnerId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener partner:', error);
    throw error;
  }
};

/**
 * Actualiza un partner (solo admin)
 * @param {string} partnerId - ID del partner
 * @param {Object} updateData - Datos a actualizar
 */
export const updatePartner = async (partnerId, updateData) => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/partners/${partnerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar partner:', error);
    throw error;
  }
};

/**
 * Desactiva un partner (solo admin)
 * @param {string} partnerId - ID del partner
 */
export const deletePartner = async (partnerId) => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/partners/${partnerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar partner:', error);
    throw error;
  }
};

// ==================== Webhook Operations (Admin) ====================

/**
 * Envía un webhook a partners suscritos (solo admin)
 * @param {Object} webhookData - Datos del webhook
 * @param {string} webhookData.event - Tipo de evento
 * @param {Object} webhookData.data - Datos del evento
 * @param {Array} webhookData.partner_ids - IDs de partners (opcional)
 */
export const sendWebhook = async (webhookData) => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/webhooks/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(webhookData)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al enviar webhook:', error);
    throw error;
  }
};

/**
 * Obtiene logs de webhooks (solo admin)
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.direction - incoming o outgoing
 * @param {string} filters.partner_id - ID del partner
 * @param {boolean} filters.success - Filtrar por éxito
 * @param {number} filters.limit - Límite de resultados
 */
export const getWebhookLogs = async (filters = {}) => {
  try {
    const url = new URL(`${PAYMENT_SERVICE_URL}/webhooks/logs`);
    
    if (filters.direction) url.searchParams.append('direction', filters.direction);
    if (filters.partner_id) url.searchParams.append('partner_id', filters.partner_id);
    if (filters.success !== undefined) url.searchParams.append('success', filters.success);
    if (filters.limit) url.searchParams.append('limit', filters.limit);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener logs de webhooks:', error);
    throw error;
  }
};

// ==================== Health Check ====================

/**
 * Verifica el estado del Payment Service
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Error al verificar salud del servicio:', error);
    throw error;
  }
};

// ==================== Helpers ====================

/**
 * Formatea el estado de un pago para mostrar
 * @param {string} status - Estado del pago
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'processing': 'Procesando',
    'completed': 'Completado',
    'failed': 'Fallido',
    'refunded': 'Reembolsado',
    'cancelled': 'Cancelado'
  };
  
  return statusMap[status] || status;
};

/**
 * Obtiene la clase CSS para el estado de un pago
 * @param {string} status - Estado del pago
 */
export const getPaymentStatusClass = (status) => {
  const classMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'refunded': 'bg-purple-100 text-purple-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };
  
  return classMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Formatea el proveedor de pago para mostrar
 * @param {string} provider - Proveedor de pago
 */
export const formatPaymentProvider = (provider) => {
  const providerMap = {
    'mock': 'Simulado (Test)',
    'stripe': 'Stripe',
    'mercadopago': 'MercadoPago'
  };
  
  return providerMap[provider] || provider;
};

export default {
  createPayment,
  getPayment,
  getMyPayments,
  refundPayment,
  registerPartner,
  getPartners,
  getPartner,
  updatePartner,
  deletePartner,
  sendWebhook,
  getWebhookLogs,
  checkHealth,
  formatPaymentStatus,
  getPaymentStatusClass,
  formatPaymentProvider
};
