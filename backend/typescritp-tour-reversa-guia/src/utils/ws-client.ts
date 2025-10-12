import axios from 'axios';
import { config } from '../config/environment';

class WebSocketClient {
  private websocketUrl: string;

  constructor() {
    this.websocketUrl = config.services.websocketUrl || 'http://localhost:8081';
  }

  async notify(event: string, data: any, room: string = 'dashboard'): Promise<void> {
    try {
      await axios.post(`${this.websocketUrl}/notify`, {
        event,
        data,
        room,
        timestamp: new Date().toISOString()
      }, {
        timeout: 5000
      });
      
      console.log(`✅ Evento '${event}' notificado al WebSocket`);
    } catch (error: any) {
      console.error(`❌ Error notificando WebSocket: ${error.message}`);
    }
  }

  // Eventos específicos
  async notifyNuevaReserva(data: {
    id_reserva: number;
    tour_nombre: string;
    usuario_nombre: string;
    cantidad_personas: number;
    precio_total: number;
  }): Promise<void> {
    await this.notify('nueva_reserva', data);
  }

  async notifyTourActualizado(data: {
    id_tour: number;
    nombre: string;
    accion: 'creado' | 'actualizado' | 'eliminado';
  }): Promise<void> {
    await this.notify('tour_actualizado', data);
  }

  async notifyGuiaDisponible(data: {
    id_guia: number;
    nombre: string;
    disponible: boolean;
  }): Promise<void> {
    await this.notify('guia_disponible', data);
  }
}

export const wsClient = new WebSocketClient();