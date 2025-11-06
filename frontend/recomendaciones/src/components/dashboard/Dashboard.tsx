/**
 * Dashboard principal con notificaciones en tiempo real via WebSocket
 */

import React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { NotificationPanel } from '../common/NotificationPanel';
import { WebSocketStatus } from '../common/WebSocketStatus';

const Dashboard: React.FC = () => {
  const { isConnected, reconnectCount, notifications, clearNotifications } = useWebSocket(
    (data) => {
      // Aquí puedes agregar lógica adicional cuando llega una notificación
      console.log('Nueva notificación:', data);
      
      // Opcional: Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.message, {
          icon: '/favicon.ico',
          body: data.type.replace(/_/g, ' '),
        });
      }
    }
  );

  // Solicitar permiso para notificaciones del navegador
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            
            {/* Estado de conexión WebSocket */}
            <WebSocketStatus
              isConnected={isConnected}
              reconnectCount={reconnectCount}
            />
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de estadísticas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Usuarios Registrados"
                value="0"
                icon="👤"
                color="blue"
              />
              <StatCard
                title="Reservas Activas"
                value="0"
                icon="🎫"
                color="green"
              />
              <StatCard
                title="Tours Disponibles"
                value="0"
                icon="🗺️"
                color="purple"
              />
            </div>

            {/* Gráficas o contenido adicional */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
              <p className="text-gray-600">
                Aquí puedes agregar gráficas, tablas o cualquier contenido adicional.
              </p>
            </div>
          </div>

          {/* Panel de notificaciones */}
          <div className="lg:col-span-1">
            <NotificationPanel
              notifications={notifications}
              onClear={clearNotifications}
              maxHeight="calc(100vh - 250px)"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente auxiliar para tarjetas de estadísticas
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color]} rounded-full p-4`}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

