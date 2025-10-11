# WebSocket Server for Tourist Recommendations

Este proyecto es un servidor WebSocket diseñado para proporcionar recomendaciones turísticas en tiempo real. Utiliza TypeScript y está estructurado para facilitar la expansión y el mantenimiento.

## Estructura del Proyecto

- **src/**: Contiene el código fuente del servidor.
  - **server.ts**: Archivo principal que inicia el servidor WebSocket.
  - **controllers/**: Contiene la lógica de controladores para manejar las solicitudes.
    - **recomendacionesController.ts**: Controlador para gestionar las recomendaciones turísticas.
  - **models/**: Define los modelos de datos utilizados en el proyecto.
    - **recomendacion.ts**: Modelo que representa una recomendación turística.
  - **services/**: Contiene la lógica de negocio y servicios.
    - **recomendacionesService.ts**: Servicio que maneja la lógica relacionada con las recomendaciones.
  - **config/**: Archivos de configuración del servidor.
    - **websocket.ts**: Configuración del servidor WebSocket.
  - **types/**: Define tipos personalizados utilizados en el proyecto.
    - **index.ts**: Archivo para definir tipos globales.

- **tests/**: Contiene pruebas unitarias para el servidor.
  - **server.test.ts**: Pruebas para el archivo `server.ts`.

## Instalación

1. Clona el repositorio.
2. Navega a la carpeta del proyecto.
3. Ejecuta `npm install` para instalar las dependencias.

## Uso

Inicia el servidor ejecutando `ts-node src/server.ts`. El servidor comenzará a escuchar conexiones WebSocket y proporcionará recomendaciones turísticas a los clientes conectados.

## Contribuciones

Las contribuciones son bienvenidas. Siéntete libre de abrir un issue o un pull request.