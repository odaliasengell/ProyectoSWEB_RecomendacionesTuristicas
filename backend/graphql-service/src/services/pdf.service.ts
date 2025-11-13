// ============================================
//  SERVICIO DE GENERACION DE PDFs
// ============================================

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface ReportData {
  title: string;
  subtitle?: string;
  data: any;
  type: 'tours' | 'guias' | 'usuarios' | 'reservas' | 'destinos' | 'servicios' | 'general';
}

interface PDFResult {
  success: boolean;
  filename: string;
  path: string;
  message?: string;
}

export class PDFService {
  private pdfsDir: string;

  constructor() {
    // Directorio donde se guardaran los PDFs
    this.pdfsDir = path.join(__dirname, '../../pdfs');
    
    // Crear directorio si no existe
    if (!fs.existsSync(this.pdfsDir)) {
      fs.mkdirSync(this.pdfsDir, { recursive: true });
    }
  }

  /**
   * Genera un PDF de reporte
   */
  async generateReport(reportData: ReportData): Promise<PDFResult> {
    try {
      const timestamp = new Date().getTime();
      const filename = `reporte_${reportData.type}_${timestamp}.pdf`;
      const filepath = path.join(this.pdfsDir, filename);

      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 30, bottom: 30, left: 40, right: 40 }
      });

      // Pipe el PDF a un archivo
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Generar contenido segun el tipo de reporte
      await this.generateContent(doc, reportData);

      // Finalizar documento
      doc.end();

      // Esperar a que se complete la escritura
      await new Promise<void>((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', reject);
      });

      return {
        success: true,
        filename,
        path: filepath,
        message: 'PDF generado exitosamente'
      };
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      return {
        success: false,
        filename: '',
        path: '',
        message: error.message || 'Error generando PDF'
      };
    }
  }

  /**
   * Genera el contenido del PDF segun el tipo de reporte
   */
  private async generateContent(doc: PDFKit.PDFDocument, reportData: ReportData) {
    // Encabezado
    this.addHeader(doc, reportData.title, reportData.subtitle);

    // Contenido segun tipo
    switch (reportData.type) {
      case 'tours':
        this.generateToursReport(doc, reportData.data);
        break;
      case 'guias':
        this.generateGuiasReport(doc, reportData.data);
        break;
      case 'usuarios':
        this.generateUsuariosReport(doc, reportData.data);
        break;
      case 'reservas':
        this.generateReservasReport(doc, reportData.data);
        break;
      case 'destinos':
        this.generateDestinosReport(doc, reportData.data);
        break;
      case 'servicios':
        this.generateServiciosReport(doc, reportData.data);
        break;
      case 'general':
        this.generateGeneralReport(doc, reportData.data);
        break;
    }

    // Pie de pgina
    this.addFooter(doc);
  }

  /**
   * Agrega encabezado al PDF con diseño compacto
   */
  private addHeader(doc: PDFKit.PDFDocument, title: string, subtitle?: string) {
    // Fondo del encabezado
    doc
      .rect(0, 0, 595, 70)
      .fill('#059669');

    // Titulo principal
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text(title, 40, 20, { align: 'center', width: 515 });

    if (subtitle) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#D1FAE5')
        .text(subtitle, 40, 42, { align: 'center', width: 515 });
    }

    // Fecha compacta
    const fecha = new Date().toLocaleDateString('es-ES');
    
    doc
      .fontSize(8)
      .fillColor('#FFFFFF')
      .text(fecha, 40, 55, { align: 'right', width: 515 });

    // Resetear posicion Y despues del encabezado
    doc.y = 80;
    doc.fillColor('#000000'); // Resetear color
  }

  /**
   * Agrega pie de pagina mejorado
   */
  private addFooter(doc: PDFKit.PDFDocument) {
    const range = doc.bufferedPageRange();
    const pageCount = range.count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(range.start + i);
      
      // Fondo del pie de pagina
      doc
        .rect(0, 770, 595, 52)
        .fill('#F3F4F6');

      // Linea decorativa superior
      doc
        .strokeColor('#059669')
        .lineWidth(2)
        .moveTo(50, 770)
        .lineTo(545, 770)
        .stroke();

      // Informacion del sistema
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#059669')
        .text('Sistema de Recomendaciones Turisticas', 50, 780);

      // Numero de pagina
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(
          `Pagina ${i + 1} de ${pageCount}`,
          50,
          795,
          { align: 'center', width: 495 }
        );

      // Marca de agua
      doc
        .fontSize(7)
        .fillColor('#9CA3AF')
        .text('Generado automaticamente - Documento confidencial', 50, 806, {
          align: 'center',
          width: 495
        });
    }
  }

  /**
   * Genera reporte de Tours compacto
   */
  private generateToursReport(doc: PDFKit.PDFDocument, data: any) {
    // Titulo
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#059669')
      .text('RANKING DE TOURS')
      .moveDown(0.3);

    if (!data || data.length === 0) {
      doc.fontSize(9).fillColor('#6B7280').text('No hay datos disponibles');
      return;
    }

    // Estadisticas en una linea
    const totalReservas = data.reduce((sum: number, item: any) => sum + (item.total_reservas || 0), 0);
    const totalIngresos = data.reduce((sum: number, item: any) => sum + (item.ingresos_totales || 0), 0);

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Total: ${data.length} tours | Reservas: ${totalReservas} | Ingresos: $${totalIngresos.toFixed(0)}`)
      .moveDown(0.5);

    // Lista compacta de tours
    data.forEach((item: any, index: number) => {
      // Verificar espacio disponible
      if (doc.y > 730) {
        doc.addPage();
        doc.y = 50;
      }

      const boxHeight = 35; // Compacto
      const bgColor = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';

      // Caja compacta
      doc
        .rect(40, doc.y, 515, boxHeight)
        .fill(bgColor);

      // Ranking y nombre en una linea
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#059669')
        .text(`${index + 1}.`, 45, doc.y + 10);

      const nombreTour = item.tour?.nombre || 'Tour sin nombre';
      const nombreCorto = nombreTour.length > 50 ? nombreTour.substring(0, 50) + '...' : nombreTour;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#1F2937')
        .text(nombreCorto, 65, doc.y + 10, { width: 280 });

      // Metricas compactas
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(`Reservas: ${item.total_reservas || 0}`, 360, doc.y + 8)
        .text(`Ingresos: $${(item.ingresos_totales || 0).toFixed(0)}`, 360, doc.y + 19);

      doc.y += boxHeight + 2;
    });
  }

  /**
   * Añade una caja de informacion (optimizada)
   */
  private addInfoBox(doc: PDFKit.PDFDocument, text: string, bgColor: string, textColor: string) {
    const boxHeight = 35; // Reducido de 40 a 35
    
    doc
      .rect(50, doc.y, 495, boxHeight)
      .fill(bgColor);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(textColor)
      .text(text, 60, doc.y + 10, { width: 475 });

    doc.y += boxHeight + 5; // Reducido el espacio después
  }

  /**
   * Añade una caja de estadisticas (optimizada y compacta)
   */
  private addStatsBox(doc: PDFKit.PDFDocument, stats: Array<{label: string, value: string, icon: string}>) {
    const boxWidth = 495;
    const itemWidth = boxWidth / stats.length;
    const startX = 50;
    const startY = doc.y;
    const boxHeight = 55; // Reducido de 65 a 55

    // Fondo de la caja
    doc
      .rect(startX, startY, boxWidth, boxHeight)
      .fill('#F0FDF4');

    // Borde
    doc
      .rect(startX, startY, boxWidth, boxHeight)
      .stroke('#059669');

    stats.forEach((stat, index) => {
      const x = startX + (itemWidth * index);
      
      // Lnea divisoria (excepto la ltima)
      if (index > 0) {
        doc
          .strokeColor('#D1FAE5')
          .lineWidth(1)
          .moveTo(x, startY + 8)
          .lineTo(x, startY + boxHeight - 8)
          .stroke();
      }

      // Icono (más pequeño)
      doc
        .fontSize(16)
        .text(stat.icon, x + 10, startY + 8, { width: itemWidth - 20, align: 'center' });

      // Valor
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#059669')
        .text(stat.value, x + 10, startY + 26, { width: itemWidth - 20, align: 'center' });

      // Label
      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(stat.label, x + 10, startY + 42, { width: itemWidth - 20, align: 'center' });
    });

    doc.y = startY + boxHeight + 5; // Reducido el espacio después
  }

  /**
   * Añade un grafico de barras horizontales (optimizado)
   */
  private addBarChart(
    doc: PDFKit.PDFDocument, 
    title: string,
    data: Array<{label: string, value: number, color?: string}>,
    options?: {maxValue?: number, width?: number, height?: number}
  ) {
    const chartWidth = options?.width || 495;
    const startX = 50;
    const barHeight = 20; // Reducido de 25 a 20
    const barSpacing = 6; // Reducido de 10 a 6
    const maxBars = 10;
    const displayData = data.slice(0, maxBars);
    
    // Verificar si hay suficiente espacio en la pagina
    const estimatedHeight = 35 + (displayData.length * (barHeight + barSpacing));
    if (doc.y + estimatedHeight > 720) {
      doc.addPage();
      doc.y = 50;
    }
    
    const startY = doc.y;
    
    // Titulo del grafico
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#1F2937')
      .text(title, startX, startY);

    doc.y = startY + 20; // Espacio reducido después del título
    const graphStartY = doc.y;
    
    // Encontrar valor maximo
    const maxValue = options?.maxValue || Math.max(...displayData.map(d => d.value));
    const barMaxWidth = chartWidth - 130; // Espacio para labels y valores

    displayData.forEach((item, index) => {
      const barY = graphStartY + (index * (barHeight + barSpacing));
      const barWidth = maxValue > 0 ? (item.value / maxValue) * barMaxWidth : 0;
      const barColor = item.color || '#059669';

      // Label del item
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#374151')
        .text(
          item.label.length > 18 ? item.label.substring(0, 18) + '...' : item.label,
          startX,
          barY + 5,
          { width: 110, align: 'left' }
        );

      // Solo dibujar barra si tiene ancho
      if (barWidth > 1) {
        // Barra con borde
        doc
          .rect(startX + 115, barY, barWidth, barHeight)
          .fillAndStroke(barColor, '#374151');
      }

      // Valor - formatear segun magnitud
      const formattedValue = item.value >= 10000 
        ? `${(item.value / 1000).toFixed(1)}k` 
        : item.value >= 1000
        ? `${(item.value / 1000).toFixed(2)}k`
        : item.value.toFixed(0);
      
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text(
          formattedValue,
          startX + 120 + barWidth,
          barY + 5,
          { width: 45, align: 'left' }
        );
    });

    doc.y = graphStartY + (displayData.length * (barHeight + barSpacing)) + 10; // Espacio reducido después
  }

  /**
   * Genera reporte de Guias mejorado
   */
  private generateGuiasReport(doc: PDFKit.PDFDocument, data: any) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#3B82F6')
      .text('LISTADO DE GUIAS')
      .moveDown(0.3);

    if (!data || data.length === 0) {
      doc.fontSize(9).fillColor('#6B7280').text('No hay datos disponibles');
      return;
    }

    // Estadisticas compactas
    const totalTours = data.reduce((sum: number, item: any) => sum + (item.total_tours || 0), 0);
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Total: ${data.length} guias | Tours asignados: ${totalTours}`)
      .moveDown(0.5);

    // Lista compacta
    data.forEach((item: any, index: number) => {
      if (doc.y > 730) {
        doc.addPage();
        doc.y = 50;
      }

      const boxHeight = 30;
      const bgColor = index % 2 === 0 ? '#F0F9FF' : '#FFFFFF';

      doc.rect(40, doc.y, 515, boxHeight).fill(bgColor);

      // Numero y nombre
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#3B82F6')
        .text(`${index + 1}.`, 45, doc.y + 8);

      const nombreGuia = item.guia?.nombre || 'Guia sin nombre';
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#1F2937')
        .text(nombreGuia.length > 40 ? nombreGuia.substring(0, 40) + '...' : nombreGuia, 65, doc.y + 8, { width: 250 });

      // Metricas
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text(`Tours: ${item.total_tours || 0}`, 330, doc.y + 8);

      if (item.guia?.calificacion) {
        doc.text(`★ ${item.guia.calificacion.toFixed(1)}`, 400, doc.y + 8);
      }

      doc.y += boxHeight + 2;
    });
  }

  /**
   * Genera reporte de Usuarios compacto
   */
  private generateUsuariosReport(doc: PDFKit.PDFDocument, data: any) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#8B5CF6')
      .text('USUARIOS MAS ACTIVOS')
      .moveDown(0.3);

    if (!data || data.length === 0) {
      doc.fontSize(9).fillColor('#6B7280').text('No hay datos disponibles');
      return;
    }

    // Estadisticas compactas
    const totalReservas = data.reduce((sum: number, item: any) => sum + (item.total_reservas || 0), 0);
    const totalGastado = data.reduce((sum: number, item: any) => sum + (item.total_gastado || 0), 0);

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Total: ${data.length} usuarios | Reservas: ${totalReservas} | Ingresos: $${totalGastado.toFixed(0)}`)
      .moveDown(0.5);

    // Lista compacta
    data.forEach((item: any, index: number) => {
      if (doc.y > 730) {
        doc.addPage();
        doc.y = 50;
      }

      const boxHeight = 32;
      const bgColor = index % 2 === 0 ? '#FAF5FF' : '#FFFFFF';

      doc.rect(40, doc.y, 515, boxHeight).fill(bgColor);

      // Ranking
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#8B5CF6')
        .text(`${index + 1}.`, 45, doc.y + 9);

      // Nombre
      const nombreCompleto = `${item.usuario?.nombre || ''} ${item.usuario?.apellido || ''}`.trim() || `Usuario ${index + 1}`;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#1F2937')
        .text(nombreCompleto.length > 35 ? nombreCompleto.substring(0, 35) + '...' : nombreCompleto, 65, doc.y + 9, { width: 220 });

      // Metricas
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text(`Reservas: ${item.total_reservas || 0}`, 300, doc.y + 9)
        .text(`Gasto: $${(item.total_gastado || 0).toFixed(0)}`, 400, doc.y + 9);

      doc.y += boxHeight + 2;
    });
  }

  /**
   * Genera reporte de Reservas por Mes compacto
   */
  private generateReservasReport(doc: PDFKit.PDFDocument, data: any) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#EC4899')
      .text('RESERVAS E INGRESOS MENSUALES')
      .moveDown(0.3);

    if (!data || data.length === 0) {
      doc.fontSize(9).fillColor('#6B7280').text('No hay datos disponibles');
      return;
    }

    // Estadisticas compactas
    const totalReservas = data.reduce((sum: number, item: any) => sum + (item.total_reservas || 0), 0);
    const totalIngresos = data.reduce((sum: number, item: any) => sum + (item.ingresos_totales || 0), 0);

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Periodo: ${data.length} meses | Reservas: ${totalReservas} | Ingresos: $${totalIngresos.toFixed(0)}`)
      .moveDown(0.5);

    // Lista compacta por mes
    data.forEach((item: any, index: number) => {
      if (doc.y > 730) {
        doc.addPage();
        doc.y = 50;
      }

      const boxHeight = 28;
      const bgColor = index % 2 === 0 ? '#FDF2F8' : '#FFFFFF';

      doc.rect(40, doc.y, 515, boxHeight).fill(bgColor);

      // Mes
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#EC4899')
        .text(item.mes || 'Mes', 45, doc.y + 8, { width: 120 });

      // Metricas en linea
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(`Reservas: ${item.total_reservas || 0}`, 180, doc.y + 8)
        .text(`Personas: ${item.total_personas || 0}`, 280, doc.y + 8)
        .fillColor('#059669')
        .font('Helvetica-Bold')
        .text(`$${(item.ingresos_totales || 0).toFixed(0)}`, 400, doc.y + 8);

      doc.y += boxHeight + 2;
    });
  }

  /**
   * Genera reporte de Destinos
   */
  private generateDestinosReport(doc: PDFKit.PDFDocument, data: any) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#10B981')
      .text(' Destinos Ms Populares', { underline: true })
      .moveDown(0.5);

    if (!data || data.length === 0) {
      this.addInfoBox(doc, ' No hay datos disponibles', '#FEF3C7', '#92400E');
      return;
    }

    // Estadsticas
    const totalTours = data.reduce((sum: number, item: any) => sum + (item.total_tours || 0), 0);
    const destinosConTours = data.filter((item: any) => item.total_tours > 0).length;
    const calificacionPromedio = data.reduce((sum: number, item: any) => 
      sum + (item.destino?.calificacion_promedio || 0), 0) / data.length;

    this.addStatsBox(doc, [
      { label: 'Total Destinos', value: data.length.toString(), icon: '' },
      { label: 'Con Tours Activos', value: destinosConTours.toString(), icon: '' },
      { label: 'Total Tours', value: totalTours.toString(), icon: '' },
      { label: 'Calificacion Promedio', value: calificacionPromedio.toFixed(1), icon: '' }
    ]);

    doc.moveDown(1);

    // Grafico de barras - Top 10 Destinos por Tours
    const chartData = data.slice(0, 10).map((item: any, index: number) => ({
      label: item.destino?.nombre || `Destino ${index + 1}`,
      value: item.total_tours || 0,
      color: index < 3 ? '#059669' : '#10B981'
    }));
    this.addBarChart(doc, 'Top 10 Destinos por Cantidad de Tours', chartData);

    doc.moveDown(2);
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1F2937')
      .text(' Ranking de Destinos')
      .moveDown(0.5);

    data.forEach((item: any, index: number) => {
      if (doc.y > 650) {
        doc.addPage();
        doc.y = 50;
      }

      const esTop3 = index < 3;
      const bgColor = esTop3 ? '#D1FAE5' : (index % 2 === 0 ? '#ECFDF5' : '#F9FAFB');
      const accentColor = esTop3 ? '#059669' : '#10B981';

      doc
        .rect(50, doc.y, 495, 110)
        .fill(bgColor);

      // Medalla para top 3
      if (esTop3) {
        const medallas = ['', '', ''];
        doc
          .fontSize(24)
          .text(medallas[index], 60, doc.y + 10);
      }

      // Posicin
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(accentColor)
        .text(`#${index + 1}`, esTop3 ? 95 : 60, doc.y + 15);

      // Nombre del destino
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text(item.destino?.nombre || 'Destino sin nombre', esTop3 ? 140 : 95, doc.y + 15, { width: 400 });

      // Ubicacin
      const ubicacion = item.destino?.ubicacion || item.destino?.ciudad || 'Ubicacin no especificada';
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(` ${ubicacion}`, esTop3 ? 140 : 95, doc.y + 35, { width: 400 });

      // Descripcin corta
      if (item.destino?.descripcion) {
        const desc = item.destino.descripcion.length > 100 
          ? item.destino.descripcion.substring(0, 100) + '...' 
          : item.destino.descripcion;
        doc
          .fontSize(8)
          .font('Helvetica-Oblique')
          .fillColor('#6B7280')
          .text(desc, esTop3 ? 140 : 95, doc.y + 50, { width: 400 });
      }

      // Informacin en columnas
      const infoY = doc.y + 70;

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(' Tours', 60, infoY)
        .fillColor(accentColor)
        .font('Helvetica-Bold')
        .text(`${item.total_tours || 0}`, 60, infoY + 12);

      // Calificacin con estrellas
      const calificacion = item.destino?.calificacion_promedio || 0;
      const estrellasNum = Math.round(calificacion);
      const estrellas = ''.repeat(Math.min(estrellasNum, 5));

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text('Calificacion', 160, infoY)
        .fillColor('#F59E0B')
        .font('Helvetica-Bold')
        .text(`${calificacion.toFixed(1)} ${estrellas}`, 160, infoY + 12, { width: 180 });

      // Categoria/Tipo
      if (item.destino?.categoria) {
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#6B7280')
          .text('Categoria', 370, infoY)
          .fillColor('#8B5CF6')
          .font('Helvetica-Bold')
          .text(item.destino.categoria, 370, infoY + 12, { width: 170 });
      }

      doc.y += 120;
    });
  }

  /**
   * Genera reporte de Servicios
   */
  private generateServiciosReport(doc: PDFKit.PDFDocument, data: any) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#F59E0B')
      .text(' Servicios Ms Contratados', { underline: true })
      .moveDown(0.5);

    if (!data || data.length === 0) {
      this.addInfoBox(doc, ' No hay datos disponibles', '#FEF3C7', '#92400E');
      return;
    }

    // Estadsticas
    const totalContrataciones = data.reduce((sum: number, item: any) => sum + (item.total_contrataciones || 0), 0);
    const totalIngresos = data.reduce((sum: number, item: any) => sum + (item.ingresos_totales || 0), 0);
    const precioPromedio = data.length > 0 
      ? data.reduce((sum: number, item: any) => sum + (item.servicio?.precio || 0), 0) / data.length 
      : 0;

    this.addStatsBox(doc, [
      { label: 'Total Servicios', value: data.length.toString(), icon: '' },
      { label: 'Contrataciones', value: totalContrataciones.toString(), icon: '' },
      { label: 'Ingresos Totales', value: `$${totalIngresos.toFixed(2)}`, icon: '' },
      { label: 'Precio Promedio', value: `$${precioPromedio.toFixed(2)}`, icon: '' }
    ]);

    doc.moveDown(1);

    // Grafico de barras - Top 10 Servicios por Contrataciones
    const chartData = data.slice(0, 10).map((item: any, index: number) => ({
      label: item.servicio?.nombre || `Servicio ${index + 1}`,
      value: item.total_contrataciones || 0,
      color: index < 3 ? '#D97706' : '#F59E0B'
    }));
    this.addBarChart(doc, 'Top 10 Servicios por Contrataciones', chartData);

    doc.moveDown(2);
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1F2937')
      .text(' Top Servicios')
      .moveDown(0.5);

    data.forEach((item: any, index: number) => {
      if (doc.y > 650) {
        doc.addPage();
        doc.y = 50;
      }

      const esTop3 = index < 3;
      const bgColor = esTop3 ? '#FEF3C7' : (index % 2 === 0 ? '#FEF9C3' : '#F9FAFB');
      const accentColor = esTop3 ? '#D97706' : '#F59E0B';

      doc
        .rect(50, doc.y, 495, 100)
        .fill(bgColor);

      // Medalla para top 3
      if (esTop3) {
        const medallas = ['', '', ''];
        doc
          .fontSize(24)
          .text(medallas[index], 60, doc.y + 10);
      }

      // Posicin
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(accentColor)
        .text(`#${index + 1}`, esTop3 ? 95 : 60, doc.y + 15);

      // Nombre del servicio
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text(item.servicio?.nombre || 'Servicio sin nombre', esTop3 ? 140 : 95, doc.y + 15, { width: 400 });

      // Descripcin del servicio
      if (item.servicio?.descripcion) {
        const desc = item.servicio.descripcion.length > 80 
          ? item.servicio.descripcion.substring(0, 80) + '...' 
          : item.servicio.descripcion;
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#6B7280')
          .text(desc, esTop3 ? 140 : 95, doc.y + 35, { width: 400 });
      }

      // Informacin en columnas
      const infoY = doc.y + 55;

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(' Precio', 60, infoY)
        .fillColor(accentColor)
        .font('Helvetica-Bold')
        .text(`$${item.servicio?.precio?.toFixed(2) || '0.00'}`, 60, infoY + 12);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(' Categora', 160, infoY)
        .fillColor('#8B5CF6')
        .font('Helvetica-Bold')
        .text(item.servicio?.categoria || 'N/A', 160, infoY + 12, { width: 120 });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(' Contrataciones', 290, infoY)
        .fillColor('#3B82F6')
        .font('Helvetica-Bold')
        .text(`${item.total_contrataciones || 0}`, 290, infoY + 12);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(' Ingresos', 410, infoY)
        .fillColor('#059669')
        .font('Helvetica-Bold')
        .text(`$${item.ingresos_totales?.toFixed(2) || '0.00'}`, 410, infoY + 12);

      // Promedio por contratacin
      const promedio = item.total_contrataciones > 0 
        ? (item.ingresos_totales / item.total_contrataciones).toFixed(2) 
        : '0.00';
      
      doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .fillColor('#6B7280')
        .text(` Promedio por contratacin: $${promedio}`, 60, infoY + 30);

      doc.y += 110;
    });
  }

  /**
   * Genera reporte general mejorado con estadsticas
   */
  private generateGeneralReport(doc: PDFKit.PDFDocument, data: any) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#8B5CF6')
      .text(' Dashboard Ejecutivo', { underline: true })
      .moveDown(0.5);

    if (!data) {
      this.addInfoBox(doc, ' No hay datos disponibles', '#FEF3C7', '#92400E');
      return;
    }

    // Seccin de Tours
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#059669')
      .text(' TOURS', 50)
      .moveDown(0.3);

    this.addStatsBox(doc, [
      { label: 'Total Tours', value: (data.total_tours || 0).toString(), icon: '' },
      { label: 'Tours Disponibles', value: (data.tours_disponibles || 0).toString(), icon: '' },
      { label: 'Ocupacin', value: `${data.total_tours > 0 ? ((data.tours_disponibles / data.total_tours) * 100).toFixed(1) : 0}%`, icon: '' }
    ]);

    doc.moveDown(1);

    // Seccin de Reservas e Ingresos
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#3B82F6')
      .text(' RESERVAS E INGRESOS', 50)
      .moveDown(0.3);

    this.addStatsBox(doc, [
      { label: 'Total Reservas', value: (data.total_reservas || 0).toString(), icon: '' },
      { label: 'Total Personas', value: (data.total_personas || 0).toString(), icon: '' },
      { label: 'Ingresos Totales', value: `$${(data.ingresos_totales || 0).toFixed(2)}`, icon: '' }
    ]);

    doc.moveDown(1);

    // Promedios
    const promedioPersonasPorReserva = data.total_reservas > 0 
      ? (data.total_personas / data.total_reservas).toFixed(2) 
      : '0.00';
    const promedioIngresoPorPersona = data.total_personas > 0 
      ? (data.ingresos_totales / data.total_personas).toFixed(2) 
      : '0.00';

    doc
      .rect(50, doc.y, 495, 60)
      .fill('#FEF3C7');

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#92400E')
      .text(' MTRICAS CLAVE', 60, doc.y + 12);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(` Promedio personas por reserva: `, 60, doc.y + 30)
      .fillColor('#059669')
      .font('Helvetica-Bold')
      .text(`${promedioPersonasPorReserva} personas`, 220, doc.y + 30);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(` Ingreso promedio por persona: `, 60, doc.y + 45)
      .fillColor('#059669')
      .font('Helvetica-Bold')
      .text(`$${promedioIngresoPorPersona}`, 220, doc.y + 45);

    doc.y += 70;
    doc.moveDown(1);

    // Grafico de comparacion de metricas
    if (doc.y > 500) {
      doc.addPage();
      doc.y = 50;
    }

    const metricsChartData = [
      { label: 'Tours Totales', value: data.total_tours || 0, color: '#059669' },
      { label: 'Reservas', value: data.total_reservas || 0, color: '#3B82F6' },
      { label: 'Personas', value: data.total_personas || 0, color: '#8B5CF6' },
      { label: 'Guias', value: data.total_guias || 0, color: '#F59E0B' },
      { label: 'Destinos', value: data.total_destinos || 0, color: '#EC4899' },
      { label: 'Servicios', value: data.total_servicios || 0, color: '#10B981' }
    ];
    this.addBarChart(doc, 'Comparacion de Metricas del Sistema', metricsChartData);

    doc.moveDown(2);

    // Seccion de Guias
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#8B5CF6')
      .text(' GUAS', 50)
      .moveDown(0.3);

    this.addStatsBox(doc, [
      { label: 'Total Guas', value: (data.total_guias || 0).toString(), icon: '' },
      { label: 'Guas Disponibles', value: (data.guias_disponibles || 0).toString(), icon: '' },
      { label: 'Disponibilidad', value: `${data.total_guias > 0 ? ((data.guias_disponibles / data.total_guias) * 100).toFixed(1) : 0}%`, icon: '' }
    ]);

    doc.moveDown(1);

    // Seccin de Destinos
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#F59E0B')
      .text(' DESTINOS', 50)
      .moveDown(0.3);

    this.addStatsBox(doc, [
      { label: 'Total Destinos', value: (data.total_destinos || 0).toString(), icon: '' },
      { label: 'Destinos Activos', value: (data.destinos_activos || 0).toString(), icon: '' }
    ]);

    doc.moveDown(1);

    // Seccin de Servicios
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#EC4899')
      .text(' SERVICIOS', 50)
      .moveDown(0.3);

    this.addStatsBox(doc, [
      { label: 'Total Servicios', value: (data.total_servicios || 0).toString(), icon: '' },
      { label: 'Servicios Disponibles', value: (data.servicios_disponibles || 0).toString(), icon: '' },
      { label: 'Contrataciones', value: (data.total_contrataciones || 0).toString(), icon: '' }
    ]);

    doc.moveDown(1);

    // Grafico de disponibilidad
    if (doc.y > 500) {
      doc.addPage();
      doc.y = 50;
    }

    const disponibilidadData = [
      { 
        label: 'Tours Disponibles', 
        value: data.tours_disponibles || 0, 
        color: '#059669' 
      },
      { 
        label: 'Guias Disponibles', 
        value: data.guias_disponibles || 0, 
        color: '#8B5CF6' 
      },
      { 
        label: 'Destinos Activos', 
        value: data.destinos_activos || 0, 
        color: '#F59E0B' 
      },
      { 
        label: 'Servicios Disponibles', 
        value: data.servicios_disponibles || 0, 
        color: '#EC4899' 
      }
    ];
    this.addBarChart(doc, 'Recursos Disponibles en el Sistema', disponibilidadData);

    // Resumen final
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 50;
    }

    doc.moveDown(2);
    doc
      .rect(50, doc.y, 495, 100)
      .fill('#D1FAE5');

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#065F46')
      .text(' RESUMEN EJECUTIVO', 60, doc.y + 15);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#047857')
      .text(
        `El sistema cuenta con ${data.total_tours || 0} tours tursticos, de los cuales ${data.tours_disponibles || 0} estn disponibles. ` +
        `Se han registrado ${data.total_reservas || 0} reservas con un total de ${data.total_personas || 0} personas, ` +
        `generando ingresos por $${(data.ingresos_totales || 0).toFixed(2)}. ` +
        `El equipo est conformado por ${data.total_guias || 0} guas tursticos y se ofrecen servicios en ${data.total_destinos || 0} destinos.`,
        60,
        doc.y + 40,
        { width: 475, align: 'justify' }
      );

    doc.y += 110;
  }

  /**
   * Obtiene la lista de PDFs generados
   */
  getGeneratedPDFs(): string[] {
    try {
      const files = fs.readdirSync(this.pdfsDir);
      return files.filter(file => file.endsWith('.pdf'));
    } catch (error) {
      console.error('Error leyendo directorio de PDFs:', error);
      return [];
    }
  }

  /**
   * Elimina PDFs antiguos (ms de 24 horas)
   */
  cleanOldPDFs(): number {
    try {
      const files = this.getGeneratedPDFs();
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      let deletedCount = 0;

      files.forEach(file => {
        const filepath = path.join(this.pdfsDir, file);
        const stats = fs.statSync(filepath);
        
        if (stats.mtimeMs < oneDayAgo) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      });

      return deletedCount;
    } catch (error) {
      console.error('Error limpiando PDFs antiguos:', error);
      return 0;
    }
  }
}

export const pdfService = new PDFService();
