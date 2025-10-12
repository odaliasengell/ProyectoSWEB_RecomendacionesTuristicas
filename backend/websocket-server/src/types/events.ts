export interface WebSocketEvent {
  event: string;
  data: any;
  room?: string;
  timestamp: string;
}

export interface NuevaReservaEvent {
  id_reserva: number;
  id_tour: number;
  tour_nombre: string;
  id_usuario: number;
  usuario_nombre: string;
  cantidad_personas: number;
  precio_total: number;
}

export interface TourActualizadoEvent {
  id_tour: number;
  nombre: string;
  accion: 'creado' | 'actualizado' | 'eliminado';
}

export interface GuiaDisponibleEvent {
  id_guia: number;
  nombre: string;
  disponible: boolean;
}

export interface NotificacionEvent {
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
}