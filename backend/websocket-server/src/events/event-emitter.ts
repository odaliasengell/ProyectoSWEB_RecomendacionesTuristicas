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
    this.emit('nueva_reserva', data, 'dashboard');
  }

  // Reserva actualizada
  emitReservaActualizada(data: {
    id_reserva: number;
    estado: string;
    mensaje: string;
  }) {
    this.emit('reserva_actualizada', data, 'dashboard');
  }

  // Tour creado/actualizado
  emitTourActualizado(data: {
    id_tour: number;
    nombre: string;
    accion: 'creado' | 'actualizado' | 'eliminado';
  }) {
    this.emit('tour_actualizado', data, 'dashboard');
  }

  // Guía cambió disponibilidad
  emitGuiaDisponibilidad(data: {
    id_guia: number;
    nombre: string;
    disponible: boolean;
  }) {
    this.emit('guia_disponible', data, 'dashboard');
  }

  // Nuevo usuario registrado
  emitNuevoUsuario(data: {
    id_usuario: number;
    nombre: string;
    email: string;
  }) {
    this.emit('nuevo_usuario', data, 'dashboard');
  }

  // Nuevo destino agregado
  emitNuevoDestino(data: {
    id_destino: number;
    nombre: string;
    ubicacion: string;
  }) {
    this.emit('nuevo_destino', data, 'dashboard');
  }

  // Servicio contratado
  emitServicioContratado(data: {
    id_contratacion: number;
    id_servicio: number;
    servicio_nombre: string;
    id_usuario: number;
  }) {
    this.emit('servicio_contratado', data, 'dashboard');
  }

  // Notificación general
  emitNotificacion(data: {
    tipo: 'info' | 'success' | 'warning' | 'error';
    titulo: string;
    mensaje: string;
  }) {
    this.emit('notificacion', data);
  }
}