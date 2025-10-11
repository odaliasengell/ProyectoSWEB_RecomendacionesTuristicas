import { cacheManager } from '../utils/cache';

export const reporteResolvers = {
  Query: {
    // Reportes de Tours
    reporteToursPopulares: async (
      _: any,
      { limite = 10 }: { limite?: number },
      { dataSources }: any
    ) => {
      return cacheManager.getOrSet(`reporte:tours:populares:${limite}`, async () => {
        const tours = await dataSources.typescriptAPI.getTours();
        const reservas = await dataSources.typescriptAPI.getReservas();

        const toursConEstadisticas = tours.map((tour: any) => {
          const reservasTour = reservas.filter((r: any) => r.tourId === tour.id);
          const totalReservas = reservasTour.length;
          const ingresoTotal = reservasTour.reduce((sum: number, r: any) => sum + (r.precioTotal || 0), 0);

          // Agrupar reservas por mes
          const reservasPorMes: any = {};
          reservasTour.forEach((r: any) => {
            const fecha = new Date(r.fechaReserva);
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (!reservasPorMes[mes]) {
              reservasPorMes[mes] = { cantidad: 0, ingreso: 0 };
            }
            reservasPorMes[mes].cantidad++;
            reservasPorMes[mes].ingreso += r.precioTotal || 0;
          });

          return {
            tourId: tour.id,
            nombreTour: tour.nombre,
            totalReservas,
            ingresoTotal,
            promedioCalificacion: tour.calificacion || 0,
            categoria: tour.categoria,
            reservasPorMes: Object.entries(reservasPorMes).map(([mes, data]: [string, any]) => ({
              mes,
              cantidad: data.cantidad,
              ingreso: data.ingreso,
            })),
          };
        });

        return toursConEstadisticas
          .sort((a: any, b: any) => b.totalReservas - a.totalReservas)
          .slice(0, limite);
      });
    },

    reporteToursPorCategoria: async (
      _: any,
      { categoria }: { categoria: string },
      { dataSources }: any
    ) => {
      const tours = await dataSources.typescriptAPI.getToursByCategory(categoria);
      const reservas = await dataSources.typescriptAPI.getReservas();

      return tours.map((tour: any) => {
        const reservasTour = reservas.filter((r: any) => r.tourId === tour.id);
        return {
          tourId: tour.id,
          nombreTour: tour.nombre,
          totalReservas: reservasTour.length,
          ingresoTotal: reservasTour.reduce((sum: number, r: any) => sum + (r.precioTotal || 0), 0),
          promedioCalificacion: tour.calificacion || 0,
          categoria: tour.categoria,
        };
      });
    },

    // Reportes de Reservas
    reporteReservasPorPeriodo: async (
      _: any,
      { fechaInicio, fechaFin }: { fechaInicio: string; fechaFin: string },
      { dataSources }: any
    ) => {
      const reservas = await dataSources.typescriptAPI.getReservasByDateRange(fechaInicio, fechaFin);

      const totalReservas = reservas.length;
      const reservasPendientes = reservas.filter((r: any) => r.estado === 'PENDIENTE').length;
      const reservasConfirmadas = reservas.filter((r: any) => r.estado === 'CONFIRMADA').length;
      const reservasCanceladas = reservas.filter((r: any) => r.estado === 'CANCELADA').length;
      const reservasCompletadas = reservas.filter((r: any) => r.estado === 'COMPLETADA').length;

      const ingresoTotal = reservas
        .filter((r: any) => r.estado !== 'CANCELADA')
        .reduce((sum: number, r: any) => sum + (r.precioTotal || 0), 0);

      const ingresoPromedio = totalReservas > 0 ? ingresoTotal / totalReservas : 0;

      // Agrupar por día
      const reservasPorDia: any = {};
      reservas.forEach((r: any) => {
        const fecha = new Date(r.fechaReserva).toISOString().split('T')[0];
        if (!reservasPorDia[fecha]) {
          reservasPorDia[fecha] = { cantidad: 0, ingreso: 0 };
        }
        reservasPorDia[fecha].cantidad++;
        if (r.estado !== 'CANCELADA') {
          reservasPorDia[fecha].ingreso += r.precioTotal || 0;
        }
      });

      return {
        totalReservas,
        reservasPendientes,
        reservasConfirmadas,
        reservasCanceladas,
        reservasCompletadas,
        ingresoTotal,
        ingresoPromedio,
        reservasPorDia: Object.entries(reservasPorDia).map(([fecha, data]: [string, any]) => ({
          fecha,
          cantidad: data.cantidad,
          ingreso: data.ingreso,
        })),
      };
    },

    reporteReservasPorEstado: async (_: any, __: any, { dataSources }: any) => {
      const reservas = await dataSources.typescriptAPI.getReservas();

      return {
        totalReservas: reservas.length,
        reservasPendientes: reservas.filter((r: any) => r.estado === 'PENDIENTE').length,
        reservasConfirmadas: reservas.filter((r: any) => r.estado === 'CONFIRMADA').length,
        reservasCanceladas: reservas.filter((r: any) => r.estado === 'CANCELADA').length,
        reservasCompletadas: reservas.filter((r: any) => r.estado === 'COMPLETADA').length,
        ingresoTotal: reservas
          .filter((r: any) => r.estado !== 'CANCELADA')
          .reduce((sum: number, r: any) => sum + (r.precioTotal || 0), 0),
        ingresoPromedio:
          reservas.length > 0
            ? reservas
                .filter((r: any) => r.estado !== 'CANCELADA')
                .reduce((sum: number, r: any) => sum + (r.precioTotal || 0), 0) / reservas.length
            : 0,
        reservasPorDia: [],
      };
    },

    // Reportes de Guías
    reporteGuias: async (_: any, { limite = 10 }: { limite?: number }, { dataSources }: any) => {
      const guias = await dataSources.typescriptAPI.getGuias();
      const tours = await dataSources.typescriptAPI.getTours();
      const reservas = await dataSources.typescriptAPI.getReservas();

      const guiasConEstadisticas = guias.map((guia: any) => {
        const toursGuia = tours.filter((t: any) => t.guiaId === guia.id);
        const tourIds = toursGuia.map((t: any) => t.id);
        const reservasGuia = reservas.filter((r: any) => tourIds.includes(r.tourId));

        return {
          guiaId: guia.id,
          nombreGuia: `${guia.nombre} ${guia.apellido}`,
          totalTours: toursGuia.length,
          totalReservas: reservasGuia.length,
          ingresoGenerado: reservasGuia.reduce((sum: number, r: any) => sum + (r.precioTotal || 0), 0),
          calificacionPromedio: guia.calificacion || 0,
          toursActivos: toursGuia.filter((t: any) => t.disponible).length,
        };
      });

      return guiasConEstadisticas
        .sort((a: any, b: any) => b.totalReservas - a.totalReservas)
        .slice(0, limite);
    },

    reporteGuiaMasExitoso: async (_: any, __: any, { dataSources }: any) => {
      const reporteGuias = await reporteResolvers.Query.reporteGuias(_, { limite: 1 }, { dataSources });
      return reporteGuias[0] || null;
    },

    // Reportes de Destinos
    reporteDestinosPopulares: async (
      _: any,
      { limite = 10 }: { limite?: number },
      { dataSources }: any
    ) => {
      return cacheManager.getOrSet(`reporte:destinos:populares:${limite}`, async () => {
        const destinos = await dataSources.pythonAPI.getDestinosPopulares(limite);

        return destinos.map((destino: any) => ({
          destinoId: destino.id,
          nombreDestino: destino.nombre,
          pais: destino.pais,
          totalVisitas: destino.visitas || 0,
          calificacionPromedio: destino.calificacion || 0,
          popularidad: destino.popularidad || 0,
          temporadaAlta: destino.temporadaAlta || [],
        }));
      });
    },

    reporteDestinosPorPais: async (_: any, { pais }: { pais: string }, { dataSources }: any) => {
      const destinos = await dataSources.pythonAPI.getDestinosByPais(pais);

      return destinos.map((destino: any) => ({
        destinoId: destino.id,
        nombreDestino: destino.nombre,
        pais: destino.pais,
        totalVisitas: destino.visitas || 0,
        calificacionPromedio: destino.calificacion || 0,
        popularidad: destino.popularidad || 0,
        temporadaAlta: destino.temporadaAlta || [],
      }));
    },

    // Reportes de Servicios
    reporteServicios: async (_: any, __: any, { dataSources }: any) => {
      return cacheManager.getOrSet('reporte:servicios:all', async () => {
        const servicios = await dataSources.golangAPI.getServicios();
        const contrataciones = await dataSources.golangAPI.getContrataciones();

        return servicios.map((servicio: any) => {
          const contratacionesServicio = contrataciones.filter(
            (c: any) => c.servicioId === servicio.id
          );

          return {
            servicioId: servicio.id,
            nombreServicio: servicio.nombre,
            tipo: servicio.tipo,
            totalContrataciones: contratacionesServicio.length,
            ingresoTotal: contratacionesServicio.reduce(
              (sum: number, c: any) => sum + (c.precio || 0),
              0
            ),
            precioPromedio:
              contratacionesServicio.length > 0
                ? contratacionesServicio.reduce((sum: number, c: any) => sum + (c.precio || 0), 0) /
                  contratacionesServicio.length
                : servicio.precio || 0,
          };
        });
      });
    },

    reporteServiciosMasContratados: async (
      _: any,
      { limite = 10 }: { limite?: number },
      { dataSources }: any
    ) => {
      const reporteServicios = await reporteResolvers.Query.reporteServicios(_, {}, { dataSources });
      return reporteServicios
        .sort((a: any, b: any) => b.totalContrataciones - a.totalContrataciones)
        .slice(0, limite);
    },

    // Reporte Consolidado
    reporteConsolidado: async (
      _: any,
      { fechaInicio, fechaFin }: { fechaInicio?: string; fechaFin?: string },
      { dataSources }: any
    ) => {
      return cacheManager.getOrSet(
        `reporte:consolidado:${fechaInicio || 'all'}:${fechaFin || 'all'}`,
        async () => {
          const [tours, reservas, guias, destinos, servicios, contrataciones] = await Promise.all([
            dataSources.typescriptAPI.getTours(),
            dataSources.typescriptAPI.getReservas(),
            dataSources.typescriptAPI.getGuias(),
            dataSources.pythonAPI.getDestinos(),
            dataSources.golangAPI.getServicios(),
            dataSources.golangAPI.getContrataciones(),
          ]);

          // Filtrar por fechas si se proporcionan
          let reservasFiltradas = reservas;
          if (fechaInicio || fechaFin) {
            reservasFiltradas = reservas.filter((r: any) => {
              const fechaReserva = new Date(r.fechaReserva);
              if (fechaInicio && fechaReserva < new Date(fechaInicio)) return false;
              if (fechaFin && fechaReserva > new Date(fechaFin)) return false;
              return true;
            });
          }

          // Estadísticas de Tours
          const categorias: any = {};
          tours.forEach((tour: any) => {
            const cat = tour.categoria || 'Sin categoría';
            categorias[cat] = (categorias[cat] || 0) + 1;
          });

          const promedioPrecios =
            tours.length > 0
              ? tours.reduce((sum: number, t: any) => sum + (t.precio || 0), 0) / tours.length
              : 0;

          // Estadísticas de Reservas
          const totalReservas = reservasFiltradas.length;
          const reservasPendientes = reservasFiltradas.filter((r: any) => r.estado === 'PENDIENTE').length;
          const reservasConfirmadas = reservasFiltradas.filter(
            (r: any) => r.estado === 'CONFIRMADA'
          ).length;
          const reservasCanceladas = reservasFiltradas.filter((r: any) => r.estado === 'CANCELADA').length;
          const reservasCompletadas = reservasFiltradas.filter(
            (r: any) => r.estado === 'COMPLETADA'
          ).length;

          const tasaCancelacion =
            totalReservas > 0 ? (reservasCanceladas / totalReservas) * 100 : 0;
          const tasaCompletado =
            totalReservas > 0 ? (reservasCompletadas / totalReservas) * 100 : 0;

          // Ingresos
          const ingresoTours = reservasFiltradas
            .filter((r: any) => r.estado !== 'CANCELADA')
            .reduce((sum: number, r: any) => sum + (r.precioTotal || 0), 0);

          const ingresoServicios = contrataciones.reduce(
            (sum: number, c: any) => sum + (c.precio || 0),
            0
          );

          // Estadísticas de Guías
          const guiasActivos = guias.filter((g: any) => g.disponible).length;
          const promedioCalificacionGuias =
            guias.length > 0
              ? guias.reduce((sum: number, g: any) => sum + (g.calificacion || 0), 0) / guias.length
              : 0;

          // Estadísticas de Destinos
          const destinosPorPais: any = {};
          destinos.forEach((d: any) => {
            destinosPorPais[d.pais] = (destinosPorPais[d.pais] || 0) + 1;
          });

          // Estadísticas de Servicios
          const serviciosPorTipo: any = {};
          servicios.forEach((s: any) => {
            const tipo = s.tipo || 'Otro';
            serviciosPorTipo[tipo] = (serviciosPorTipo[tipo] || 0) + 1;
          });

          return {
            tours: {
              total: tours.length,
              activos: tours.filter((t: any) => t.disponible).length,
              inactivos: tours.filter((t: any) => !t.disponible).length,
              porCategoria: Object.entries(categorias).map(([categoria, cantidad]: [string, any]) => ({
                categoria,
                cantidad,
                porcentaje: (cantidad / tours.length) * 100,
              })),
              promedioPrecios,
            },
            reservas: {
              total: totalReservas,
              pendientes: reservasPendientes,
              confirmadas: reservasConfirmadas,
              canceladas: reservasCanceladas,
              completadas: reservasCompletadas,
              tasaCancelacion,
              tasaCompletado,
            },
            guias: {
              total: guias.length,
              activos: guiasActivos,
              promedioCalificacion: promedioCalificacionGuias,
              conMasReservas: [],
            },
            destinos: {
              total: destinos.length,
              masVisitados: [],
              porPais: Object.entries(destinosPorPais).map(([pais, cantidad]: [string, any]) => ({
                pais,
                cantidad,
                destinosPopulares: [],
              })),
            },
            servicios: {
              total: servicios.length,
              contratados: contrataciones.length,
              ingresoTotal: ingresoServicios,
              porTipo: Object.entries(serviciosPorTipo).map(([tipo, cantidad]: [string, any]) => ({
                tipo,
                cantidad,
                ingresoTotal: 0,
              })),
            },
            ingresoTotal: ingresoTours + ingresoServicios,
            periodo: {
              fechaInicio: fechaInicio || 'N/A',
              fechaFin: fechaFin || 'N/A',
            },
          };
        },
        600 // 10 minutos de cache para reportes consolidados
      );
    },

    reporteIngresos: async (
      _: any,
      { fechaInicio, fechaFin }: { fechaInicio: string; fechaFin: string },
      { dataSources }: any
    ) => {
      const [reservas, contrataciones, tours] = await Promise.all([
        dataSources.typescriptAPI.getReservasByDateRange(fechaInicio, fechaFin),
        dataSources.golangAPI.getEstadisticasContrataciones(fechaInicio, fechaFin),
        dataSources.typescriptAPI.getTours(),
      ]);

      const ingresoTours = reservas
        .filter((r: any) => r.estado !== 'CANCELADA')
        .reduce((sum: number, r: any) => sum + (r.precioTotal || 0), 0);

      const ingresoServicios = contrataciones.ingresoTotal || 0;

      // Agrupar por mes
      const ingresosPorMes: any = {};
      reservas.forEach((r: any) => {
        if (r.estado === 'CANCELADA') return;
        const fecha = new Date(r.fechaReserva);
        const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        if (!ingresosPorMes[mes]) {
          ingresosPorMes[mes] = { tours: 0, servicios: 0 };
        }
        ingresosPorMes[mes].tours += r.precioTotal || 0;
      });

      // Agrupar por categoría
      const ingresosPorCategoria: any = {};
      reservas.forEach((r: any) => {
        if (r.estado === 'CANCELADA') return;
        const tour = tours.find((t: any) => t.id === r.tourId);
        const categoria = tour?.categoria || 'Sin categoría';
        ingresosPorCategoria[categoria] = (ingresosPorCategoria[categoria] || 0) + (r.precioTotal || 0);
      });

      const ingresoTotal = ingresoTours + ingresoServicios;

      return {
        ingresoTours,
        ingresoServicios,
        ingresoTotal,
        porMes: Object.entries(ingresosPorMes).map(([mes, data]: [string, any]) => ({
          mes,
          tours: data.tours,
          servicios: data.servicios,
          total: data.tours + data.servicios,
        })),
        porCategoria: Object.entries(ingresosPorCategoria).map(([categoria, ingreso]: [string, any]) => ({
          categoria,
          ingreso,
          porcentaje: ingresoTotal > 0 ? (ingreso / ingresoTotal) * 100 : 0,
        })),
      };
    },

    estadisticasGenerales: async (_: any, __: any, { dataSources }: any) => {
      return reporteResolvers.Query.reporteConsolidado(_, {}, { dataSources });
    },
  },

  Mutation: {
    limpiarCache: async () => {
      cacheManager.flush();
      return true;
    },

    regenerarReportes: async () => {
      cacheManager.delStartWith('reporte:');
      return true;
    },
  },
};
