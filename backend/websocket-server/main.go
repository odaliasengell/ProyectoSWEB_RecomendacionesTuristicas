package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

// Configuración del upgrader para WebSocket
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Permitir todas las conexiones (ajustar en producción)
		return true
	},
}

// Hub global para manejar todas las conexiones
var hub *Hub

func main() {
	// Inicializar el Hub
	hub = NewHub()
	go hub.Run()

	// Configurar rutas
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handleWebSocket)
	mux.HandleFunc("/notify", handleNotify)
	mux.HandleFunc("/", handleIndex)

	// Configurar CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Permitir todos los orígenes
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(mux)

	// Iniciar servidor
	port := ":8083"
	fmt.Printf("🚀 Servidor WebSocket iniciado en http://localhost%s\n", port)
	fmt.Printf("📡 Endpoint WebSocket: ws://localhost%s/ws\n", port)
	fmt.Printf("📮 Endpoint de notificación: http://localhost%s/notify\n", port)
	fmt.Printf("🌐 Página de prueba: http://localhost%s/\n", port)

	log.Fatal(http.ListenAndServe(port, handler))
}

// Maneja las conexiones WebSocket de los clientes
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error al actualizar conexión:", err)
		return
	}

	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
	}

	client.hub.register <- client

	// Iniciar goroutines para leer y escribir
	go client.WritePump()
	go client.ReadPump()

	log.Println("✅ Nuevo cliente conectado")
}

// Endpoint HTTP para recibir notificaciones desde el backend REST
func handleNotify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	// Validar que el evento tenga los campos requeridos
	if event.Type == "" || event.Message == "" {
		http.Error(w, "Campos 'type' y 'message' son requeridos", http.StatusBadRequest)
		return
	}

	// Broadcast del evento a todos los clientes conectados
	hub.BroadcastEvent(event)

	log.Printf("📨 Notificación recibida: [%s] %s\n", event.Type, event.Message)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Notificación enviada a todos los clientes",
	})
}

