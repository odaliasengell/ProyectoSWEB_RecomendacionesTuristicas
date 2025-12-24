/**
 * Dashboard V2 con preparación para los 4 pilares del segundo parcial
 * Incluye: Auth Status, Payment Integration, Chat Module, Event Monitoring
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { NotificationPanel } from '../common/NotificationPanel';
import { WebSocketStatus } from '../common/WebSocketStatus';
import '../common/NotificationPanel.css';
import './DashboardV2.css';

interface DashboardStats {
  users: number;
  activeReservations: number;
  totalTours: number;
  todayRevenue: number;
  pendingPayments: number;
  chatInteractions: number;
  webhookEvents: number;
}

const DashboardV2: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    activeReservations: 0,
    totalTours: 0,
    todayRevenue: 0,
    pendingPayments: 0,
    chatInteractions: 0,
    webhookEvents: 0,
  });

  const { isConnected, reconnectCount, notifications, clearNotifications } = useWebSocket(
    (data) => {
      console.log('📢 Nueva notificación WebSocket:', data);
      
      // Actualizar stats basado en notificaciones
      if (data.type === 'payment_success') {
        setStats(prev => ({ ...prev, todayRevenue: prev.todayRevenue + (data.amount || 0) }));
      }
      
      if (data.type === 'webhook_received') {
        setStats(prev => ({ ...prev, webhookEvents: prev.webhookEvents + 1 }));
      }
      
      if (data.type === 'chat_interaction') {
        setStats(prev => ({ ...prev, chatInteractions: prev.chatInteractions + 1 }));
      }

      // Notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.message, {
          icon: '/favicon.ico',
          body: `Tipo: ${data.type.replace(/_/g, ' ')}`,
        });
      }
    }
  );

  // Solicitar permiso para notificaciones
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Simular carga de estadísticas iniciales
    loadInitialStats();
  }, []);

  const loadInitialStats = async () => {
    // TODO: Conectar con APIs reales en próximas semanas
    // Por ahora datos simulados para la demo
    setStats({
      users: 156,
      activeReservations: 23,
      totalTours: 45,
      todayRevenue: 2450,
      pendingPayments: 8,
      chatInteractions: 67,
      webhookEvents: 12,
    });
  };

  return (
    <div className="dashboard-v2">
      {/* Header con estado de conexión */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🎯 Sistema de Turismo - Dashboard V2</h1>
            <p>Arquitectura de Microservicios - Segundo Parcial</p>
          </div>
          
          <div className="header-controls">
            <WebSocketStatus
              isConnected={isConnected}
              reconnectCount={reconnectCount}
            />
            <div className="user-info">
              <span className="welcome-text">
                Bienvenido, {JSON.parse(localStorage.getItem('userData') || '{}').nombre || 'Usuario'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          
          {/* Sección 1: Estadísticas principales */}
          <section className="stats-section">
            <h2 className="section-title">📊 Estadísticas Principales</h2>
            <div className="stats-grid">
              <StatCard
                title="Usuarios Activos"
                value={stats.users}
                icon="👥"
                color="blue"
                trend="+12%"
              />
              <StatCard
                title="Reservas Hoy"
                value={stats.activeReservations}
                icon="🎫"
                color="green"
                trend="+8%"
              />
              <StatCard
                title="Tours Disponibles"
                value={stats.totalTours}
                icon="🗺️"
                color="purple"
                trend="Estable"
              />
              <StatCard
                title="Ingresos Hoy"
                value={`$${stats.todayRevenue}`}
                icon="💰"
                color="yellow"
                trend="+25%"
              />
            </div>
          </section>

          {/* Sección 2: Pilares del Segundo Parcial */}
          <section className="pillars-section">
            <h2 className="section-title">🏗️ Estado de los 4 Pilares</h2>
            <div className="pillars-grid">
              
              {/* Pilar 1: Auth Service */}
              <PillarCard
                title="Pilar 1: Auth Service"
                subtitle="JWT + Refresh Tokens"
                status="development"
                progress={25}
                features={[
                  "✅ Login básico funcionando",
                  "🔄 JWT tokens implementados",
                  "⏳ Refresh tokens pendiente",
                  "⏳ Validación local pendiente"
                ]}
                responsible="Nestor"
                color="auth"
              />

              {/* Pilar 2: Payment + Webhooks */}
              <PillarCard
                title="Pilar 2: Payment Service"
                subtitle="Pasarelas + Webhooks B2B"
                status="planning"
                progress={10}
                features={[
                  "📋 MockAdapter definido",
                  "⏳ Payment wrapper pendiente",
                  "⏳ HMAC authentication",
                  `⏳ Integración con Partner (${stats.webhookEvents} eventos)`
                ]}
                responsible="Odalia"
                color="payment"
              />

              {/* Pilar 3: MCP Chatbot */}
              <PillarCard
                title="Pilar 3: MCP Chatbot"
                subtitle="IA Conversacional + Tools"
                status="design"
                progress={5}
                features={[
                  "📋 LLM Adapter diseñado",
                  "⏳ Chat UI pendiente",
                  "⏳ MCP Tools (5 herramientas)",
                  `📊 ${stats.chatInteractions} interacciones simuladas`
                ]}
                responsible="Abigail"
                color="chat"
              />

              {/* Pilar 4: n8n Event Bus */}
              <PillarCard
                title="Pilar 4: n8n Event Bus"
                subtitle="Orquestación de Eventos"
                status="planning"
                progress={15}
                features={[
                  "📋 Payment Handler workflow",
                  "⏳ Partner Handler workflow",
                  "⏳ MCP Input Handler",
                  "⏳ Scheduled Tasks setup"
                ]}
                responsible="Odalia"
                color="events"
              />

            </div>
          </section>

          {/* Sección 3: Servicios en Desarrollo */}
          <section className="services-section">
            <h2 className="section-title">🛠️ Servicios en Desarrollo</h2>
            <div className="services-grid">
              
              <ServiceCard
                name="Payment Service"
                port="8200"
                status="pending"
                description="Wrapper para múltiples pasarelas de pago"
                endpoints={["POST /payment/process", "POST /partners/register", "POST /webhooks/receive"]}
                pendingCount={stats.pendingPayments}
              />
              
              <ServiceCard
                name="AI Orchestrator"
                port="8300"
                status="pending"
                description="Servicio de IA conversacional con MCP"
                endpoints={["POST /chat/message", "GET /tools/list", "POST /tools/execute"]}
                pendingCount={0}
              />
              
              <ServiceCard
                name="Event Bus (n8n)"
                port="5678"
                status="pending"
                description="Orquestación visual de eventos"
                endpoints={["Workflows GUI", "Webhook endpoints", "Scheduled tasks"]}
                pendingCount={0}
              />

            </div>
          </section>

          {/* Sección 4: Notificaciones en tiempo real */}
          <section className="notifications-section">
            <h2 className="section-title">🔔 Notificaciones en Tiempo Real</h2>
            <NotificationPanel
              notifications={notifications}
              onClear={clearNotifications}
              maxHeight="400px"
            />
          </section>

        </div>
      </main>
    </div>
  );
};

