package ws

var defaultHub *Hub

func SetDefault(h *Hub) {
	defaultHub = h
}

func Default() *Hub {
	return defaultHub
}
