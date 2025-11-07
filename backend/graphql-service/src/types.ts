// ============================================
// 📦 TIPOS Y INTERFACES PARA GraphQL
// Alineados con los modelos del REST API
// ============================================

// 👤 Usuario
export interface Usuario {
  _id: string;
  nombre: string;
  apellido?: string;
  email: string;
  username?: string;
  contrasena: string;
  fecha_nacimiento?: string;
  pais?: string;
  fecha_registro?: string;
}

// 🌍 Destino
export interface Destino {
  _id: string;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  ruta?: string;
  provincia?: string;
  ciudad?: string;
  categoria?: string;
  calificacion_promedio?: number;
  activo?: boolean;
  fecha_creacion?: string;
}

// 🎫 Tour
export interface Tour {
  _id: string;
  nombre: string;
  duracion?: string;
  precio?: number;
  guia_id?: string;
  guia?: Guia;
  destino_id?: string;
  destino?: Destino;
  descripcion?: string;
  capacidad_maxima?: number;
  disponible?: boolean;
  created_at?: string;
}

// 🧑‍✈️ Guía
export interface Guia {
  _id: string;
  id_guia?: number;
  nombre: string;
  email?: string;
  idiomas?: string[];
  experiencia?: string;
  disponible?: boolean;
  calificacion?: number;
  created_at?: string;
}

// 📅 Reserva
export interface Reserva {
  _id: string;
  tour_id?: string;
  tour?: Tour;
  usuario_id?: string;
  usuario?: Usuario;
  fecha_reserva?: string;
  cantidad_personas?: number;
  estado?: string;
}

// 🛎️ Servicio
export interface Servicio {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
  destino?: string;
  duracion_dias?: number;
  capacidad_maxima?: number;
  disponible?: boolean;
  proveedor?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  created_at?: string;
  updated_at?: string;
}

// 🤝 Contratación de Servicio
export interface ContratacionServicio {
  _id: string;
  servicio_id?: string;
  servicio?: Servicio;
  usuario_id?: string;
  usuario?: Usuario;
  fecha_contratacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cantidad_personas?: number;
  total?: number;
  estado?: string;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  notas?: string;
}

// ⭐ Recomendación
export interface Recomendacion {
  _id: string;
  fecha: string;
  calificacion: number;
  comentario: string;
  id_usuario: string;
  usuario?: Usuario;
  id_tour?: string;
  tour?: Tour;
  id_servicio?: string;
  servicio?: Servicio;
  tipo_recomendacion?: string;
  nombre_referencia?: string;
}

// ============================================
// 📊 TIPOS PARA REPORTES
// ============================================

export interface TourMasReservado {
  tour: Tour;
  total_reservas: number;
  total_personas: number;
  ingresos_totales: number;
}

export interface GuiaMasActivo {
  guia: Guia;
  total_tours: number;
  total_reservas: number;
  calificacion_promedio: number;
}

export interface UsuarioMasActivo {
  usuario: Usuario;
  total_reservas: number;
  total_gastado: number;
  total_recomendaciones: number;
}

export interface ReservasPorMes {
  mes: string;
  anio: number;
  total_reservas: number;
  total_ingresos: number;
}

export interface DestinoMasPopular {
  destino: Destino;
  total_tours: number;
  total_reservas: number;
  calificacion_promedio: number;
}

export interface EstadisticaGeneral {
  total_usuarios: number;
  total_destinos: number;
  total_tours: number;
  total_guias: number;
  total_reservas: number;
  total_ingresos: number;
  reservas_pendientes: number;
  reservas_confirmadas: number;
  reservas_completadas: number;
  reservas_canceladas: number;
}

export interface ServicioMasContratado {
  servicio: Servicio;
  total_contrataciones: number;
  total_ingresos: number;
}

export interface RecomendacionMejorCalificada {
  recomendacion: Recomendacion;
  tour?: Tour | null;
  servicio?: Servicio | null;
  usuario: Usuario;
}

export interface ContratacionPorMes {
  mes: string;
  anio: number;
  total_contrataciones: number;
  total_ingresos: number;
}
