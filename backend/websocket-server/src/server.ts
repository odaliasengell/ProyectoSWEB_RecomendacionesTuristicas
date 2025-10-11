import WebSocket from 'ws';
import { handleConnection } from './controllers/recomendacionesController';

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', handleConnection);

server.on('listening', () => {
    console.log('Servidor WebSocket escuchando en el puerto 8080');
});

server.on('error', (error) => {
    console.error('Error en el servidor WebSocket:', error);
});