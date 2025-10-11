import axios, { AxiosInstance } from 'axios';

export class TypeScriptAPI {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Tours
  async getTours() {
    try {
      const response = await this.client.get('/api/tours');
      return response.data.data || []; // Extraer el array del objeto { success, message, data }
    } catch (error) {
      console.error('Error fetching tours:', error);
      throw new Error('No se pudieron obtener los tours');
    }
  }

  async getTourById(id: string) {
    try {
      const response = await this.client.get(`/api/tours/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching tour ${id}:`, error);
      return null;
    }
  }

  async getToursByCategory(categoria: string) {
    try {
      const response = await this.client.get(`/api/tours/categoria/${categoria}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching tours by category ${categoria}:`, error);
      return [];
    }
  }

  async getToursDisponibles() {
    try {
      const response = await this.client.get('/api/tours/disponibles');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching available tours:', error);
      return [];
    }
  }

  async createTour(tourData: any) {
    try {
      const response = await this.client.post('/api/tours', tourData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating tour:', error);
      throw new Error('No se pudo crear el tour');
    }
  }

  async updateTour(id: string, tourData: any) {
    try {
      const response = await this.client.put(`/api/tours/${id}`, tourData);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating tour ${id}:`, error);
      throw new Error('No se pudo actualizar el tour');
    }
  }

  async deleteTour(id: string) {
    try {
      await this.client.delete(`/api/tours/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting tour ${id}:`, error);
      return false;
    }
  }

  // Guías
  async getGuias() {
    try {
      const response = await this.client.get('/api/guias');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching guias:', error);
      return [];
    }
  }

  async getGuiaById(id: string) {
    try {
      const response = await this.client.get(`/api/guias/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching guia ${id}:`, error);
      return null;
    }
  }

  // Reservas
  async getReservas() {
    try {
      const response = await this.client.get('/api/reservas');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching reservas:', error);
      return [];
    }
  }

  async getReservaById(id: string) {
    try {
      const response = await this.client.get(`/api/reservas/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching reserva ${id}:`, error);
      return null;
    }
  }

  async getReservasByTour(tourId: string) {
    try {
      const response = await this.client.get(`/api/reservas/tour/${tourId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching reservas for tour ${tourId}:`, error);
      return [];
    }
  }

  async getReservasByUsuario(usuarioId: string) {
    try {
      const response = await this.client.get(`/api/reservas/usuario/${usuarioId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching reservas for user ${usuarioId}:`, error);
      return [];
    }
  }

  async getReservasByEstado(estado: string) {
    try {
      const response = await this.client.get(`/api/reservas/estado/${estado}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching reservas by estado ${estado}:`, error);
      return [];
    }
  }

  async getReservasByDateRange(fechaInicio: string, fechaFin: string) {
    try {
      const response = await this.client.get('/api/reservas/fecha', {
        params: { fechaInicio, fechaFin }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching reservas by date range:', error);
      return [];
    }
  }

  async createReserva(reservaData: any) {
    try {
      const response = await this.client.post('/api/reservas', reservaData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating reserva:', error);
      throw new Error('No se pudo crear la reserva');
    }
  }

  async updateReserva(id: string, reservaData: any) {
    try {
      const response = await this.client.put(`/api/reservas/${id}`, reservaData);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating reserva ${id}:`, error);
      throw new Error('No se pudo actualizar la reserva');
    }
  }

  async cancelReserva(id: string, motivo?: string) {
    try {
      const response = await this.client.patch(`/api/reservas/${id}/cancelar`, { motivo });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error canceling reserva ${id}:`, error);
      throw new Error('No se pudo cancelar la reserva');
    }
  }

  async confirmarReserva(id: string) {
    try {
      const response = await this.client.patch(`/api/reservas/${id}/confirmar`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error confirming reserva ${id}:`, error);
      throw new Error('No se pudo confirmar la reserva');
    }
  }
}
