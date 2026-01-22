/**
 * Página principal mejorada que integra todos los componentes
 * Semana 1: UI Base con Chat y Pagos preparatorios
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardV2 from '../components/dashboard/DashboardV2';
import ChatBot from '../components/common/ChatBot';
import './MainDashboardPage.css';

const MainDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    console.log('🔐 Usuario autenticado, cargando dashboard...');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/');
  };

  return (
    <div className="main-dashboard-page">
      
      {/* Dashboard principal */}
      <DashboardV2 />

      {/* Floating Action Buttons */}
      <div className="floating-actions">

        {/* Logout Button */}
        <button 
          className="fab logout-fab"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          🚪
        </button>

      </div>

      {/* Chat Bot Component */}
      <ChatBot 
        isActive={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Development Status Indicator */}
      <div className="dev-status">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Semana 1 - UI Base Completada</span>
        </div>
      </div>

    </div>
  );
};

export default MainDashboardPage;