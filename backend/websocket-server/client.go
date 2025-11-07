package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Tiempo permitido para escribir un mensaje al peer
	writeWait = 10 * time.Second

	// Tiempo permitido para leer el siguiente pong del peer
	pongWait = 60 * time.Second

	// Enviar pings al peer con este período (debe ser menor que pongWait)
	pingPeriod = (pongWait * 9) / 10

	// Tamaño máximo del mensaje permitido del peer
	maxMessageSize = 512
)

// Client es un intermediario entre la conexión websocket y el hub
type Client struct {
	hub *Hub

	// La conexión websocket
	conn *websocket.Conn

	// Canal de mensajes salientes
	send chan []byte
}

// ReadPump bombea mensajes desde la conexión websocket al hub
//
// La aplicación ejecuta ReadPump en una goroutine por conexión.
// La aplicación garantiza que haya como máximo un lector en una conexión
// ejecutando todas las lecturas desde esta goroutine.
func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// Opcional: Aquí puedes procesar mensajes que vengan desde el cliente
		log.Printf("📩 Mensaje del cliente: %s", message)

		// Reenviar el mensaje a todos los clientes (broadcast)
		c.hub.broadcast <- message
	}
}

// WritePump bombea mensajes desde el hub a la conexión websocket
//
// Se inicia una goroutine que ejecuta WritePump para cada conexión.
// La aplicación garantiza que haya como máximo un escritor en una conexión
// ejecutando todas las escrituras desde esta goroutine.
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// El hub cerró el canal
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Agregar mensajes en cola al mensaje actual
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
