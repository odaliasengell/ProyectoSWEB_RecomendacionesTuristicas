export class RoomManager {
  private connections: Set<string>;
  private rooms: Map<string, Set<string>>;

  constructor() {
    this.connections = new Set();
    this.rooms = new Map();
  }

  // Agregar conexión
  addConnection(socketId: string) {
    this.connections.add(socketId);
  }

  // Remover conexión
  removeConnection(socketId: string) {
    this.connections.delete(socketId);
    
    // Remover de todas las salas
    this.rooms.forEach((clients, room) => {
      clients.delete(socketId);
    });
  }

  // Agregar cliente a una sala
  addToRoom(socketId: string, room: string) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(socketId);
  }

  // Remover cliente de una sala
  removeFromRoom(socketId: string, room: string) {
    const roomClients = this.rooms.get(room);
    if (roomClients) {
      roomClients.delete(socketId);
      
      // Si la sala está vacía, eliminarla
      if (roomClients.size === 0) {
        this.rooms.delete(room);
      }
    }
  }

  // Obtener total de conexiones
  getTotalConnections(): number {
    return this.connections.size;
  }

  // Obtener clientes en una sala
  getRoomClients(room: string): string[] {
    const clients = this.rooms.get(room);
    return clients ? Array.from(clients) : [];
  }

  // Obtener todas las salas
  getAllRooms(): { [key: string]: number } {
    const roomsInfo: { [key: string]: number } = {};
    
    this.rooms.forEach((clients, room) => {
      roomsInfo[room] = clients.size;
    });
    
    return roomsInfo;
  }

  // Verificar si un socket está en una sala
  isInRoom(socketId: string, room: string): boolean {
    const roomClients = this.rooms.get(room);
    return roomClients ? roomClients.has(socketId) : false;
  }
}