/**
 * WebSocket Service para manejo de notificaciones en tiempo real
 * Semana 3 - Abigail Plua
 * Integración con grupo partner (Reservas ULEAM 2025)
 */

export interface WebSocketMessage {
  type: 'payment_confirmation' | 'reservation_update' | 'partner_notification' | 'system_message' | 'tour_purchased' | 'reserva_confirmada';
  data: any;
  timestamp?: string;
  source?: 'partner_group' | 'n8n' | 'system';
}

export interface PartnerMessage {
  event_type: 'tour_purchased' | 'reserva_confirmada' | 'payment_success';
  data: {
    partner_id: string;
    user_id: string;
    tour_id?: string;
    reservation_id?: string;
    amount?: number;
    currency?: string;
    status: string;
    details: any;
  };
  signature?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private isConnecting = false;
  private messageHandlers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();

  constructor(
    private baseUrl: string = 'ws://localhost:8080',
    private token?: string
  ) {}

  // Conectar al WebSocket
  connect(userId?: string): Promise<void> {
    if (this.isConnecting || this.isConnected()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        const wsUrl = this.token 
          ? `${this.baseUrl}?token=${this.token}&user_id=${userId || ''}`
          : this.baseUrl;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('🔌 [WebSocketService] Conectado exitosamente');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Enviar autenticación si tenemos token
          if (this.token && userId) {
            this.sendMessage({
              type: 'system_message',
              data: {
                action: 'auth',
                user_id: userId,
                token: this.token
              }
            });
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('🚨 [WebSocketService] Error parsing message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 [WebSocketService] Desconectado:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          
          // Reconectar automáticamente
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('🚨 [WebSocketService] Error de conexión:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Desconectar WebSocket
  disconnect(): void {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Disconnect requested');
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.messageHandlers.clear();
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Enviar mensaje
  sendMessage(message: WebSocketMessage): boolean {
    if (!this.isConnected()) {
      console.warn('🚨 [WebSocketService] No conectado, no se puede enviar mensaje');
      return false;
    }

    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      this.ws!.send(JSON.stringify(messageWithTimestamp));
      return true;
    } catch (error) {
      console.error('🚨 [WebSocketService] Error enviando mensaje:', error);
      return false;
    }
  }

  // Suscribirse a mensajes de un tipo específico
  subscribe(messageType: string, handler: (message: WebSocketMessage) => void): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);
  }

  // Desuscribirse de mensajes
  unsubscribe(messageType: string, handler: (message: WebSocketMessage) => void): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  // Manejar mensaje recibido
  private handleMessage(message: WebSocketMessage): void {
    console.log('📨 [WebSocketService] Mensaje recibido:', message);

    // Ejecutar handlers específicos del tipo de mensaje
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('🚨 [WebSocketService] Error en handler:', error);
        }
      });
    }

    // Ejecutar handlers universales
    const universalHandlers = this.messageHandlers.get('*');
    if (universalHandlers) {
      universalHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('🚨 [WebSocketService] Error en handler universal:', error);
        }
      });
    }
  }

  // Programar reconexión
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚨 [WebSocketService] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s

    console.log(`🔄 [WebSocketService] Reconectando en ${delay/1000}s (intento ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Métodos helper para tipos de mensaje específicos
  sendTourPurchased(tourData: any): boolean {
    return this.sendMessage({
      type: 'tour_purchased',
      source: 'payment_service',
      data: {
        event_type: 'tour_purchased',
        tour_id: tourData.id,
        user_id: tourData.user_id,
        amount: tourData.amount,
        currency: tourData.currency,
        status: 'confirmed',
        details: tourData
      }
    });
  }

  sendPaymentConfirmation(paymentData: any): boolean {
    return this.sendMessage({
      type: 'payment_confirmation',
      source: 'payment_service',
      data: {
        payment_id: paymentData.id,
        amount: paymentData.amount,
        status: paymentData.status,
        item_name: paymentData.item_name,
        user_id: paymentData.user_id
      }
    });
  }
}

// Instancia singleton para uso global
export const webSocketService = new WebSocketService();