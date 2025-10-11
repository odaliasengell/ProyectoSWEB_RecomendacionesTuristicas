import WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
        // Aquí puedes agregar la lógica para manejar los mensajes recibidos
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

export default wss;