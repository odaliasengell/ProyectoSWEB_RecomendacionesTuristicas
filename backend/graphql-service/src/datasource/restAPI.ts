// ============================================
// 🔌 DATASOURCE: Conexión con REST API
// ============================================

import axios from 'axios';
import {
  Usuario,
  Destino,
  Tour,
  Guia,
  Reserva,
  Servicio,
  ContratacionServicio,
  Recomendacion,
} from '../types';

// Helper para convertir 'id' a '_id' (REST API usa 'id', GraphQL usa '_id')
function mapIdToUnderscore<T extends { id?: string; _id?: string }>(
  item: T,
): T {
  if (!item) return item;

  if (item.id && !item._id) {
    return { ...item, _id: item.id };
  }
  return item;
}

function mapArrayIds<T extends { id?: string; _id?: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.map(mapIdToUnderscore);
}

export class RestAPIDataSource {
  private client: any;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ============================================
  // 👤 USUARIOS
  // ============================================
  async getAllUsuarios(): Promise<Usuario[]> {
    try {
      const response = await this.client.get('/usuarios/');
      return mapArrayIds(response.data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      return [];
    }
  }

  async getUsuarioById(id: string): Promise<Usuario | null> {
    try {
      const response = await this.client.get(`/usuarios/${id}`);
      return mapIdToUnderscore(response.data);
    } catch (error) {
      console.error(`Error fetching usuario ${id}:`, error);
      return null;
    }
  }

  // ============================================
  // 🌍 DESTINOS
  // ============================================
  async getAllDestinos(): Promise<Destino[]> {
    try {
      const response = await this.client.get('/destinos/');
      return mapArrayIds(response.data);
    } catch (error) {
      console.error('Error fetching destinos:', error);
      return [];
    }
  }

  async getDestinoById(id: string): Promise<Destino | null> {
    try {
      const response = await this.client.get(`/destinos/${id}`);
      return mapIdToUnderscore(response.data);
    } catch (error) {
      console.error(`Error fetching destino ${id}:`, error);
      return null;
    }
  }

  // ============================================
  // 🎫 TOURS
  // ============================================
  async getAllTours(): Promise<Tour[]> {
    try {
      const response = await this.client.get('/tours/');
      return mapArrayIds(response.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
      return [];
    }
  }

  async getTourById(id: string): Promise<Tour | null> {
    try {
      const response = await this.client.get(`/tours/${id}`);
      return mapIdToUnderscore(response.data);
    } catch (error) {
      console.error(`Error fetching tour ${id}:`, error);
      return null;
    }
  }

  // ============================================
  // 🧑‍✈️ GUÍAS
  // ============================================
  async getAllGuias(): Promise<Guia[]> {
    try {
      const response = await this.client.get('/guias/');
      return mapArrayIds(response.data);
    } catch (error) {
      console.error('Error fetching guias:', error);
      return [];
    }
  }

  async getGuiaById(id: string): Promise<Guia | null> {
    try {
      const response = await this.client.get(`/guias/${id}`);
      return mapIdToUnderscore(response.data);
    } catch (error) {
      console.error(`Error fetching guia ${id}:`, error);
      return null;
    }
  }

  // ============================================
  // 📅 RESERVAS
  // ============================================
  async getAllReservas(): Promise<Reserva[]> {
    try {
      const response = await this.client.get('/reservas/');
      return mapArrayIds(response.data);
    } catch (error) {
      console.error('Error fetching reservas:', error);
      return [];
    }
  }

  async getReservaById(id: string): Promise<Reserva | null> {
    try {
      const response = await this.client.get(`/reservas/${id}`);
      return mapIdToUnderscore(response.data);
    } catch (error) {
      console.error(`Error fetching reserva ${id}:`, error);
      return null;
    }
  }

  async getReservasByUsuario(usuarioId: string): Promise<Reserva[]> {
    try {
      const response = await this.client.get(`/reservas/usuario/${usuarioId}`);
      return mapArrayIds(response.data);
    } catch (error) {
      console.error(`Error fetching reservas for usuario ${usuarioId}:`, error);
      return [];
    }
  }

  async getReservasByTour(tourId: string): Promise<Reserva[]> {
    try {
      const response = await this.client.get(`/reservas/tour/${tourId}`);
      return mapArrayIds(response.data);
    } catch (error) {
      console.error(`Error fetching reservas for tour ${tourId}:`, error);
      return [];
    }
  }

  // ============================================
  // 🛎️ SERVICIOS
  // ============================================
  async getAllServicios(): Promise<Servicio[]> {
    try {
      const response = await this.client.get('/servicios/');
      return mapArrayIds(response.data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
      return [];
    }
  }

  async getServicioById(id: string): Promise<Servicio | null> {
    try {
      const response = await this.client.get(`/servicios/${id}`);
      return mapIdToUnderscore(response.data);
    } catch (error) {
      console.error(`Error fetching servicio ${id}:`, error);
      return null;
    }
  }

  // ============================================
  // 🤝 CONTRATACIONES
  // ============================================
  async getAllContrataciones(): Promise<ContratacionServicio[]> {
    try {
      const response = await this.client.get('/contrataciones/');
      return mapArrayIds(response.data);
    } catch (error) {
      console.error('Error fetching contrataciones:', error);
      return [];
    }
  }

  // ============================================
  // ⭐ RECOMENDACIONES
  // ============================================
  async getAllRecomendaciones(): Promise<Recomendacion[]> {
    try {
      const response = await this.client.get('/recomendaciones/');
      return mapArrayIds(response.data);
    } catch (error) {
      console.error('Error fetching recomendaciones:', error);
      return [];
    }
  }

  async getRecomendacionesByTour(tourId: string): Promise<Recomendacion[]> {
    try {
      const response = await this.client.get(`/recomendaciones/tour/${tourId}`);
      return mapArrayIds(response.data);
    } catch (error) {
      console.error(
        `Error fetching recomendaciones for tour ${tourId}:`,
        error,
      );
      return [];
    }
  }

  async getRecomendacionesByGuia(guiaId: string): Promise<Recomendacion[]> {
    try {
      const response = await this.client.get(`/recomendaciones/guia/${guiaId}`);
      return mapArrayIds(response.data);
    } catch (error) {
      console.error(
        `Error fetching recomendaciones for guia ${guiaId}:`,
        error,
      );
      return [];
    }
  }
}
