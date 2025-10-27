import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  LogOut, 
  BarChart3, 
  UserX,
  Eye,
  Trash2,
  Menu,
  X,
  MapPin,
  Camera,
  Route,
  Building2,
  Plus,
  Search,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importar formularios
import DestinoForm from '../components/DestinoForm';
import GuiaForm from '../components/GuiaForm';
import TourForm from '../components/TourForm';
import ServicioForm from '../components/ServicioForm';

// URLs de los servicios
const PYTHON_API_URL = 'http://localhost:8000';
const TYPESCRIPT_API_URL = 'http://localhost:3000';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_usuarios: 0,
    total_administradores: 0,
    usuarios_activos: 0
  });
  const [users, setUsers] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [guias, setGuias] = useState([]);
  const [tours, setTours] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Estados para formularios
  const [showDestinoForm, setShowDestinoForm] = useState(false);
  const [showGuiaForm, setShowGuiaForm] = useState(false);
  const [showTourForm, setShowTourForm] = useState(false);
  const [showServicioForm, setShowServicioForm] = useState(false);
  const [editingDestino, setEditingDestino] = useState(null);
  const [editingGuia, setEditingGuia] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [editingServicio, setEditingServicio] = useState(null);
  
  // Estado para ver detalles de usuario
  const [viewingUser, setViewingUser] = useState(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación de admin
    const token = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('adminData');
    
    if (!token || !admin) {
      navigate('/admin/login');
      return;
    }
    
    setAdminData(JSON.parse(admin));
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    const token = localStorage.getItem('adminToken');
    console.log('🔄 Cargando datos del dashboard...');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    
    try {
      // Cargar estadísticas
      const statsResponse = await fetch(`${PYTHON_API_URL}/admin/panel/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Respuesta de stats:', statsResponse.status);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Stats cargadas:', statsData);
        setStats(statsData);
      } else {
        console.error('❌ Error al cargar stats:', statsResponse.status);
      }

      // Cargar usuarios
      const usersResponse = await fetch(`${PYTHON_API_URL}/admin/panel/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('👥 Respuesta de usuarios:', usersResponse.status);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Usuarios cargados:', usersData.length, 'usuarios');
        setUsers(usersData);
      } else {
        console.error('❌ Error al cargar usuarios:', usersResponse.status);
      }
    } catch (error) {
      console.error('💥 Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${PYTHON_API_URL}/admin/panel/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Recargar datos
        loadDashboardData();
        alert('Usuario eliminado exitosamente');
      } else {
        alert('Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar usuario');
    }
  };

  // Función para ver detalles del usuario
  const handleViewUser = (user) => {
    console.log('👁️ Viendo detalles de usuario:', user);
    setViewingUser(user);
    setShowUserDetailModal(true);
  };

  // ==================== FUNCIONES PARA GESTIÓN TURÍSTICA ====================
  const loadDestinos = async () => {
    const token = localStorage.getItem('adminToken');
    console.log('🏖️ Cargando destinos...');
    try {
      const response = await fetch(`${PYTHON_API_URL}/admin/turismo/destinos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('🏖️ Respuesta de destinos:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Destinos cargados:', data.length, 'destinos');
        setDestinos(data);
      } else {
        console.log('❌ API error for destinos, status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        setDestinos([]);
      }
    } catch (error) {
      console.error('💥 Error loading destinos:', error);
      setDestinos([]);
    }
  };

  const loadGuias = async () => {
    setIsLoadingData(true);
    const token = localStorage.getItem('adminToken');
    console.log('👨‍🏫 Cargando guías desde TypeScript...');
    try {
      // Llamar al servicio de TypeScript que tiene MongoDB
      const response = await fetch(`${TYPESCRIPT_API_URL}/api/guias`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('👨‍🏫 Respuesta de guías:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resultado completo:', result);
        // El backend TypeScript envuelve los datos en un objeto con 'data'
        const data = result.data || result;
        console.log('✅ Guías cargadas:', data);
        setGuias(data || []);
      } else {
        console.error('❌ Error al cargar guías:', response.status);
        setGuias([]);
      }
    } catch (error) {
      console.error('💥 Error loading guías:', error);
      setGuias([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTours = async () => {
    setIsLoadingData(true);
    const token = localStorage.getItem('adminToken');
    console.log('🚌 Cargando tours desde TypeScript...');
    try {
      // Llamar al servicio de TypeScript que tiene MongoDB
      const response = await fetch(`${TYPESCRIPT_API_URL}/api/tours`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('🚌 Respuesta de tours:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resultado completo:', result);
        // El backend TypeScript envuelve los datos en un objeto con 'data'
        const data = result.data || result;
        console.log('✅ Tours cargados:', data);
        setTours(data || []);
      } else {
        console.error('❌ Error loading tours:', response.status);
        setTours([]);
      }
    } catch (error) {
      console.error('💥 Error loading tours:', error);
      setTours([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadServicios = async () => {
    console.log('🚌 Cargando servicios desde Go (vía Python proxy)...');
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${PYTHON_API_URL}/admin/turismo/servicios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('🚌 Respuesta de servicios:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Resultado completo:', data);
        // Manejar caso donde data podría ser null o no tener la propiedad servicios
        if (data && data.servicios) {
          console.log('✅ Servicios cargados:', data.servicios);
          setServicios(data.servicios);
        } else if (Array.isArray(data)) {
          // Si devuelve un array directamente
          console.log('✅ Servicios (array directo):', data);
          setServicios(data);
        } else {
          console.log('⚠️ No se encontraron servicios en la respuesta');
          setServicios([]);
        }
      } else {
        console.log('❌ API error for servicios, status:', response.status);
        setServicios([]);
      }
    } catch (error) {
      console.error('❌ Error loading servicios:', error);
      setServicios([]);
    }
  };

  // Funciones para abrir formularios
  const openNewDestino = () => {
    setEditingDestino(null);
    setShowDestinoForm(true);
  };

  const openEditDestino = (destino) => {
    setEditingDestino(destino);
    setShowDestinoForm(true);
  };

  const openNewGuia = () => {
    setEditingGuia(null);
    setShowGuiaForm(true);
  };

  const openNewTour = () => {
    setEditingTour(null);
    setShowTourForm(true);
  };

  const openNewServicio = () => {
    setEditingServicio(null);
    setShowServicioForm(true);
  };

  const deleteDestino = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este destino?')) return;
    const token = localStorage.getItem('adminToken');
    console.log('🗑️ Eliminando destino:', id);
    try {
      const response = await fetch(`${PYTHON_API_URL}/admin/turismo/destinos/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        console.log('✅ Destino eliminado');
        loadDestinos();
        alert('Destino eliminado exitosamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error al eliminar destino:', errorText);
        alert('Error al eliminar destino');
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al eliminar destino');
    }
  };

  const deleteGuia = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta guía?')) return;
    console.log('🗑️ Eliminando guía:', id);
    try {
      // Las guías están en el servicio TypeScript
      const response = await fetch(`${TYPESCRIPT_API_URL}/api/guias/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log('✅ Guía eliminada');
        loadGuias();
        alert('Guía eliminada exitosamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error al eliminar guía:', errorText);
        alert('Error al eliminar guía');
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al eliminar guía');
    }
  };

  const deleteTour = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este tour?')) return;
    console.log('🗑️ Eliminando tour:', id);
    try {
      // Los tours están en el servicio TypeScript
      const response = await fetch(`${TYPESCRIPT_API_URL}/api/tours/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log('✅ Tour eliminado');
        loadTours();
        alert('Tour eliminado exitosamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error al eliminar tour:', errorText);
        alert('Error al eliminar tour');
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al eliminar tour');
    }
  };

  const deleteServicio = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;
    const token = localStorage.getItem('adminToken');
    console.log('🗑️ Eliminando servicio:', id);
    try {
      const response = await fetch(`${PYTHON_API_URL}/admin/turismo/servicios/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        console.log('✅ Servicio eliminado');
        loadServicios();
        alert('Servicio eliminado exitosamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error al eliminar servicio:', errorText);
        alert('Error al eliminar servicio');
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al eliminar servicio');
    }
  };

  // Funciones para manejar formularios
  const handleSaveDestino = async (destinoData) => {
    const token = localStorage.getItem('adminToken');
    console.log('💾 Guardando destino:', destinoData);
    
    // Limpiar y mapear los datos según el modelo de Destino
    const cleanedData = {
      nombre: destinoData.nombre,
      descripcion: destinoData.descripcion,
      ubicacion: destinoData.ubicacion,
      ruta: destinoData.ruta || null,
      provincia: destinoData.provincia || null,
      ciudad: destinoData.ciudad || null,
      categoria: destinoData.categoria || null,
      calificacion_promedio: destinoData.calificacion_promedio || 0.0
    };
    
    console.log('🧹 Datos limpios a enviar:', cleanedData);
    
    try {
      const url = editingDestino 
        ? `${PYTHON_API_URL}/admin/turismo/destinos/${editingDestino.id}`
        : `${PYTHON_API_URL}/admin/turismo/destinos`;
      
      const method = editingDestino ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Destino guardado:', result);
        setShowDestinoForm(false);
        setEditingDestino(null);
        loadDestinos();
        alert(editingDestino ? 'Destino actualizado exitosamente' : 'Destino creado exitosamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error al guardar destino:', errorText);
        alert('Error al guardar destino: ' + errorText);
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al guardar destino');
    }
  };

  const handleSaveGuia = async (guiaData) => {
    console.log('💾 Guardando guía:', guiaData);
    try {
      // Las guías se guardan en el servicio de TypeScript (MongoDB)
      const url = editingGuia 
        ? `${TYPESCRIPT_API_URL}/api/guias/${editingGuia.id_guia}`
        : `${TYPESCRIPT_API_URL}/api/guias`;
      
      const method = editingGuia ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guiaData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Guía guardada:', result);
        setShowGuiaForm(false);
        setEditingGuia(null);
        loadGuias();
        alert(editingGuia ? 'Guía actualizada exitosamente' : 'Guía creada exitosamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error al guardar guía:', errorText);
        alert('Error al guardar guía: ' + errorText);
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al guardar guía');
    }
  };

  const handleSaveTour = async (tourData) => {
    console.log('💾 Guardando tour:', tourData);
    try {
      // Convertir id_guia a número si existe, o null si no está asignado
      const dataToSend = {
        ...tourData,
        id_guia: tourData.id_guia ? parseInt(tourData.id_guia, 10) : null
      };
      
      console.log('📤 Datos a enviar:', dataToSend);
      
      // Los tours se guardan en el servicio de TypeScript (MongoDB)
      const url = editingTour 
        ? `${TYPESCRIPT_API_URL}/api/tours/${editingTour.id_tour}`
        : `${TYPESCRIPT_API_URL}/api/tours`;
      
      const method = editingTour ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Tour guardado:', result);
        setShowTourForm(false);
        setEditingTour(null);
        loadTours();
        alert(editingTour ? 'Tour actualizado exitosamente' : 'Tour creado exitosamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error al guardar tour:', errorText);
        alert('Error al guardar tour: ' + errorText);
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al guardar tour');
    }
  };

  const handleSaveServicio = async (servicioData) => {
    const token = localStorage.getItem('adminToken');
    console.log('💾 Guardando servicio:', servicioData);
    try {
      const url = editingServicio 
        ? `${PYTHON_API_URL}/admin/turismo/servicios/${editingServicio.id}`
        : `${PYTHON_API_URL}/admin/turismo/servicios`;
      
      const method = editingServicio ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(servicioData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Servicio guardado:', result);
        setShowServicioForm(false);
        setEditingServicio(null);
        loadServicios();
        alert(editingServicio ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente');
      } else {
        const errorText = await response.text();
        console.error('❌ Error al guardar servicio:', errorText);
        alert('Error al guardar servicio: ' + errorText);
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al guardar servicio');
    }
  };

  // Funciones para abrir formularios de edición (guía)
  const openEditGuia = (guia) => {
    setEditingGuia(guia);
    setShowGuiaForm(true);
  };

  const openEditTour = (tour) => {
    setEditingTour(tour);
    setShowTourForm(true);
  };

  const openEditServicio = (servicio) => {
    setEditingServicio(servicio);
    setShowServicioForm(true);
  };

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (adminData) {
      switch (activeTab) {
        case 'destinos':
          loadDestinos();
          break;
        case 'guias':
          loadGuias();
          break;
        case 'tours':
          loadTours();
          break;
        case 'servicios':
          loadServicios();
          break;
        default:
          break;
      }
    }
  }, [activeTab, adminData]);

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  };

  const sidebarStyle = {
    width: sidebarOpen ? '280px' : '70px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    transition: 'all 0.3s ease',
    position: 'relative',
    minHeight: '100vh'
  };

  const sidebarHeaderStyle = {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const sidebarMenuStyle = {
    padding: '20px 0'
  };

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid transparent'
  };

  const activeMenuItemStyle = {
    ...menuItemStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: '#3b82f6'
  };

  const mainContentStyle = {
    flex: 1,
    padding: '0',
    overflow: 'auto'
  };

  const headerStyle = {
    backgroundColor: 'white',
    padding: '20px 30px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const contentStyle = {
    padding: '30px'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const statCardStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  };

  const tableStyle = {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  const tableHeaderStyle = {
    backgroundColor: '#f8fafc',
    padding: '20px 25px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: '600',
    color: '#374151'
  };

  const tableRowStyle = {
    padding: '15px 25px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const actionButtonStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    margin: '0 5px'
  };

  const MenuIcon = ({ icon: Icon, label, isActive, onClick }) => (
    <div
      style={isActive ? activeMenuItemStyle : menuItemStyle}
      onClick={onClick}
    >
      <Icon size={20} />
      {sidebarOpen && <span style={{ marginLeft: '12px' }}>{label}</span>}
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div style={statCardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>{title}</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{value}</p>
        </div>
        <div style={{ 
          backgroundColor: color, 
          padding: '12px', 
          borderRadius: '10px',
          color: 'white'
        }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#64748b'
      }}>
        Cargando panel de administrador...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Shield size={24} />
            {sidebarOpen && <span style={{ marginLeft: '10px', fontWeight: '600' }}>Admin Panel</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div style={sidebarMenuStyle}>
          <MenuIcon
            icon={BarChart3}
            label="Dashboard"
            isActive={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <MenuIcon
            icon={Users}
            label="Usuarios"
            isActive={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <MenuIcon
            icon={MapPin}
            label="Destinos"
            isActive={activeTab === 'destinos'}
            onClick={() => setActiveTab('destinos')}
          />
          <MenuIcon
            icon={Camera}
            label="Guías"
            isActive={activeTab === 'guias'}
            onClick={() => setActiveTab('guias')}
          />
          <MenuIcon
            icon={Route}
            label="Tours"
            isActive={activeTab === 'tours'}
            onClick={() => setActiveTab('tours')}
          />
          <MenuIcon
            icon={Building2}
            label="Servicios"
            isActive={activeTab === 'servicios'}
            onClick={() => setActiveTab('servicios')}
          />
          <MenuIcon
            icon={Settings}
            label="Configuración"
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>

        <div style={{ position: 'absolute', bottom: '20px', width: '100%' }}>
          <MenuIcon
            icon={LogOut}
            label="Cerrar Sesión"
            isActive={false}
            onClick={handleLogout}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'users' && 'Gestión de Usuarios'}
              {activeTab === 'settings' && 'Configuración'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#64748b' }}>
              Bienvenido, {adminData?.nombre}
            </span>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#1e3a8a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600'
            }}>
              {adminData?.nombre?.charAt(0)}
            </div>
          </div>
        </div>

        <div style={contentStyle}>
          {activeTab === 'dashboard' && (
            <>
              <div style={statsGridStyle}>
                <StatCard
                  key="total-usuarios"
                  icon={Users}
                  title="Total Usuarios"
                  value={stats.total_usuarios}
                  color="#3b82f6"
                />
                <StatCard
                  key="total-administradores"
                  icon={Shield}
                  title="Administradores"
                  value={stats.total_administradores}
                  color="#10b981"
                />
                <StatCard
                  key="usuarios-activos"
                  icon={Activity}
                  title="Usuarios Activos"
                  value={stats.usuarios_activos}
                  color="#f59e0b"
                />
              </div>

              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Usuarios Recientes</h3>
                </div>
                {users.slice(0, 5).map((user, index) => (
                  <div key={`user-recent-${user.id_usuario}-${index}`} style={tableRowStyle}>
                    <div style={{ flex: 1 }}>
                      <strong>{`${user.nombre} ${user.apellido}`}</strong>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>{user.email}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>
                      @{user.username}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div style={tableStyle}>
              <div style={tableHeaderStyle}>
                <h3 style={{ margin: 0 }}>Todos los Usuarios ({users.length})</h3>
              </div>
              {users.map((user, index) => (
                <div key={`user-all-${user.id_usuario}-${index}`} style={tableRowStyle}>
                  <div style={{ flex: 1 }}>
                    <strong>{`${user.nombre} ${user.apellido}`}</strong>
                    <br />
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      {user.email} • @{user.username}
                    </span>
                    {user.fecha_nacimiento && (
                      <>
                        <br />
                        <span style={{ color: '#64748b', fontSize: '12px' }}>
                          Nacimiento: {user.fecha_nacimiento}
                        </span>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: '#3b82f6',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye size={14} />
                      Ver
                    </button>
                    <button
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: '#ef4444',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                      onClick={() => deleteUser(user.id_usuario)}
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GESTIÓN DE DESTINOS */}
          {activeTab === 'destinos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#374151' }}>Gestión de Destinos</h2>
                <button
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => openNewDestino()}
                >
                  <Plus size={16} /> Nuevo Destino
                </button>
              </div>
              
              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Destinos Registrados ({destinos.length})</h3>
                </div>
                {destinos.map((destino, index) => (
                  <div key={`destino-${destino.id}-${index}`} style={tableRowStyle}>
                    <div style={{ flex: 1 }}>
                      <strong>{destino.nombre}</strong>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>
                        {`${destino.ciudad || 'N/A'}, ${destino.provincia || 'N/A'} • ${destino.categoria || 'N/A'}`}
                      </span>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        Ubicación: {destino.ubicacion || 'N/A'} | Calificación: ⭐ {destino.calificacion_promedio}/5
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        style={{ ...actionButtonStyle, backgroundColor: '#3b82f6', color: 'white' }}
                        onClick={() => openEditDestino(destino)}
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button 
                        style={{ ...actionButtonStyle, backgroundColor: '#ef4444', color: 'white' }}
                        onClick={() => deleteDestino(destino.id)}
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GESTIÓN DE GUÍAS */}
          {activeTab === 'guias' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#374151' }}>Gestión de Guías</h2>
                <button
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => openNewGuia()}
                >
                  <Plus size={16} /> Nueva Guía
                </button>
              </div>
              
              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Guías Registradas ({guias ? guias.length : 0})</h3>
                </div>
                <div style={{ padding: '20px' }}>
                  {isLoadingData ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                      <p>Cargando guías...</p>
                    </div>
                  ) : !guias || !Array.isArray(guias) || guias.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                      <p>No hay guías registradas</p>
                    </div>
                  ) : (
                    Array.isArray(guias) && guias.map((guia, index) => (
                      <div key={`guia-${guia.id_guia || index}-${index}`} style={tableRowStyle}>
                        <div style={{ flex: 1 }}>
                          <strong>{guia.nombre || 'Sin nombre'}</strong>
                          <br />
                          <span style={{ color: '#64748b', fontSize: '14px' }}>
                            {`${guia.email || 'Sin email'} • ${guia.telefono || 'Sin teléfono'}`}
                          </span>
                          <br />
                          <span style={{ color: '#64748b', fontSize: '12px' }}>
                            {`Idiomas: ${guia.idiomas || 'No especificado'} • ⭐ ${guia.calificacion || 0}/5`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            style={{ 
                              padding: '8px 12px',
                              backgroundColor: '#3b82f6', 
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onClick={() => openEditGuia(guia)}
                          >
                            <Edit size={14} /> Editar
                          </button>
                          <button 
                            style={{ 
                              padding: '8px 12px',
                              backgroundColor: '#ef4444', 
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onClick={() => deleteGuia(guia.id_guia)}
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GESTIÓN DE TOURS */}
          {activeTab === 'tours' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#374151' }}>Gestión de Tours</h2>
                <button
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={openNewTour}
                >
                  <Plus size={16} /> Nuevo Tour
                </button>
              </div>
              
              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Tours Disponibles ({tours ? tours.length : 0})</h3>
                </div>
                <div style={{ padding: '20px' }}>
                  {isLoadingData ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                      <p>Cargando tours...</p>
                    </div>
                  ) : !tours || !Array.isArray(tours) || tours.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                      <p>No hay tours disponibles</p>
                    </div>
                  ) : (
                    Array.isArray(tours) && tours.map((tour, index) => (
                      <div key={`tour-${tour.id_tour || index}-${index}`} style={tableRowStyle}>
                        <div style={{ flex: 1 }}>
                          <strong>{tour.nombre || 'Sin nombre'}</strong>
                          <br />
                          <span style={{ color: '#64748b', fontSize: '14px' }}>
                            {`Duración: ${tour.duracion || 'No especificado'} • Precio: $${tour.precio || 0}`}
                          </span>
                          <br />
                          <span style={{ color: '#64748b', fontSize: '12px' }}>
                            {`Capacidad: ${tour.capacidad_maxima || 0} personas • Disponible: ${tour.disponible ? '✅' : '❌'}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            style={{ 
                              padding: '8px 12px',
                              backgroundColor: '#3b82f6', 
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onClick={() => openEditTour(tour)}
                          >
                            <Edit size={14} /> Editar
                          </button>
                          <button 
                            style={{ 
                              padding: '8px 12px',
                              backgroundColor: '#ef4444', 
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onClick={() => deleteTour(tour.id_tour)}
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GESTIÓN DE SERVICIOS */}
          {activeTab === 'servicios' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#374151' }}>Gestión de Servicios</h2>
                <button
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={openNewServicio}
                >
                  <Plus size={16} /> Nuevo Servicio
                </button>
              </div>
              
              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Servicios Turísticos ({servicios.length})</h3>
                </div>
                {servicios.map((servicio, index) => (
                  <div key={`servicio-${servicio.id}-${index}`} style={tableRowStyle}>
                    <div style={{ flex: 1 }}>
                      <strong>{servicio.nombre}</strong>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>
                        {`${servicio.categoria} • $${servicio.precio}`}
                      </span>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        {`${servicio.destino} • Proveedor: ${servicio.proveedor}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        style={{ ...actionButtonStyle, backgroundColor: '#3b82f6', color: 'white' }}
                        onClick={() => openEditServicio(servicio)}
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button 
                        style={{ ...actionButtonStyle, backgroundColor: '#ef4444', color: 'white' }}
                        onClick={() => deleteServicio(servicio.id)}
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={tableStyle}>
              <div style={tableHeaderStyle}>
                <h3 style={{ margin: 0 }}>Configuración del Sistema</h3>
              </div>
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                <Settings size={48} style={{ marginBottom: '20px' }} />
                <p>Panel de configuración en desarrollo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formularios */}
      <DestinoForm
        show={showDestinoForm}
        onClose={() => {
          setShowDestinoForm(false);
          setEditingDestino(null);
        }}
        onSave={handleSaveDestino}
        destino={editingDestino}
        isEditing={!!editingDestino}
      />

      <GuiaForm
        show={showGuiaForm}
        onClose={() => {
          setShowGuiaForm(false);
          setEditingGuia(null);
        }}
        onSave={handleSaveGuia}
        guia={editingGuia}
        isEditing={!!editingGuia}
      />

      <TourForm
        show={showTourForm}
        onClose={() => {
          setShowTourForm(false);
          setEditingTour(null);
        }}
        onSave={handleSaveTour}
        tour={editingTour}
        isEditing={!!editingTour}
        guias={guias}
      />

      <ServicioForm
        show={showServicioForm}
        onClose={() => {
          setShowServicioForm(false);
          setEditingServicio(null);
        }}
        onSave={handleSaveServicio}
        servicio={editingServicio}
        isEditing={!!editingServicio}
        destinos={destinos}
      />

      {/* Modal de Detalles de Usuario */}
      {showUserDetailModal && viewingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Detalles del Usuario</h2>
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setViewingUser(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '24px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
                    Nombre
                  </label>
                  <p style={{ margin: '5px 0 0 0', color: '#1f2937', fontSize: '16px' }}>
                    {viewingUser.nombre || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No especificado</span>}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
                    Apellido
                  </label>
                  <p style={{ margin: '5px 0 0 0', color: viewingUser.apellido ? '#1f2937' : '#9ca3af', fontSize: '16px', fontStyle: viewingUser.apellido ? 'normal' : 'italic' }}>
                    {viewingUser.apellido || 'No especificado'}
                  </p>
                </div>
              </div>

              <div>
                <label style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
                  Email
                </label>
                <p style={{ margin: '5px 0 0 0', color: '#1f2937', fontSize: '16px' }}>
                  {viewingUser.email || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No especificado</span>}
                </p>
              </div>

              <div>
                <label style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
                  Nombre de Usuario
                </label>
                <p style={{ margin: '5px 0 0 0', color: viewingUser.username ? '#1f2937' : '#9ca3af', fontSize: '16px', fontStyle: viewingUser.username ? 'normal' : 'italic' }}>
                  {viewingUser.username ? `@${viewingUser.username}` : 'No especificado'}
                </p>
              </div>

              {viewingUser.fecha_nacimiento ? (
                <div>
                  <label style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
                    Fecha de Nacimiento
                  </label>
                  <p style={{ margin: '5px 0 0 0', color: '#1f2937', fontSize: '16px' }}>
                    {viewingUser.fecha_nacimiento}
                  </p>
                </div>
              ) : (
                <div>
                  <label style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
                    Fecha de Nacimiento
                  </label>
                  <p style={{ margin: '5px 0 0 0', color: '#9ca3af', fontSize: '16px', fontStyle: 'italic' }}>
                    No especificado
                  </p>
                </div>
              )}

              <div>
                <label style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
                  ID de Usuario
                </label>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px', fontFamily: 'monospace' }}>
                  {viewingUser.id_usuario || 'N/A'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setViewingUser(null);
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
