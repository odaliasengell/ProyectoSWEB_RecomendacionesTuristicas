# Scripts de Utilidad - Servidor GraphQL

Este directorio contiene scripts útiles para el desarrollo y operación del servidor GraphQL.

## Scripts disponibles en package.json

### Desarrollo
```bash
npm run dev
```
Inicia el servidor en modo desarrollo con recarga automática usando `ts-node-dev`.

### Producción
```bash
npm run build
npm start
```
Compila el código TypeScript a JavaScript y ejecuta el servidor en modo producción.

### Testing
```bash
npm test
```
Ejecuta las pruebas unitarias (cuando estén implementadas).

## Variables de entorno importantes

Asegúrate de configurar estas variables en tu archivo `.env`:

- `PORT`: Puerto donde se ejecutará el servidor (default: 4000)
- `NODE_ENV`: Entorno de ejecución (development, production)
- `TYPESCRIPT_API_URL`: URL del microservicio TypeScript
- `PYTHON_API_URL`: URL del microservicio Python
- `GOLANG_API_URL`: URL del microservicio Golang
- `CACHE_TTL`: Tiempo de vida del caché en segundos (default: 300)

## Comandos útiles

### Instalar dependencias
```bash
npm install
```

### Verificar tipos TypeScript
```bash
npx tsc --noEmit
```

### Limpiar archivos compilados
```bash
rm -rf dist/
```

### Ver estadísticas del caché
Puedes consultar las estadísticas del caché a través de GraphQL (agregar query personalizada si es necesario).
