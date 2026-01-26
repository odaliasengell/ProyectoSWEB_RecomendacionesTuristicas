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
  Edit,
  Zap,
  Calendar,
  FileText,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importar formularios
import DestinoForm from '../components/DestinoForm';
import GuiaForm from '../components/GuiaForm';
import TourForm from '../components/TourForm';
import ServicioForm from '../components/ServicioForm';
import ReportesPanel from '../components/ReportesPanel';

// Importar servicios REST unificados
import { getUsuarios, getUsuarioById } from '../services/api/usuarios.service';
import {
  getDestinos,
  createDestino,
  updateDestino,
  deleteDestino,
} from '../services/api/destinos.service';
import {
  getGuias,
  createGuia,
  updateGuia,
  deleteGuia,
} from '../services/api/guias.service';
import {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
} from '../services/api/tours.service';
import {
  getServicios,
  createServicio,
  updateServicio,
  deleteServicio as eliminarServicio,
} from '../services/api/servicios.service';
import {
  getReservas,
  actualizarReserva,
} from '../services/api/reservas.service';
import { getRecomendaciones } from '../services/api/recomendaciones.service';
import {
  getContrataciones,
  updateContratacion,
} from '../services/api/contrataciones.service';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_usuarios: 0,
    total_administradores: 0,
    usuarios_activos: 0,
  });
  const [users, setUsers] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [guias, setGuias] = useState([]);
  const [tours, setTours] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [contrataciones, setContrataciones] = useState([]);
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

  // Estados para datos del usuario
  const [userReservas, setUserReservas] = useState([]);
  const [userRecomendaciones, setUserRecomendaciones] = useState([]);
  const [userContrataciones, setUserContrataciones] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación de admin
    // Opción 1: Sistema antiguo (adminToken + adminData)
    const adminToken = localStorage.getItem('adminToken');
    const adminDataOld = localStorage.getItem('adminData');

    if (adminToken && adminDataOld) {
      setAdminData(JSON.parse(adminDataOld));
      loadDashboardData();
      return;
    }

    // Opción 2: Sistema JWT Auth Service
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      const user = JSON.parse(userData);

      if (user.role === 'admin') {
        console.log('✅ [AdminDashboard] Admin JWT autenticado:', user.email);
        // Mapear datos del Auth Service al formato del AdminDashboard
        setAdminData({
          nombre: user.fullName || user.firstName || user.email,
          username: user.username || user.email,
          email: user.email,
          role: user.role,
        });
        loadDashboardData();
        return;
      } else {
        console.warn(
          '❌ [AdminDashboard] Usuario no es admin, rol:',
          user.role,
        );
      }
    }

    // Si no hay autenticación válida, redirigir a login
    navigate('/admin/login');
  }, [navigate]);

  const loadDashboardData = async () => {
    console.log('🔄 Cargando datos del dashboard...');

    try {
      // Cargar usuarios usando el servicio REST
      console.log('� Cargando usuarios...');
      const usersData = await getUsuarios();
      console.log('✅ Usuarios cargados:', usersData.length, 'usuarios');
      setUsers(usersData);

      // Calcular estadísticas desde los datos cargados
      const statsData = {
        total_usuarios: usersData.length,
        total_administradores: usersData.filter(
          (u) => u.rol === 'admin' || u.is_admin,
        ).length,
        usuarios_activos: usersData.filter((u) => u.activo !== false).length,
      };
      setStats(statsData);
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
    if (
      !window.confirm('¿Estás seguro de que quieres eliminar este usuario?')
    ) {
      return;
    }

    try {
      // Nota: deleteUsuario está en usuarios.service.ts pero requiere importación
      // Por ahora usamos fetch directo para endpoints admin específicos
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000'}/admin/panel/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
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
  const handleViewUser = async (user) => {
    console.log('👁️ Viendo detalles de usuario:', user);
    console.log('   - user.id:', user.id);
    console.log('   - user._id:', user._id);
    console.log('   - user.id_usuario:', user.id_usuario);

    setViewingUser(user);
    setShowUserDetailModal(true);

    // Cargar datos adicionales del usuario (aceptar múltiples formatos de ID)
    const userId = user.id || user._id || user.id_usuario;
    console.log('   - userId final:', userId);
    await loadUserData(userId, user.email);
  };

  // Función para cargar reservas, recomendaciones y contrataciones del usuario
  const loadUserData = async (userId, userEmail) => {
    setLoadingUserData(true);
    console.log('📊 Cargando datos del usuario:', userId, 'Email:', userEmail);

    try {
      // 1. Cargar Reservas usando el servicio REST
      try {
        console.log('📅 Cargando reservas del usuario...');
        const allReservas = await getReservas();
        console.log('📊 Total reservas:', allReservas.length);
        console.log('🔍 UserID buscado:', userId);

        if (allReservas.length > 0) {
          console.log('📋 Primera reserva (ejemplo):', allReservas[0]);
        }

        // Filtrar usando la misma lógica que obtenerMisReservas
        const userReservasData = allReservas.filter(
          (reserva) => reserva.usuario_id === userId,
        );

        setUserReservas(
          Array.isArray(userReservasData) ? userReservasData : [],
        );
        console.log(
          `✅ ${userReservasData.length} reservas del usuario cargadas`,
        );
      } catch (error) {
        console.error('⚠️ Error cargando reservas:', error.message);
        setUserReservas([]);
      }

      // 2. Cargar Recomendaciones usando el servicio REST
      try {
        console.log('⭐ Cargando recomendaciones del usuario...');
        const allRecomendaciones = await getRecomendaciones();
        console.log('📊 Total de recomendaciones:', allRecomendaciones.length);
        console.log('🔍 UserID buscado:', userId);

        if (allRecomendaciones.length > 0) {
          console.log(
            '📋 Primera recomendación (ejemplo):',
            allRecomendaciones[0],
          );
        }

        // Filtrar usando la misma lógica que obtenerMisRecomendaciones
        const userRecomendacionesData = allRecomendaciones.filter(
          (rec) => rec.id_usuario === userId,
        );

        setUserRecomendaciones(userRecomendacionesData);
        console.log(
          `✅ ${userRecomendacionesData.length} recomendaciones del usuario cargadas`,
        );
        if (userRecomendacionesData.length > 0) {
          console.log(
            '📋 Recomendaciones encontradas:',
            userRecomendacionesData,
          );
        }
      } catch (error) {
        console.error('⚠️ Error cargando recomendaciones:', error.message);
        setUserRecomendaciones([]);
      }

      // 3. Cargar Contrataciones usando el servicio REST
      try {
        console.log('📋 Cargando contrataciones del usuario...');
        const allContrataciones = await getContrataciones();
        // Filtrar por email del usuario
        const userContratacionesData = allContrataciones.filter(
          (c) => c.cliente_email === userEmail,
        );
        setUserContrataciones(
          Array.isArray(userContratacionesData) ? userContratacionesData : [],
        );
        console.log(
          `✅ ${userContratacionesData.length} contrataciones del usuario cargadas`,
        );
      } catch (error) {
        console.error('⚠️ Error cargando contrataciones:', error.message);
        setUserContrataciones([]);
      }
    } catch (error) {
      console.error('💥 Error general cargando datos del usuario:', error);
    } finally {
      setLoadingUserData(false);
    }
  };

  // ==================== FUNCIONES PARA GESTIÓN TURÍSTICA ====================
  const loadDestinos = async () => {
    console.log('🏖️ Cargando destinos...');
    try {
      const data = await getDestinos();
      console.log('✅ Destinos cargados:', data.length, 'destinos');
      if (data.length > 0) {
        console.log('📋 Primer destino (ejemplo):', data[0]);
        console.log('🆔 Campo id del primer destino:', data[0].id);
        console.log('🆔 Campo _id del primer destino:', data[0]._id);
        // Debug: Ver las URLs de imágenes de los destinos
        console.log(
          '🖼️ Imágenes de destinos:',
          data.map((d) => ({
            nombre: d.nombre,
            imagen_url: d.imagen_url,
            ruta: d.ruta,
          })),
        );
      }
      setDestinos(data);
    } catch (error) {
      console.error('💥 Error loading destinos:', error);
      setDestinos([]);
    }
  };

  const loadGuias = async () => {
    setIsLoadingData(true);
    console.log('👨‍🏫 Cargando guías...');
    try {
      const data = await getGuias();
      console.log('✅ Guías cargadas:', data);
      setGuias(data || []);
    } catch (error) {
      console.error('💥 Error loading guías:', error);
      setGuias([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTours = async () => {
    setIsLoadingData(true);
    console.log('🚌 Cargando tours...');
    try {
      // Cargar tours, destinos y guías en paralelo
      const [toursData, destinosData, guiasData] = await Promise.all([
        getTours(),
        getDestinos(),
        getGuias(),
      ]);

      console.log('✅ Tours cargados:', toursData);
      console.log('✅ Destinos cargados:', destinosData.length, 'destinos');
      console.log('✅ Guías cargadas:', guiasData.length, 'guías');

      // Debug: Ver las URLs de imágenes de los tours
      if (toursData && toursData.length > 0) {
        console.log(
          '🖼️ Imágenes de tours:',
          toursData.map((t) => ({
            nombre: t.nombre,
            imagen_url: t.imagen_url,
          })),
        );
        // Debug primer tour
        console.log('🔍 Primer tour:', toursData[0]);
        console.log('  - destino_id:', toursData[0].destino_id);
        console.log('  - guia_id:', toursData[0].guia_id);
      }

      setTours(toursData || []);
      setDestinos(destinosData || []);
      setGuias(guiasData || []);
    } catch (error) {
      console.error('💥 Error loading tours:', error);
      setTours([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadServicios = async () => {
    console.log('🚌 Cargando servicios...');
    try {
      const data = await getServicios();
      console.log('✅ Servicios cargados:', data);
      setServicios(data || []);
    } catch (error) {
      console.error('❌ Error loading servicios:', error);
      setServicios([]);
    }
  };

  const loadReservas = async () => {
    setIsLoadingData(true);
    console.log('📅 Cargando reservas...');
    try {
      const data = await getReservas();
      console.log('✅ Reservas cargadas:', data);

      // Enriquecer cada reserva con información del usuario, guía y tour
      const reservasEnriquecidas = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (reserva) => {
          // Usar el ID que devuelve el backend (puede ser usuario_id o id_usuario)
          const usuarioId = reserva.usuario_id || reserva.id_usuario;
          const tourId = reserva.tour_id || reserva.id_tour;

          let usuarioNombre = usuarioId
            ? `ID: ${usuarioId.toString().substring(0, 8)}...`
            : 'Sin usuario';
          let guiaNombre = 'N/A';
          let tourNombre = tourId ? `Tour ${tourId}` : 'N/A';

          console.log('🔍 Debug reserva:', { reserva, usuarioId, tourId });

          // Obtener información del usuario
          if (usuarioId) {
            try {
              const userData = await getUsuarioById(usuarioId);
              usuarioNombre =
                `${userData.nombre || ''} ${userData.apellido || ''}`.trim() ||
                userData.username ||
                'Sin nombre';
            } catch (error) {
              console.error('Error cargando usuario:', error.message);
            }
          }

          // Obtener información del tour y guía
          if (tourId) {
            try {
              const tourData = await getTourById(tourId);
              tourNombre = tourData.nombre || `Tour ${tourId}`;

              // Obtener guía si existe (usar guia_id como campo principal)
              const guiaId = tourData.guia_id;
              if (guiaId) {
                const guiaData = await getGuias().then((guias) =>
                  guias.find((g) => g.id === guiaId || g._id === guiaId),
                );
                if (guiaData) {
                  guiaNombre =
                    `${guiaData.nombre || ''} ${guiaData.apellido || ''}`.trim() ||
                    'Sin nombre';
                }
              }
            } catch (error) {
              console.error('Error cargando tour/guía:', error.message);
            }
          }

          return {
            ...reserva,
            usuarioNombre,
            guiaNombre,
            tourNombre,
          };
        }),
      );

      setReservas(reservasEnriquecidas);
    } catch (error) {
      console.error('💥 Error loading reservas:', error);
      setReservas([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadRecomendaciones = async () => {
    setIsLoadingData(true);
    console.log('⭐ Cargando recomendaciones...');
    try {
      const data = await getRecomendaciones();
      console.log('✅ Recomendaciones cargadas:', data);

      // Enriquecer cada recomendación con información del usuario y el tipo real (tour o servicio)
      const recomendacionesEnriquecidas = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (rec) => {
          let usuarioNombre = `ID: ${(rec.id_usuario || '').toString().substring(0, 8)}...`;
          let tipo = 'Desconocido';
          let itemNombre = 'N/A';

          // Obtener información del usuario
          try {
            const userData = await getUsuarioById(rec.id_usuario);
            usuarioNombre =
              `${userData.nombre || ''} ${userData.apellido || ''}`.trim() ||
              userData.username ||
              'Sin nombre';
          } catch (error) {
            console.error('Error cargando usuario:', error);
          }

          // Verificar si es un tour
          if (rec.id_tour) {
            try {
              const tourData = await getTourById(rec.id_tour);
              tipo = 'Tour';
              itemNombre = tourData.nombre || `Tour ${rec.id_tour}`;
            } catch (error) {
              console.error('Error verificando tour:', error);
            }
          }

          // Verificar si es un servicio
          if (rec.id_servicio) {
            try {
              const servicios = await getServicios();
              const servicioData = servicios.find(
                (s) => s.id === rec.id_servicio || s._id === rec.id_servicio,
              );
              if (servicioData) {
                tipo = 'Servicio';
                itemNombre =
                  servicioData.nombre || `Servicio ${rec.id_servicio}`;
              }
            } catch (error) {
              console.error('Error verificando servicio:', error);
            }
          }

          // Si no tiene ni id_tour ni id_servicio, verificar el campo 'tipo'
          if (!rec.id_tour && !rec.id_servicio && rec.tipo) {
            tipo = rec.tipo;
          }

          return {
            ...rec,
            usuarioNombre,
            tipo,
            itemNombre,
          };
        }),
      );

      setRecomendaciones(recomendacionesEnriquecidas);
    } catch (error) {
      console.error('💥 Error loading recomendaciones:', error);
      setRecomendaciones([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadContrataciones = async () => {
    setIsLoadingData(true);
    console.log('📋 Cargando contrataciones...');
    try {
      const data = await getContrataciones();
      console.log('✅ Contrataciones cargadas:', data);

      // Enriquecer cada contratación con información del servicio y usuario
      const contratacionesEnriquecidas = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (contrato) => {
          const servicioId = contrato.servicio_id || contrato.id_servicio;
          const usuarioId = contrato.usuario_id || contrato.id_usuario;

          let servicioNombre = servicioId
            ? `ID: ${servicioId.toString().substring(0, 8)}...`
            : 'Sin servicio';
          let servicioDescripcion = '';
          let cliente_nombre = contrato.cliente_nombre || 'Sin usuario';
          let cliente_email = contrato.cliente_email || '';

          console.log('🔍 Debug contratación:', {
            contrato,
            servicioId,
            usuarioId,
          });

          // Obtener información del servicio
          if (servicioId) {
            try {
              const servicios = await getServicios();
              const serviceData = servicios.find(
                (s) => s.id === servicioId || s._id === servicioId,
              );
              if (serviceData) {
                servicioNombre = serviceData.nombre || 'Sin nombre';
                servicioDescripcion = serviceData.descripcion || '';
              } else {
                console.warn('⚠️ Servicio no encontrado:', servicioId);
              }
            } catch (error) {
              console.error('Error cargando servicio:', error.message);
            }
          }

          // Solo obtener información del usuario si no viene en los datos de la contratación
          if (!contrato.cliente_nombre && usuarioId) {
            try {
              const userData = await getUsuarioById(usuarioId);
              cliente_nombre =
                `${userData.nombre || ''} ${userData.apellido || ''}`.trim() ||
                userData.username ||
                'Sin nombre';
              cliente_email = userData.email || '';
            } catch (error) {
              console.error('Error cargando usuario:', error.message);
              cliente_nombre = `ID: ${usuarioId.toString().substring(0, 8)}...`;
            }
          }

          return {
            ...contrato,
            servicioNombre,
            servicioDescripcion,
            cliente_nombre,
            cliente_email,
          };
        }),
      );

      setContrataciones(contratacionesEnriquecidas);
    } catch (error) {
      console.error('💥 Error loading contrataciones:', error);
      setContrataciones([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Función para aceptar reserva
  const aceptarReserva = async (reservaId) => {
    if (!window.confirm('¿Deseas confirmar esta reserva?')) return;
    console.log('✅ Confirmando reserva:', reservaId);
    try {
      await actualizarReserva(reservaId, { estado: 'confirmada' });
      console.log('✅ Reserva confirmada exitosamente');
      alert('Reserva confirmada exitosamente');
      loadReservas(); // Recargar la lista
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al confirmar reserva');
    }
  };

  // Función para aceptar contratación
  const aceptarContratacion = async (contratacionId) => {
    if (!window.confirm('¿Deseas confirmar esta contratación?')) return;
    console.log('✅ Confirmando contratación:', contratacionId);
    try {
      await updateContratacion(contratacionId, { estado: 'confirmada' });
      console.log('✅ Contratación confirmada exitosamente');
      alert('Contratación confirmada exitosamente');
      loadContrataciones(); // Recargar la lista
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al confirmar contratación');
    }
  };

  // Funciones para abrir formularios
  const openNewDestino = () => {
    setEditingDestino(null);
    setShowDestinoForm(true);
  };

  const openEditDestino = (destino) => {
    console.log('✏️ Abriendo destino para editar:', destino);
    console.log('🆔 ID del destino:', destino.id);
    console.log('🆔 _ID del destino:', destino._id);
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

  const handleDeleteDestino = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este destino?')) return;
    console.log('🗑️ Eliminando destino:', id);
    try {
      await deleteDestino(id);
      console.log('✅ Destino eliminado');
      loadDestinos();
      alert('Destino eliminado exitosamente');
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al eliminar destino');
    }
  };

  const handleDeleteGuia = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta guía?')) return;
    console.log('🗑️ Eliminando guía:', id);
    try {
      await deleteGuia(id);
      console.log('✅ Guía eliminada');
      loadGuias();
      alert('Guía eliminada exitosamente');
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al eliminar guía');
    }
  };

  const handleDeleteTour = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este tour?')) return;
    console.log('🗑️ Eliminando tour:', id);
    try {
      await deleteTour(id);
      console.log('✅ Tour eliminado');
      loadTours();
      alert('Tour eliminado exitosamente');
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al eliminar tour');
    }
  };

  const handleDeleteServicio = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;
    console.log('🗑️ Eliminando servicio:', id);
    try {
      await eliminarServicio(id);
      console.log('✅ Servicio eliminado');
      loadServicios();
      alert('Servicio eliminado exitosamente');
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al eliminar servicio');
    }
  };

  // Funciones para manejar formularios
  const handleSaveDestino = async (destinoData) => {
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
      calificacion_promedio: destinoData.calificacion_promedio || 0.0,
    };

    console.log('🧹 Datos limpios a enviar:', cleanedData);

    try {
      let result;
      // Usar el id del destinoData si existe (viene del formulario)
      const destinoId =
        destinoData.id || (editingDestino ? editingDestino.id : null);

      if (destinoId) {
        console.log('📝 Actualizando destino con ID:', destinoId);
        result = await updateDestino(destinoId, cleanedData);
      } else {
        console.log('🆕 Creando nuevo destino');
        result = await createDestino(cleanedData);
      }
      console.log('✅ Destino guardado:', result);
      setShowDestinoForm(false);
      setEditingDestino(null);
      loadDestinos();
      alert(
        destinoId
          ? 'Destino actualizado exitosamente'
          : 'Destino creado exitosamente',
      );
    } catch (error) {
      console.error('💥 Error:', error);
      alert(
        'Error al guardar destino: ' + (error.message || 'Error desconocido'),
      );
    }
  };

  const handleSaveGuia = async (guiaData) => {
    console.log('💾 Guardando guía:', guiaData);
    try {
      // Preparar datos limpios
      const dataToSend = { ...guiaData };

      // Obtener el ID desde guiaData o editingGuia
      const guiaId = guiaData.id || editingGuia?.id_guia || editingGuia?.id;

      // Si es una actualización, remover _id, id_guia e id del body
      if (guiaId) {
        delete dataToSend._id;
        delete dataToSend.id_guia;
        delete dataToSend.id;
      }

      console.log('📤 Datos a enviar (después de limpiar):', dataToSend);

      let result;
      if (guiaId) {
        console.log('📝 Actualizando guía con ID:', guiaId);
        result = await updateGuia(guiaId, dataToSend);
      } else {
        console.log('🆕 Creando nueva guía');
        result = await createGuia(dataToSend);
      }
      console.log('✅ Guía guardada:', result);
      setShowGuiaForm(false);
      setEditingGuia(null);
      loadGuias();
      alert(
        guiaId ? 'Guía actualizada exitosamente' : 'Guía creada exitosamente',
      );
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al guardar guía: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleSaveTour = async (tourData) => {
    console.log('💾 Guardando tour:', tourData);
    try {
      // Los datos ya vienen con los nombres correctos (guia_id, destino_id)
      const dataToSend = {
        nombre: tourData.nombre,
        descripcion: tourData.descripcion,
        duracion: tourData.duracion,
        precio: tourData.precio,
        capacidad_maxima: tourData.capacidad_maxima,
        disponible: tourData.disponible,
        guia_id: tourData.guia_id || null,
        destino_id: tourData.destino_id || null,
        imagen_url: tourData.imagen_url || null,
      };

      // Obtener el ID desde tourData o editingTour
      const tourId = tourData.id || editingTour?.id_tour || editingTour?.id;

      console.log('📤 Datos a enviar al backend:', dataToSend);
      console.log('   🆔 guia_id:', dataToSend.guia_id);
      console.log('   � destino_id:', dataToSend.destino_id);
      console.log('�🔍 ID del tour para editar:', tourId);

      let result;
      if (tourId) {
        console.log('📝 Actualizando tour con ID:', tourId);
        result = await updateTour(tourId, dataToSend);
        console.log('✅ Respuesta del servidor:', result);
        console.log('   ➡️ guia_id devuelto:', result.guia_id);
        console.log('   ➡️ destino_id devuelto:', result.destino_id);
      } else {
        console.log('🆕 Creando nuevo tour');
        result = await createTour(dataToSend);
      }
      console.log('✅ Tour guardado completo:', result);
      setShowTourForm(false);
      setEditingTour(null);
      await loadTours(); // Esperar a que termine de cargar
      alert(
        tourId ? 'Tour actualizado exitosamente' : 'Tour creado exitosamente',
      );
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error al guardar tour: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleSaveServicio = async (servicioData) => {
    console.log('💾 Guardando servicio:', servicioData);
    try {
      // Preparar datos limpios
      const dataToSend = { ...servicioData };

      // Obtener el ID desde servicioData o editingServicio
      const servicioId =
        servicioData.id || editingServicio?.id || editingServicio?._id;

      // Si es una actualización, remover _id e id del body
      if (servicioId) {
        delete dataToSend._id;
        delete dataToSend.id;
      }

      console.log('📤 Datos a enviar (después de limpiar):', dataToSend);

      let result;
      if (servicioId) {
        console.log('📝 Actualizando servicio con ID:', servicioId);
        result = await updateServicio(servicioId, dataToSend);
      } else {
        console.log('🆕 Creando nuevo servicio');
        result = await createServicio(dataToSend);
      }
      console.log('✅ Servicio guardado:', result);
      setShowServicioForm(false);
      setEditingServicio(null);
      loadServicios();
      alert(
        servicioId
          ? 'Servicio actualizado exitosamente'
          : 'Servicio creado exitosamente',
      );
    } catch (error) {
      console.error('💥 Error:', error);
      alert(
        'Error al guardar servicio: ' + (error.message || 'Error desconocido'),
      );
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
    console.log('✏️ Abriendo servicio para editar:', servicio);
    console.log('   - ID:', servicio.id);
    console.log(
      '   - Disponible:',
      servicio.disponible,
      '(tipo:',
      typeof servicio.disponible,
      ')',
    );
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
        case 'reservas':
          loadReservas();
          break;
        case 'contrataciones':
          loadContrataciones();
          break;
        case 'recomendaciones':
          loadRecomendaciones();
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
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  };

  const sidebarStyle = {
    width: sidebarOpen ? '280px' : '70px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    transition: 'all 0.3s ease',
    position: 'relative',
    minHeight: '100vh',
  };

  const sidebarHeaderStyle = {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const sidebarMenuStyle = {
    padding: '20px 0',
  };

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid transparent',
  };

  const activeMenuItemStyle = {
    ...menuItemStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: '#3b82f6',
  };

  const mainContentStyle = {
    flex: 1,
    padding: '0',
    overflow: 'auto',
  };

  const headerStyle = {
    backgroundColor: 'white',
    padding: '20px 30px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const contentStyle = {
    padding: '30px',
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  };

  const statCardStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  };

  const tableStyle = {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  };

  const tableHeaderStyle = {
    backgroundColor: '#f8fafc',
    padding: '20px 25px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const tableCellHeaderStyle = {
    padding: '12px 15px',
    textAlign: 'left',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const tableCellStyle = {
    padding: '12px 15px',
    color: '#1e293b',
    fontSize: '14px',
  };

  const tableRowStyle = {
    padding: '15px 25px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    margin: '0 5px',
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0,
            }}
          >
            {value}
          </p>
        </div>
        <div
          style={{
            backgroundColor: color,
            padding: '12px',
            borderRadius: '10px',
            color: 'white',
          }}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '18px',
          color: '#64748b',
        }}
      >
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
            {sidebarOpen && (
              <span style={{ marginLeft: '10px', fontWeight: '600' }}>
                Admin Panel
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '5px',
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
            icon={Calendar}
            label="Reservas"
            isActive={activeTab === 'reservas'}
            onClick={() => setActiveTab('reservas')}
          />
          <MenuIcon
            icon={FileText}
            label="Contrataciones"
            isActive={activeTab === 'contrataciones'}
            onClick={() => setActiveTab('contrataciones')}
          />
          <MenuIcon
            icon={Star}
            label="Recomendaciones"
            isActive={activeTab === 'recomendaciones'}
            onClick={() => setActiveTab('recomendaciones')}
          />
          <MenuIcon
            icon={BarChart3}
            label="Reportes"
            isActive={activeTab === 'reportes'}
            onClick={() => setActiveTab('reportes')}
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
              {activeTab === 'destinos' && 'Gestión de Destinos'}
              {activeTab === 'guias' && 'Gestión de Guías'}
              {activeTab === 'tours' && 'Gestión de Tours'}
              {activeTab === 'servicios' && 'Gestión de Servicios'}
              {activeTab === 'reservas' && 'Gestión de Reservas'}
              {activeTab === 'contrataciones' && 'Gestión de Contrataciones'}
              {activeTab === 'recomendaciones' && 'Gestión de Recomendaciones'}
              {activeTab === 'reportes' && 'Reportes y Análisis'}
              {activeTab === 'settings' && 'Configuración'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#64748b' }}>
              Bienvenido, {adminData?.nombre}
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1e3a8a',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
              }}
            >
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
                  value={1}
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
                  <div
                    key={`user-recent-${user.id_usuario}-${index}`}
                    style={tableRowStyle}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{`${user.nombre} ${user.apellido}`}</strong>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>
                        {user.email}
                      </span>
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
            <div>
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <Users size={24} style={{ color: '#3b82f6' }} />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1e293b',
                    }}
                  >
                    Lista de Usuarios
                  </h3>
                </div>
                <p
                  style={{
                    margin: '0 0 20px 36px',
                    fontSize: '14px',
                    color: '#64748b',
                  }}
                >
                  {users.length} usuarios totales
                </p>

                {users.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px',
                      color: '#64748b',
                    }}
                  >
                    <Users
                      size={48}
                      style={{ margin: '0 auto 15px', opacity: 0.5 }}
                    />
                    <p>No hay usuarios registrados</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                    <div style={{ minWidth: '1200px' }}>
                      {/* Header de la tabla */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '120px 200px 250px 180px 150px 180px',
                          gap: '15px',
                          padding: '15px 20px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px 8px 0 0',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        <div>ID</div>
                        <div>Nombre Completo</div>
                        <div>Email</div>
                        <div>Username</div>
                        <div>Fecha Nacimiento</div>
                        <div>Acciones</div>
                      </div>

                      {/* Filas de datos */}
                      {users.map((user, index) => (
                        <div
                          key={`user-all-${user.id_usuario}-${index}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '120px 200px 250px 180px 150px 180px',
                            gap: '15px',
                            padding: '20px',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '14px',
                            color: '#1e293b',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            transition: 'background-color 0.2s',
                            cursor: 'default',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#f8fafc')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'white')
                          }
                        >
                          <div
                            style={{
                              color: '#64748b',
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            #
                            {(user.id_usuario || 'N/A')
                              .toString()
                              .substring(0, 10)}
                            ...
                          </div>
                          <div style={{ fontWeight: '600' }}>
                            {`${user.nombre} ${user.apellido}`}
                          </div>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: '#64748b',
                            }}
                          >
                            {user.email}
                          </div>
                          <div style={{ color: '#3b82f6', fontWeight: '500' }}>
                            @{user.username}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '13px' }}>
                            {user.fecha_nacimiento || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = '#2563eb')
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = '#3b82f6')
                              }
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye size={14} />
                              Ver
                            </button>
                            <button
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = '#dc2626')
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = '#ef4444')
                              }
                              onClick={() => deleteUser(user.id_usuario)}
                            >
                              <Trash2 size={14} />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GESTIÓN DE DESTINOS */}
          {activeTab === 'destinos' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h2 style={{ margin: 0, color: '#374151' }}>
                  Gestión de Destinos
                </h2>
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
                    gap: '8px',
                  }}
                  onClick={() => openNewDestino()}
                >
                  <Plus size={16} /> Nuevo Destino
                </button>
              </div>

              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>
                    Destinos Registrados ({destinos.length})
                  </h3>
                </div>
                {destinos.map((destino, index) => (
                  <div
                    key={`destino-${destino.id}-${index}`}
                    style={{
                      ...tableRowStyle,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                    }}
                  >
                    {/* Imagen del destino */}
                    {(destino.imagen_url || destino.ruta) && (
                      <img
                        src={destino.imagen_url || destino.ruta}
                        alt={destino.nombre}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}

                    <div style={{ flex: 1 }}>
                      <strong>{destino.nombre}</strong>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>
                        {`${destino.ciudad || 'N/A'}, ${destino.provincia || 'N/A'} • ${destino.categoria || 'N/A'}`}
                      </span>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        Ubicación: {destino.ubicacion || 'N/A'} | Calificación:
                        ⭐ {destino.calificacion_promedio}/5
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        style={{
                          ...actionButtonStyle,
                          backgroundColor: '#3b82f6',
                          color: 'white',
                        }}
                        onClick={() => openEditDestino(destino)}
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button
                        style={{
                          ...actionButtonStyle,
                          backgroundColor: '#ef4444',
                          color: 'white',
                        }}
                        onClick={() =>
                          handleDeleteDestino(destino.id || destino._id)
                        }
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h2 style={{ margin: 0, color: '#374151' }}>
                  Gestión de Guías
                </h2>
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
                    gap: '8px',
                  }}
                  onClick={() => openNewGuia()}
                >
                  <Plus size={16} /> Nueva Guía
                </button>
              </div>

              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>
                    Guías Registradas ({guias ? guias.length : 0})
                  </h3>
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
                    Array.isArray(guias) &&
                    guias.map((guia, index) => (
                      <div
                        key={`guia-${guia.id_guia || index}-${index}`}
                        style={tableRowStyle}
                      >
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
                              cursor: 'pointer',
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
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              handleDeleteGuia(
                                guia.id_guia || guia.id || guia._id,
                              )
                            }
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h2 style={{ margin: 0, color: '#374151' }}>
                  Gestión de Tours
                </h2>
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
                    gap: '8px',
                  }}
                  onClick={openNewTour}
                >
                  <Plus size={16} /> Nuevo Tour
                </button>
              </div>

              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>
                    Tours Disponibles ({tours ? tours.length : 0})
                  </h3>
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
                    Array.isArray(tours) &&
                    tours.map((tour, index) => {
                      // Debug completo del primer tour
                      if (index === 0) {
                        console.log('🔍 DEBUG PRIMER TOUR:');
                        console.log('  Tour completo:', tour);
                        console.log(
                          '  Destinos disponibles:',
                          destinos.length,
                          'destinos',
                        );
                        console.log(
                          '  Guías disponibles:',
                          guias.length,
                          'guías',
                        );
                      }

                      // Buscar el destino asignado (backend usa destino_id)
                      const destinoId = tour.destino_id || tour.id_destino;
                      const destinoAsignado = destinoId
                        ? destinos.find((d) => {
                            const match = (d.id || d._id) === destinoId;
                            if (index === 0 && destinoId) {
                              console.log(
                                `  ¿Destino ${d.nombre} (${d.id || d._id}) === ${destinoId}? ${match}`,
                              );
                            }
                            return match;
                          })
                        : null;

                      if (index === 0) {
                        console.log(
                          '  Destino encontrado:',
                          destinoAsignado
                            ? destinoAsignado.nombre
                            : 'NO ENCONTRADO',
                        );
                      }

                      // Buscar la guía asignada (backend usa guia_id)
                      const guiaId = tour.guia_id || tour.id_guia;

                      const guiaAsignada = guiaId
                        ? guias.find((g) => {
                            const gId = (
                              g.id ||
                              g._id ||
                              g.id_guia
                            )?.toString();
                            const match = gId === guiaId.toString();
                            if (index === 0 && guiaId) {
                              console.log(
                                `  ¿Guía ${g.nombre} (${gId}) === ${guiaId}? ${match}`,
                              );
                            }
                            return match;
                          })
                        : null;

                      if (index === 0) {
                        console.log(
                          '  Guía encontrada:',
                          guiaAsignada ? guiaAsignada.nombre : 'NO ENCONTRADA',
                        );
                      }

                      return (
                        <div
                          key={`tour-${tour.id_tour || index}-${index}`}
                          style={{
                            ...tableRowStyle,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                          }}
                        >
                          {/* Imagen del tour */}
                          {tour.imagen_url && (
                            <img
                              src={tour.imagen_url}
                              alt={tour.nombre}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #e5e7eb',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}

                          <div style={{ flex: 1 }}>
                            <strong>{tour.nombre || 'Sin nombre'}</strong>
                            <br />
                            <span
                              style={{ color: '#64748b', fontSize: '14px' }}
                            >
                              {`Duración: ${tour.duracion || 'No especificado'} • Precio: $${tour.precio || 0}`}
                            </span>
                            <br />
                            <span
                              style={{ color: '#64748b', fontSize: '12px' }}
                            >
                              {`Capacidad: ${tour.capacidad_maxima || 0} personas • Disponible: ${tour.disponible ? '✅' : '❌'}`}
                            </span>
                            <br />
                            <span
                              style={{ color: '#10b981', fontSize: '12px' }}
                            >
                              � Guía:{' '}
                              {guiaAsignada
                                ? guiaAsignada.nombre
                                : 'Sin asignar'}
                            </span>
                            {' • '}
                            <span
                              style={{ color: '#3b82f6', fontSize: '12px' }}
                            >
                              📍 Destino:{' '}
                              {destinoAsignado
                                ? destinoAsignado.nombre
                                : 'Sin asignar'}
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
                                cursor: 'pointer',
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
                                cursor: 'pointer',
                              }}
                              onClick={() =>
                                handleDeleteTour(
                                  tour.id_tour || tour.id || tour._id,
                                )
                              }
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GESTIÓN DE SERVICIOS */}
          {activeTab === 'servicios' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h2 style={{ margin: 0, color: '#374151' }}>
                  Gestión de Servicios
                </h2>
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
                    gap: '8px',
                  }}
                  onClick={openNewServicio}
                >
                  <Plus size={16} /> Nuevo Servicio
                </button>
              </div>

              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>
                    Servicios Turísticos ({servicios.length})
                  </h3>
                </div>
                {servicios.map((servicio, index) => (
                  <div
                    key={`servicio-${servicio.id}-${index}`}
                    style={tableRowStyle}
                  >
                    {/* Imagen del servicio */}
                    {servicio.imagen_url && (
                      <img
                        src={
                          servicio.imagen_url.startsWith('http')
                            ? servicio.imagen_url
                            : `http://localhost:8000${servicio.imagen_url}`
                        }
                        alt={servicio.nombre}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginRight: '15px',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
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
                        style={{
                          ...actionButtonStyle,
                          backgroundColor: '#3b82f6',
                          color: 'white',
                        }}
                        onClick={() => openEditServicio(servicio)}
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button
                        style={{
                          ...actionButtonStyle,
                          backgroundColor: '#ef4444',
                          color: 'white',
                        }}
                        onClick={() =>
                          handleDeleteServicio(servicio.id || servicio._id)
                        }
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN DE RESERVAS */}
          {activeTab === 'reservas' && (
            <div>
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <Calendar size={24} style={{ color: '#3b82f6' }} />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1e293b',
                    }}
                  >
                    Lista de Reservas
                  </h3>
                </div>
                <p
                  style={{
                    margin: '0 0 20px 36px',
                    fontSize: '14px',
                    color: '#64748b',
                  }}
                >
                  {reservas.length} reservas totales
                </p>

                {isLoadingData ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px',
                      color: '#64748b',
                    }}
                  >
                    <p>Cargando reservas...</p>
                  </div>
                ) : reservas.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px',
                      color: '#64748b',
                    }}
                  >
                    <Calendar
                      size={48}
                      style={{ margin: '0 auto 15px', opacity: 0.5 }}
                    />
                    <p>No hay reservas registradas</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                    <div style={{ minWidth: '1220px' }}>
                      {/* Header de la tabla */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '150px 200px 120px 100px 150px 120px 120px 120px',
                          gap: '15px',
                          padding: '15px 20px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px 8px 0 0',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        <div>ID</div>
                        <div>Usuario</div>
                        <div>Tour</div>
                        <div>Guía</div>
                        <div>Fecha Tour</div>
                        <div>Participantes</div>
                        <div>Estado</div>
                        <div>Acciones</div>
                      </div>

                      {/* Filas de datos */}
                      {reservas.map((reserva, index) => (
                        <div
                          key={reserva.id || reserva._id || index}
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '150px 200px 120px 100px 150px 120px 120px 120px',
                            gap: '15px',
                            padding: '20px',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '14px',
                            color: '#1e293b',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            transition: 'background-color 0.2s',
                            cursor: 'default',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#f8fafc')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'white')
                          }
                        >
                          <div
                            style={{
                              fontWeight: '500',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '12px',
                              fontFamily: 'monospace',
                            }}
                          >
                            #
                            {(reserva.id || reserva._id || 'N/A')
                              .toString()
                              .substring(0, 12)}
                            ...
                          </div>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: '500',
                              color:
                                reserva.usuarioNombre &&
                                !reserva.usuarioNombre.startsWith('ID:')
                                  ? '#1e293b'
                                  : '#94a3b8',
                            }}
                          >
                            {reserva.usuarioNombre || 'Cargando...'}
                          </div>
                          <div
                            style={{
                              fontWeight: '500',
                              color: '#c2410c',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {reserva.tourNombre ||
                              `Tour ${reserva.tour_id || reserva.id_tour}` ||
                              'N/A'}
                          </div>
                          <div
                            style={{
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '13px',
                            }}
                          >
                            {reserva.guiaNombre || 'N/A'}
                          </div>
                          <div style={{ color: '#64748b' }}>
                            {reserva.fecha_reserva
                              ? new Date(
                                  reserva.fecha_reserva,
                                ).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : reserva.fechaReserva
                                ? new Date(
                                    reserva.fechaReserva,
                                  ).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              backgroundColor: '#dbeafe',
                              borderRadius: '50%',
                              fontWeight: '600',
                              color: '#1e40af',
                            }}
                          >
                            {reserva.cantidad_personas ||
                              reserva.cantidadPersonas ||
                              '1'}
                          </div>
                          <div>
                            <span
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor:
                                  reserva.estado === 'CONFIRMADA' ||
                                  reserva.estado === 'confirmada'
                                    ? '#dcfce7'
                                    : reserva.estado === 'PENDIENTE' ||
                                        reserva.estado === 'pendiente'
                                      ? '#fef3c7'
                                      : reserva.estado === 'CANCELADA' ||
                                          reserva.estado === 'cancelada'
                                        ? '#fee2e2'
                                        : '#f3f4f6',
                                color:
                                  reserva.estado === 'CONFIRMADA' ||
                                  reserva.estado === 'confirmada'
                                    ? '#166534'
                                    : reserva.estado === 'PENDIENTE' ||
                                        reserva.estado === 'pendiente'
                                      ? '#92400e'
                                      : reserva.estado === 'CANCELADA' ||
                                          reserva.estado === 'cancelada'
                                        ? '#991b1b'
                                        : '#6b7280',
                              }}
                            >
                              {(reserva.estado || 'pendiente').toLowerCase()}
                            </span>
                          </div>
                          <div>
                            {(reserva.estado === 'PENDIENTE' ||
                              reserva.estado === 'pendiente' ||
                              !reserva.estado) && (
                              <button
                                onClick={() =>
                                  aceptarReserva(reserva.id || reserva._id)
                                }
                                style={{
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                  whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    '#059669')
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    '#10b981')
                                }
                              >
                                ✓ Aceptar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN DE CONTRATACIONES */}
          {activeTab === 'contrataciones' && (
            <div>
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <FileText size={24} style={{ color: '#3b82f6' }} />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1e293b',
                    }}
                  >
                    Lista de Contrataciones
                  </h3>
                </div>
                <p
                  style={{
                    margin: '0 0 20px 36px',
                    fontSize: '14px',
                    color: '#64748b',
                  }}
                >
                  {contrataciones.length} contrataciones totales
                </p>

                {isLoadingData ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px',
                      color: '#64748b',
                    }}
                  >
                    <p>Cargando contrataciones...</p>
                  </div>
                ) : contrataciones.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px',
                      color: '#64748b',
                    }}
                  >
                    <FileText
                      size={48}
                      style={{ margin: '0 auto 15px', opacity: 0.5 }}
                    />
                    <p>No hay contrataciones registradas</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                    <div style={{ minWidth: '1170px' }}>
                      {/* Header de la tabla */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '150px 200px 180px 120px 120px 140px 120px',
                          gap: '15px',
                          padding: '15px 20px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px 8px 0 0',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        <div>ID</div>
                        <div>Usuario</div>
                        <div>Servicio</div>
                        <div>Precio</div>
                        <div>Estado</div>
                        <div>Fecha</div>
                        <div>Acciones</div>
                      </div>

                      {/* Filas de datos */}
                      {contrataciones.map((contrato, index) => (
                        <div
                          key={contrato.id || contrato._id || index}
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '150px 200px 180px 120px 120px 140px 120px',
                            gap: '15px',
                            padding: '20px',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '14px',
                            color: '#1e293b',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            transition: 'background-color 0.2s',
                            cursor: 'default',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#f8fafc')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'white')
                          }
                        >
                          <div
                            style={{
                              fontWeight: '500',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '12px',
                              fontFamily: 'monospace',
                            }}
                          >
                            #
                            {(contrato.id || contrato._id || 'N/A')
                              .toString()
                              .substring(0, 12)}
                            ...
                          </div>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {contrato.cliente_nombre ||
                              contrato.cliente_email ||
                              'N/A'}
                          </div>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: '500',
                              color:
                                contrato.servicioNombre &&
                                !contrato.servicioNombre.startsWith('ID:')
                                  ? '#1e293b'
                                  : '#94a3b8',
                            }}
                          >
                            {contrato.servicioNombre || 'Cargando...'}
                          </div>
                          <div style={{ fontWeight: '600', color: '#059669' }}>
                            {contrato.moneda || '$'} {contrato.total || 0}
                          </div>
                          <div>
                            <span
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor:
                                  contrato.estado === 'CONFIRMADO' ||
                                  contrato.estado === 'confirmado'
                                    ? '#dcfce7'
                                    : contrato.estado === 'PENDIENTE' ||
                                        contrato.estado === 'pendiente'
                                      ? '#fef3c7'
                                      : contrato.estado === 'CANCELADO' ||
                                          contrato.estado === 'cancelado' ||
                                          contrato.estado === 'cancelada'
                                        ? '#fee2e2'
                                        : '#f3f4f6',
                                color:
                                  contrato.estado === 'CONFIRMADO' ||
                                  contrato.estado === 'confirmado'
                                    ? '#166534'
                                    : contrato.estado === 'PENDIENTE' ||
                                        contrato.estado === 'pendiente'
                                      ? '#92400e'
                                      : contrato.estado === 'CANCELADO' ||
                                          contrato.estado === 'cancelado' ||
                                          contrato.estado === 'cancelada'
                                        ? '#991b1b'
                                        : '#6b7280',
                              }}
                            >
                              {(contrato.estado || 'pendiente').toLowerCase()}
                            </span>
                          </div>
                          <div style={{ color: '#64748b' }}>
                            {contrato.fecha_contratacion
                              ? new Date(
                                  contrato.fecha_contratacion,
                                ).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : contrato.created_at
                                ? new Date(
                                    contrato.created_at,
                                  ).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                          </div>
                          <div>
                            {(contrato.estado === 'PENDIENTE' ||
                              contrato.estado === 'pendiente' ||
                              !contrato.estado) && (
                              <button
                                onClick={() =>
                                  aceptarContratacion(
                                    contrato.id || contrato._id,
                                  )
                                }
                                style={{
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                  whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    '#059669')
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    '#10b981')
                                }
                              >
                                ✓ Aceptar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN DE RECOMENDACIONES */}
          {activeTab === 'recomendaciones' && (
            <div>
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <Star size={24} style={{ color: '#3b82f6' }} />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1e293b',
                    }}
                  >
                    Lista de Recomendaciones
                  </h3>
                </div>
                <p
                  style={{
                    margin: '0 0 20px 36px',
                    fontSize: '14px',
                    color: '#64748b',
                  }}
                >
                  {recomendaciones.length} recomendaciones totales
                </p>

                {isLoadingData ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px',
                      color: '#64748b',
                    }}
                  >
                    <p>Cargando recomendaciones...</p>
                  </div>
                ) : recomendaciones.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px',
                      color: '#64748b',
                    }}
                  >
                    <Star
                      size={48}
                      style={{ margin: '0 auto 15px', opacity: 0.5 }}
                    />
                    <p>No hay recomendaciones registradas</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                    <div style={{ minWidth: '1200px' }}>
                      {/* Header de la tabla */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '100px 180px 200px 130px 280px 130px',
                          gap: '15px',
                          padding: '15px 20px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px 8px 0 0',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        <div>Tipo</div>
                        <div>Usuario</div>
                        <div>Tour/Servicio</div>
                        <div>Calificación</div>
                        <div>Comentario</div>
                        <div>Fecha</div>
                      </div>

                      {/* Filas de datos */}
                      {recomendaciones.map((rec, index) => (
                        <div
                          key={rec.id_recomendacion || rec._id || index}
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '100px 180px 200px 130px 280px 130px',
                            gap: '15px',
                            padding: '20px',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '14px',
                            color: '#1e293b',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            transition: 'background-color 0.2s',
                            cursor: 'default',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#f8fafc')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'white')
                          }
                        >
                          <div>
                            <span
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor:
                                  rec.tipo === 'Tour'
                                    ? '#fef3c7'
                                    : rec.tipo === 'Servicio'
                                      ? '#dbeafe'
                                      : '#f3f4f6',
                                color:
                                  rec.tipo === 'Tour'
                                    ? '#92400e'
                                    : rec.tipo === 'Servicio'
                                      ? '#1e40af'
                                      : '#6b7280',
                              }}
                            >
                              {rec.tipo || 'N/A'}
                            </span>
                          </div>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: '500',
                              color:
                                rec.usuarioNombre &&
                                !rec.usuarioNombre.startsWith('ID:')
                                  ? '#1e293b'
                                  : '#94a3b8',
                            }}
                          >
                            {rec.usuarioNombre || 'Cargando...'}
                          </div>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: '#64748b',
                              fontSize: '13px',
                            }}
                          >
                            {rec.itemNombre || 'N/A'}
                          </div>
                          <div>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                fontWeight: '600',
                                fontSize: '13px',
                              }}
                            >
                              ⭐ {rec.calificacion || 5}
                            </span>
                          </div>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: '#64748b',
                              fontStyle: 'italic',
                            }}
                          >
                            {rec.comentario || 'Sin comentario'}
                          </div>
                          <div style={{ color: '#64748b' }}>
                            {rec.fecha
                              ? new Date(rec.fecha).toLocaleDateString(
                                  'es-ES',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  },
                                )
                              : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reportes' && <ReportesPanel />}

          {activeTab === 'settings' && (
            <div>
              {/* Información del Sistema */}
              <div style={tableStyle}>
                <div style={tableHeaderStyle}>
                  <h3
                    style={{
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Settings size={24} />
                    Información del Sistema
                  </h3>
                </div>
                <div style={{ padding: '30px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px',
                    }}
                  >
                    <div
                      style={{
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <h4
                        style={{
                          margin: '0 0 10px 0',
                          color: '#64748b',
                          fontSize: '14px',
                        }}
                      >
                        Frontend
                      </h4>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Puerto: 5174
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Framework: React + Vite
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <h4
                        style={{
                          margin: '0 0 10px 0',
                          color: '#64748b',
                          fontSize: '14px',
                        }}
                      >
                        Backend Python
                      </h4>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Puerto: 8000
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Framework: FastAPI
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Gestiona: Usuarios, Destinos, Guías, Tours, Servicios,
                        Reservas, Contrataciones, Recomendaciones
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <h4
                        style={{
                          margin: '0 0 10px 0',
                          color: '#64748b',
                          fontSize: '14px',
                        }}
                      >
                        GraphQL Server
                      </h4>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Puerto: 4000
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Framework: Apollo Server
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Estado: Opcional
                      </p>
                      <p
                        style={{
                          margin: '5px 0',
                          fontSize: '13px',
                          color: '#94a3b8',
                        }}
                      >
                        Para reportes y consultas consolidadas
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <h4
                        style={{
                          margin: '0 0 10px 0',
                          color: '#64748b',
                          fontSize: '14px',
                        }}
                      >
                        Base de Datos
                      </h4>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Motor: MongoDB
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        Base: turismo_db
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>
                        ODM: Beanie (Python)
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '20px',
                      padding: '15px',
                      background: '#eff6ff',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    <p
                      style={{ margin: 0, fontSize: '13px', color: '#1e40af' }}
                    >
                      <strong>Arquitectura:</strong> API REST unificada con
                      FastAPI como backend principal. GraphQL Server disponible
                      para consultas avanzadas y reportes consolidados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Perfil del Administrador */}
              <div style={{ ...tableStyle, marginTop: '20px' }}>
                <div style={tableHeaderStyle}>
                  <h3
                    style={{
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Users size={24} />
                    Perfil de Administrador
                  </h3>
                </div>
                <div style={{ padding: '30px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '30px',
                    }}
                  >
                    <div>
                      <h4 style={{ marginTop: 0, color: '#334155' }}>
                        Información Personal
                      </h4>
                      <div style={{ marginBottom: '15px' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#64748b',
                          }}
                        >
                          Nombre de Usuario
                        </label>
                        <input
                          type="text"
                          value={adminData?.username || ''}
                          disabled
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            background: '#f8fafc',
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '15px' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#64748b',
                          }}
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          value={adminData?.email || ''}
                          disabled
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            background: '#f8fafc',
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '15px' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#64748b',
                          }}
                        >
                          Rol
                        </label>
                        <input
                          type="text"
                          value="Administrador"
                          disabled
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            background: '#f8fafc',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 style={{ marginTop: 0, color: '#334155' }}>
                        Estadísticas del Sistema
                      </h4>
                      <div
                        style={{
                          padding: '20px',
                          background: '#f0f9ff',
                          borderRadius: '8px',
                          border: '1px solid #bfdbfe',
                          marginBottom: '15px',
                        }}
                      >
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>👥 Total Usuarios:</strong>{' '}
                          {stats.total_usuarios || users.length}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>✅ Usuarios Activos:</strong>{' '}
                          {stats.usuarios_activos || 0}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>🏖️ Total Destinos:</strong> {destinos.length}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>👨‍🏫 Total Guías:</strong> {guias.length}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>🚌 Total Tours:</strong> {tours.length}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>🏢 Total Servicios:</strong>{' '}
                          {servicios.length}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem('adminToken');
                          localStorage.removeItem('adminData');
                          window.location.href = '/admin/login';
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div style={{ ...tableStyle, marginTop: '20px' }}>
                <div style={tableHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Acciones Rápidas</h3>
                </div>
                <div style={{ padding: '30px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '15px',
                    }}
                  >
                    <button
                      onClick={() => {
                        loadDashboardData();
                        loadDestinos();
                        loadGuias();
                        loadTours();
                        loadServicios();
                        alert('Datos actualizados correctamente');
                      }}
                      style={{
                        padding: '15px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      🔄 Actualizar Todos los Datos
                    </button>
                    <button
                      onClick={() => setActiveTab('reportes')}
                      style={{
                        padding: '15px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      📊 Ver Reportes
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      style={{
                        padding: '15px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      👥 Gestionar Usuarios
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            '¿Estás seguro de que quieres limpiar la caché del navegador?',
                          )
                        ) {
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.reload();
                        }
                      }}
                      style={{
                        padding: '15px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      🗑️ Limpiar Caché
                    </button>
                  </div>
                </div>
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
        destinos={destinos}
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
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '15px',
              }}
            >
              <h2 style={{ margin: 0, color: '#1f2937' }}>
                Detalles del Usuario
              </h2>
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setViewingUser(null);
                  setUserReservas([]);
                  setUserRecomendaciones([]);
                  setUserContrataciones([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '24px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    Nombre
                  </label>
                  <p
                    style={{
                      margin: '5px 0 0 0',
                      color: '#1f2937',
                      fontSize: '16px',
                    }}
                  >
                    {viewingUser.nombre || (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        No especificado
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label
                    style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    Apellido
                  </label>
                  <p
                    style={{
                      margin: '5px 0 0 0',
                      color: viewingUser.apellido ? '#1f2937' : '#9ca3af',
                      fontSize: '16px',
                      fontStyle: viewingUser.apellido ? 'normal' : 'italic',
                    }}
                  >
                    {viewingUser.apellido || 'No especificado'}
                  </p>
                </div>
              </div>

              <div>
                <label
                  style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Email
                </label>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: '#1f2937',
                    fontSize: '16px',
                  }}
                >
                  {viewingUser.email || (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      No especificado
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label
                  style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Nombre de Usuario
                </label>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: viewingUser.username ? '#1f2937' : '#9ca3af',
                    fontSize: '16px',
                    fontStyle: viewingUser.username ? 'normal' : 'italic',
                  }}
                >
                  {viewingUser.username
                    ? `@${viewingUser.username}`
                    : 'No especificado'}
                </p>
              </div>

              {viewingUser.fecha_nacimiento ? (
                <div>
                  <label
                    style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    Fecha de Nacimiento
                  </label>
                  <p
                    style={{
                      margin: '5px 0 0 0',
                      color: '#1f2937',
                      fontSize: '16px',
                    }}
                  >
                    {viewingUser.fecha_nacimiento}
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    Fecha de Nacimiento
                  </label>
                  <p
                    style={{
                      margin: '5px 0 0 0',
                      color: '#9ca3af',
                      fontSize: '16px',
                      fontStyle: 'italic',
                    }}
                  >
                    No especificado
                  </p>
                </div>
              )}

              <div>
                <label
                  style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  ID de Usuario
                </label>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: '#64748b',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                  }}
                >
                  {viewingUser.id ||
                    viewingUser._id ||
                    viewingUser.id_usuario ||
                    'N/A'}
                </p>
              </div>
            </div>

            {/* Sección de Actividad del Usuario */}
            <div
              style={{
                marginTop: '30px',
                borderTop: '2px solid #e5e7eb',
                paddingTop: '20px',
              }}
            >
              <h3
                style={{
                  margin: '0 0 20px 0',
                  color: '#1f2937',
                  fontSize: '18px',
                  fontWeight: '600',
                }}
              >
                📊 Actividad del Usuario
              </h3>

              {loadingUserData ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6b7280',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      width: '40px',
                      height: '40px',
                      border: '4px solid #e5e7eb',
                      borderTopColor: '#3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  ></div>
                  <p style={{ marginTop: '10px' }}>Cargando datos...</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Reservas */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px',
                        padding: '10px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>📅</span>
                      <div>
                        <h4
                          style={{
                            margin: 0,
                            color: '#1f2937',
                            fontSize: '16px',
                            fontWeight: '600',
                          }}
                        >
                          Reservas ({userReservas.length})
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            color: '#6b7280',
                            fontSize: '12px',
                          }}
                        >
                          Tours reservados por el usuario
                        </p>
                      </div>
                    </div>

                    {userReservas.length > 0 ? (
                      <div
                        style={{
                          display: 'grid',
                          gap: '10px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}
                      >
                        {userReservas.map((reserva, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '12px',
                              backgroundColor: '#f9fafb',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <p
                                  style={{
                                    margin: '0 0 5px 0',
                                    color: '#1f2937',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                  }}
                                >
                                  Tour ID:{' '}
                                  {reserva.tourId || reserva.tour_id || 'N/A'}
                                </p>
                                <p
                                  style={{
                                    margin: '0 0 5px 0',
                                    color: '#6b7280',
                                    fontSize: '12px',
                                  }}
                                >
                                  📅 Fecha:{' '}
                                  {reserva.fechaReserva
                                    ? new Date(
                                        reserva.fechaReserva,
                                      ).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                                <p
                                  style={{
                                    margin: '0 0 5px 0',
                                    color: '#6b7280',
                                    fontSize: '12px',
                                  }}
                                >
                                  👥 Personas:{' '}
                                  {reserva.cantidadPersonas ||
                                    reserva.cantidad_personas ||
                                    'N/A'}
                                </p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    backgroundColor:
                                      reserva.estado === 'CONFIRMADA'
                                        ? '#dcfce7'
                                        : reserva.estado === 'PENDIENTE'
                                          ? '#fef3c7'
                                          : reserva.estado === 'CANCELADA'
                                            ? '#fee2e2'
                                            : '#e5e7eb',
                                    color:
                                      reserva.estado === 'CONFIRMADA'
                                        ? '#166534'
                                        : reserva.estado === 'PENDIENTE'
                                          ? '#92400e'
                                          : reserva.estado === 'CANCELADA'
                                            ? '#991b1b'
                                            : '#6b7280',
                                  }}
                                >
                                  {reserva.estado || 'N/A'}
                                </span>
                                <p
                                  style={{
                                    margin: '5px 0 0 0',
                                    color: '#1f2937',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                  }}
                                >
                                  $
                                  {reserva.precioTotal ||
                                    reserva.precio_total ||
                                    0}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        style={{
                          margin: '10px 0',
                          color: '#9ca3af',
                          fontSize: '14px',
                          fontStyle: 'italic',
                          textAlign: 'center',
                        }}
                      >
                        No hay reservas registradas
                      </p>
                    )}
                  </div>

                  {/* Recomendaciones */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px',
                        padding: '10px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>⭐</span>
                      <div>
                        <h4
                          style={{
                            margin: 0,
                            color: '#1f2937',
                            fontSize: '16px',
                            fontWeight: '600',
                          }}
                        >
                          Recomendaciones ({userRecomendaciones.length})
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            color: '#6b7280',
                            fontSize: '12px',
                          }}
                        >
                          Opiniones y calificaciones del usuario
                        </p>
                      </div>
                    </div>

                    {userRecomendaciones.length > 0 ? (
                      <div
                        style={{
                          display: 'grid',
                          gap: '10px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}
                      >
                        {userRecomendaciones.map((rec, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '12px',
                              backgroundColor: '#fffbeb',
                              borderRadius: '8px',
                              border: '1px solid #fef3c7',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                              }}
                            >
                              <span
                                style={{
                                  color: '#92400e',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                }}
                              >
                                {rec.fecha
                                  ? new Date(rec.fecha).toLocaleDateString()
                                  : 'N/A'}
                              </span>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      color:
                                        i < (rec.calificacion || 0)
                                          ? '#f59e0b'
                                          : '#d1d5db',
                                    }}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            </div>
                            {rec.comentario && (
                              <p
                                style={{
                                  margin: '0',
                                  color: '#78716c',
                                  fontSize: '13px',
                                  fontStyle: 'italic',
                                }}
                              >
                                "{rec.comentario}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        style={{
                          margin: '10px 0',
                          color: '#9ca3af',
                          fontSize: '14px',
                          fontStyle: 'italic',
                          textAlign: 'center',
                        }}
                      >
                        No hay recomendaciones registradas
                      </p>
                    )}
                  </div>

                  {/* Contrataciones */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px',
                        padding: '10px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>📋</span>
                      <div>
                        <h4
                          style={{
                            margin: 0,
                            color: '#1f2937',
                            fontSize: '16px',
                            fontWeight: '600',
                          }}
                        >
                          Contrataciones ({userContrataciones.length})
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            color: '#6b7280',
                            fontSize: '12px',
                          }}
                        >
                          Servicios contratados por el usuario
                        </p>
                      </div>
                    </div>

                    {userContrataciones.length > 0 ? (
                      <div
                        style={{
                          display: 'grid',
                          gap: '10px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}
                      >
                        {userContrataciones.map((contrato, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '12px',
                              backgroundColor: '#f0fdf4',
                              borderRadius: '8px',
                              border: '1px solid #bbf7d0',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <p
                                  style={{
                                    margin: '0 0 5px 0',
                                    color: '#1f2937',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                  }}
                                >
                                  {contrato.cliente_nombre || 'Cliente'}
                                </p>
                                <p
                                  style={{
                                    margin: '0 0 5px 0',
                                    color: '#6b7280',
                                    fontSize: '12px',
                                  }}
                                >
                                  📅 Inicio:{' '}
                                  {contrato.fecha_inicio
                                    ? new Date(
                                        contrato.fecha_inicio,
                                      ).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                                <p
                                  style={{
                                    margin: '0 0 5px 0',
                                    color: '#6b7280',
                                    fontSize: '12px',
                                  }}
                                >
                                  📅 Fin:{' '}
                                  {contrato.fecha_fin
                                    ? new Date(
                                        contrato.fecha_fin,
                                      ).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                                <p
                                  style={{
                                    margin: '0',
                                    color: '#6b7280',
                                    fontSize: '12px',
                                  }}
                                >
                                  👥 Viajeros: {contrato.num_viajeros || 'N/A'}
                                </p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    backgroundColor:
                                      contrato.estado === 'CONFIRMADO'
                                        ? '#dcfce7'
                                        : contrato.estado === 'PENDIENTE'
                                          ? '#fef3c7'
                                          : contrato.estado === 'CANCELADO'
                                            ? '#fee2e2'
                                            : '#e5e7eb',
                                    color:
                                      contrato.estado === 'CONFIRMADO'
                                        ? '#166534'
                                        : contrato.estado === 'PENDIENTE'
                                          ? '#92400e'
                                          : contrato.estado === 'CANCELADO'
                                            ? '#991b1b'
                                            : '#6b7280',
                                  }}
                                >
                                  {contrato.estado || 'N/A'}
                                </span>
                                <p
                                  style={{
                                    margin: '5px 0 0 0',
                                    color: '#1f2937',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                  }}
                                >
                                  {contrato.moneda || '$'} {contrato.total || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        style={{
                          margin: '10px 0',
                          color: '#9ca3af',
                          fontSize: '14px',
                          fontStyle: 'italic',
                          textAlign: 'center',
                        }}
                      >
                        No hay contrataciones registradas
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: '25px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => {
                  setShowUserDetailModal(false);
                  setViewingUser(null);
                  setUserReservas([]);
                  setUserRecomendaciones([]);
                  setUserContrataciones([]);
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
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
