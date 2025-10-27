/**
 * Servicio para notificar eventos al WebSocket Server
 * Las APIs pueden usar este servicio para enviar eventos en tiempo real
 */

const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL || 'http://localhost:4001';

export interface NotificationPayload {
  event: string;
  data: any;
  room?: string; // admin_panel, usuarios, destinos, tours, servicios
  source: 'python_api' | 'typescript_api' | 'golang_api';
}

/**
 * Envía una notificación al servidor WebSocket
 */
export async function notifyWebSocket(payload: NotificationPayload): Promise<boolean> {
  try {
    const response = await fetch(`${WEBSOCKET_SERVER_URL}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error(`[WebSocket] Error: ${response.status} - ${response.statusText}`);
      return false;
    }

    const result = await response.json();
    console.log(`[WebSocket] Evento enviado: ${payload.event}`, result);
    return true;
  } catch (error) {
    console.error('[WebSocket] Error al enviar notificación:', error);
    return false;
  }
}

/**
 * Notifica un evento de usuario
 */
export async function notifyUserEvent(
  eventType: 'user_created' | 'user_updated' | 'user_deleted' | 'user_logged_in' | 'user_logged_out',
  userData: any,
  source: 'python_api' | 'typescript_api' | 'golang_api' = 'python_api'
) {
  return notifyWebSocket({
    event: eventType,
    data: {
      user_id: userData.id || userData._id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      created_at: userData.created_at
    },
    room: 'usuarios',
    source
  });
}

/**
 * Notifica un evento de destino
 */
export async function notifyDestinoEvent(
  eventType: 'destino_created' | 'destino_updated' | 'destino_deleted',
  destinoData: any,
  source: 'python_api' | 'typescript_api' = 'python_api'
) {
  return notifyWebSocket({
    event: eventType,
    data: {
      destino_id: destinoData.id || destinoData._id,
      nombre: destinoData.nombre,
      descripcion: destinoData.descripcion,
      location: destinoData.location || destinoData.ubicacion,
      rating: destinoData.rating
    },
    room: 'destinos',
    source
  });
}

/**
 * Notifica un evento de recomendación
 */
export async function notifyRecomendacionEvent(
  eventType: 'recomendacion_created' | 'recomendacion_updated' | 'recomendacion_deleted',
  recomendacionData: any,
  source: 'python_api' = 'python_api'
) {
  return notifyWebSocket({
    event: eventType,
    data: {
      recomendacion_id: recomendacionData.id || recomendacionData._id,
      usuario_id: recomendacionData.usuario_id || recomendacionData.user_id,
      destino_id: recomendacionData.destino_id,
      rating: recomendacionData.rating,
      comentario: recomendacionData.comentario || recomendacionData.comentario
    },
    room: 'recomendaciones',
    source
  });
}

/**
 * Notifica un evento de tour
 */
export async function notifyTourEvent(
  eventType: 'tour_created' | 'tour_updated' | 'tour_deleted' | 'tour_booked',
  tourData: any,
  source: 'typescript_api' = 'typescript_api'
) {
  return notifyWebSocket({
    event: eventType,
    data: {
      tour_id: tourData.id || tourData._id,
      nombre: tourData.nombre,
      guia_id: tourData.guia_id || tourData.guide_id,
      destino_id: tourData.destino_id,
      bookings_count: tourData.bookings_count,
      estado: tourData.estado || tourData.status
    },
    room: 'tours',
    source
  });
}

/**
 * Notifica un evento de guía
 */
export async function notifyGuiaEvent(
  eventType: 'guia_created' | 'guia_updated' | 'guia_disponible' | 'guia_no_disponible',
  guiaData: any,
  source: 'typescript_api' = 'typescript_api'
) {
  return notifyWebSocket({
    event: eventType,
    data: {
      guia_id: guiaData.id || guiaData._id,
      nombre: guiaData.nombre,
      disponible: guiaData.disponible !== false,
      tours_activos: guiaData.tours_activos || 0
    },
    room: 'guias',
    source
  });
}

/**
 * Notifica un evento de contratación
 */
export async function notifyContratacionEvent(
  eventType: 'contratacion_created' | 'contratacion_updated' | 'contratacion_deleted' | 'contratacion_completed',
  contratacionData: any,
  source: 'golang_api' = 'golang_api'
) {
  return notifyWebSocket({
    event: eventType,
    data: {
      contratacion_id: contratacionData.id || contratacionData.ID,
      servicio_id: contratacionData.servicio_id || contratacionData.ServiceID,
      estado: contratacionData.estado || contratacionData.Status,
      monto: contratacionData.monto || contratacionData.Amount,
      proveedor_id: contratacionData.proveedor_id || contratacionData.ProviderID
    },
    room: 'servicios',
    source
  });
}

/**
 * Notifica un evento de servicio
 */
export async function notifyServicioEvent(
  eventType: 'servicio_created' | 'servicio_updated' | 'servicio_deleted',
  servicioData: any,
  source: 'golang_api' = 'golang_api'
) {
  return notifyWebSocket({
    event: eventType,
    data: {
      servicio_id: servicioData.id || servicioData.ID,
      nombre: servicioData.nombre || servicioData.Name,
      descripcion: servicioData.descripcion || servicioData.Description,
      precio: servicioData.precio || servicioData.Price,
      disponible: servicioData.disponible !== false
    },
    room: 'servicios',
    source
  });
}

/**
 * Notifica actualización de estadísticas
 */
export async function notifyStatsUpdate(stats: {
  total_usuarios: number;
  total_destinos: number;
  total_tours: number;
  total_servicios: number;
  usuarios_activos: number;
  contratos_pendientes?: number;
  reservas_nuevas?: number;
}) {
  return notifyWebSocket({
    event: 'stats_updated',
    data: stats,
    room: 'admin_panel',
    source: 'python_api'
  });
}

/**
 * Notifica error o alerta al panel admin
 */
export async function notifyAdminAlert(
  titulo: string,
  mensaje: string,
  tipo: 'info' | 'success' | 'warning' | 'error' = 'info'
) {
  return notifyWebSocket({
    event: 'admin_alert',
    data: {
      titulo,
      mensaje,
      tipo
    },
    room: 'admin_panel',
    source: 'python_api'
  });
}
