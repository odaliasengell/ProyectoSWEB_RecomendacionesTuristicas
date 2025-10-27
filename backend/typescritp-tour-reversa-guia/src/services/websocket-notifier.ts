/**
 * Servicio de notificación WebSocket para TypeScript/Node.js
 * Permite notificar eventos en tiempo real al dashboard admin
 */

import axios, { AxiosError } from 'axios';

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'http://localhost:4001';

// Logger simple
const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`)
};

export interface WebSocketEventPayload {
  event: string;
  data: Record<string, any>;
  room?: string;
  source?: 'typescript_api' | 'python_api' | 'golang_api';
  timestamp?: string;
}

/**
 * Envía una notificación al WebSocket Server
 */
export async function notifyWebSocket(payload: WebSocketEventPayload): Promise<boolean> {
  try {
    const response = await axios.post(`${WEBSOCKET_URL}/notify`, {
      ...payload,
      source: 'typescript_api',
      timestamp: new Date().toISOString()
    });

    logger.info(`✅ WebSocket notificado: ${payload.event}`);
    return true;
  } catch (error) {
    const axiosError = error as AxiosError;
    logger.error(`❌ Error al notificar WebSocket: ${axiosError.message}`);
    return false;
  }
}

// ==========================================
// FUNCIONES ESPECÍFICAS POR TIPO DE EVENTO
// ==========================================

/**
 * Notifica un evento de tour
 */
export async function notifyTourEvent(
  eventType: 'tour_created' | 'tour_updated' | 'tour_deleted' | 'tour_booked',
  tourData: Record<string, any>
): Promise<boolean> {
  return notifyWebSocket({
    event: eventType,
    data: {
      tour_id: tourData.id || tourData._id,
      nombre: tourData.nombre,
      guia_id: tourData.guia_id,
      destino_id: tourData.destino_id,
      bookings_count: tourData.bookings_count || 0,
      estado: tourData.estado || tourData.status
    },
    room: 'tours'
  });
}

/**
 * Notifica un evento de guía
 */
export async function notifyGuiaEvent(
  eventType: 'guia_created' | 'guia_updated' | 'guia_disponible' | 'guia_no_disponible',
  guiaData: Record<string, any>
): Promise<boolean> {
  return notifyWebSocket({
    event: eventType,
    data: {
      guia_id: guiaData.id || guiaData._id,
      nombre: guiaData.nombre,
      disponible: eventType === 'guia_disponible' ? true : eventType === 'guia_no_disponible' ? false : guiaData.disponible,
      tours_activos: guiaData.tours_activos || 0
    },
    room: 'guias'
  });
}

/**
 * Notifica un evento de reserva/booking
 */
export async function notifyBookingEvent(
  bookingData: Record<string, any>
): Promise<boolean> {
  return notifyWebSocket({
    event: 'tour_booked',
    data: {
      booking_id: bookingData.id || bookingData._id,
      tour_id: bookingData.tour_id,
      usuario_id: bookingData.usuario_id || bookingData.user_id,
      cantidad_personas: bookingData.cantidad_personas,
      fecha_reserva: bookingData.fecha_reserva,
      estado: bookingData.estado || 'pendiente'
    },
    room: 'tours'
  });
}

/**
 * Notifica una alerta al panel admin
 */
export async function notifyAdminAlert(
  titulo: string,
  mensaje: string,
  tipo: 'info' | 'success' | 'warning' | 'error' = 'info'
): Promise<boolean> {
  return notifyWebSocket({
    event: 'admin_alert',
    data: {
      titulo,
      mensaje,
      tipo
    },
    room: 'admin_panel'
  });
}

// ==========================================
// EJEMPLOS DE USO EN RUTAS
// ==========================================

/*
// En routes/tours.routes.ts

import { notifyTourEvent, notifyBookingEvent, notifyAdminAlert } from '../services/websocket-notifier';

router.post('/tours', async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    
    // ✨ NOTIFICAR EVENTO
    await notifyTourEvent('tour_created', tour.toObject());
    
    res.json(tour);
  } catch (error) {
    logger.error(error);
    await notifyAdminAlert(
      'Error al crear tour',
      error.message,
      'error'
    );
    res.status(500).json({ error: error.message });
  }
});

router.put('/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // ✨ NOTIFICAR EVENTO
    await notifyTourEvent('tour_updated', tour.toObject());
    
    res.json(tour);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    
    // ✨ NOTIFICAR EVENTO
    await notifyTourEvent('tour_deleted', tour.toObject());
    
    res.json({ message: 'Tour eliminado' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

// En routes/bookings.routes.ts

router.post('/bookings', async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    
    // ✨ NOTIFICAR EVENTO DE RESERVA
    await notifyBookingEvent(booking.toObject());
    
    // ✨ NOTIFICAR AL TOUR QUE FUE RESERVADO
    await notifyTourEvent('tour_booked', {
      ...booking.tour,
      bookings_count: await Booking.countDocuments({ tour_id: booking.tour_id })
    });
    
    res.json(booking);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

// En routes/guides.routes.ts

router.post('/guias', async (req, res) => {
  try {
    const guia = await Guia.create(req.body);
    
    // ✨ NOTIFICAR EVENTO
    await notifyGuiaEvent('guia_created', guia.toObject());
    
    res.json(guia);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/guias/:id/disponibilidad', async (req, res) => {
  try {
    const { disponible } = req.body;
    const guia = await Guia.findByIdAndUpdate(
      req.params.id,
      { disponible },
      { new: true }
    );
    
    // ✨ NOTIFICAR CAMBIO DE DISPONIBILIDAD
    const eventType = disponible ? 'guia_disponible' : 'guia_no_disponible';
    await notifyGuiaEvent(eventType, guia.toObject());
    
    res.json(guia);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});
*/
