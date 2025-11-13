// ============================================
// 🔧 RESOLVERS PARA GRAPHQL
// ============================================

import { RestAPIDataSource } from '../datasource/restAPI';
import { pdfService } from '../services/pdf.service';
import {
  TourMasReservado,
  GuiaMasActivo,
  UsuarioMasActivo,
  ReservasPorMes,
  DestinoMasPopular,
  EstadisticaGeneral,
  ServicioMasContratado,
  Tour,
  Reserva,
  Recomendacion,
  ContratacionServicio
} from '../types';

interface Context {
  dataSources: {
    restAPI: RestAPIDataSource;
  };
}

export const resolvers = {
  // ============================================
  // QUERIES
  // ============================================
  Query: {
    // Consultas básicas
    usuarios: async (_: any, __: any, { dataSources }: Context) => {
      return await dataSources.restAPI.getAllUsuarios();
    },

    usuario: async (_: any, { id }: { id: string }, { dataSources }: Context) => {
      return await dataSources.restAPI.getUsuarioById(id);
    },

    destinos: async (_: any, __: any, { dataSources }: Context) => {
      return await dataSources.restAPI.getAllDestinos();
    },

    destino: async (_: any, { id }: { id: string }, { dataSources }: Context) => {
      return await dataSources.restAPI.getDestinoById(id);
    },

    tours: async (_: any, __: any, { dataSources }: Context) => {
      return await dataSources.restAPI.getAllTours();
    },

    tour: async (_: any, { id }: { id: string }, { dataSources }: Context) => {
      return await dataSources.restAPI.getTourById(id);
    },

    guias: async (_: any, __: any, { dataSources }: Context) => {
      return await dataSources.restAPI.getAllGuias();
    },

    guia: async (_: any, { id }: { id: string }, { dataSources }: Context) => {
      return await dataSources.restAPI.getGuiaById(id);
    },

    reservas: async (_: any, __: any, { dataSources }: Context) => {
      return await dataSources.restAPI.getAllReservas();
    },

    reserva: async (_: any, { id }: { id: string }, { dataSources }: Context) => {
      return await dataSources.restAPI.getReservaById(id);
    },

    servicios: async (_: any, __: any, { dataSources }: Context) => {
      return await dataSources.restAPI.getAllServicios();
    },

    servicio: async (_: any, { id }: { id: string }, { dataSources }: Context) => {
      return await dataSources.restAPI.getServicioById(id);
    },

    recomendaciones: async (_: any, __: any, { dataSources }: Context) => {
      return await dataSources.restAPI.getAllRecomendaciones();
    },

    contrataciones: async (_: any, __: any, { dataSources }: Context) => {
      return await dataSources.restAPI.getAllContrataciones();
    },

    // ============================================
    // 📊 REPORTES ANALÍTICOS
    // ============================================

    // Top tours más reservados
    toursTop: async (_: any, { limit = 10 }: { limit?: number }, { dataSources }: Context): Promise<TourMasReservado[]> => {
      const tours = await dataSources.restAPI.getAllTours();
      const reservas = await dataSources.restAPI.getAllReservas();

      // Agrupar reservas por tour
      const tourStats = new Map<string, { total_reservas: number; total_personas: number; ingresos_totales: number }>();

      reservas.forEach((reserva) => {
        if (reserva.estado !== 'cancelada' && reserva.tour_id) {
          const stats = tourStats.get(reserva.tour_id) || { total_reservas: 0, total_personas: 0, ingresos_totales: 0 };
          stats.total_reservas += 1;
          stats.total_personas += reserva.cantidad_personas || 0;
          // Calcular ingresos basado en el tour
          const tour = tours.find(t => t._id === reserva.tour_id);
          if (tour && tour.precio) {
            stats.ingresos_totales += tour.precio * (reserva.cantidad_personas || 0);
          }
          tourStats.set(reserva.tour_id, stats);
        }
      });

      // Crear resultado combinando tours con sus estadísticas
      const result: TourMasReservado[] = [];
      tourStats.forEach((stats, tourId) => {
        const tour = tours.find(t => t._id === tourId);
        if (tour) {
          result.push({
            tour,
            ...stats
          });
        }
      });

      // Ordenar por total de reservas y limitar
      return result
        .sort((a, b) => b.total_reservas - a.total_reservas)
        .slice(0, limit);
    },

    // Guías más activos
    guiasTop: async (_: any, { limit = 10 }: { limit?: number }, { dataSources }: Context): Promise<GuiaMasActivo[]> => {
      const guias = await dataSources.restAPI.getAllGuias();
      const tours = await dataSources.restAPI.getAllTours();
      const reservas = await dataSources.restAPI.getAllReservas();

      const guiaStats = new Map<string, { total_tours: number; total_reservas: number; calificaciones: number[] }>();

      // Contar tours por guía
      tours.forEach((tour) => {
        if (tour.guia_id) {
          const stats = guiaStats.get(tour.guia_id) || { total_tours: 0, total_reservas: 0, calificaciones: [] };
          stats.total_tours += 1;
          guiaStats.set(tour.guia_id, stats);
        }
      });

      // Contar reservas por guía (a través de tours)
      reservas.forEach((reserva) => {
        if (reserva.estado !== 'cancelada' && reserva.tour_id) {
          const tour = tours.find(t => t._id === reserva.tour_id);
          if (tour && tour.guia_id) {
            const stats = guiaStats.get(tour.guia_id);
            if (stats) {
              stats.total_reservas += 1;
            }
          }
        }
      });

      // Agregar calificaciones de tours (las recomendaciones del REST no tienen guia_id directo)
      // Se necesitaría mapear a través de tours si es necesario
      // Por ahora, usar calificación base de los guías si existe
      guias.forEach((guia) => {
        const stats = guiaStats.get(guia._id);
        if (stats && guia.calificacion) {
          stats.calificaciones.push(guia.calificacion);
        }
      });

      const result: GuiaMasActivo[] = [];
      guiaStats.forEach((stats, guiaId) => {
        const guia = guias.find(g => g._id === guiaId);
        if (guia) {
          const calificacion_promedio = stats.calificaciones.length > 0
            ? stats.calificaciones.reduce((a, b) => a + b, 0) / stats.calificaciones.length
            : 0;

          result.push({
            guia,
            total_tours: stats.total_tours,
            total_reservas: stats.total_reservas,
            calificacion_promedio
          });
        }
      });

      return result
        .sort((a, b) => b.total_reservas - a.total_reservas)
        .slice(0, limit);
    },

    // Usuarios más activos
    usuariosTop: async (_: any, { limit = 10 }: { limit?: number }, { dataSources }: Context): Promise<UsuarioMasActivo[]> => {
      const usuarios = await dataSources.restAPI.getAllUsuarios();
      const tours = await dataSources.restAPI.getAllTours();
      const reservas = await dataSources.restAPI.getAllReservas();
      const recomendaciones = await dataSources.restAPI.getAllRecomendaciones();

      const usuarioStats = new Map<string, { total_reservas: number; total_gastado: number; total_recomendaciones: number }>();

      reservas.forEach((reserva) => {
        if (reserva.estado !== 'cancelada' && reserva.usuario_id) {
          const stats = usuarioStats.get(reserva.usuario_id) || { total_reservas: 0, total_gastado: 0, total_recomendaciones: 0 };
          stats.total_reservas += 1;
          // Calcular total gastado basado en el tour
          const tour = tours.find((t: Tour) => t._id === reserva.tour_id);
          if (tour && tour.precio) {
            stats.total_gastado += tour.precio * (reserva.cantidad_personas || 0);
          }
          usuarioStats.set(reserva.usuario_id, stats);
        }
      });

      recomendaciones.forEach((rec) => {
        const stats = usuarioStats.get(rec.id_usuario) || { total_reservas: 0, total_gastado: 0, total_recomendaciones: 0 };
        stats.total_recomendaciones += 1;
        usuarioStats.set(rec.id_usuario, stats);
      });

      const result: UsuarioMasActivo[] = [];
      usuarioStats.forEach((stats, usuarioId) => {
        const usuario = usuarios.find(u => u._id === usuarioId);
        if (usuario) {
          result.push({
            usuario,
            ...stats
          });
        }
      });

      return result
        .sort((a, b) => b.total_reservas - a.total_reservas)
        .slice(0, limit);
    },

    // Reservas por mes
    reservasPorMes: async (_: any, { anio }: { anio: number }, { dataSources }: Context): Promise<ReservasPorMes[]> => {
      const reservas = await dataSources.restAPI.getAllReservas();

      const mesesStats = new Map<string, { total_reservas: number; total_ingresos: number }>();

      const tours = await dataSources.restAPI.getAllTours();
      
      reservas.forEach((reserva) => {
        if (reserva.fecha_reserva) {
          const fecha = new Date(reserva.fecha_reserva);
          if (fecha.getFullYear() === anio && reserva.estado !== 'cancelada') {
            const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            const stats = mesesStats.get(mesKey) || { total_reservas: 0, total_ingresos: 0 };
            stats.total_reservas += 1;
            // Calcular ingresos basado en el tour
            const tour = tours.find(t => t._id === reserva.tour_id);
            if (tour && tour.precio) {
              stats.total_ingresos += tour.precio * (reserva.cantidad_personas || 0);
            }
            mesesStats.set(mesKey, stats);
          }
        }
      });

      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

      const result: ReservasPorMes[] = [];
      mesesStats.forEach((stats, mesKey) => {
        const [year, month] = mesKey.split('-');
        result.push({
          mes: meses[parseInt(month) - 1],
          anio: parseInt(year),
          ...stats
        });
      });

      return result.sort((a, b) => {
        const monthA = meses.indexOf(a.mes);
        const monthB = meses.indexOf(b.mes);
        return monthA - monthB;
      });
    },

    // Destinos más populares
    destinosPopulares: async (_: any, { limit = 10 }: { limit?: number }, { dataSources }: Context): Promise<DestinoMasPopular[]> => {
      const destinos = await dataSources.restAPI.getAllDestinos();
      const tours = await dataSources.restAPI.getAllTours();
      const reservas = await dataSources.restAPI.getAllReservas();
      const recomendaciones = await dataSources.restAPI.getAllRecomendaciones();

      const destinoStats = new Map<string, { total_tours: number; total_reservas: number; calificaciones: number[] }>();

      tours.forEach((tour) => {
        if (tour.destino_id) {
          const stats = destinoStats.get(tour.destino_id) || { total_tours: 0, total_reservas: 0, calificaciones: [] };
          stats.total_tours += 1;
          destinoStats.set(tour.destino_id, stats);
        }
      });

      reservas.forEach((reserva) => {
        if (reserva.estado !== 'cancelada' && reserva.tour_id) {
          const tour = tours.find(t => t._id === reserva.tour_id);
          if (tour && tour.destino_id) {
            const stats = destinoStats.get(tour.destino_id);
            if (stats) {
              stats.total_reservas += 1;
            }
          }
        }
      });

      // Las recomendaciones del REST no tienen destino_id directo
      // Se pueden asociar a través de tours
      recomendaciones.forEach((rec) => {
        if (rec.id_tour) {
          const tour = tours.find(t => t._id === rec.id_tour);
          if (tour && tour.destino_id) {
            const stats = destinoStats.get(tour.destino_id);
            if (stats) {
              stats.calificaciones.push(rec.calificacion);
            }
          }
        }
      });

      const result: DestinoMasPopular[] = [];
      destinoStats.forEach((stats, destinoId) => {
        const destino = destinos.find(d => d._id === destinoId);
        if (destino) {
          const calificacion_promedio = stats.calificaciones.length > 0
            ? stats.calificaciones.reduce((a, b) => a + b, 0) / stats.calificaciones.length
            : 0;

          result.push({
            destino,
            total_tours: stats.total_tours,
            total_reservas: stats.total_reservas,
            calificacion_promedio
          });
        }
      });

      return result
        .sort((a, b) => b.total_reservas - a.total_reservas)
        .slice(0, limit);
    },

    // Servicios más contratados
    serviciosTop: async (_: any, { limit = 10 }: { limit?: number }, { dataSources }: Context): Promise<ServicioMasContratado[]> => {
      const servicios = await dataSources.restAPI.getAllServicios();
      const contrataciones = await dataSources.restAPI.getAllContrataciones();

      const servicioStats = new Map<string, { total_contrataciones: number; total_ingresos: number }>();

      contrataciones.forEach((contratacion) => {
        if (contratacion.servicio_id) {
          const stats = servicioStats.get(contratacion.servicio_id) || { total_contrataciones: 0, total_ingresos: 0 };
          stats.total_contrataciones += 1;
          stats.total_ingresos += contratacion.total || 0;
          servicioStats.set(contratacion.servicio_id, stats);
        }
      });

      const result: ServicioMasContratado[] = [];
      servicioStats.forEach((stats, servicioId) => {
        const servicio = servicios.find(s => s._id === servicioId);
        if (servicio) {
          result.push({
            servicio,
            ...stats
          });
        }
      });

      return result
        .sort((a, b) => b.total_contrataciones - a.total_contrataciones)
        .slice(0, limit);
    },

    // Estadísticas generales
    estadisticasGenerales: async (_: any, __: any, { dataSources }: Context): Promise<EstadisticaGeneral> => {
      const usuarios = await dataSources.restAPI.getAllUsuarios();
      const destinos = await dataSources.restAPI.getAllDestinos();
      const tours = await dataSources.restAPI.getAllTours();
      const guias = await dataSources.restAPI.getAllGuias();
      const reservas = await dataSources.restAPI.getAllReservas();

      let total_ingresos = 0;
      let reservas_pendientes = 0;
      let reservas_confirmadas = 0;
      let reservas_completadas = 0;
      let reservas_canceladas = 0;

      reservas.forEach((reserva) => {
        // Calcular ingresos basado en tour + cantidad de personas
        if (reserva.estado !== 'cancelada' && reserva.tour_id) {
          const tour = tours.find(t => t._id === reserva.tour_id);
          if (tour && tour.precio) {
            total_ingresos += tour.precio * (reserva.cantidad_personas || 0);
          }
        }

        switch (reserva.estado) {
          case 'pendiente':
            reservas_pendientes += 1;
            break;
          case 'confirmada':
            reservas_confirmadas += 1;
            break;
          case 'completada':
            reservas_completadas += 1;
            break;
          case 'cancelada':
            reservas_canceladas += 1;
            break;
        }
      });

      return {
        total_usuarios: usuarios.length,
        total_destinos: destinos.length,
        total_tours: tours.length,
        total_guias: guias.length,
        total_reservas: reservas.length,
        total_ingresos,
        reservas_pendientes,
        reservas_confirmadas,
        reservas_completadas,
        reservas_canceladas
      };
    },

    // Recomendaciones mejor calificadas
    recomendacionesTop: async (_: any, { limit = 10 }: { limit?: number }, { dataSources }: Context) => {
      const recomendaciones = await dataSources.restAPI.getAllRecomendaciones();
      
      // Ordenar por calificación descendente
      const sorted = recomendaciones
        .sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0))
        .slice(0, limit);

      return sorted.map((recomendacion) => ({
        recomendacion,
        tour: null,
        servicio: null,
        usuario: null
      }));
    },

    // Contrataciones por mes
    contratacionesPorMes: async (_: any, { anio }: { anio: number }, { dataSources }: Context) => {
      const contrataciones = await dataSources.restAPI.getAllContrataciones();
      
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      const statsPorMes = new Map<number, { total: number; ingresos: number }>();

      // Inicializar todos los meses
      for (let i = 0; i < 12; i++) {
        statsPorMes.set(i, { total: 0, ingresos: 0 });
      }

      // Agrupar contrataciones por mes
      contrataciones.forEach((contratacion) => {
        if (contratacion.fecha_contratacion) {
          const fecha = new Date(contratacion.fecha_contratacion);
          if (fecha.getFullYear() === anio) {
            const mes = fecha.getMonth();
            const stats = statsPorMes.get(mes)!;
            stats.total += 1;
            stats.ingresos += contratacion.total || 0;
          }
        }
      });

      // Convertir a array
      const resultado = [];
      for (let i = 0; i < 12; i++) {
        const stats = statsPorMes.get(i)!;
        resultado.push({
          mes: meses[i],
          anio,
          total_contrataciones: stats.total,
          total_ingresos: stats.ingresos
        });
      }

      return resultado;
    }
  },

  // ============================================
  // RESOLVERS DE RELACIONES
  // ============================================
  Tour: {
    destino: async (parent: Tour, _: any, { dataSources }: Context) => {
      return parent.destino_id ? await dataSources.restAPI.getDestinoById(parent.destino_id) : null;
    },
    guia: async (parent: Tour, _: any, { dataSources }: Context) => {
      return parent.guia_id ? await dataSources.restAPI.getGuiaById(parent.guia_id) : null;
    }
  },

  Reserva: {
    tour: async (parent: Reserva, _: any, { dataSources }: Context) => {
      return parent.tour_id ? await dataSources.restAPI.getTourById(parent.tour_id) : null;
    },
    usuario: async (parent: Reserva, _: any, { dataSources }: Context) => {
      return parent.usuario_id ? await dataSources.restAPI.getUsuarioById(parent.usuario_id) : null;
    }
  },

  ContratacionServicio: {
    servicio: async (parent: ContratacionServicio, _: any, { dataSources }: Context) => {
      return parent.servicio_id ? await dataSources.restAPI.getServicioById(parent.servicio_id) : null;
    },
    usuario: async (parent: ContratacionServicio, _: any, { dataSources }: Context) => {
      return parent.usuario_id ? await dataSources.restAPI.getUsuarioById(parent.usuario_id) : null;
    }
  },

  Recomendacion: {
    usuario: async (parent: Recomendacion, _: any, { dataSources }: Context) => {
      return parent.id_usuario ? await dataSources.restAPI.getUsuarioById(parent.id_usuario) : null;
    },
    tour: async (parent: Recomendacion, _: any, { dataSources }: Context) => {
      return parent.id_tour ? await dataSources.restAPI.getTourById(parent.id_tour) : null;
    },
    servicio: async (parent: Recomendacion, _: any, { dataSources }: Context) => {
      return parent.id_servicio ? await dataSources.restAPI.getServicioById(parent.id_servicio) : null;
    }
  },

  // ============================================
  // 🔧 MUTATIONS
  // ============================================
  Mutation: {
    generateReportPDF: async (
      _: any,
      { reportType, limit = 10 }: { reportType: string; limit?: number },
      { dataSources }: Context
    ) => {
      try {
        console.log(`📄 Generando PDF de reporte: ${reportType}`);
        
        let reportData: any = {};
        let title = '';
        let subtitle = '';
        
        // Obtener datos según el tipo de reporte
        switch (reportType) {
          case 'TOURS': {
            const tours = await dataSources.restAPI.getAllTours();
            const reservas = await dataSources.restAPI.getAllReservas();
            
            // Calcular estadísticas de tours (igual que en toursTop)
            const tourStats = new Map<string, { total_reservas: number; total_personas: number; ingresos_totales: number }>();
            reservas.forEach((reserva) => {
              if (reserva.estado !== 'cancelada' && reserva.tour_id) {
                const stats = tourStats.get(reserva.tour_id) || { total_reservas: 0, total_personas: 0, ingresos_totales: 0 };
                stats.total_reservas += 1;
                stats.total_personas += reserva.cantidad_personas || 0;
                const tour = tours.find(t => t._id === reserva.tour_id);
                if (tour && tour.precio) {
                  stats.ingresos_totales += tour.precio * (reserva.cantidad_personas || 0);
                }
                tourStats.set(reserva.tour_id, stats);
              }
            });

            const toursData: any[] = [];
            tourStats.forEach((stats, tourId) => {
              const tour = tours.find(t => t._id === tourId);
              if (tour) {
                toursData.push({ tour, ...stats });
              }
            });

            reportData = toursData.sort((a, b) => b.total_reservas - a.total_reservas).slice(0, limit);
            title = 'Reporte de Tours Más Reservados';
            subtitle = `Top ${limit} tours con mayor demanda`;
            break;
          }

          case 'GUIAS': {
            const guias = await dataSources.restAPI.getAllGuias();
            const tours = await dataSources.restAPI.getAllTours();
            
            const guiaStats = new Map<string, { total_tours: number }>();
            tours.forEach((tour) => {
              if (tour.guia_id) {
                const stats = guiaStats.get(tour.guia_id) || { total_tours: 0 };
                stats.total_tours += 1;
                guiaStats.set(tour.guia_id, stats);
              }
            });

            const guiasData: any[] = [];
            guiaStats.forEach((stats, guiaId) => {
              const guia = guias.find(g => g._id === guiaId);
              if (guia) {
                guiasData.push({ guia, ...stats });
              }
            });

            reportData = guiasData.sort((a, b) => b.total_tours - a.total_tours).slice(0, limit);
            title = 'Reporte de Guías Más Activos';
            subtitle = `Top ${limit} guías con mayor actividad`;
            break;
          }

          case 'USUARIOS': {
            const usuarios = await dataSources.restAPI.getAllUsuarios();
            const reservas = await dataSources.restAPI.getAllReservas();
            const tours = await dataSources.restAPI.getAllTours();
            
            const userStats = new Map<string, { total_reservas: number; total_gastado: number }>();
            reservas.forEach((reserva) => {
              if (reserva.usuario_id && reserva.estado !== 'cancelada') {
                const stats = userStats.get(reserva.usuario_id) || { total_reservas: 0, total_gastado: 0 };
                stats.total_reservas += 1;
                const tour = tours.find(t => t._id === reserva.tour_id);
                if (tour && tour.precio) {
                  stats.total_gastado += tour.precio * (reserva.cantidad_personas || 0);
                }
                userStats.set(reserva.usuario_id, stats);
              }
            });

            const usuariosData: any[] = [];
            userStats.forEach((stats, userId) => {
              const usuario = usuarios.find(u => u._id === userId);
              if (usuario) {
                usuariosData.push({ usuario, ...stats });
              }
            });

            reportData = usuariosData.sort((a, b) => b.total_reservas - a.total_reservas).slice(0, limit);
            title = 'Reporte de Usuarios Más Activos';
            subtitle = `Top ${limit} usuarios con mayor actividad`;
            break;
          }

          case 'RESERVAS': {
            const reservas = await dataSources.restAPI.getAllReservas();
            const tours = await dataSources.restAPI.getAllTours();
            
            const monthStats = new Map<string, { total_reservas: number; total_personas: number; ingresos_totales: number }>();
            reservas.forEach((reserva) => {
              if (reserva.fecha_reserva && reserva.estado !== 'cancelada') {
                const date = new Date(reserva.fecha_reserva);
                const mes = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                
                const stats = monthStats.get(mes) || { total_reservas: 0, total_personas: 0, ingresos_totales: 0 };
                stats.total_reservas += 1;
                stats.total_personas += reserva.cantidad_personas || 0;
                
                const tour = tours.find(t => t._id === reserva.tour_id);
                if (tour && tour.precio) {
                  stats.ingresos_totales += tour.precio * (reserva.cantidad_personas || 0);
                }
                monthStats.set(mes, stats);
              }
            });

            reportData = Array.from(monthStats.entries()).map(([mes, stats]) => ({ mes, ...stats }));
            title = 'Reporte de Reservas por Mes';
            subtitle = 'Análisis mensual de reservas';
            break;
          }

          case 'DESTINOS': {
            const destinos = await dataSources.restAPI.getAllDestinos();
            const tours = await dataSources.restAPI.getAllTours();
            
            const destinoStats = new Map<string, { total_tours: number }>();
            tours.forEach((tour) => {
              if (tour.destino_id) {
                const stats = destinoStats.get(tour.destino_id) || { total_tours: 0 };
                stats.total_tours += 1;
                destinoStats.set(tour.destino_id, stats);
              }
            });

            const destinosData: any[] = [];
            destinoStats.forEach((stats, destinoId) => {
              const destino = destinos.find(d => d._id === destinoId);
              if (destino) {
                destinosData.push({ destino, ...stats });
              }
            });

            reportData = destinosData.sort((a, b) => b.total_tours - a.total_tours).slice(0, limit);
            title = 'Reporte de Destinos Más Populares';
            subtitle = `Top ${limit} destinos con mayor actividad turística`;
            break;
          }

          case 'SERVICIOS': {
            const servicios = await dataSources.restAPI.getAllServicios();
            const contrataciones = await dataSources.restAPI.getAllContrataciones();
            
            const servicioStats = new Map<string, { total_contrataciones: number; ingresos_totales: number }>();
            contrataciones.forEach((contratacion) => {
              if (contratacion.servicio_id && contratacion.estado !== 'cancelada') {
                const stats = servicioStats.get(contratacion.servicio_id) || { total_contrataciones: 0, ingresos_totales: 0 };
                stats.total_contrataciones += 1;
                const servicio = servicios.find(s => s._id === contratacion.servicio_id);
                if (servicio && servicio.precio) {
                  stats.ingresos_totales += servicio.precio;
                }
                servicioStats.set(contratacion.servicio_id, stats);
              }
            });

            const serviciosData: any[] = [];
            servicioStats.forEach((stats, servicioId) => {
              const servicio = servicios.find(s => s._id === servicioId);
              if (servicio) {
                serviciosData.push({ servicio, ...stats });
              }
            });

            reportData = serviciosData.sort((a, b) => b.total_contrataciones - a.total_contrataciones).slice(0, limit);
            title = 'Reporte de Servicios Más Contratados';
            subtitle = `Top ${limit} servicios con mayor demanda`;
            break;
          }

          case 'GENERAL': {
            const tours = await dataSources.restAPI.getAllTours();
            const reservas = await dataSources.restAPI.getAllReservas();
            const guias = await dataSources.restAPI.getAllGuias();
            const destinos = await dataSources.restAPI.getAllDestinos();
            const servicios = await dataSources.restAPI.getAllServicios();
            const contrataciones = await dataSources.restAPI.getAllContrataciones();

            let total_personas = 0;
            let ingresos_totales = 0;

            reservas.forEach((reserva) => {
              if (reserva.estado !== 'cancelada') {
                total_personas += reserva.cantidad_personas || 0;
                const tour = tours.find(t => t._id === reserva.tour_id);
                if (tour && tour.precio) {
                  ingresos_totales += tour.precio * (reserva.cantidad_personas || 0);
                }
              }
            });

            reportData = {
              total_tours: tours.length,
              tours_disponibles: tours.filter(t => t.disponible).length,
              total_reservas: reservas.length,
              total_personas,
              ingresos_totales,
              total_guias: guias.length,
              guias_disponibles: guias.filter(g => g.disponible).length,
              total_destinos: destinos.length,
              destinos_activos: destinos.filter(d => d.activo).length,
              total_servicios: servicios.length,
              servicios_disponibles: servicios.filter(s => s.disponible).length,
              total_contrataciones: contrataciones.length
            };
            
            title = 'Reporte General del Sistema';
            subtitle = 'Estadísticas generales de la plataforma turística';
            break;
          }

          default:
            throw new Error(`Tipo de reporte no válido: ${reportType}`);
        }

        // Generar el PDF
        const result = await pdfService.generateReport({
          title,
          subtitle,
          data: reportData,
          type: reportType.toLowerCase() as any
        });

        if (result.success) {
          // Limpiar PDFs antiguos (opcional)
          pdfService.cleanOldPDFs();
          
          const PORT = process.env.PORT || '4000';
          return {
            success: true,
            filename: result.filename,
            url: `http://localhost:${PORT}/pdfs/${result.filename}`,
            message: 'PDF generado exitosamente'
          };
        } else {
          throw new Error(result.message || 'Error generando PDF');
        }
      } catch (error: any) {
        console.error('❌ Error en generateReportPDF:', error);
        return {
          success: false,
          filename: '',
          url: '',
          message: error.message || 'Error generando PDF'
        };
      }
    }
  }
};
