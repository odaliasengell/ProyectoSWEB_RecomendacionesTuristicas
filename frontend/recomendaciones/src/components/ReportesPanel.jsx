import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MapPin, 
  Calendar,
  RefreshCw,
  Download,
  Award,
  AlertTriangle,
  CheckCircle2,
  Globe,
  MessageCircle
} from 'lucide-react';

// Importar cliente GraphQL y queries
import { 
  executeQuery,
  GET_TOURS,
  GET_GUIAS,
  GET_DESTINOS,
  GET_SERVICIOS,
  GET_CONTRATACIONES,
  GET_RECOMENDACIONES,
  GET_RESERVAS
} from '../services/graphql-client';

// URLs de las APIs REST directas (fallback)
const PYTHON_API_URL = 'http://localhost:8000';
const TYPESCRIPT_API_URL = 'http://localhost:3000';
const GO_API_URL = 'http://localhost:8000/admin/turismo'; // Via proxy Python
const GRAPHQL_URL = 'http://localhost:4000/graphql';

const ReportesPanel = () => {
  const [loading, setLoading] = useState(false);
  const [reporteConsolidado, setReporteConsolidado] = useState(null);
  const [toursPopulares, setToursPopulares] = useState([]);
  const [estadisticasGuias, setEstadisticasGuias] = useState([]);
  const [destinosLista, setDestinosLista] = useState([]);
  const [recomendacionesLista, setRecomendacionesLista] = useState([]);
  const [ingresos, setIngresos] = useState(null);
  const [activeReport, setActiveReport] = useState('general');
  
  // Nuevos estados para reportes avanzados
  const [analisisCompletitud, setAnalisisCompletitud] = useState(null);
  const [analisisCobertura, setAnalisisCobertura] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    console.log('📊 Cargando reportes mediante GraphQL (en paralelo)...');
    console.time('⏱️ Tiempo total de carga');
    
    try {
      // 🚀 EJECUTAR TODAS LAS QUERIES EN PARALELO para mejor rendimiento
      const [
        toursResult,
        guiasResult,
        destinosResult,
        serviciosResult,
        contratacionesResult,
        recomendacionesResult,
        reservasResult
      ] = await Promise.allSettled([
        executeQuery(GET_TOURS).catch(err => { console.error('❌ Error tours:', err.message); return { tours: [] }; }),
        executeQuery(GET_GUIAS).catch(err => { console.error('❌ Error guías:', err.message); return { guias: [] }; }),
        executeQuery(GET_DESTINOS).catch(err => { console.error('❌ Error destinos:', err.message); return { destinos: [] }; }),
        executeQuery(GET_SERVICIOS).catch(err => { console.error('❌ Error servicios:', err.message); return { servicios: [] }; }),
        executeQuery(GET_CONTRATACIONES).catch(err => { console.error('❌ Error contrataciones:', err.message); return { contrataciones: [] }; }),
        executeQuery(GET_RECOMENDACIONES).catch(err => { console.error('❌ Error recomendaciones:', err.message); return { recomendaciones: [] }; }),
        executeQuery(GET_RESERVAS).catch(err => { console.error('❌ Error reservas:', err.message); return { reservas: [] }; })
      ]);

      // Extraer datos de los resultados
      const toursData = toursResult.status === 'fulfilled' ? (toursResult.value?.tours || []) : [];
      const guiasData = guiasResult.status === 'fulfilled' ? (guiasResult.value?.guias || []) : [];
      const destinosData = destinosResult.status === 'fulfilled' ? (destinosResult.value?.destinos || []) : [];
      const serviciosData = serviciosResult.status === 'fulfilled' ? (serviciosResult.value?.servicios || []) : [];
      
      const contratacionesData = contratacionesResult.status === 'fulfilled' ? (contratacionesResult.value?.contrataciones || []) : [];
      
      const recomendacionesData = recomendacionesResult.status === 'fulfilled' ? (recomendacionesResult.value?.recomendaciones || []) : [];
      const reservasData = reservasResult.status === 'fulfilled' ? (reservasResult.value?.reservas || []) : [];

      // Debug reservas
      console.log('🔍 Debug Reservas:', reservasData);
      if (reservasData.length > 0) {
        console.log('📋 Primera reserva:', reservasData[0]);
        console.log('👥 Cantidad personas primera reserva:', reservasData[0].cantidad_personas);
      }

      console.log('✅ Datos cargados:', {
        tours: toursData.length,
        guias: guiasData.length,
        destinos: destinosData.length,
        servicios: serviciosData.length,
        contrataciones: contratacionesData.length,
        recomendaciones: recomendacionesData.length,
        reservas: reservasData.length
      });
      
      // Debug: Mostrar contrataciones si existen
      if (contratacionesData.length > 0) {
        console.warn('⚠️ Se encontraron contrataciones (posiblemente datos de prueba):', contratacionesData);
        console.log('📋 Primera contratación:', contratacionesData[0]);
      }
      
      console.timeEnd('⏱️ Tiempo total de carga');

      // PROCESAR DATOS PARA REPORTES

      // Tours - mostrar tours disponibles ordenados por precio
      const toursConReporte = toursData
        .filter(tour => tour.disponible)
        .map(tour => {
          // Buscar el guía asignado (backend usa guia_id)
          const tourGuiaId = (tour.guia_id || tour.id_guia)?.toString();
          const guiaAsignado = tourGuiaId 
            ? guiasData.find(g => {
                const guiaId = (g.id || g._id || g.id_guia)?.toString();
                return guiaId === tourGuiaId;
              })
            : null;
          
          // Buscar el destino asignado (backend usa destino_id)
          const tourDestinoId = (tour.destino_id || tour.id_destino)?.toString();
          const destinoAsignado = tourDestinoId 
            ? destinosData.find(d => {
                const destinoId = (d.id || d._id)?.toString();
                return destinoId === tourDestinoId;
              })
            : null;
          
          return {
            tourId: tour._id || tour.id || tour.id_tour,
            nombreTour: tour.nombre,
            precio: parseFloat(tour.precio || 0),
            duracion: tour.duracion,
            capacidad: tour.capacidad_maxima,
            guia: guiaAsignado ? guiaAsignado.nombre : 'Sin asignar',
            destino: destinoAsignado ? (destinoAsignado.nombre || destinoAsignado.ciudad) : 'Sin asignar'
          };
        })
        .sort((a, b) => b.precio - a.precio);
      
      setToursPopulares(toursConReporte);
      console.log('📊 Tours procesados:', toursConReporte.length);

      // Guías - todos los guías disponibles
      const guiasConReporte = guiasData
        .filter(guia => guia.disponible)
        .map(guia => {
          const guiaId = (guia.id || guia._id || guia.id_guia)?.toString();
          // Backend usa guia_id en tours
          const toursAsignados = toursData.filter(t => {
            const tourGuiaId = (t.guia_id || t.id_guia)?.toString();
            return tourGuiaId === guiaId;
          });
          return {
            guiaId: guia.id || guia._id || guia.id_guia,
            nombreGuia: guia.nombre,
            idiomas: Array.isArray(guia.idiomas) ? guia.idiomas.join(', ') : (guia.idiomas || ''),
            totalTours: toursAsignados.length,
            experiencia: guia.experiencia || 0,
            calificacion: guia.calificacion || 0
          };
        })
        .sort((a, b) => b.totalTours - a.totalTours);
      
      setEstadisticasGuias(guiasConReporte);
      console.log('📊 Guías procesados:', guiasConReporte.length);
      
      // Guardar listas completas para mostrar en pestañas
      setDestinosLista(destinosData);
      setRecomendacionesLista(recomendacionesData);
      console.log('✅ Destinos guardados:', destinosData.length);
      console.log('✅ Recomendaciones guardadas:', recomendacionesData.length);

      // Estadísticas Generales - datos reales
      const toursActivos = toursData.filter(t => t.disponible).length;
      const toursInactivos = toursData.length - toursActivos;
      const precioPromedio = toursData.length > 0
        ? toursData.reduce((sum, t) => sum + parseFloat(t.precio || 0), 0) / toursData.length
        : 0;

      const guiasActivos = guiasData.filter(g => g.disponible).length;
      const calificacionPromedioGuias = guiasData.length > 0
        ? guiasData.reduce((sum, g) => sum + (g.calificacion || 4.5), 0) / guiasData.length
        : 4.5;

      const ingresoTotalServicios = serviciosData.reduce((sum, s) => sum + parseFloat(s.precio || 0), 0);
      
      // Estadísticas de Contrataciones
      console.log('📊 Debug Contrataciones:');
      console.log('   Total contrataciones:', contratacionesData.length);
      contratacionesData.forEach((c, i) => {
        console.log(`   Contratación ${i + 1}: estado="${c.estado}", total=${c.total}`);
      });
      
      // Aceptar tanto minúsculas como mayúsculas para el estado
      const contratacionesConfirmadas = contratacionesData.filter(c => 
        c.estado?.toLowerCase() === 'confirmada'
      ).length;
      const contratacionesPendientes = contratacionesData.filter(c => 
        c.estado?.toLowerCase() === 'pendiente'
      ).length;
      const contratacionesCanceladas = contratacionesData.filter(c => 
        c.estado?.toLowerCase() === 'cancelada'
      ).length;
      const ingresoTotalContrataciones = contratacionesData.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);
      
      console.log('   Confirmadas:', contratacionesConfirmadas);
      console.log('   Pendientes:', contratacionesPendientes);
      console.log('   Canceladas:', contratacionesCanceladas);
      
      // Estadísticas de Recomendaciones
      const recomendacionesDestinos = recomendacionesData.filter(r => r.id_destino).length;
      const recomendacionesTours = recomendacionesData.filter(r => r.id_tour).length;
      const recomendacionesServicios = recomendacionesData.filter(r => r.id_servicio).length;
      const calificacionPromedioRecs = recomendacionesData.length > 0
        ? recomendacionesData.reduce((sum, r) => sum + (r.calificacion || 0), 0) / recomendacionesData.length
        : 0;
      
      // Estadísticas de Reservas
      console.log('📊 Debug Reservas:');
      console.log('   Total reservas:', reservasData.length);
      reservasData.forEach((r, i) => {
        console.log(`   Reserva ${i + 1}: estado="${r.estado}", personas=${r.cantidad_personas}`);
      });
      
      // Aceptar tanto minúsculas como mayúsculas para el estado
      const reservasConfirmadas = reservasData.filter(r => 
        r.estado?.toLowerCase() === 'confirmada'
      ).length;
      const reservasPendientes = reservasData.filter(r => 
        r.estado?.toLowerCase() === 'pendiente'
      ).length;
      const reservasCanceladas = reservasData.filter(r => 
        r.estado?.toLowerCase() === 'cancelada'
      ).length;
      const totalPersonasReservadas = reservasData.reduce((sum, r) => sum + (r.cantidad_personas || 0), 0);

      console.log('   Confirmadas:', reservasConfirmadas);
      console.log('   Pendientes:', reservasPendientes);
      console.log('   Canceladas:', reservasCanceladas);
      console.log('   Total personas:', totalPersonasReservadas);

      const estadisticas = {
        tours: {
          total: toursData.length,
          activos: toursActivos,
          inactivos: toursInactivos,
          promedioPrecios: precioPromedio
        },
        guias: {
          total: guiasData.length,
          activos: guiasActivos,
          promedioCalificacion: calificacionPromedioGuias
        },
        destinos: {
          total: destinosData.length
        },
        servicios: {
          total: serviciosData.length,
          contratados: serviciosData.filter(s => s.disponible).length,
          ingresoTotal: ingresoTotalServicios
        },
        contrataciones: {
          total: contratacionesData.length,
          confirmadas: contratacionesConfirmadas,
          pendientes: contratacionesPendientes,
          canceladas: contratacionesCanceladas,
          ingresoTotal: ingresoTotalContrataciones
        },
        recomendaciones: {
          total: recomendacionesData.length,
          destinos: recomendacionesDestinos,
          tours: recomendacionesTours,
          servicios: recomendacionesServicios,
          calificacionPromedio: calificacionPromedioRecs
        },
        reservas: {
          total: reservasData.length,
          confirmadas: reservasConfirmadas,
          pendientes: reservasPendientes,
          canceladas: reservasCanceladas,
          totalPersonas: totalPersonasReservadas
        }
      };
      
      setReporteConsolidado(estadisticas);
      console.log('✅ Estadísticas generales:', estadisticas);

      // Ingresos - Como no hay sistema de reservas aún, ingresos de tours = 0
      // Solo mostramos ingresos reales de servicios contratados
      const ingresosTours = 0; // Sin reservas implementadas aún
      const ingresosServicios = ingresoTotalServicios;
      
      const ingresosData = {
        ingresoTours: ingresosTours,
        ingresoServicios: ingresosServicios,
        ingresoTotal: ingresosTours + ingresosServicios,
        // Potencial de ingresos si cada tour tuviera 1 reserva
        potencialTours: toursData
          .filter(t => t.disponible)
          .reduce((sum, t) => sum + parseFloat(t.precio || 0), 0)
      };
      
      setIngresos(ingresosData);
      console.log('✅ Ingresos calculados:', ingresosData);

      // ========== ANÁLISIS AVANZADOS ==========
      
      // 1. ANÁLISIS DE COMPLETITUD (Tours completos vs incompletos)
      const toursCompletos = toursData.filter(t => 
        t.guia_id && t.destino_id && t.disponible
      );
      const toursIncompletos = toursData.filter(t => 
        !t.guia_id || !t.destino_id || !t.disponible
      );
      
      const completitudData = {
        toursCompletos: toursCompletos.length,
        toursIncompletos: toursIncompletos.length,
        porcentajeCompletitud: toursData.length > 0 
          ? ((toursCompletos.length / toursData.length) * 100).toFixed(1)
          : 0,
        detalleIncompletos: toursIncompletos.map(t => ({
          id: t._id,
          nombre: t.nombre,
          faltaGuia: !t.guia_id,
          faltaDestino: !t.destino_id,
          noDisponible: !t.disponible
        }))
      };
      
      setAnalisisCompletitud(completitudData);
      console.log('✅ Análisis de completitud:', completitudData);

      // 2. ANÁLISIS DE COBERTURA (Idiomas y Regiones)
      const idiomasUnicos = new Set();
      guiasData.forEach(guia => {
        if (guia.idiomas && Array.isArray(guia.idiomas)) {
          guia.idiomas.forEach(idioma => idiomasUnicos.add(idioma));
        }
      });

      const destinosPorPais = {};
      destinosData.forEach(destino => {
        const pais = destino.ubicacion || destino.pais || 'Sin ubicación';
        if (!destinosPorPais[pais]) {
          destinosPorPais[pais] = [];
        }
        destinosPorPais[pais].push(destino);
      });

      const coberturaData = {
        totalIdiomas: idiomasUnicos.size,
        idiomas: Array.from(idiomasUnicos),
        totalPaises: Object.keys(destinosPorPais).length,
        destinosPorPais: Object.entries(destinosPorPais).map(([pais, destinos]) => ({
          pais,
          cantidad: destinos.length,
          destinos: destinos.map(d => d.nombre || d.ciudad)
        })),
        guiasPorIdioma: Array.from(idiomasUnicos).map(idioma => ({
          idioma,
          cantidad: guiasData.filter(g => 
            g.idiomas && g.idiomas.includes(idioma)
          ).length
        }))
      };
      
      setAnalisisCobertura(coberturaData);
      console.log('✅ Análisis de cobertura:', coberturaData);

      // 3. KPIs DE COMPLETITUD
      const guiasConTours = guiasData.filter(g => {
        const guiaId = (g.id || g._id || g.id_guia)?.toString();
        return toursData.some(t => {
          const tourGuiaId = (t.guia_id || t.id_guia)?.toString();
          return tourGuiaId === guiaId;
        });
      }).length;
      
      const destinosConTours = destinosData.filter(d => {
        const destinoId = (d.id || d._id)?.toString();
        return toursData.some(t => {
          const tourDestinoId = (t.destino_id || t.id_destino)?.toString();
          return tourDestinoId === destinoId;
        });
      }).length;

      const kpisData = {
        tasaAsignacionGuias: guiasData.length > 0 
          ? ((guiasConTours / guiasData.length) * 100).toFixed(1)
          : 0,
        tasaUsoDestinos: destinosData.length > 0 
          ? ((destinosConTours / destinosData.length) * 100).toFixed(1)
          : 0,
        tasaDisponibilidadTours: toursData.length > 0 
          ? ((toursData.filter(t => t.disponible).length / toursData.length) * 100).toFixed(1)
          : 0,
        tasaDisponibilidadGuias: guiasData.length > 0 
          ? ((guiasData.filter(g => g.disponible).length / guiasData.length) * 100).toFixed(1)
          : 0,
        tasaDisponibilidadServicios: serviciosData.length > 0 
          ? ((serviciosData.filter(s => s.disponible).length / serviciosData.length) * 100).toFixed(1)
          : 0,
        promedioToursPorGuia: guiasData.length > 0 
          ? (toursData.length / guiasData.length).toFixed(1)
          : 0
      };
      
      setKpis(kpisData);
      console.log('✅ KPIs calculados:', kpisData);

      // 4. ALERTAS DE RECURSOS INFRAUTILIZADOS
      const alertasArray = [];

      // Guías sin tours asignados
      const guiasSinTours = guiasData.filter(g => {
        const guiaId = (g.id || g._id || g.id_guia)?.toString();
        // Backend usa guia_id en tours, no id_guia
        return !toursData.some(t => {
          const tourGuiaId = (t.guia_id || t.id_guia)?.toString();
          return tourGuiaId === guiaId;
        }) && g.disponible;
      });
      
      console.log('🔍 Debug guías sin tours:');
      console.log('  Total guías:', guiasData.length);
      console.log('  Guías IDs:', guiasData.map(g => ({ id: g.id, _id: g._id, id_guia: g.id_guia, nombre: g.nombre })));
      console.log('  Tours guia_id:', toursData.map(t => ({ nombre: t.nombre, guia_id: t.guia_id, id_guia: t.id_guia })));
      console.log('  Guías sin tours:', guiasSinTours.length);
      
      if (guiasSinTours.length > 0) {
        alertasArray.push({
          tipo: 'warning',
          categoria: 'Guías',
          titulo: `${guiasSinTours.length} guía(s) sin tours asignados`,
          descripcion: `Guías disponibles: ${guiasSinTours.map(g => g.nombre).join(', ')}`,
          detalles: guiasSinTours
        });
      }

      // Destinos sin tours
      const destinosSinTours = destinosData.filter(d => {
        const destinoId = (d.id || d._id)?.toString();
        // Backend usa destino_id en tours, no id_destino
        return !toursData.some(t => {
          const tourDestinoId = (t.destino_id || t.id_destino)?.toString();
          return tourDestinoId === destinoId;
        });
      });
      
      if (destinosSinTours.length > 0) {
        alertasArray.push({
          tipo: 'warning',
          categoria: 'Destinos',
          titulo: `${destinosSinTours.length} destino(s) sin tours`,
          descripcion: `Destinos sin aprovechar: ${destinosSinTours.map(d => d.nombre || d.ciudad).join(', ')}`,
          detalles: destinosSinTours
        });
      }

      // Tours incompletos
      if (toursIncompletos.length > 0) {
        alertasArray.push({
          tipo: 'error',
          categoria: 'Tours',
          titulo: `${toursIncompletos.length} tour(s) incompleto(s)`,
          descripcion: 'Tours que necesitan guía, destino o activación',
          detalles: completitudData.detalleIncompletos
        });
      }

      // Servicios no disponibles
      const serviciosInactivos = serviciosData.filter(s => !s.disponible);
      if (serviciosInactivos.length > 0) {
        alertasArray.push({
          tipo: 'info',
          categoria: 'Servicios',
          titulo: `${serviciosInactivos.length} servicio(s) inactivo(s)`,
          descripcion: 'Servicios que podrían reactivarse',
          detalles: serviciosInactivos
        });
      }

      setAlertas(alertasArray);
      console.log('✅ Alertas generadas:', alertasArray.length);

    } catch (error) {
      console.error('❌ Error general cargando reportes:', error);
      alert('Error al cargar reportes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Estilos
  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  };

  const statCardStyle = {
    ...cardStyle,
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  };

  const iconContainerStyle = (color) => ({
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${color}20, ${color}40)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const buttonStyle = {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'transform 0.2s'
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive ? 'linear-gradient(135deg, #059669, #10b981)' : '#f3f4f6',
    color: isActive ? 'white' : '#6b7280',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  });

  if (loading && !reporteConsolidado) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', color: '#059669' }} />
        <p style={{ marginTop: '20px', color: '#6b7280' }}>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            📊 Reportes y Análisis
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
            🚀 Consultas consolidadas mediante GraphQL Server (puerto 4000)
          </p>
        </div>
        <button 
          onClick={cargarReportes} 
          disabled={loading}
          style={buttonStyle}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button style={tabStyle(activeReport === 'general')} onClick={() => setActiveReport('general')}>
          Vista General
        </button>
        <button style={tabStyle(activeReport === 'contrataciones')} onClick={() => setActiveReport('contrataciones')}>
          Contrataciones
        </button>
        <button style={tabStyle(activeReport === 'recomendaciones')} onClick={() => setActiveReport('recomendaciones')}>
          Recomendaciones
        </button>
        <button style={tabStyle(activeReport === 'reservas')} onClick={() => setActiveReport('reservas')}>
          Reservas
        </button>
        <button style={tabStyle(activeReport === 'tours')} onClick={() => setActiveReport('tours')}>
          Tours Disponibles
        </button>
        <button style={tabStyle(activeReport === 'guias')} onClick={() => setActiveReport('guias')}>
          Guías Disponibles
        </button>
        <button style={tabStyle(activeReport === 'destinos')} onClick={() => setActiveReport('destinos')}>
          Destinos
        </button>
        <button style={tabStyle(activeReport === 'ingresos')} onClick={() => setActiveReport('ingresos')}>
          Ingresos
        </button>
        <button style={tabStyle(activeReport === 'completitud')} onClick={() => setActiveReport('completitud')}>
          Completitud
        </button>
        <button style={tabStyle(activeReport === 'cobertura')} onClick={() => setActiveReport('cobertura')}>
          Cobertura
        </button>
        <button style={tabStyle(activeReport === 'kpis')} onClick={() => setActiveReport('kpis')}>
          KPIs
        </button>
        <button style={tabStyle(activeReport === 'alertas')} onClick={() => setActiveReport('alertas')}>
          Alertas {alertas.length > 0 && <span style={{background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', marginLeft: '5px'}}>{alertas.length}</span>}
        </button>
      </div>

      {/* Vista General */}
      {activeReport === 'general' && reporteConsolidado && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={statCardStyle}>
            <div style={iconContainerStyle('#059669')}>
              <BarChart3 size={24} color="#059669" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Tours</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                {reporteConsolidado.tours?.total || 0}
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#10b981' }}>
                {reporteConsolidado.tours?.activos || 0} activos
              </p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={iconContainerStyle('#3b82f6')}>
              <Users size={24} color="#3b82f6" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Guías</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                {reporteConsolidado.guias?.total || 0}
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#3b82f6' }}>
                ⭐ {reporteConsolidado.guias?.promedioCalificacion?.toFixed(1) || '0.0'} promedio
              </p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={iconContainerStyle('#f59e0b')}>
              <MapPin size={24} color="#f59e0b" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Destinos</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                {reporteConsolidado.destinos?.total || 0}
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#f59e0b' }}>
                Disponibles
              </p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={iconContainerStyle('#8b5cf6')}>
              <DollarSign size={24} color="#8b5cf6" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Servicios</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                {reporteConsolidado.servicios?.total || 0}
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#8b5cf6' }}>
                {formatCurrency(reporteConsolidado.servicios?.ingresoTotal)}
              </p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={iconContainerStyle('#ef4444')}>
              <Calendar size={24} color="#ef4444" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Contrataciones</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                {reporteConsolidado.contrataciones?.total || 0}
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#10b981' }}>
                {reporteConsolidado.contrataciones?.confirmadas || 0} confirmadas | {reporteConsolidado.contrataciones?.pendientes || 0} pendientes
              </p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={iconContainerStyle('#ec4899')}>
              <MessageCircle size={24} color="#ec4899" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Recomendaciones</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                {reporteConsolidado.recomendaciones?.total || 0}
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#ec4899' }}>
                ⭐ {reporteConsolidado.recomendaciones?.calificacionPromedio?.toFixed(1) || '0.0'} promedio
              </p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={iconContainerStyle('#06b6d4')}>
              <CheckCircle2 size={24} color="#06b6d4" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Reservas</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                {reporteConsolidado.reservas?.total || 0}
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#06b6d4' }}>
                {reporteConsolidado.reservas?.confirmadas || 0} confirmadas | {reporteConsolidado.reservas?.pendientes || 0} pendientes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contrataciones */}
      {activeReport === 'contrataciones' && reporteConsolidado && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar color="#ef4444" />
            Reporte de Contrataciones
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', background: '#dcfce7', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>Confirmadas</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#166534' }}>
                {reporteConsolidado.contrataciones?.confirmadas || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#854d0e' }}>Pendientes</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#854d0e' }}>
                {reporteConsolidado.contrataciones?.pendientes || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#fee2e2', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#991b1b' }}>Canceladas</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#991b1b' }}>
                {reporteConsolidado.contrataciones?.canceladas || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#dbeafe', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#1e40af' }}>Ingresos Totales</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                ${reporteConsolidado.contrataciones?.ingresoTotal?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            Total de contrataciones: <strong>{reporteConsolidado.contrataciones?.total || 0}</strong>
          </p>
        </div>
      )}

      {/* Recomendaciones */}
      {activeReport === 'recomendaciones' && reporteConsolidado && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageCircle color="#ec4899" />
            Reporte de Recomendaciones
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', background: '#dbeafe', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#1e40af' }}>Destinos</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                {reporteConsolidado.recomendaciones?.destinos || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#854d0e' }}>Tours</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#854d0e' }}>
                {reporteConsolidado.recomendaciones?.tours || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#e0e7ff', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#5b21b6' }}>Servicios</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#5b21b6' }}>
                {reporteConsolidado.recomendaciones?.servicios || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#dcfce7', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>Calificación Promedio</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#166534' }}>
                ⭐ {reporteConsolidado.recomendaciones?.calificacionPromedio?.toFixed(1) || '0.0'}
              </p>
            </div>
          </div>

          {recomendacionesLista.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#6b7280', fontSize: '16px' }}>
                Últimas Recomendaciones
              </h4>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {recomendacionesLista.slice(0, 10).map((rec, index) => (
                  <div key={rec.id || rec.id_recomendacion || rec._id || index} style={{
                    padding: '15px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 5px 0', color: '#1f2937', fontWeight: '500' }}>
                          {rec.comentario || 'Sin comentario'}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '13px', color: '#6b7280' }}>
                          {rec.tipo_recomendacion === 'tour' && '🎯 Tour'}
                          {rec.tipo_recomendacion === 'destino' && '📍 Destino'}
                          {rec.tipo_recomendacion === 'servicio' && '🏢 Servicio'}
                          {!rec.tipo_recomendacion && rec.id_tour && '🎯 Tour'}
                          {!rec.tipo_recomendacion && rec.id_destino && '📍 Destino'}
                          {!rec.tipo_recomendacion && rec.id_servicio && '🏢 Servicio'}
                          {' | '}
                          {rec.fecha && new Date(rec.fecha).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div style={{ marginLeft: '15px' }}>
                        <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '18px' }}>
                          {'⭐'.repeat(rec.calificacion || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '20px' }}>
            Total de recomendaciones: <strong>{reporteConsolidado.recomendaciones?.total || 0}</strong>
          </p>
        </div>
      )}

      {/* Reservas */}
      {activeReport === 'reservas' && reporteConsolidado && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 color="#06b6d4" />
            Reporte de Reservas
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', background: '#dcfce7', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>Confirmadas</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#166534' }}>
                {reporteConsolidado.reservas?.confirmadas || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#854d0e' }}>Pendientes</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#854d0e' }}>
                {reporteConsolidado.reservas?.pendientes || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#fee2e2', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#991b1b' }}>Canceladas</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#991b1b' }}>
                {reporteConsolidado.reservas?.canceladas || 0}
              </p>
            </div>
            <div style={{ padding: '15px', background: '#dbeafe', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#1e40af' }}>Total Personas</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                {reporteConsolidado.reservas?.totalPersonas || 0}
              </p>
            </div>
          </div>

          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            Total de reservas: <strong>{reporteConsolidado.reservas?.total || 0}</strong>
          </p>
        </div>
      )}

      {/* Tours Populares */}
      {activeReport === 'tours' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp color="#059669" />
            Tours Disponibles
          </h3>
          {toursPopulares.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No hay tours disponibles
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Tour</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Destino</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Guía</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Duración</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {toursPopulares.map((tour, index) => (
                    <tr key={tour.tourId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          background: index < 3 ? '#dbeafe' : '#f3f4f6', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '500' }}>{tour.nombreTour}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Capacidad: {tour.capacidad} personas
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#3b82f6' }}>
                        {tour.destino}
                      </td>
                      <td style={{ padding: '12px', color: '#059669' }}>
                        {tour.guia}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {tour.duracion}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#8b5cf6', fontWeight: '600' }}>
                        {formatCurrency(tour.precio)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Top Guías */}
      {activeReport === 'guias' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award color="#3b82f6" />
            Guías Disponibles
          </h3>
          {estadisticasGuias.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No hay guías disponibles
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Guía</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Idiomas</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Tours</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Experiencia</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticasGuias.map((guia, index) => (
                    <tr key={guia.guiaId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          background: index < 3 ? '#dbeafe' : '#f3f4f6', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{guia.nombreGuia}</td>
                      <td style={{ padding: '12px', color: '#6366f1', fontSize: '13px' }}>
                        {guia.idiomas || 'No especificado'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <span style={{ 
                          background: '#dbeafe', 
                          color: '#1e40af',
                          padding: '4px 12px', 
                          borderRadius: '12px',
                          fontWeight: '600'
                        }}>
                          {guia.totalTours}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#059669' }}>
                        {guia.experiencia > 0 ? `${guia.experiencia} años` : 'N/A'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {guia.calificacion > 0 ? (
                          <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                            ⭐ {guia.calificacion.toFixed(1)}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>Sin calificar</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Destinos */}
      {activeReport === 'destinos' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin color="#10b981" />
            Destinos Turísticos
          </h3>
          {destinosLista.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No hay destinos registrados
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {destinosLista.map((destino) => (
                <div key={destino.id || destino.id_destino || destino._id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'white',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  {destino.ruta && (
                    <img 
                      src={destino.ruta} 
                      alt={destino.nombre}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '18px' }}>
                      {destino.nombre}
                    </h4>
                    <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={16} color="#10b981" />
                      {destino.ubicacion || destino.ciudad || 'Ubicación no especificada'}
                    </p>
                    {destino.provincia && (
                      <p style={{ margin: '5px 0', color: '#8b5cf6', fontSize: '13px', fontWeight: '500' }}>
                        📍 {destino.provincia}
                      </p>
                    )}
                    {destino.categoria && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '10px',
                        padding: '4px 12px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {destino.categoria}
                      </span>
                    )}
                    {destino.calificacion_promedio && (
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                          ⭐ {destino.calificacion_promedio.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '20px', textAlign: 'center' }}>
            Total de destinos: <strong>{destinosLista.length}</strong>
          </p>
        </div>
      )}

      {/* Ingresos */}
      {activeReport === 'ingresos' && ingresos && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={cardStyle}>
              <h4 style={{ marginTop: 0, color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} />
                Valor Total en Servicios
              </h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', margin: '10px 0' }}>
                {formatCurrency(ingresos.ingresoServicios)}
              </p>
              <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>
                Suma de {reporteConsolidado.servicios?.total || 0} servicios configurados
              </p>
            </div>
            
            <div style={cardStyle}>
              <h4 style={{ marginTop: 0, color: '#3b82f6', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} />
                Valor Total en Tours
              </h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', margin: '10px 0' }}>
                {formatCurrency(ingresos.potencialTours)}
              </p>
              <p style={{ fontSize: '12px', color: '#2563eb', margin: 0 }}>
                Suma de {reporteConsolidado.tours?.total || 0} tours configurados
              </p>
            </div>

            <div style={cardStyle}>
              <h4 style={{ marginTop: 0, color: '#8b5cf6', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} />
                Valor Total del Catálogo
              </h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', margin: '10px 0' }}>
                {formatCurrency(ingresos.ingresoServicios + ingresos.potencialTours)}
              </p>
              <p style={{ fontSize: '12px', color: '#7c3aed', margin: 0 }}>
                Tours + Servicios disponibles
              </p>
            </div>
          </div>
          
          {/* Proyección de ingresos */}
          {ingresos.potencialTours > 0 && (
            <div style={{ ...cardStyle, marginTop: '20px', background: '#f0f9ff', border: '2px dashed #3b82f6' }}>
              <h4 style={{ marginTop: 0, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
               Proyección de Ingresos (Ejemplo)
              </h4>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '15px' }}>
                Estos son ejemplos de ingresos potenciales basados en diferentes escenarios de reservas:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>5 reservas/tour</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#2563eb' }}>
                    {formatCurrency(ingresos.potencialTours * 5)}
                  </p>
                </div>
                <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>10 reservas/tour</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#2563eb' }}>
                    {formatCurrency(ingresos.potencialTours * 10)}
                  </p>
                </div>
                <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>20 reservas/tour</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '600', color: '#2563eb' }}>
                    {formatCurrency(ingresos.potencialTours * 20)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ANÁLISIS DE COMPLETITUD */}
      {activeReport === 'completitud' && analisisCompletitud && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 color="#10b981" size={32} />
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Tours Completos</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
                    {analisisCompletitud.toursCompletos}
                  </p>
                </div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle color="#f59e0b" size={32} />
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Tours Incompletos</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>
                    {analisisCompletitud.toursIncompletos}
                  </p>
                </div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 color="#3b82f6" size={32} />
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Completitud</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
                    {analisisCompletitud.porcentajeCompletitud}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {analisisCompletitud.detalleIncompletos.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle color="#f59e0b" />
                Tours que Necesitan Atención
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Tour</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Falta Guía</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Falta Destino</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>No Disponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analisisCompletitud.detalleIncompletos.map((tour) => (
                      <tr key={tour.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{tour.nombre}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {tour.faltaGuia ? <span style={{color: '#ef4444'}}>❌</span> : <span style={{color: '#10b981'}}>✅</span>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {tour.faltaDestino ? <span style={{color: '#ef4444'}}>❌</span> : <span style={{color: '#10b981'}}>✅</span>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {tour.noDisponible ? <span style={{color: '#ef4444'}}>❌</span> : <span style={{color: '#10b981'}}>✅</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ANÁLISIS DE COBERTURA */}
      {activeReport === 'cobertura' && analisisCobertura && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe color="#10b981" />
              Cobertura Geográfica
            </h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', margin: '10px 0' }}>
              {analisisCobertura.totalPaises} Países/Regiones
            </p>
            
            {analisisCobertura.destinosPorPais.map(pais => (
              <div key={pais.pais} style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontWeight: '600', color: '#166534' }}>{pais.pais}</span>
                  <span style={{ 
                    background: '#10b981',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {pais.cantidad} destinos
                  </span>
                </div>
                <div style={{ paddingLeft: '15px', fontSize: '14px', color: '#6b7280' }}>
                  {pais.destinos.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      {activeReport === 'kpis' && kpis && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Indicadores Clave de Rendimiento</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={cardStyle}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Asignación de Guías</h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', margin: '10px 0' }}>
                {kpis.tasaAsignacionGuias}%
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                % de guías con tours asignados
              </p>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Uso de Destinos</h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', margin: '10px 0' }}>
                {kpis.tasaUsoDestinos}%
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                % de destinos con tours
              </p>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Tours Disponibles</h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', margin: '10px 0' }}>
                {kpis.tasaDisponibilidadTours}%
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                % de tours activos
              </p>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Guías Disponibles</h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', margin: '10px 0' }}>
                {kpis.tasaDisponibilidadGuias}%
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                % de guías activos
              </p>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Servicios Disponibles</h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#ec4899', margin: '10px 0' }}>
                {kpis.tasaDisponibilidadServicios}%
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                % de servicios activos
              </p>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Promedio Tours/Guía</h4>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#06b6d4', margin: '10px 0' }}>
                {kpis.promedioToursPorGuia}
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                tours por guía
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ALERTAS */}
      {activeReport === 'alertas' && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle color="#f59e0b" />
            Alertas y Recomendaciones
          </h3>
          
          {alertas.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
              <CheckCircle2 color="#10b981" size={48} style={{ margin: '0 auto 15px' }} />
              <h3 style={{ color: '#10b981', margin: '0 0 10px 0' }}>¡Todo en orden!</h3>
              <p style={{ color: '#6b7280', margin: 0 }}>
                No hay alertas ni recursos infrautilizados en este momento.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {alertas.map((alerta, index) => (
                <div key={index} style={{
                  ...cardStyle,
                  borderLeft: `4px solid ${
                    alerta.tipo === 'error' ? '#ef4444' :
                    alerta.tipo === 'warning' ? '#f59e0b' :
                    '#3b82f6'
                  }`
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                    <div>
                      {alerta.tipo === 'error' && <AlertTriangle color="#ef4444" size={24} />}
                      {alerta.tipo === 'warning' && <AlertTriangle color="#f59e0b" size={24} />}
                      {alerta.tipo === 'info' && <CheckCircle2 color="#3b82f6" size={24} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{alerta.titulo}</h4>
                        <span style={{
                          background: alerta.tipo === 'error' ? '#fee2e2' : 
                                     alerta.tipo === 'warning' ? '#fef3c7' : '#dbeafe',
                          color: alerta.tipo === 'error' ? '#991b1b' : 
                                alerta.tipo === 'warning' ? '#92400e' : '#1e40af',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {alerta.categoria}
                        </span>
                      </div>
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                        {alerta.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx="true">{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportesPanel;
