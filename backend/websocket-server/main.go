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
	port := ":8080"
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

// Página HTML simple para probar el WebSocket
func handleIndex(w http.ResponseWriter, r *http.Request) {
	html := `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket - Turismo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .status {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        .status.connected { background: #4ade80; color: #166534; }
        .status.disconnected { background: #f87171; color: #991b1b; }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.5em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .notifications {
            max-height: 400px;
            overflow-y: auto;
            background: #f9fafb;
            border-radius: 10px;
            padding: 20px;
        }
        .notification {
            background: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .notification .type {
            font-weight: bold;
            color: #667eea;
            text-transform: uppercase;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        .notification .message {
            color: #4b5563;
            line-height: 1.5;
        }
        .notification .data {
            margin-top: 10px;
            padding: 10px;
            background: #f3f4f6;
            border-radius: 5px;
            font-size: 0.85em;
            color: #6b7280;
            font-family: 'Courier New', monospace;
        }
        .notification .timestamp {
            font-size: 0.8em;
            color: #9ca3af;
            margin-top: 8px;
        }
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #9ca3af;
        }
        .empty-state svg {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
            opacity: 0.3;
        }
        .controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        button {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 1em;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-danger {
            background: #ef4444;
            color: white;
        }
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-card .label {
            font-size: 0.9em;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 WebSocket - Sistema de Turismo</h1>
            <div class="status disconnected" id="status">Desconectado</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Estadísticas</h2>
                <div class="stats">
                    <div class="stat-card">
                        <div class="value" id="totalNotifications">0</div>
                        <div class="label">Notificaciones</div>
                    </div>
                    <div class="stat-card">
                        <div class="value" id="connectionTime">--</div>
                        <div class="label">Tiempo conectado</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🎮 Controles</h2>
                <div class="controls">
                    <button class="btn-primary" onclick="connect()">Conectar</button>
                    <button class="btn-danger" onclick="disconnect()">Desconectar</button>
                    <button class="btn-secondary" onclick="clearNotifications()">Limpiar</button>
                    <button class="btn-secondary" onclick="sendTestNotification()">Enviar prueba</button>
                </div>
            </div>

            <div class="section">
                <h2>🔔 Notificaciones en Tiempo Real</h2>
                <div class="notifications" id="notifications">
                    <div class="empty-state">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                        <p>No hay notificaciones aún</p>
                        <p style="font-size: 0.9em; margin-top: 10px;">Conecta al WebSocket para recibir actualizaciones en tiempo real</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let ws = null;
        let notificationCount = 0;
        let connectionStartTime = null;
        let timerInterval = null;

        function connect() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                alert('Ya está conectado');
                return;
            }

            ws = new WebSocket('ws://localhost:8080/ws');

            ws.onopen = () => {
                console.log('✅ Conectado al WebSocket');
                document.getElementById('status').textContent = 'Conectado';
                document.getElementById('status').className = 'status connected';
                connectionStartTime = Date.now();
                startTimer();
                addSystemNotification('Conexión establecida exitosamente', 'success');
            };

            ws.onmessage = (event) => {
                console.log('📨 Mensaje recibido:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    addNotification(data);
                } catch (e) {
                    console.error('Error al parsear mensaje:', e);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ Error en WebSocket:', error);
                addSystemNotification('Error en la conexión', 'error');
            };

            ws.onclose = () => {
                console.log('🔌 Desconectado del WebSocket');
                document.getElementById('status').textContent = 'Desconectado';
                document.getElementById('status').className = 'status disconnected';
                stopTimer();
                addSystemNotification('Conexión cerrada', 'warning');
            };
        }

        function disconnect() {
            if (ws) {
                ws.close();
                ws = null;
            }
        }

        function addNotification(data) {
            notificationCount++;
            document.getElementById('totalNotifications').textContent = notificationCount;

            const container = document.getElementById('notifications');
            
            // Remover mensaje vacío si existe
            const emptyState = container.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }

            const notif = document.createElement('div');
            notif.className = 'notification';
            
            let dataHtml = '';
            if (data.data && Object.keys(data.data).length > 0) {
                dataHtml = '<div class="data">' + JSON.stringify(data.data, null, 2) + '</div>';
            }

            notif.innerHTML = ` + "`" + `
                <div class="type">${data.type || 'Notificación'}</div>
                <div class="message">${data.message || 'Sin mensaje'}</div>
                ${dataHtml}
                <div class="timestamp">${new Date().toLocaleTimeString('es-ES')}</div>
            ` + "`" + `;
            
            container.insertBefore(notif, container.firstChild);
        }

        function addSystemNotification(message, type) {
            addNotification({
                type: type,
                message: message,
                data: { system: true }
            });
        }

        function clearNotifications() {
            const container = document.getElementById('notifications');
            container.innerHTML = ` + "`" + `
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <p>No hay notificaciones</p>
                </div>
            ` + "`" + `;
            notificationCount = 0;
            document.getElementById('totalNotifications').textContent = '0';
        }

        function sendTestNotification() {
            fetch('http://localhost:8080/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'test',
                    message: 'Esta es una notificación de prueba',
                    data: { timestamp: new Date().toISOString() }
                })
            })
            .then(response => response.json())
            .then(data => console.log('Notificación enviada:', data))
            .catch(error => console.error('Error:', error));
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                if (connectionStartTime) {
                    const elapsed = Math.floor((Date.now() - connectionStartTime) / 1000);
                    const minutes = Math.floor(elapsed / 60);
                    const seconds = elapsed % 60;
                    document.getElementById('connectionTime').textContent = 
                        ` + "`" + `${minutes}:${seconds.toString().padStart(2, '0')}` + "`" + `;
                }
            }, 1000);
        }

        function stopTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            document.getElementById('connectionTime').textContent = '--';
        }

        // Auto-conectar al cargar la página
        window.onload = () => {
            connect();
        };

        // Limpiar al cerrar la página
        window.onbeforeunload = () => {
            disconnect();
        };
    </script>
</body>
</html>`

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}