// Dashboard visual con gráficos en tiempo real
func handleIndex(w http.ResponseWriter, r *http.Request) {
	html := `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Dashboard en Tiempo Real - Sistema Turístico</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #2c3e50;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            margin-top: 15px;
            background: rgba(255,255,255,0.2);
        }
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }
        .status-dot.connected { background: #4ade80; }
        .status-dot.disconnected { background: #f87171; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s, box-shadow 0.3s;
            position: relative;
            overflow: hidden;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        .stat-icon {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
            margin: 10px 0;
            animation: countUp 0.5s ease-out;
        }
        @keyframes countUp {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.95em;
            font-weight: 500;
        }
        .stat-trend {
            margin-top: 8px;
            font-size: 0.85em;
            color: #27ae60;
            font-weight: bold;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-container {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        .chart-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .live-badge {
            background: #27ae60;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.7em;
            font-weight: bold;
            animation: pulse 2s ease-in-out infinite;
        }
        .activity-feed {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            max-height: 600px;
            overflow-y: auto;
        }
        .activity-feed::-webkit-scrollbar {
            width: 8px;
        }
        .activity-feed::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        .activity-feed::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
        }
        .activity-item {
            padding: 15px;
            margin-bottom: 12px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            background: #f8f9fa;
            animation: slideIn 0.4s ease-out;
            transition: transform 0.2s;
        }
        .activity-item:hover {
            transform: translateX(5px);
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .activity-type {
            font-weight: bold;
            color: #667eea;
            font-size: 0.85em;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .activity-message {
            color: #2c3e50;
            font-size: 0.95em;
            margin-bottom: 5px;
        }
        .activity-time {
            color: #7f8c8d;
            font-size: 0.8em;
        }
        .btn-vista {
            padding: 10px 20px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 8px;
            font-weight: 600;
            color: #7f8c8d;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.9em;
        }
        .btn-vista:hover {
            border-color: #667eea;
            color: #667eea;
            transform: translateY(-2px);
        }
        .btn-vista.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
        }
        @media (max-width: 1024px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>📊 Dashboard en Tiempo Real</h1>
            <p>Monitoreo de Actividad del Sistema Turístico</p>
            <div class="status-indicator">
                <div class="status-dot disconnected" id="statusDot"></div>
                <span id="statusText">Conectando...</span>
            </div>
        </div>

        <!-- Tarjetas de Estadísticas -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-value" id="statReservas">0</div>
                <div class="stat-label">Reservas Hoy</div>
                <div class="stat-trend" id="trendReservas">+0 desde inicio</div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value" id="statIngresos">$0</div>
                <div class="stat-label">Ingresos del Día</div>
                <div class="stat-trend" id="trendIngresos">$0 acumulado</div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-value" id="statServicios">0</div>
                <div class="stat-label">Servicios Contratados</div>
                <div class="stat-trend" id="trendServicios">+0 desde inicio</div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-value" id="statRecomendaciones">0</div>
                <div class="stat-label">Recomendaciones</div>
                <div class="stat-trend" id="trendRecomendaciones">+0 desde inicio</div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-value" id="statUsuarios">0</div>
                <div class="stat-label">Usuarios Activos</div>
                <div class="stat-trend" id="trendUsuarios">+0 nuevos</div>
            </div>
        </div>

        <!-- Selector de Vista Temporal -->
        <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.08);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: bold; color: #2c3e50;">📅 Vista Temporal:</span>
                    <button onclick="cambiarVista('hoy')" id="btnHoy" class="btn-vista active">Hoy</button>
                    <button onclick="cambiarVista('semana')" id="btnSemana" class="btn-vista">Semana</button>
                    <button onclick="cambiarVista('mes')" id="btnMes" class="btn-vista">Mes</button>
                    <button onclick="cambiarVista('anual')" id="btnAnual" class="btn-vista">Año</button>
                </div>
                <div style="color: #7f8c8d; font-size: 0.9em;">
                    <span id="periodoActual">Hoy - 12 Nov 2025</span>
                </div>
            </div>
        </div>

        <!-- Gráficos y Feed de Actividad -->
        <div class="charts-grid">
            <div>
                <!-- Gráfico de Barras por Tiempo -->
                <div class="chart-container">
                    <div class="chart-title">
                        <span id="chartMainTitle">📈 Actividad del Día</span>
                        <span class="live-badge">LIVE</span>
                    </div>
                    <canvas id="chartBar"></canvas>
                </div>

                <!-- Gráfico de Líneas - Tendencia Mensual -->
                <div class="chart-container" style="margin-top: 20px;">
                    <div class="chart-title">
                        📊 Tendencia por Mes
                    </div>
                    <canvas id="chartLine"></canvas>
                </div>
            </div>

            <!-- Feed de Actividad -->
            <div class="activity-feed">
                <div class="chart-title">🔔 Actividad Reciente</div>
                <div id="activityFeed"></div>
            </div>
        </div>
    </div>

    <script>
        // === VARIABLES GLOBALES ===
        let ws = null;
        let vistaActual = 'hoy';
        let stats = {
            reservas: 0,
            ingresos: 0,
            servicios: 0,
            usuarios: 0,
            recomendaciones: 0
        };
        
        let chartBar = null;
        let chartLine = null;
        
        // Datos por vista
        let datosVistas = {
            hoy: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                reservas: [0, 0, 0, 0, 0, 0],
                servicios: [0, 0, 0, 0, 0, 0],
                recomendaciones: [0, 0, 0, 0, 0, 0]
            },
            semana: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                reservas: [0, 0, 0, 0, 0, 0, 0],
                servicios: [0, 0, 0, 0, 0, 0, 0],
                recomendaciones: [0, 0, 0, 0, 0, 0, 0]
            },
            mes: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                reservas: [0, 0, 0, 0],
                servicios: [0, 0, 0, 0],
                recomendaciones: [0, 0, 0, 0]
            },
            anual: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                reservas: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                servicios: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                recomendaciones: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        };

        // Datos para gráfico de líneas (tendencia mensual) - TODO EN CERO
        let datosMensuales = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            reservas: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ingresos: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            recomendaciones: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        };

        // === INICIALIZACIÓN ===
        window.onload = () => {
            initCharts();
            connectWebSocket();
        };

        // === GRÁFICOS ===
        function initCharts() {
            // Gráfico de Barras
            const ctxBar = document.getElementById('chartBar').getContext('2d');
            chartBar = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: datosVistas.hoy.labels,
                    datasets: [{
                        label: 'Reservas',
                        data: datosVistas.hoy.reservas,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    }, {
                        label: 'Servicios',
                        data: datosVistas.hoy.servicios,
                        backgroundColor: 'rgba(255, 159, 64, 0.8)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    }, {
                        label: 'Recomendaciones',
                        data: datosVistas.hoy.recomendaciones,
                        backgroundColor: 'rgba(167, 139, 250, 0.8)',
                        borderColor: 'rgba(167, 139, 250, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: {
                        duration: 750,
                        easing: 'easeInOutQuart'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    },
                    plugins: {
                        legend: { display: true, position: 'top' }
                    }
                }
            });

            // Gráfico de Líneas (Tendencia Mensual)
            const ctxLine = document.getElementById('chartLine').getContext('2d');
            chartLine = new Chart(ctxLine, {
                type: 'line',
                data: {
                    labels: datosMensuales.labels,
                    datasets: [{
                        label: 'Reservas por Mes',
                        data: datosMensuales.reservas,
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: 'rgba(102, 126, 234, 1)'
                    }, {
                        label: 'Recomendaciones por Mes',
                        data: datosMensuales.recomendaciones,
                        borderColor: 'rgba(167, 139, 250, 1)',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: 'rgba(167, 139, 250, 1)'
                    }, {
                        label: 'Ingresos ($)',
                        data: datosMensuales.ingresos,
                        borderColor: 'rgba(34, 197, 94, 1)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            title: { display: true, text: 'Reservas' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            title: { display: true, text: 'Ingresos ($)' },
                            grid: { drawOnChartArea: false }
                        }
                    },
                    plugins: {
                        legend: { display: true, position: 'top' }
                    }
                }
            });
        }

        function updateChart(type, value) {
            const now = new Date();
            const hora = now.getHours();
            const diaSemana = now.getDay(); // 0=Domingo, 1=Lunes, etc
            const semanaDelMes = Math.ceil(now.getDate() / 7); // Semana del mes
            const mesActual = now.getMonth(); // 0=Enero, 11=Diciembre
            
            // Actualizar TODAS las vistas (no solo la actual)
            // Vista HOY
            const indiceHoy = Math.floor(hora / 4); // 0-5 (cada 4 horas)
            datosVistas.hoy[type][indiceHoy] += value;
            
            // Vista SEMANA
            const indiceSemana = diaSemana === 0 ? 6 : diaSemana - 1; // Ajustar para Lun-Dom
            datosVistas.semana[type][indiceSemana] += value;
            
            // Vista MES
            const indiceMes = Math.min(semanaDelMes - 1, 3); // Semana 1-4
            datosVistas.mes[type][indiceMes] += value;
            
            // Vista ANUAL
            datosVistas.anual[type][mesActual] += value;
            
            // Actualizar gráfico de barras con la vista actual
            const vista = datosVistas[vistaActual];
            const datasetIndex = type === 'reservas' ? 0 : (type === 'servicios' ? 1 : 2);
            chartBar.data.datasets[datasetIndex].data = vista[type];
            chartBar.update();
            
            // Actualizar también el mes actual en el gráfico de líneas mensual
            if (type === 'reservas') {
                datosMensuales.reservas[mesActual] += value;
                chartLine.data.datasets[0].data = datosMensuales.reservas;
            } else if (type === 'recomendaciones') {
                datosMensuales.recomendaciones[mesActual] += value;
                chartLine.data.datasets[1].data = datosMensuales.recomendaciones;
            }
            chartLine.update();
        }

        function updateMonthlyIncome(amount) {
            const mesActual = new Date().getMonth();
            datosMensuales.ingresos[mesActual] += amount;
            chartLine.data.datasets[2].data = datosMensuales.ingresos;
            chartLine.update();
        }

        function cambiarVista(vista) {
            vistaActual = vista;
            
            // Actualizar botones
            document.querySelectorAll('.btn-vista').forEach(btn => btn.classList.remove('active'));
            document.getElementById('btn' + vista.charAt(0).toUpperCase() + vista.slice(1)).classList.add('active');
            
            // Actualizar datos del gráfico
            const datos = datosVistas[vista];
            chartBar.data.labels = datos.labels;
            chartBar.data.datasets[0].data = datos.reservas;
            chartBar.data.datasets[1].data = datos.servicios;
            chartBar.data.datasets[2].data = datos.recomendaciones;
            chartBar.update();
            
            // Actualizar título
            const titulos = {
                'hoy': '📈 Actividad del Día',
                'semana': '📈 Actividad de la Semana',
                'mes': '📈 Actividad del Mes',
                'anual': '📈 Actividad Anual'
            };
            document.getElementById('chartMainTitle').textContent = titulos[vista];
            
            // Actualizar período de forma dinámica
            const now = new Date();
            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const dia = now.getDate();
            const mes = meses[now.getMonth()];
            const anio = now.getFullYear();
            
            const periodos = {
                'hoy': ` + "`Hoy - ${dia} ${mes} ${anio}`" + `,
                'semana': ` + "`Semana Actual - ${mes} ${anio}`" + `,
                'mes': ` + "`Mes - ${mes} ${anio}`" + `,
                'anual': ` + "`Año - ${anio}`" + `
            };
            document.getElementById('periodoActual').textContent = periodos[vista];
        }

        // === WEBSOCKET ===
        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:8083/ws');

            ws.onopen = () => {
                console.log('✅ Conectado al WebSocket');
                updateStatus(true);
                addActivity('Sistema', 'Conexión establecida', 'system');
            };

            ws.onmessage = (event) => {
                console.log('📨 Mensaje recibido:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    handleEvent(data);
                } catch (e) {
                    console.error('Error al parsear mensaje:', e);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ Error en WebSocket:', error);
            };

            ws.onclose = () => {
                console.log('🔌 Desconectado del WebSocket');
                updateStatus(false);
                setTimeout(connectWebSocket, 3000); // Reconectar en 3s
            };
        }

        function updateStatus(connected) {
            const dot = document.getElementById('statusDot');
            const text = document.getElementById('statusText');
            
            if (connected) {
                dot.className = 'status-dot connected';
                text.textContent = 'Conectado';
            } else {
                dot.className = 'status-dot disconnected';
                text.textContent = 'Desconectado';
            }
        }

        // === MANEJO DE EVENTOS ===
        function handleEvent(event) {
            const type = event.type;
            const message = event.message;
            const data = event.data || {};

            switch(type) {
                case 'reserva_creada':
                    stats.reservas++;
                    const montoReserva = parseFloat(data.monto) || 0;
                    stats.ingresos += montoReserva;
                    updateChart('reservas', 1);
                    updateMonthlyIncome(montoReserva);
                    updateStats();
                    addActivity('Reserva', message, 'reserva');
                    break;

                case 'servicio_contratado':
                    stats.servicios++;
                    const precioServicio = parseFloat(data.precio) || 0;
                    stats.ingresos += precioServicio;
                    updateChart('servicios', 1);
                    updateMonthlyIncome(precioServicio);
                    updateStats();
                    addActivity('Servicio', message, 'servicio');
                    break;

                case 'recomendacion_creada':
                    stats.recomendaciones++;
                    updateChart('recomendaciones', 1);
                    updateStats();
                    const tipoRec = data.tipoRecomendacion || 'general';
                    const nombreRef = data.nombreReferencia || '';
                    const calificacion = data.calificacion || 5;
                    const mensajeRec = tipoRec === 'tour' ? ` + "`🗺️ ${nombreRef} (⭐${calificacion})`" + ` : 
                                       tipoRec === 'servicio' ? ` + "`🛎️ ${nombreRef} (⭐${calificacion})`" + ` : 
                                       ` + "`⭐ ${calificacion} estrellas`" + `;
                    addActivity('Recomendación', mensajeRec, 'recomendacion');
                    break;

                case 'usuario_registrado':
                    stats.usuarios++;
                    updateStats();
                    addActivity('Usuario Nuevo', message, 'usuario');
                    break;

                case 'usuario_inicio_sesion':
                    stats.usuarios++;
                    updateStats();
                    addActivity('Inicio de Sesión', message, 'usuario');
                    break;

                default:
                    addActivity(type, message, 'general');
            }
        }

        // === ACTUALIZAR ESTADÍSTICAS ===
        function updateStats() {
            document.getElementById('statReservas').textContent = stats.reservas;
            document.getElementById('statIngresos').textContent = ` + "`$${stats.ingresos}`" + `;
            document.getElementById('statServicios').textContent = stats.servicios;
            document.getElementById('statRecomendaciones').textContent = stats.recomendaciones;
            document.getElementById('statUsuarios').textContent = stats.usuarios;
            
            // Actualizar trends
            document.getElementById('trendReservas').textContent = ` + "`+${stats.reservas} desde inicio`" + `;
            document.getElementById('trendIngresos').textContent = ` + "`$${stats.ingresos} acumulado`" + `;
            document.getElementById('trendServicios').textContent = ` + "`+${stats.servicios} desde inicio`" + `;
            document.getElementById('trendRecomendaciones').textContent = ` + "`+${stats.recomendaciones} desde inicio`" + `;
            document.getElementById('trendUsuarios').textContent = ` + "`+${stats.usuarios} nuevos`" + `;
        }

        // === FEED DE ACTIVIDAD ===
        function addActivity(type, message, category) {
            const feed = document.getElementById('activityFeed');
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const colors = {
                'reserva': '#667eea',
                'servicio': '#ff9f40',
                'recomendacion': '#a78bfa',
                'usuario': '#9b59b6',
                'system': '#27ae60',
                'general': '#7f8c8d'
            };
            
            item.style.borderLeftColor = colors[category] || colors.general;
            
            const time = new Date().toLocaleTimeString('es-ES');
            
            item.innerHTML = ` + "`" + `
                <div class="activity-type">${type}</div>
                <div class="activity-message">${message}</div>
                <div class="activity-time">${time}</div>
            ` + "`" + `;
            
            feed.insertBefore(item, feed.firstChild);
            
            // Mantener solo las últimas 15 actividades
            while (feed.children.length > 15) {
                feed.removeChild(feed.lastChild);
            }
        }

        // === CERRAR CONEXIÓN ===
        window.onbeforeunload = () => {
            if (ws) ws.close();
        };
    </script>
</body>
</html>`

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}
