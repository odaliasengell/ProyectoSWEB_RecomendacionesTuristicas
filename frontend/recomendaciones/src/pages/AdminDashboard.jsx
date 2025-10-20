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
    
    try {
      // Cargar estadísticas
      const statsResponse = await fetch('http://localhost:8000/admin/panel/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Cargar usuarios
      const usersResponse = await fetch('http://localhost:8000/admin/panel/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
      const response = await fetch(`http://localhost:8000/admin/panel/users/${userId}`, {
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
      console.error('Error deleting user:', error);
      alert('Error de conexión');
    }
  };

  // ==================== FUNCIONES PARA GESTIÓN TURÍSTICA ====================
  const loadDestinos = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:8000/admin/turismo/destinos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDestinos(data);
      } else {
        console.log('API error for destinos, status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        setDestinos([]);
      }
    } catch (error) {
      console.error('Error loading destinos:', error);
      // Datos de prueba cuando la API falla
      setDestinos([
        {
          id_destino: 1,
          nombre: "Quito Centro Histórico",
          descripcion: "El centro histórico más grande de América",
          ciudad: "Quito",
          provincia: "Pichincha",
          categoria: "cultural",
          calificacion_promedio: 4.8,
          latitud: -0.2201641,
          longitud: -78.5123274
        },
        {
          id_destino: 2,
          nombre: "Islas Galápagos",
          descripcion: "Paraíso natural único en el mundo",
          ciudad: "Puerto Ayora",
          provincia: "Galápagos", 
          categoria: "natural",
          calificacion_promedio: 4.9,
          latitud: -0.7669,
          longitud: -90.3022
        },
        {
          id_destino: 3,
          nombre: "Baños de Agua Santa",
          descripcion: "Destino de aventura y relajación",
          ciudad: "Baños",
          provincia: "Tungurahua",
          categoria: "aventura",
          calificacion_promedio: 4.7,
          latitud: -1.3965,
          longitud: -78.4247
        }
      ]);
    }
  };

  const loadGuias = async () => {
    setIsLoadingData(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:8000/admin/turismo/guias', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGuias(data.guias || []);
      } else {
        // Datos de prueba cuando la API falla
        setGuias([
          {
            id_guia: 1,
            nombre: "María González",
            email: "maria@guia.com",
            telefono: "099-123-4567",
            idiomas: "Español, Inglés",
            calificacion: 4.8,
            experiencia: "5 años de experiencia en turismo",
            disponible: true
          },
          {
            id_guia: 2,
            nombre: "Carlos Ruiz",
            email: "carlos@guia.com",
            telefono: "098-765-4321",
            idiomas: "Español, Inglés, Francés",
            calificacion: 4.9,
            experiencia: "8 años como guía profesional",
            disponible: true
          }
        ]);
      }
    } catch (error) {
      // Datos de prueba cuando la API falla
      setGuias([
        {
          id_guia: 1,
          nombre: "María González",
          email: "maria@guia.com",
          telefono: "099-123-4567",
          idiomas: "Español, Inglés",
          calificacion: 4.8,
          experiencia: "5 años de experiencia en turismo",
          disponible: true
        },
        {
          id_guia: 2,
          nombre: "Carlos Ruiz",
          email: "carlos@guia.com",
          telefono: "098-765-4321",
          idiomas: "Español, Inglés, Francés",
          calificacion: 4.9,
          experiencia: "8 años como guía profesional",
          disponible: true
        }
      ]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTours = async () => {
    setIsLoadingData(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:8000/admin/turismo/tours', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTours(data.tours || []);
      } else {
        console.error('Error loading tours:', response.status);
        // Datos de prueba cuando la API falla
        setTours([
          {
            id_tour: 1,
            nombre: "Tour Quito Colonial",
            descripcion: "Recorrido por el centro histórico de Quito",
            duracion: "4 horas",
            precio: 45.00,
            capacidad_maxima: 15,
            disponible: true,
            guia_asignada: "María González"
          },
          {
            id_tour: 2,
            nombre: "Aventura en Baños",
            descripcion: "Tour de aventura con deportes extremos",
            duracion: "1 día",
            precio: 120.00,
            capacidad_maxima: 8,
            disponible: true,
            guia_asignada: "Carlos Ruiz"
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading tours:', error);
      // Datos de prueba cuando la API falla
      setTours([
        {
          id_tour: 1,
          nombre: "Tour Quito Colonial",
          descripcion: "Recorrido por el centro histórico de Quito",
          duracion: "4 horas",
          precio: 45.00,
          capacidad_maxima: 15,
          disponible: true,
          guia_asignada: "María González"
        },
        {
          id_tour: 2,
          nombre: "Aventura en Baños",
          descripcion: "Tour de aventura con deportes extremos",
          duracion: "1 día",
          precio: 120.00,
          capacidad_maxima: 8,
          disponible: true,
          guia_asignada: "Carlos Ruiz"
        }
      ]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadServicios = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:8000/admin/turismo/servicios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setServicios(data.servicios || []);
      } else {
        console.log('API error for servicios, status:', response.status);
        // Datos de prueba cuando la API falla (incluyendo error 500)
        setServicios([
          {
            id: 1,
            nombre: "Hotel Casa Gangotena",
            descripcion: "Hotel boutique en el centro histórico de Quito",
            precio: 150.00,
            categoria: "hotel",
            destino: "Quito",
            duracion_dias: 1,
            capacidad_maxima: 2,
            disponible: true,
            proveedor: "Casa Gangotena S.A.",
            telefono_contacto: "02-400-8000",
            email_contacto: "info@casagangotena.com"
          },
          {
            id: 2,
            nombre: "Tour Gastronómico Quito",
            descripcion: "Experiencia culinaria por el centro histórico",
            precio: 75.00,
            categoria: "gastronomico",
            destino: "Quito",
            duracion_dias: 1,
            capacidad_maxima: 12,
            disponible: true,
            proveedor: "Quito Gourmet Tours",
            telefono_contacto: "099-555-1234",
            email_contacto: "tours@quitogourmet.com"
          },
          {
            id: 3,
            nombre: "Transporte Aeropuerto",
            descripcion: "Transporte privado desde/hacia el aeropuerto",
            precio: 25.00,
            categoria: "transporte",
            destino: "Quito",
            duracion_dias: 1,
            capacidad_maxima: 4,
            disponible: true,
            proveedor: "Transfers Ecuador",
            telefono_contacto: "098-777-9999",
            email_contacto: "info@transfersec.com"
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading servicios:', error);
      // Datos de prueba cuando hay error de conexión
      setServicios([
        {
          id: 1,
          nombre: "Hotel Casa Gangotena",
          descripcion: "Hotel boutique en el centro histórico de Quito",
          precio: 150.00,
          categoria: "hotel",
          destino: "Quito",
          duracion_dias: 1,
          capacidad_maxima: 2,
          disponible: true,
          proveedor: "Casa Gangotena S.A.",
          telefono_contacto: "02-400-8000",
          email_contacto: "info@casagangotena.com"
        },
        {
          id: 2,
          nombre: "Tour Gastronómico Quito",
          descripcion: "Experiencia culinaria por el centro histórico",
          precio: 75.00,
          categoria: "gastronomico",
          destino: "Quito",
          duracion_dias: 1,
          capacidad_maxima: 12,
          disponible: true,
          proveedor: "Quito Gourmet Tours",
          telefono_contacto: "099-555-1234",
          email_contacto: "tours@quitogourmet.com"
        },
        {
          id: 3,
          nombre: "Transporte Aeropuerto",
          descripcion: "Transporte privado desde/hacia el aeropuerto",
          precio: 25.00,
          categoria: "transporte",
          destino: "Quito",
          duracion_dias: 1,
          capacidad_maxima: 4,
          disponible: true,
          proveedor: "Transfers Ecuador",
          telefono_contacto: "098-777-9999",
          email_contacto: "info@transfersec.com"
        }
      ]);
    }
  };

  const deleteDestino = async (id) => {
    if (!window.confirm('¿Eliminar este destino?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:8000/admin/turismo/destinos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadDestinos();
        alert('Destino eliminado');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteGuia = async (id) => {
    if (!window.confirm('¿Eliminar esta guía?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:8000/admin/turismo/guias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadGuias();
        alert('Guía eliminada');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteTour = async (id) => {
    if (!window.confirm('¿Eliminar este tour?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:8000/admin/turismo/tours/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadTours();
        alert('Tour eliminado');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteServicio = async (id) => {
    if (!window.confirm('¿Eliminar este servicio?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:8000/admin/turismo/servicios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadServicios();
        alert('Servicio eliminado');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Funciones para manejar formularios
  const handleSaveDestino = async (destinoData) => {
    const token = localStorage.getItem('adminToken');
    try {
      const url = editingDestino 
        ? `http://localhost:8000/admin/turismo/destinos/${editingDestino.id}`
        : 'http://localhost:8000/admin/turismo/destinos';
      
      const method = editingDestino ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(destinoData)
      });

      if (response.ok) {
        setShowDestinoForm(false);
        setEditingDestino(null);
        loadDestinos();
        alert(editingDestino ? 'Destino actualizado' : 'Destino creado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar destino');
    }
  };

  const handleSaveGuia = async (guiaData) => {
    const token = localStorage.getItem('adminToken');
    try {
      const url = editingGuia 
        ? `http://localhost:8000/admin/turismo/guias/${editingGuia.id}`
        : 'http://localhost:8000/admin/turismo/guias';
      
      const method = editingGuia ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(guiaData)
      });

      if (response.ok) {
        setShowGuiaForm(false);
        setEditingGuia(null);
        loadGuias();
        alert(editingGuia ? 'Guía actualizada' : 'Guía creada');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar guía');
    }
  };

  const handleSaveTour = async (tourData) => {
    const token = localStorage.getItem('adminToken');
    try {
      const url = editingTour 
        ? `http://localhost:8000/admin/turismo/tours/${editingTour.id}`
        : 'http://localhost:8000/admin/turismo/tours';
      
      const method = editingTour ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tourData)
      });

      if (response.ok) {
        setShowTourForm(false);
        setEditingTour(null);
        loadTours();
        alert(editingTour ? 'Tour actualizado' : 'Tour creado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar tour');
    }
  };

  const handleSaveServicio = async (servicioData) => {
    const token = localStorage.getItem('adminToken');
    try {
      const url = editingServicio 
        ? `http://localhost:8000/admin/turismo/servicios/${editingServicio.id}`
        : 'http://localhost:8000/admin/turismo/servicios';
      
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
        setShowServicioForm(false);
        setEditingServicio(null);
        loadServicios();
        alert(editingServicio ? 'Servicio actualizado' : 'Servicio creado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar servicio');
    }
  };

  // Funciones para abrir formularios de edición
  const openEditDestino = (destino) => {
    setEditingDestino(destino);
    setShowDestinoForm(true);
  };

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
                  icon={Users}
                  title="Total Usuarios"
                  value={stats.total_usuarios}
                  color="#3b82f6"
                />
                <StatCard
                  icon={Shield}
                  title="Administradores"
                  value={stats.total_administradores}
                  color="#10b981"
                />
                <StatCard
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
                {users.slice(0, 5).map((user) => (
                  <div key={user.id_usuario} style={tableRowStyle}>
                    <div>
                      <strong>{user.nombre} {user.apellido}</strong>
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
              {users.map((user) => (
                <div key={user.id_usuario} style={tableRowStyle}>
                  <div style={{ flex: 1 }}>
                    <strong>{user.nombre} {user.apellido}</strong>
                    <br />
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      {user.email} • @{user.username}
                    </span>
                    {user.fecha_nacimiento && (
                      <br />
                    )}
                    {user.fecha_nacimiento && (
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        Nacimiento: {user.fecha_nacimiento}
                      </span>
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
                  onClick={() => setShowDestinoForm(true)}
                >
                  <Plus size={16} /> Nuevo Destino
                </button>
              </div>
              
              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Destinos Registrados ({destinos.length})</h3>
                </div>
                {destinos.map((destino) => (
                  <div key={destino.id_destino} style={tableRowStyle}>
                    <div style={{ flex: 1 }}>
                      <strong>{destino.nombre}</strong>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>
                        {destino.ciudad}, {destino.provincia} • {destino.categoria}
                      </span>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        Calificación: ⭐ {destino.calificacion_promedio}/5
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
                        onClick={() => deleteDestino(destino.id_destino)}
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
                  onClick={() => setShowGuiaForm(true)}
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
                      <div key={guia.id_guia || index} style={tableRowStyle}>
                        <div style={{ flex: 1 }}>
                          <strong>{guia.nombre || 'Sin nombre'}</strong>
                          <br />
                          <span style={{ color: '#64748b', fontSize: '14px' }}>
                            {guia.email || 'Sin email'} • {guia.telefono || 'Sin teléfono'}
                          </span>
                          <br />
                          <span style={{ color: '#64748b', fontSize: '12px' }}>
                            Idiomas: {guia.idiomas || 'No especificado'} • ⭐ {guia.calificacion || 0}/5
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
                  onClick={() => setShowTourForm(true)}
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
                      <div key={tour.id_tour || index} style={tableRowStyle}>
                        <div style={{ flex: 1 }}>
                          <strong>{tour.nombre || 'Sin nombre'}</strong>
                          <br />
                          <span style={{ color: '#64748b', fontSize: '14px' }}>
                            Duración: {tour.duracion || 'No especificado'} • Precio: ${tour.precio || 0}
                          </span>
                          <br />
                          <span style={{ color: '#64748b', fontSize: '12px' }}>
                            Capacidad: {tour.capacidad_maxima || 0} personas • Disponible: {tour.disponible ? '✅' : '❌'}
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
                  onClick={() => setShowServicioForm(true)}
                >
                  <Plus size={16} /> Nuevo Servicio
                </button>
              </div>
              
              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Servicios Turísticos ({servicios.length})</h3>
                </div>
                {servicios.map((servicio) => (
                  <div key={servicio.id} style={tableRowStyle}>
                    <div style={{ flex: 1 }}>
                      <strong>{servicio.nombre}</strong>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>
                        {servicio.categoria} • ${servicio.precio}
                      </span>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        {servicio.destino} • Proveedor: {servicio.proveedor}
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
      />
    </div>
  );
};

export default AdminDashboard;