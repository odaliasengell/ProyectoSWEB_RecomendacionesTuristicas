package ws

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients   map[*websocket.Conn]bool
	broadcast chan []byte
	upgrader  websocket.Upgrader
}

func NewHub() *Hub {
	return &Hub{
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan []byte, 16),
		upgrader:  websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }},
	}
}

func (h *Hub) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws upgrade error: %v", err)
		return
	}
	h.clients[conn] = true

	go func() {
		for msg := range h.broadcast {
			for c := range h.clients {
				c.WriteMessage(websocket.TextMessage, msg)
			}
		}
	}()
}

func (h *Hub) Emit(msg []byte) {
	select {
	case h.broadcast <- msg:
	default:
	}
}
