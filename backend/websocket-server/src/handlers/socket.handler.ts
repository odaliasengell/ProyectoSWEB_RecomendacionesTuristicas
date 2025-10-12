import { Server, Socket } from 'socket.io';
import { RoomManager } from '../utils/room-manager';
import { EventEmitter } from '../events/event-emitter';

export class SocketHandler {
  private io: Server;
  private roomManager: RoomManager;
  private eventEmitter: EventEmitter;

  constructor(io: Server, roomManager: RoomManager, eventEmitter: EventEmitter) {
    this.io = io;
    this.roomManager = roomManager;
    this.eventEmitter = eventEmitter;
  }

  initialize() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`✅ Cliente conectado: ${socket.id}`);
      this.roomManager.addConnection(socket.id);

      // Evento: Cliente se une a una sala
      socket.on('join_room', (room: string) => {
        socket.join(room);
        this.roomManager.addToRoom(socket.id, room);
        console.log(`📥 Cliente ${socket.id} se unió a la sala: ${room}`);

        socket.emit('room_joined', {
          room,
          message: `Te uniste a la sala ${room}`,
          timestamp: new Date().toISOString()
        });
      });

      // Evento: Cliente abandona una sala
      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        this.roomManager.removeFromRoom(socket.id, room);
        console.log(`📤 Cliente ${socket.id} abandonó la sala: ${room}`);

        socket.emit('room_left', {
          room,
          message: `Abandonaste la sala ${room}`,
          timestamp: new Date().toISOString()
        });
      });

      // Evento: Ping/Pong para keep-alive
      socket.on('ping', () => {
        socket.emit('pong', {
          timestamp: new Date().toISOString()
        });
      });

      // Evento: Cliente solicita estado del servidor
      socket.on('get_status', () => {
        socket.emit('server_status', {
          total_connections: this.roomManager.getTotalConnections(),
          rooms: this.roomManager.getAllRooms(),
          timestamp: new Date().toISOString()
        });
      });

      // Evento: Desconexión
      socket.on('disconnect', (reason) => {
        console.log(`❌ Cliente desconectado: ${socket.id} - Razón: ${reason}`);
        this.roomManager.removeConnection(socket.id);
      });

      // Enviar mensaje de bienvenida
      socket.emit('welcome', {
        message: 'Conectado al servidor WebSocket',
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });
  }
}