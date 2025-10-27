// ==========================================
// TIPOS BÁSICOS DEL WEBSOCKET
// ==========================================

export interface WebSocketEvent {
  event: string;
  data: any;
  room?: string;
  timestamp: string;
  source?: 'python_api' | 'typescript_api' | 'golang_api';
}

// ==========================================
// EVENTOS DE PYTHON API (Usuarios, Destinos, Recomendaciones)
// ==========================================

export interface UserEvent extends WebSocketEvent {
  event: 'user_created' | 'user_updated' | 'user_deleted' | 'user_logged_in' | 'user_logged_out';
  data: {
    user_id: string;
    username: string;
    email: string;
    role?: string;
    created_at?: string;
  };
}

export interface DestinoEvent extends WebSocketEvent {
  event: 'destino_created' | 'destino_updated' | 'destino_deleted';
  data: {
    destino_id: string;
    nombre: string;
    descripcion: string;
    location?: string;
    rating?: number;
  };
}

export interface RecomendacionEvent extends WebSocketEvent {
  event: 'recomendacion_created' | 'recomendacion_updated' | 'recomendacion_deleted';
  data: {
    recomendacion_id: string;
    usuario_id: string;
    destino_id: string;
    rating: number;
    comentario?: string;
  };
}

// ==========================================
// EVENTOS DE TYPESCRIPT API (Tours, Guías)
// ==========================================

export interface TourEvent extends WebSocketEvent {
  event: 'tour_created' | 'tour_updated' | 'tour_deleted' | 'tour_booked';
  data: {
    tour_id: string;
    nombre: string;
    guia_id?: string;
    destino_id?: string;
    bookings_count?: number;
    estado?: string;
  };
}

export interface GuiaEvent extends WebSocketEvent {
  event: 'guia_created' | 'guia_updated' | 'guia_disponible' | 'guia_no_disponible';
  data: {
    guia_id: string;
    nombre: string;
    disponible: boolean;
    tours_activos?: number;
  };
}

// ==========================================
// EVENTOS DE GO API (Contratos y Servicios)
// ==========================================

export interface ContratacionEvent extends WebSocketEvent {
  event: 'contratacion_created' | 'contratacion_updated' | 'contratacion_deleted' | 'contratacion_completed';
  data: {
    contratacion_id: string;
    servicio_id: string;
    estado: string;
    monto: number;
    proveedor_id?: string;
  };
}

export interface ServicioEvent extends WebSocketEvent {
  event: 'servicio_created' | 'servicio_updated' | 'servicio_deleted';
  data: {
    servicio_id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    disponible: boolean;
  };
}

// ==========================================
// EVENTOS DE PANEL DE ADMINISTRACIÓN
// ==========================================

export interface StatsEvent extends WebSocketEvent {
  event: 'stats_updated';
  data: {
    total_usuarios: number;
    total_destinos: number;
    total_tours: number;
    total_servicios: number;
    usuarios_activos: number;
    contratos_pendientes?: number;
    reservas_nuevas?: number;
  };
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
  origen?: 'python_api' | 'typescript_api' | 'golang_api';
}

// ==========================================
// TIPO GENÉRICO PARA CUALQUIER EVENTO
// ==========================================

export type AnyEvent = 
  | UserEvent 
  | DestinoEvent 
  | RecomendacionEvent 
  | TourEvent 
  | GuiaEvent 
  | ContratacionEvent 
  | ServicioEvent 
  | StatsEvent 
  | WebSocketEvent;