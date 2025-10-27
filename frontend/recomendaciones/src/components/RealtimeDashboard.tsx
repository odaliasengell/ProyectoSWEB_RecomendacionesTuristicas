import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertCircle, Clock, Zap } from 'lucide-react';
import useWebsocket from '../hooks/useWebsocket';

/**
 * Funciones auxiliares para el formato de eventos
 */
const getEventIcon = (eventType: string) => {
  if (eventType.includes('created')) return '✨ Creado';
  if (eventType.includes('updated')) return '🔄 Actualizado';
  if (eventType.includes('deleted')) return '🗑️ Eliminado';
  if (eventType.includes('booked')) return '📅 Reservado';
  if (eventType.includes('completed')) return '✅ Completado';
  if (eventType.includes('usuario') || eventType.includes('user')) return '👤 Usuario';
  if (eventType.includes('destino')) return '📍 Destino';
  if (eventType.includes('tour')) return '🎫 Tour';
  if (eventType.includes('servicio')) return '🔧 Servicio';
  if (eventType.includes('contrat')) return '📋 Contrato';
  return '📢 Evento';
};

const getSourceColor = (source: string) => {
  switch (source) {
    case 'python_api':
      return 'bg-blue-100 text-blue-800';
    case 'typescript_api':
      return 'bg-cyan-100 text-cyan-800';
    case 'golang_api':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const RealtimeDashboard = () => {
  const { connected, messages } = useWebsocket(['admin_panel']);
  const [liveStats, setLiveStats] = useState({
    total_usuarios: 0,
    total_destinos: 0,
    total_tours: 0,
    total_servicios: 0,
    usuarios_activos: 0,
    contratos_pendientes: 0,
    reservas_nuevas: 0,
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('desconectado');

  // Procesar mensajes del WebSocket
  useEffect(() => {
    messages.forEach((msg: any) => {
      if (msg.type === 'stats_updated' || msg.event === 'stats_updated') {
        setLiveStats(msg.data || msg);
      }

      // Agregar a eventos recientes
      if (msg.event !== 'stats_updated') {
        setRecentEvents((prev) => [
          {
            id: msg.id || Date.now(),
            type: msg.event || msg.type,
            source: msg.source,
            data: msg.data,
            timestamp: msg.timestamp
          },
          ...prev.slice(0, 19) // Mantener últimos 20
        ]);
      }
    });
  }, [messages]);

  // Actualizar estado de conexión
  useEffect(() => {
    setConnectionStatus(connected ? 'conectado' : 'desconectado');
  }, [connected]);

  return (
    <div className="space-y-6">
      {/* Header con estado de conexión */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-lg">Dashboard en Tiempo Real</h3>
            <p className="text-sm text-slate-400">
              {connected ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Conectado al WebSocket
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  Reconectando...
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{recentEvents.length}</div>
          <p className="text-sm text-slate-400">eventos registrados</p>
        </div>
      </div>

      {/* Estadísticas en Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuarios"
          value={liveStats.total_usuarios}
          icon={<Activity className="w-5 h-5" />}
          color="from-blue-500 to-blue-600"
          active={liveStats.usuarios_activos}
          activeLabel="Activos"
        />
        <StatCard
          title="Destinos"
          value={liveStats.total_destinos}
          icon={<TrendingUp className="w-5 h-5" />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Tours"
          value={liveStats.total_tours}
          icon={<Activity className="w-5 h-5" />}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Servicios"
          value={liveStats.total_servicios}
          icon={<AlertCircle className="w-5 h-5" />}
          color="from-orange-500 to-orange-600"
          pending={liveStats.contratos_pendientes}
          pendingLabel="Pendientes"
        />
      </div>

      {/* Eventos Recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Eventos en Tiempo Real</h3>
            {connected && (
              <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                En Vivo
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {recentEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Esperando eventos en tiempo real...</p>
              <p className="text-xs mt-2">
                {connected ? 'Conectado' : 'Desconectado - Los eventos aparecerán aquí'}
              </p>
            </div>
          ) : (
            recentEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente para tarjeta de estadísticas
 */
const StatCard = ({
  title,
  value,
  icon,
  color,
  active,
  activeLabel,
  pending,
  pendingLabel
}: any) => (
  <div className={`bg-gradient-to-br ${color} text-white p-4 rounded-lg shadow`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {active !== undefined && (
          <p className="text-xs opacity-75 mt-1">
            {activeLabel}: {active}
          </p>
        )}
        {pending !== undefined && (
          <p className="text-xs opacity-75 mt-1">
            {pendingLabel}: {pending}
          </p>
        )}
      </div>
      <div className="opacity-50">{icon}</div>
    </div>
  </div>
);

/**
 * Componente para fila de evento
 */
const EventRow = ({ event }: { event: any }) => {
  const timestamp = new Date(event.timestamp);
  const timeString = timestamp.toLocaleTimeString('es-ES');

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getEventIcon(event.type)}</span>
            <span className="font-medium text-gray-900 capitalize">
              {event.type.replace(/_/g, ' ')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${getSourceColor(event.source)}`}>
              {event.source?.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          {event.data && (
            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
              {Object.entries(event.data).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {String(value).substring(0, 50)}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{timeString}</p>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDashboard;
