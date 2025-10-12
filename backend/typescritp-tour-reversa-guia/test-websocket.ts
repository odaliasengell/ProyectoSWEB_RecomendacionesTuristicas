import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const WEBSOCKET_URL = 'http://localhost:8081';

// Cliente Socket.IO para escuchar eventos en tiempo real
class WebSocketTestClient {
  private socket: Socket | null = null;
  private eventsReceived: { event: string; data: any }[] = [];

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Conectando al servidor WebSocket en ${WEBSOCKET_URL}...`);
      
      this.socket = io(WEBSOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      // Evento: Conexión establecida
      this.socket.on('connect', () => {
        console.log(`✅ Conectado con socket ID: ${this.socket?.id}`);
        resolve();
      });

      // Evento: Mensaje de bienvenida
      this.socket.on('welcome', (data) => {
        console.log('📩 Bienvenida recibida:', data);
      });

      // Evento: Se unió a una sala
      this.socket.on('room_joined', (data) => {
        console.log('📥 Se unió a sala:', data);
      });

      // Evento: Abandonó una sala
      this.socket.on('room_left', (data) => {
        console.log('📤 Abandonó sala:', data);
      });

      // Escuchar eventos específicos del sistema
      this.socket.on('nueva_reserva', (data) => {
        console.log('🎉 EVENTO: nueva_reserva recibido:', data);
        this.eventsReceived.push({ event: 'nueva_reserva', data });
      });

      this.socket.on('tour_actualizado', (data) => {
        console.log('🎉 EVENTO: tour_actualizado recibido:', data);
        this.eventsReceived.push({ event: 'tour_actualizado', data });
      });

      this.socket.on('guia_disponible', (data) => {
        console.log('🎉 EVENTO: guia_disponible recibido:', data);
        this.eventsReceived.push({ event: 'guia_disponible', data });
      });

      this.socket.on('reserva_actualizada', (data) => {
        console.log('🎉 EVENTO: reserva_actualizada recibido:', data);
        this.eventsReceived.push({ event: 'reserva_actualizada', data });
      });

      this.socket.on('servicio_contratado', (data) => {
        console.log('🎉 EVENTO: servicio_contratado recibido:', data);
        this.eventsReceived.push({ event: 'servicio_contratado', data });
      });

      this.socket.on('notificacion', (data) => {
        console.log('🎉 EVENTO: notificacion recibido:', data);
        this.eventsReceived.push({ event: 'notificacion', data });
      });

      // Evento: Error de conexión
      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión:', error.message);
        reject(error);
      });

      // Evento: Desconexión
      this.socket.on('disconnect', (reason) => {
        console.log(`❌ Desconectado: ${reason}`);
      });

      // Timeout de conexión
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('Timeout: No se pudo conectar al servidor'));
        }
      }, 5000);
    });
  }

  joinRoom(room: string): void {
    if (!this.socket?.connected) {
      console.error('❌ No hay conexión activa');
      return;
    }
    console.log(`📥 Uniéndose a la sala: ${room}`);
    this.socket.emit('join_room', room);
  }

  leaveRoom(room: string): void {
    if (!this.socket?.connected) {
      console.error('❌ No hay conexión activa');
      return;
    }
    console.log(`📤 Abandonando la sala: ${room}`);
    this.socket.emit('leave_room', room);
  }

  ping(): void {
    if (!this.socket?.connected) {
      console.error('❌ No hay conexión activa');
      return;
    }
    console.log('🏓 Enviando ping...');
    this.socket.emit('ping');
    this.socket.once('pong', (data) => {
      console.log('🏓 Pong recibido:', data);
    });
  }

  getStatus(): void {
    if (!this.socket?.connected) {
      console.error('❌ No hay conexión activa');
      return;
    }
    console.log('📊 Solicitando estado del servidor...');
    this.socket.emit('get_status');
    this.socket.once('server_status', (data) => {
      console.log('📊 Estado del servidor:', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Desconectando...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getEventsReceived() {
    return this.eventsReceived;
  }
}

// Función para enviar eventos vía REST /notify
async function sendNotifyEvent(event: string, data: any, room: string = 'dashboard') {
  try {
    console.log(`📡 Enviando evento '${event}' vía POST /notify...`);
    const response = await axios.post(`${WEBSOCKET_URL}/notify`, {
      event,
      data,
      room,
    });
    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error enviando evento:', error.message);
    throw error;
  }
}

// Función principal de pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas del WebSocket Server\n');
  
  const client = new WebSocketTestClient();

  try {
    // 1. Conectar al servidor
    await client.connect();
    console.log('');

    // 2. Unirse a la sala 'dashboard'
    client.joinRoom('dashboard');
    await sleep(1000);
    console.log('');

    // 3. Solicitar estado del servidor
    client.getStatus();
    await sleep(1000);
    console.log('');

    // 4. Hacer ping/pong
    client.ping();
    await sleep(1000);
    console.log('');

    // 5. Enviar eventos de prueba vía REST /notify
    console.log('📡 PRUEBA 1: Enviar evento nueva_reserva');
    await sendNotifyEvent('nueva_reserva', {
      id_reserva: 100,
      id_tour: 5,
      tour_nombre: 'Tour Galápagos',
      id_usuario: 10,
      usuario_nombre: 'Juan Pérez',
      cantidad_personas: 2,
      precio_total: 500.00,
    });
    await sleep(1500);
    console.log('');

    console.log('📡 PRUEBA 2: Enviar evento tour_actualizado');
    await sendNotifyEvent('tour_actualizado', {
      id_tour: 5,
      nombre: 'Tour Galápagos Actualizado',
      accion: 'actualizado',
    });
    await sleep(1500);
    console.log('');

    console.log('📡 PRUEBA 3: Enviar evento guia_disponible');
    await sendNotifyEvent('guia_disponible', {
      id_guia: 3,
      nombre: 'María González',
      disponible: true,
    });
    await sleep(1500);
    console.log('');

    console.log('📡 PRUEBA 4: Enviar notificación general');
    await sendNotifyEvent('notificacion', {
      tipo: 'success',
      titulo: 'Prueba exitosa',
      mensaje: 'El sistema de notificaciones funciona correctamente',
    }, undefined as any); // Sin sala específica, broadcast a todos
    await sleep(1500);
    console.log('');

    // 6. Abandonar sala
    client.leaveRoom('dashboard');
    await sleep(1000);
    console.log('');

    // 7. Resumen de eventos recibidos
    const events = client.getEventsReceived();
    console.log('📊 RESUMEN DE EVENTOS RECIBIDOS:');
    console.log(`Total de eventos: ${events.length}`);
    events.forEach((e, idx) => {
      console.log(`  ${idx + 1}. ${e.event}`);
    });
    console.log('');

    // 8. Desconectar
    client.disconnect();
    await sleep(500);

    console.log('✅ Pruebas completadas exitosamente\n');
    
    if (events.length === 0) {
      console.warn('⚠️  ADVERTENCIA: No se recibieron eventos. Verifica:');
      console.warn('   - Que el servidor WebSocket esté corriendo en http://localhost:8081');
      console.warn('   - Que no haya problemas de CORS');
      console.warn('   - Que los eventos estén siendo emitidos correctamente');
    }

    // Finalizar exitosamente
  } catch (error: any) {
    console.error('❌ Error durante las pruebas:', error.message);
    client.disconnect();
    throw error; // Re-lanzar error para que el script termine con código de error
  }
}

// Utilidad para esperar
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar pruebas
runTests();
