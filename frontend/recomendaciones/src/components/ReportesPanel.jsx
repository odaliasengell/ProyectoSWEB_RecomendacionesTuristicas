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

// URLs de las APIs REST directas
const PYTHON_API_URL = 'http://localhost:8000';
const TYPESCRIPT_API_URL = 'http://localhost:3000';
const GO_API_URL = 'http://localhost:8000/admin/turismo'; // Via proxy Python

const ReportesPanel = () => {
  const [loading, setLoading] = useState(false);
  const [reporteConsolidado, setReporteConsolidado] = useState(null);
  const [toursPopulares, setToursPopulares] = useState([]);
  const [estadisticasGuias, setEstadisticasGuias] = useState([]);
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
    console.log('📊 Cargando reportes desde APIs REST...');
    
    const token = localStorage.getItem('adminToken');

    try {
      let toursData = [];
      let guiasData = [];
      let destinosData = [];
      let serviciosData = [];
      
      // 1. Cargar Tours desde TypeScript API
      try {
        console.log('🚌 Cargando tours desde TypeScript API...');
        const responseTours = await fetch(`${TYPESCRIPT_API_URL}/api/tours`);
        if (responseTours.ok) {
          const result = await responseTours.json();
          toursData = result.data || [];
          console.log(`✅ ${toursData.length} tours cargados`);
        }
      } catch (error) {
        console.error('⚠️ Error cargando tours:', error.message);
      }

      // 2. Cargar Guías desde TypeScript API
      try {
        console.log('👨‍🏫 Cargando guías desde TypeScript API...');
        const responseGuias = await fetch(`${TYPESCRIPT_API_URL}/api/guias`);
        if (responseGuias.ok) {
          const result = await responseGuias.json();
          guiasData = result.data || [];
          console.log(`✅ ${guiasData.length} guías cargados`);
        }
      } catch (error) {
        console.error('⚠️ Error cargando guías:', error.message);
      }

      // 3. Cargar Destinos desde Python API
      try {
        console.log('📍 Cargando destinos desde Python API...');
        const responseDestinos = await fetch(`${PYTHON_API_URL}/admin/turismo/destinos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (responseDestinos.ok) {
          const result = await responseDestinos.json();
          destinosData = result || [];
          console.log(`✅ ${destinosData.length} destinos cargados`);
        }
      } catch (error) {
        console.error('⚠️ Error cargando destinos:', error.message);
      }

      // 4. Cargar Servicios desde Go API (vía proxy Python)
      try {
        console.log('🏢 Cargando servicios desde Go API...');
        const responseServicios = await fetch(`${GO_API_URL}/servicios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (responseServicios.ok) {
          const result = await responseServicios.json();
          serviciosData = result.servicios || [];
          console.log(`✅ ${serviciosData.length} servicios cargados`);
        }
      } catch (error) {
        console.error('⚠️ Error cargando servicios:', error.message);
      }

      // PROCESAR DATOS PARA REPORTES

      // Tours - mostrar tours disponibles ordenados por precio
      const toursConReporte = toursData
        .filter(tour => tour.disponible)
        .map(tour => {
          // Buscar el guía asignado
          const guiaAsignado = tour.id_guia 
            ? guiasData.find(g => g.id_guia === tour.id_guia)
            : null;
          
          // Buscar el destino asignado
          const destinoAsignado = tour.id_destino 
            ? destinosData.find(d => (d.id || d._id) === tour.id_destino)
            : null;
          
          return {
            tourId: tour.id_tour,
            nombreTour: tour.nombre,
            precio: parseFloat(tour.precio),
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
          const toursAsignados = toursData.filter(t => t.id_guia === guia.id_guia);
          return {
            guiaId: guia.id_guia,
            nombreGuia: guia.nombre,
            idiomas: Array.isArray(guia.idiomas) ? guia.idiomas.join(', ') : guia.idiomas,
            totalTours: toursAsignados.length,
            experiencia: guia.años_experiencia || 0,
            calificacion: guia.calificacion || 0
          };
        })
        .sort((a, b) => b.totalTours - a.totalTours);
      
      setEstadisticasGuias(guiasConReporte);
      console.log('📊 Guías procesados:', guiasConReporte.length);
      
      setEstadisticasGuias(guiasConReporte);
      console.log('📊 Guías destacados procesados:', guiasConReporte.length);

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
        t.id_guia && t.id_destino && t.disponible
      );
      const toursIncompletos = toursData.filter(t => 
        !t.id_guia || !t.id_destino || !t.disponible
      );
      
      const completitudData = {
        toursCompletos: toursCompletos.length,
        toursIncompletos: toursIncompletos.length,
        porcentajeCompletitud: toursData.length > 0 
          ? ((toursCompletos.length / toursData.length) * 100).toFixed(1)
          : 0,
        detalleIncompletos: toursIncompletos.map(t => ({
          id: t.id_tour,
          nombre: t.nombre,
          faltaGuia: !t.id_guia,
          faltaDestino: !t.id_destino,
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
      const guiasConTours = guiasData.filter(g => 
        toursData.some(t => t.id_guia === g.id_guia)
      ).length;
      
      const destinosConTours = destinosData.filter(d => 
        toursData.some(t => t.id_destino === d.id)
      ).length;

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
      const guiasSinTours = guiasData.filter(g => 
        !toursData.some(t => t.id_guia === g.id_guia) && g.disponible
      );
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
      const destinosSinTours = destinosData.filter(d => 
        !toursData.some(t => t.id_destino === d.id)
      );
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
            Consultas complejas mediante GraphQL
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
        <button style={tabStyle(activeReport === 'tours')} onClick={() => setActiveReport('tours')}>
          Tours Disponibles
        </button>
        <button style={tabStyle(activeReport === 'guias')} onClick={() => setActiveReport('guias')}>
          Guías Disponibles
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

      {/* Ingresos */}
      {activeReport === 'ingresos' && ingresos && (
        <div>
          {/* Mensaje informativo */}
          <div style={{ 
            padding: '15px', 
            background: '#fef3c7', 
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
              ℹ️ <strong>Sistema de Reservas Pendiente:</strong> Los ingresos reales se calcularán cuando se implemente el módulo de reservas. Por ahora, se muestra el potencial basado en precios configurados.
            </p>
          </div>

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
                � Proyección de Ingresos (Ejemplo)
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
