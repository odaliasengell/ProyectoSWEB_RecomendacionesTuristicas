import { Server } from 'socket.io';
import { createServer } from 'http';
import { expect } from 'chai';

describe('WebSocket Server', () => {
    let io: Server;
    let httpServer: any;

    before((done) => {
        httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(3000, () => {
            done();
        });
    });

    after((done) => {
        io.close();
        httpServer.close(done);
    });

    it('should connect a client', (done) => {
        const socket = require('socket.io-client')('http://localhost:3000');
        socket.on('connect', () => {
            expect(socket.connected).to.be.true;
            socket.disconnect();
            done();
        });
    });

    it('should receive a message', (done) => {
        const socket = require('socket.io-client')('http://localhost:3000');
        socket.on('connect', () => {
            socket.emit('message', 'Hello, server!');
        });

        io.on('connection', (client) => {
            client.on('message', (msg) => {
                expect(msg).to.equal('Hello, server!');
                client.disconnect();
                done();
            });
        });
    });
});