// ===== COMPONENTES AUXILIARES =====

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'stat-card-blue',
    green: 'stat-card-green',
    purple: 'stat-card-purple',
    yellow: 'stat-card-yellow',
  };

  return (
    <div className={`stat-card ${colorClasses[color]}`}>
      <div className="stat-content">
        <div className="stat-info">
          <p className="stat-title">{title}</p>
          <p className="stat-value">{value}</p>
          {trend && <p className="stat-trend">{trend}</p>}
        </div>
        <div className="stat-icon">{icon}</div>
      </div>
    </div>
  );
};

interface PillarCardProps {
  title: string;
  subtitle: string;
  status: 'planning' | 'development' | 'testing' | 'done' | 'design';
  progress: number;
  features: string[];
  responsible: string;
  color: 'auth' | 'payment' | 'chat' | 'events';
}

const PillarCard: React.FC<PillarCardProps> = ({ 
  title, subtitle, status, progress, features, responsible, color 
}) => {
  const statusLabels = {
    planning: '📋 Planificación',
    development: '👨‍💻 Desarrollo',
    testing: '🧪 Pruebas',
    done: '✅ Completado',
    design: '🎨 Diseño'
  };

  const colorClasses = {
    auth: 'pillar-auth',
    payment: 'pillar-payment',
    chat: 'pillar-chat',
    events: 'pillar-events'
  };

  return (
    <div className={`pillar-card ${colorClasses[color]}`}>
      <div className="pillar-header">
        <h3 className="pillar-title">{title}</h3>
        <p className="pillar-subtitle">{subtitle}</p>
        <div className="pillar-status">
          <span className={`status-badge status-${status}`}>
            {statusLabels[status]}
          </span>
          <span className="responsible-badge">👤 {responsible}</span>
        </div>
      </div>
      
      <div className="pillar-progress">
        <div className="progress-header">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="pillar-features">
        <h4>Estado de funcionalidades:</h4>
        <ul className="features-list">
          {features.map((feature, index) => (
            <li key={index} className="feature-item">
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  name: string;
  port: string;
  status: 'running' | 'pending' | 'error';
  description: string;
  endpoints: string[];
  pendingCount?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  name, port, status, description, endpoints, pendingCount = 0 
}) => {
  const statusColors = {
    running: '🟢',
    pending: '🟡',
    error: '🔴'
  };

  return (
    <div className={`service-card service-${status}`}>
      <div className="service-header">
        <h3 className="service-name">{name}</h3>
        <div className="service-status">
          <span className="status-indicator">{statusColors[status]}</span>
          <span className="port-info">:{port}</span>
        </div>
      </div>
      
      <p className="service-description">{description}</p>
      
      <div className="service-endpoints">
        <h4>Endpoints:</h4>
        <ul className="endpoints-list">
          {endpoints.map((endpoint, index) => (
            <li key={index} className="endpoint-item">{endpoint}</li>
          ))}
        </ul>
      </div>

      {pendingCount > 0 && (
        <div className="service-pending">
          <span className="pending-badge">{pendingCount} pendientes</span>
        </div>
      )}
    </div>
  );
};

export default DashboardV2;