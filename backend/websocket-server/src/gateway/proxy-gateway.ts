import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { LoadBalancer } from './load-balancer';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class ProxyGateway {
  private loadBalancer: LoadBalancer;

  constructor(loadBalancer: LoadBalancer) {
    this.loadBalancer = loadBalancer;
  }

  /**
   * Crear proxy dinámico que selecciona la instancia usando load balancer
   */
  createDynamicProxy(serviceName: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const instance = this.loadBalancer.getNextInstance(serviceName);
      
      if (!instance) {
        return res.status(503).json({
          success: false,
          message: `Servicio ${serviceName} no disponible`,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`🔀 Proxy: ${req.method} ${req.path} -> ${instance.url} (${instance.id})`);

      // Configuración específica del pathRewrite según el servicio
      let pathRewrite: Record<string, string> = {};
      
      if (serviceName === 'golang') {
        // Para Go: /api/servicios -> /servicios, /api/contrataciones -> /contrataciones
        pathRewrite = {
          '^/api/servicios': '/servicios',
          '^/api/contrataciones': '/contrataciones'
        };
      } else {
        // Para otros servicios: remover el prefijo /api/{serviceName}
        pathRewrite = {
          [`^/api/${serviceName}`]: ''
        };
      }

      const proxyOptions: Options = {
        target: instance.url,
        changeOrigin: true,
        pathRewrite,
        onError: (err: Error, req: IncomingMessage, res: ServerResponse) => {
          console.error(`❌ Error en proxy para ${serviceName}:`, err.message);
          if (!res.headersSent) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: `Error de gateway al comunicarse con ${serviceName}`,
              error: err.message,
              timestamp: new Date().toISOString()
            }));
          }
        },
        onProxyReq: (proxyReq: any, req: AuthenticatedRequest) => {
          // Agregar headers de usuario autenticado si existe
          if (req.user) {
            proxyReq.setHeader('X-User-Id', req.user.id);
            proxyReq.setHeader('X-User-Email', req.user.email);
            proxyReq.setHeader('X-User-Role', req.user.role);
          }
          
          // Agregar header de origen del gateway
          proxyReq.setHeader('X-Gateway-Origin', 'websocket-gateway');
          proxyReq.setHeader('X-Forwarded-For', req.ip || 'unknown');
          proxyReq.setHeader('X-Request-Id', this.generateRequestId());
          
          console.log(`📤 Enviando a ${serviceName}: ${proxyReq.method} ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes: any, req: IncomingMessage, res: ServerResponse) => {
          // Agregar headers de respuesta del gateway
          proxyRes.headers['X-Gateway-Service'] = serviceName;
          proxyRes.headers['X-Gateway-Instance'] = instance.id;
          proxyRes.headers['X-Response-Time'] = Date.now().toString();
          
          console.log(`📥 Respuesta de ${serviceName}: ${proxyRes.statusCode}`);
        },
        timeout: 30000, // 30 segundos
        proxyTimeout: 30000
      };

      const proxy = createProxyMiddleware(proxyOptions);
      proxy(req, res, next);
    };
  }

  /**
   * Proxy específico para TypeScript API (tours y guías)
   */
  get typescriptProxy() {
    return this.createDynamicProxy('typescript');
  }

  /**
   * Proxy específico para Python API (usuarios y recomendaciones)
   */
  get pythonProxy() {
    return this.createDynamicProxy('python');
  }

  /**
   * Proxy específico para Go API (servicios y contrataciones)
   */
  get golangProxy() {
    return this.createDynamicProxy('golang');
  }

  /**
   * Middleware para enrutar automáticamente basado en el path
   */
  autoRouter() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const path = req.path;
      
      // Determinar el servicio basado en el path
      let serviceName: string | null = null;
      
      if (path.startsWith('/api/tours') || path.startsWith('/api/guias')) {
        serviceName = 'typescript';
      } else if (path.startsWith('/api/usuarios') || path.startsWith('/api/recomendaciones')) {
        serviceName = 'python';
      } else if (path.startsWith('/api/servicios') || path.startsWith('/api/contrataciones')) {
        serviceName = 'golang';
      }

      if (!serviceName) {
        return res.status(404).json({
          success: false,
          message: 'Ruta no encontrada en el gateway',
          availableRoutes: [
            '/api/tours/* (TypeScript)',
            '/api/guias/* (TypeScript)', 
            '/api/usuarios/* (Python)',
            '/api/recomendaciones/* (Python)',
            '/api/servicios/* (Go)',
            '/api/contrataciones/* (Go)'
          ],
          timestamp: new Date().toISOString()
        });
      }

      console.log(`🚀 Auto-routing: ${path} -> ${serviceName}`);
      
      // Usar el proxy dinámico
      const proxy = this.createDynamicProxy(serviceName);
      proxy(req, res, next);
    };
  }

  /**
   * Middleware para transformar requests antes de enviarlos
   */
  requestTransformer() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // Agregar timestamp al request
      req.body = {
        ...req.body,
        _gateway: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'websocket-gateway'
        }
      };

      // Log del request
      console.log(`📝 Request transformado: ${req.method} ${req.path}`, {
        user: req.user?.email || 'anonymous',
        body: req.body
      });

      next();
    };
  }

  /**
   * Middleware para transformar responses antes de enviarlas al cliente
   */
  responseTransformer() {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.json.bind(res);
      
      res.json = function(body: any) {
        // Transformar la respuesta
        const transformedBody = {
          ...body,
          _gateway: {
            processedAt: new Date().toISOString(),
            requestId: req.headers['x-request-id'],
            version: '1.0.0'
          }
        };

        console.log(`📤 Response transformado: ${res.statusCode}`, transformedBody);
        return originalSend(transformedBody);
      };

      next();
    };
  }

  /**
   * Generar ID único para el request
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener estadísticas del gateway
   */
  getGatewayStats() {
    return {
      loadBalancer: this.loadBalancer.getServiceStats(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}