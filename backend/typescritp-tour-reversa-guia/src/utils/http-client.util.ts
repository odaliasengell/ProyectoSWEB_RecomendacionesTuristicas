import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { config } from '../config/environment';

class HttpClient {
  private pythonClient: AxiosInstance;
  private golangClient: AxiosInstance;

  constructor() {
    this.pythonClient = axios.create({
      baseURL: config.services.pythonApi,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.golangClient = axios.create({
      baseURL: config.services.golangApi,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Métodos para llamar al servicio Python
  async validateUser(userId: number, token: string) {
    try {
      const response = await this.pythonClient.get(`/api/usuarios/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error validando usuario:', error.message);
      return null;
    }
  }



  // Notificar al WebSocket
  async notifyWebSocket(event: string, data: any) {
    try {
      await axios.post(`${config.services.websocketUrl}/notify`, {
        event,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error notificando WebSocket:', error.message);
    }
  }
}

export const httpClient = new HttpClient();