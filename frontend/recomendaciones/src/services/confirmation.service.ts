/**
 * ConfirmationService.ts - Semana 4
 * Abigail Plua - Servicio centralizado para confirmaciones
 * Sistema de Recomendaciones Turísticas
 */

import { ConfirmationData, ConfirmationAction } from '../components/common/ConfirmationModal';

export interface ConfirmationServiceConfig {
  defaultAutoClose?: number;
  maxConcurrentModals?: number;
  persistToLocalStorage?: boolean;
}

class ConfirmationServiceClass {
  private listeners: Set<(confirmation: ConfirmationData | null) => void> = new Set();
  private currentConfirmations: ConfirmationData[] = [];
  private config: ConfirmationServiceConfig = {
    defaultAutoClose: 5,
    maxConcurrentModals: 3,
    persistToLocalStorage: true
  };

  constructor(config?: Partial<ConfirmationServiceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Restaurar confirmaciones del localStorage si está habilitado
    if (this.config.persistToLocalStorage) {
      this.loadFromLocalStorage();
    }
  }

  // Configurar el servicio
  configure(config: Partial<ConfirmationServiceConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Subscribirse a cambios de confirmaciones
  subscribe(listener: (confirmation: ConfirmationData | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notificar a todos los listeners
  private notify(confirmation: ConfirmationData | null) {
    this.listeners.forEach(listener => listener(confirmation));
  }

  // Mostrar confirmación de pago
  showPaymentConfirmation(data: {
    payment_id: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed';
    item_name: string;
    item_type: 'tour' | 'servicio';
  }) {
    const confirmation: ConfirmationData = {
      id: `payment_${data.payment_id}`,
      type: 'payment',
      title: data.status === 'success' ? '✅ Pago Confirmado' : '❌ Error en Pago',
      message: data.status === 'success' 
        ? `Tu pago de $${(data.amount / 100).toFixed(2)} ${data.currency} por "${data.item_name}" ha sido procesado exitosamente.`
        : `Hubo un error procesando tu pago de $${(data.amount / 100).toFixed(2)} ${data.currency} por "${data.item_name}". Por favor intenta nuevamente.`,
      details: {
        'ID de Pago': data.payment_id,
        'Monto': `$${(data.amount / 100).toFixed(2)} ${data.currency}`,
        'Artículo': data.item_name,
        'Tipo': data.item_type,
        'Estado': data.status,
        'Fecha': new Date().toLocaleString()
      },
      timestamp: new Date(),
      autoClose: data.status === 'success' ? this.config.defaultAutoClose : 0,
      actions: [
        {
          label: data.status === 'success' ? 'Ver Detalles' : 'Reintentar',
          variant: data.status === 'success' ? 'primary' : 'danger',
          onClick: () => {
            if (data.status === 'success') {
              window.open(`/dashboard?tab=${data.item_type === 'tour' ? 'reservas' : 'contrataciones'}`, '_blank');
            } else {
              // Reintentar pago - implementar lógica específica
              console.log('Reintentando pago...', data.payment_id);
            }
          }
        },
        {
          label: 'Cerrar',
          variant: 'secondary',
          onClick: () => this.close(confirmation.id)
        }
      ]
    };

    this.show(confirmation);
  }

  // Mostrar confirmación de tour adquirido
  showTourPurchaseConfirmation(data: {
    tour_id: string;
    tour_name: string;
    amount: number;
    user_id: string;
    partner_notified?: boolean;
  }) {
    const confirmation: ConfirmationData = {
      id: `tour_${data.tour_id}`,
      type: 'tour',
      title: '🎯 Tour Adquirido Exitosamente',
      message: `¡Felicitaciones! Has adquirido "${data.tour_name}" por $${data.amount}. ${data.partner_notified ? 'Se ha notificado al grupo partner para coordinar tu experiencia.' : 'Notificando al partner...'}`,
      details: {
        'Tour ID': data.tour_id,
        'Nombre': data.tour_name,
        'Precio': `$${data.amount}`,
        'Usuario': data.user_id,
        'Partner Notificado': data.partner_notified ? 'Sí' : 'En proceso',
        'Fecha de Compra': new Date().toLocaleString()
      },
      timestamp: new Date(),
      autoClose: this.config.defaultAutoClose,
      actions: [
        {
          label: 'Ver Mis Reservas',
          variant: 'primary',
          onClick: () => {
            window.open('/dashboard?tab=reservas', '_blank');
          }
        },
        {
          label: 'Compartir',
          variant: 'secondary',
          onClick: () => {
            if (navigator.share) {
              navigator.share({
                title: `Tour ${data.tour_name}`,
                text: `¡Acabo de reservar ${data.tour_name}!`,
                url: window.location.href
              });
            }
          }
        }
      ]
    };

    this.show(confirmation);
  }

  // Mostrar confirmación de reserva del partner
  showPartnerReservationConfirmation(data: {
    reservation_id: string;
    partner_id: string;
    status: string;
    details?: any;
  }) {
    const confirmation: ConfirmationData = {
      id: `reservation_${data.reservation_id}`,
      type: 'partner',
      title: '🏨 Reserva Confirmada por Partner',
      message: `¡Excelente! El grupo ${data.partner_id} ha confirmado tu reserva. Tu itinerario turístico está completo y listo para disfrutar.`,
      details: {
        'ID de Reserva': data.reservation_id,
        'Partner': data.partner_id,
        'Estado': data.status,
        'Confirmado': new Date().toLocaleString(),
        ...(data.details && Object.keys(data.details).length > 0 ? data.details : {})
      },
      timestamp: new Date(),
      autoClose: this.config.defaultAutoClose,
      actions: [
        {
          label: 'Ver Itinerario Completo',
          variant: 'primary',
          onClick: () => {
            window.open(`/dashboard?tab=reservas&id=${data.reservation_id}`, '_blank');
          }
        },
        {
          label: 'Contactar Partner',
          variant: 'secondary',
          onClick: () => {
            // Implementar lógica de contacto
            console.log('Contactando partner:', data.partner_id);
          }
        }
      ]
    };

    this.show(confirmation);
  }

  // Mostrar notificación de sistema
  showSystemNotification(data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'error';
    autoClose?: number;
    actions?: ConfirmationAction[];
  }) {
    const confirmation: ConfirmationData = {
      id: `system_${Date.now()}`,
      type: data.type,
      title: data.title,
      message: data.message,
      timestamp: new Date(),
      autoClose: data.autoClose ?? (data.type === 'error' ? 0 : this.config.defaultAutoClose),
      actions: data.actions || [{
        label: 'Entendido',
        variant: 'primary',
        onClick: () => this.close(confirmation.id)
      }]
    };

    this.show(confirmation);
  }

  // Mostrar confirmación genérica
  show(confirmation: ConfirmationData) {
    // Limitar el número de modales concurrentes
    if (this.currentConfirmations.length >= (this.config.maxConcurrentModals || 3)) {
      // Remover la confirmación más antigua
      this.currentConfirmations.shift();
    }

    this.currentConfirmations.push(confirmation);
    this.notify(confirmation);

    // Guardar en localStorage si está habilitado
    if (this.config.persistToLocalStorage) {
      this.saveToLocalStorage();
    }

    console.log('📋 [ConfirmationService] Mostrando confirmación:', confirmation);
  }

  // Cerrar confirmación específica
  close(confirmationId: string) {
    this.currentConfirmations = this.currentConfirmations.filter(c => c.id !== confirmationId);
    this.notify(null);
    
    if (this.config.persistToLocalStorage) {
      this.saveToLocalStorage();
    }

    console.log('📋 [ConfirmationService] Cerrando confirmación:', confirmationId);
  }

  // Cerrar todas las confirmaciones
  closeAll() {
    this.currentConfirmations = [];
    this.notify(null);
    
    if (this.config.persistToLocalStorage) {
      this.saveToLocalStorage();
    }
  }

  // Obtener confirmación actual (la más reciente)
  getCurrentConfirmation(): ConfirmationData | null {
    return this.currentConfirmations[this.currentConfirmations.length - 1] || null;
  }

  // Obtener todas las confirmaciones
  getAllConfirmations(): ConfirmationData[] {
    return [...this.currentConfirmations];
  }

  // Guardar en localStorage
  private saveToLocalStorage() {
    try {
      const data = {
        confirmations: this.currentConfirmations,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('tourist_confirmations', JSON.stringify(data));
    } catch (error) {
      console.warn('No se pudo guardar confirmaciones en localStorage:', error);
    }
  }

  // Cargar desde localStorage
  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('tourist_confirmations');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Solo restaurar si no han pasado más de 24 horas
        const storedTime = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - storedTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          this.currentConfirmations = data.confirmations.map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp)
          }));
        } else {
          localStorage.removeItem('tourist_confirmations');
        }
      }
    } catch (error) {
      console.warn('No se pudo cargar confirmaciones desde localStorage:', error);
      localStorage.removeItem('tourist_confirmations');
    }
  }

  // Limpiar localStorage
  clearStorage() {
    localStorage.removeItem('tourist_confirmations');
  }
}

// Instancia singleton
export const confirmationService = new ConfirmationServiceClass({
  defaultAutoClose: 5,
  maxConcurrentModals: 2,
  persistToLocalStorage: true
});

export default confirmationService;