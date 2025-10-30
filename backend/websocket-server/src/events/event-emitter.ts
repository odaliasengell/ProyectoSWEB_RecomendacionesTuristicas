import { Server } from 'socket.io';
import { RoomManager } from '../utils/room-manager';

export class EventEmitter {
  private io: Server;
  private roomManager: RoomManager;

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  // Emitir evento a todos los clientes conectados
  emit(event: string, data: any, room?: string) {
    const payload = {
      ...data,
      timestamp: new Date().toISOString()
    };

    if (room) {
      // Emitir solo a una sala específica
      this.io.to(room).emit(event, payload);
      console.log(`📡 Evento '${event}' emitido a sala '${room}'`);
    } else {
      // Emitir a todos los clientes
      this.io.emit(event, payload);
      console.log(`📡 Evento '${event}' emitido a todos los clientes`);
    }
  }

  // Eventos específicos del sistema

  // ==================== RESERVAS ====================
  
  // Nueva reserva creada
  emitNuevaReserva(data: {
    id_reserva: number;
    id_tour: number;
    tour_nombre: string;
    id_usuario: number;
    usuario_nombre: string;
    cantidad_personas: number;
    precio_total: number;
  }) {
    const mensaje = `${data.usuario_nombre} ha reservado el tour "${data.tour_nombre}" para ${data.cantidad_personas} persona(s)`;
    
    this.emit('nueva_reserva', {
      ...data,
      mensaje,
      tipo: 'reserva',
      accion: 'creada'
    }, 'dashboard');
    
    console.log(`🎫 Nueva reserva: ${mensaje}`);
  }

  // Reserva actualizada
  emitReservaActualizada(data: {
    id_reserva: number;
    estado: string;
    usuario_nombre?: string;
    tour_nombre?: string;
  }) {
    const mensaje = data.usuario_nombre && data.tour_nombre 
      ? `La reserva #${data.id_reserva} de ${data.usuario_nombre} para "${data.tour_nombre}" cambió a ${data.estado}`
      : `La reserva #${data.id_reserva} cambió a estado: ${data.estado}`;
    
    this.emit('reserva_actualizada', {
      ...data,
      mensaje,
      tipo: 'reserva',
      accion: 'actualizada'
    }, 'dashboard');
    
    console.log(`✏️ Reserva actualizada: ${mensaje}`);
  }

  // ==================== CONTRATACIONES ====================
  
  // Nueva contratación creada
  emitNuevaContratacion(data: {
    id_contratacion: string;
    id_servicio: string;
    servicio_nombre: string;
    id_usuario: string;
    usuario_nombre: string;
    fecha_contratacion: string;
    precio?: number;
  }) {
    const mensaje = `${data.usuario_nombre} ha contratado el servicio "${data.servicio_nombre}"`;
    
    this.emit('nueva_contratacion', {
      ...data,
      mensaje,
      tipo: 'contratacion',
      accion: 'creada'
    }, 'dashboard');
    
    console.log(`📝 Nueva contratación: ${mensaje}`);
  }

  // Contratación actualizada
  emitContratacionActualizada(data: {
    id_contratacion: string;
    estado: string;
    usuario_nombre?: string;
    servicio_nombre?: string;
  }) {
    const mensaje = data.usuario_nombre && data.servicio_nombre
      ? `La contratación de ${data.usuario_nombre} para "${data.servicio_nombre}" cambió a ${data.estado}`
      : `La contratación cambió a estado: ${data.estado}`;
    
    this.emit('contratacion_actualizada', {
      ...data,
      mensaje,
      tipo: 'contratacion',
      accion: 'actualizada'
    }, 'dashboard');
    
    console.log(`✏️ Contratación actualizada: ${mensaje}`);
  }

  // ==================== RECOMENDACIONES ====================
  
  // Nueva recomendación creada
  emitNuevaRecomendacion(data: {
    id_recomendacion: string;
    id_tour: number;
    tour_nombre: string;
    id_usuario: string;
    usuario_nombre: string;
    comentario: string;
    calificacion: number;
  }) {
    const mensaje = `${data.usuario_nombre} ha dejado una recomendación (${data.calificacion}⭐) para "${data.tour_nombre}"`;
    
    this.emit('nueva_recomendacion', {
      ...data,
      mensaje,
      tipo: 'recomendacion',
      accion: 'creada'
    }, 'dashboard');
    
    console.log(`⭐ Nueva recomendación: ${mensaje}`);
  }

