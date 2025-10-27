import axios from 'axios';

export interface ServiceInstance {
  id: string;
  url: string;
  healthy: boolean;
  lastCheck: Date;
  responseTime: number;
  weight: number; // para weighted round robin
}

export interface ServiceConfig {
  name: string;
  instances: ServiceInstance[];
  healthCheckPath: string;
  healthCheckInterval: number; // en milisegundos
  timeout: number;
}

export class LoadBalancer {
  private services: Map<string, ServiceConfig> = new Map();
  private currentIndex: Map<string, number> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // Configurar servicios disponibles
    this.addService('typescript', {
      name: 'typescript',
      instances: [
        {
          id: 'ts-1',
          url: 'http://localhost:3000',
          healthy: true,
          lastCheck: new Date(),
          responseTime: 0,
          weight: 1
        }
        // Se pueden agregar más instancias aquí
      ],
      healthCheckPath: '/api/tours', // Usar un endpoint que sabemos que existe
      healthCheckInterval: 30000, // 30 segundos
      timeout: 5000
    });

    this.addService('python', {
      name: 'python',
      instances: [
        {
          id: 'py-1',
          url: 'http://localhost:8000',
          healthy: true,
          lastCheck: new Date(),
          responseTime: 0,
          weight: 1
        }
      ],
      healthCheckPath: '/docs', // Usar FastAPI docs como health check
      healthCheckInterval: 30000,
      timeout: 5000
    });

    this.addService('golang', {
      name: 'golang',
      instances: [
        {
          id: 'go-1',
          url: 'http://localhost:8080',
          healthy: true,
          lastCheck: new Date(),
          responseTime: 0,
          weight: 1
        }
      ],
      healthCheckPath: '/servicios', // Endpoint correcto sin /api prefix
      healthCheckInterval: 30000,
      timeout: 5000
    });
  }

  /**
   * Agregar un nuevo servicio al load balancer
   */
  addService(serviceName: string, config: ServiceConfig) {
    this.services.set(serviceName, config);
    this.currentIndex.set(serviceName, 0);
    this.startHealthChecks(serviceName);
    console.log(`🔄 Servicio ${serviceName} agregado al load balancer`);
  }

  /**
   * Obtener la siguiente instancia disponible usando Round Robin
   */
  getNextInstance(serviceName: string): ServiceInstance | null {
    const service = this.services.get(serviceName);
    if (!service) {
      console.log(`❌ Servicio ${serviceName} no encontrado`);
      return null;
    }

    const healthyInstances = service.instances.filter(instance => instance.healthy);
    if (healthyInstances.length === 0) {
      console.log(`❌ No hay instancias saludables para ${serviceName}`);
      return null;
    }

    // Round Robin simple
    let currentIndex = this.currentIndex.get(serviceName) || 0;
    const instance = healthyInstances[currentIndex % healthyInstances.length];
    this.currentIndex.set(serviceName, currentIndex + 1);

    console.log(`🔄 Seleccionada instancia ${instance.id} para ${serviceName}`);
    return instance;
  }

  /**
   * Obtener la instancia con mejor rendimiento
   */
  getBestInstance(serviceName: string): ServiceInstance | null {
    const service = this.services.get(serviceName);
    if (!service) return null;

    const healthyInstances = service.instances.filter(instance => instance.healthy);
    if (healthyInstances.length === 0) return null;

    // Seleccionar la instancia con menor tiempo de respuesta
    return healthyInstances.reduce((best, current) => 
      current.responseTime < best.responseTime ? current : best
    );
  }

  /**
   * Iniciar health checks para un servicio
   */
  private startHealthChecks(serviceName: string) {
    const service = this.services.get(serviceName);
    if (!service) return;

    const interval = setInterval(async () => {
      await this.performHealthChecks(serviceName);
    }, service.healthCheckInterval);

    this.healthCheckIntervals.set(serviceName, interval);

    // Realizar check inicial
    this.performHealthChecks(serviceName);
  }

  /**
   * Realizar health check en todas las instancias de un servicio
   */
  private async performHealthChecks(serviceName: string) {
    const service = this.services.get(serviceName);
    if (!service) return;

    console.log(`🔍 Realizando health check para ${serviceName}`);

    for (const instance of service.instances) {
      try {
        const startTime = Date.now();
        const response = await axios.get(
          `${instance.url}${service.healthCheckPath}`,
          { 
            timeout: service.timeout,
            validateStatus: (status: number) => status >= 200 && status < 500 // Aceptar respuestas aunque no sean 200
          }
        );

        const responseTime = Date.now() - startTime;
        
        if (response.status >= 200 && response.status < 300) {
          instance.healthy = true;
          instance.responseTime = responseTime;
          instance.lastCheck = new Date();
          console.log(`✅ ${instance.id} saludable (${responseTime}ms)`);
        } else {
          instance.healthy = false;
          console.log(`❌ ${instance.id} no saludable - Status: ${response.status}`);
        }
      } catch (error: any) {
        instance.healthy = false;
        instance.lastCheck = new Date();
        
        // Si el error es de conexión (ECONNREFUSED), es probable que el servicio no esté ejecutándose
        if (error.code === 'ECONNREFUSED') {
          console.log(`❌ ${instance.id} no disponible - Servicio no ejecutándose`);
        } else if (error.code === 'ENOTFOUND') {
          console.log(`❌ ${instance.id} no disponible - Host no encontrado`);
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
          console.log(`❌ ${instance.id} no disponible - Timeout`);
        } else {
          console.log(`❌ ${instance.id} no saludable - Error: ${error.message}`);
        }
      }
    }
  }

  /**
   * Obtener estadísticas de todos los servicios
   */
  getServiceStats() {
    const stats: any = {};

    for (const [serviceName, service] of this.services) {
      const healthyCount = service.instances.filter(i => i.healthy).length;
      const totalCount = service.instances.length;
      const avgResponseTime = service.instances
        .filter(i => i.healthy)
        .reduce((sum, i) => sum + i.responseTime, 0) / (healthyCount || 1);

      stats[serviceName] = {
        healthy: healthyCount,
        total: totalCount,
        availability: ((healthyCount / totalCount) * 100).toFixed(2) + '%',
        avgResponseTime: Math.round(avgResponseTime) + 'ms',
        instances: service.instances.map(i => ({
          id: i.id,
          url: i.url,
          healthy: i.healthy,
          responseTime: i.responseTime + 'ms',
          lastCheck: i.lastCheck.toISOString()
        }))
      };
    }

    return stats;
  }

  /**
   * Detener todos los health checks
   */
  stop() {
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();
    console.log('🛑 Load balancer detenido');
  }
}