#!/usr/bin/env node

// Script de prueba para enviar notificaciones al WebSocket Server
// Uso: node test-notifications.js

const axios = require('axios');

const WEBSOCKET_URL = 'http://localhost:4001/notify';

// Función auxiliar para enviar notificaciones
async function sendNotification(event, data) {
    try {
        const response = await axios.post(WEBSOCKET_URL, {
            event,
            data,
            room: 'dashboard'
        });
        
        console.log(`✅ ${event}: Notificación enviada exitosamente`);
        return true;
    } catch (error) {
        console.error(`❌ ${event}: Error enviando notificación:`, error.message);
        return false;
    }
}

// Simulaciones de eventos
const testEvents = [
    {
        event: 'tour_creado',
        data: {
            nombre: 'Aventura en Galápagos',
            precio: 1500,
            guia_nombre: 'Carlos Mendez'
        }
    },
    {
        event: 'usuario_registrado',
        data: {
            nombre: 'María García',
            email: 'maria@example.com',
            fecha_registro: new Date().toISOString()
        }
    },
    {
        event: 'reserva_creada',
        data: {
            id_reserva: 12345,
            tour_nombre: 'Aventura en Galápagos',
            usuario_nombre: 'María García',
            fecha_reserva: '2025-01-15',
            total: 1500
        }
    },
    {
        event: 'servicio_contratado',
        data: {
            id_contratacion: 67890,
            nombre: 'Transporte Aeropuerto',
            precio: 150,
            cliente: 'Ana Rodríguez'
        }
    }
];

// Función principal
async function runTests() {
    console.log('🧪 Iniciando pruebas de notificaciones WebSocket...\n');
    
    // Verificar que el servidor esté funcionando
    try {
        const healthResponse = await axios.get('http://localhost:4001/health');
        console.log('✅ WebSocket Server está funcionando:', healthResponse.data.message);
    } catch (error) {
        console.error('❌ No se puede conectar al WebSocket Server. ¿Está ejecutándose en el puerto 4001?');
        process.exit(1);
    }
    
    console.log('\n📡 Enviando notificaciones de prueba...\n');
    
    // Enviar notificaciones con delay entre cada una
    for (const testEvent of testEvents) {
        await sendNotification(testEvent.event, testEvent.data);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
    }
    
    console.log('\n🎉 Pruebas completadas!');
    console.log('💡 Abre http://localhost:4001 para ver las notificaciones en tiempo real');
}

// Ejecutar las pruebas
runTests().catch(error => {
    console.error('💥 Error durante las pruebas:', error.message);
    process.exit(1);
});