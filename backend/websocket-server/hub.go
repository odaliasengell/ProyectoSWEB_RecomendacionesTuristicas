package main

import (
	"encoding/json"
	"log"
	"sync"
)

// Hub mantiene el conjunto de clientes activos y transmite mensajes
type Hub struct {
	// Clientes registrados
	clients map[*Client]bool

	// Mensajes broadcast desde los clientes
	broadcast chan []byte

	// Registro de nuevos clientes
	register chan *Client

	// Desregistro de clientes
	unregister chan *Client

	// Mutex para operaciones concurrentes
	mu sync.RWMutex
}

// NewHub crea una nueva instancia del Hub
func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

// Run inicia el loop principal del Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("✅ Cliente registrado. Total clientes: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("❌ Cliente desregistrado. Total clientes: %d", len(h.clients))
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastEvent envía un evento a todos los clientes conectados
func (h *Hub) BroadcastEvent(event Event) {
	message, err := json.Marshal(event)
	if err != nil {
		log.Printf("❌ Error al serializar evento: %v", err)
		return
	}

	h.broadcast <- message
	log.Printf("📡 Broadcast enviado a %d clientes: [%s] %s", len(h.clients), event.Type, event.Message)
}

// GetClientCount devuelve el número de clientes conectados
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