  // Recomendación actualizada
  emitRecomendacionActualizada(data: {
    id_recomendacion: string;
    calificacion?: number;
    usuario_nombre?: string;
    tour_nombre?: string;
  }) {
    const mensaje = data.usuario_nombre && data.tour_nombre
      ? `La recomendación de ${data.usuario_nombre} para "${data.tour_nombre}" ha sido actualizada`
      : `La recomendación ha sido actualizada`;
    
    this.emit('recomendacion_actualizada', {
      ...data,
      mensaje,
      tipo: 'recomendacion',
      accion: 'actualizada'
    }, 'dashboard');
    
    console.log(`✏️ Recomendación actualizada: ${mensaje}`);
  }

  // ==================== TOURS ====================

  // ==================== TOURS ====================

  // Tour creado/actualizado
  emitTourActualizado(data: {
    id_tour: number;
    nombre: string;
    accion: 'creado' | 'actualizado' | 'eliminado';
  }) {
    const acciones = {
      creado: 'ha sido creado',
      actualizado: 'ha sido actualizado',
      eliminado: 'ha sido eliminado'
    };
    
    const mensaje = `El tour "${data.nombre}" ${acciones[data.accion]}`;
    
    this.emit('tour_actualizado', {
      ...data,
      mensaje,
      tipo: 'tour'
    }, 'dashboard');
    
    console.log(`🗺️ Tour ${data.accion}: ${data.nombre}`);
  }

  // ==================== GUÍAS ====================

  // Guía cambió disponibilidad
  emitGuiaDisponibilidad(data: {
    id_guia: number;
    nombre: string;
    disponible: boolean;
  }) {
    const mensaje = `El guía ${data.nombre} ahora está ${data.disponible ? 'disponible' : 'no disponible'}`;
    
    this.emit('guia_disponible', {
      ...data,
      mensaje,
      tipo: 'guia'
    }, 'dashboard');
    
    console.log(`👨‍🏫 Guía ${data.disponible ? 'disponible' : 'no disponible'}: ${data.nombre}`);
  }

  // ==================== USUARIOS ====================

  // Nuevo usuario registrado (NO creado, solo cuando se registra)
  emitUsuarioRegistrado(data: {
    id_usuario: string;
    nombre: string;
    apellido: string;
    email: string;
  }) {
    const nombreCompleto = `${data.nombre} ${data.apellido}`;
    const mensaje = `${nombreCompleto} se ha registrado en la plataforma`;
    
    this.emit('usuario_registrado', {
      ...data,
      mensaje,
      tipo: 'usuario',
      accion: 'registrado'
    }, 'dashboard');
    
    console.log(`👤 Nuevo usuario registrado: ${nombreCompleto} (${data.email})`);
  }

  // ==================== DESTINOS ====================

  // ==================== DESTINOS ====================

  // Nuevo destino agregado
  emitNuevoDestino(data: {
    id_destino: number;
    nombre: string;
    ubicacion: string;
  }) {
    const mensaje = `Nuevo destino agregado: ${data.nombre} (${data.ubicacion})`;
    
    this.emit('nuevo_destino', {
      ...data,
      mensaje,
      tipo: 'destino',
      accion: 'creado'
    }, 'dashboard');
    
    console.log(`🌎 ${mensaje}`);
  }

  // ==================== SERVICIOS ====================

  // Servicio contratado (DEPRECATED - usar emitNuevaContratacion)
  emitServicioContratado(data: {
    id_contratacion: number;
    id_servicio: number;
    servicio_nombre: string;
    id_usuario: number;
  }) {
    this.emit('servicio_contratado', data, 'dashboard');
  }

  // ==================== NOTIFICACIONES GENERALES ====================

  // Notificación general
  emitNotificacion(data: {
    tipo: 'info' | 'success' | 'warning' | 'error';
    titulo: string;
    mensaje: string;
  }) {
    this.emit('notificacion', data);
    console.log(`📢 Notificación [${data.tipo.toUpperCase()}]: ${data.titulo} - ${data.mensaje}`);
  }
}