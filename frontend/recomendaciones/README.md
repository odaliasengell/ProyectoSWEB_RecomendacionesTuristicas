# Frontend - Recomendaciones Turísticas

Aplicación React + Vite para la gestión de usuarios, guías, tours, reservas, destinos, recomendaciones y autenticación.

## Estructura del proyecto

```
frontend/recomendaciones/
├── src/
│   ├── components/
│   │   ├── auth/                # Login y registro
│   │   ├── common/              # Navbar, Sidebar, Footer
│   │   ├── guias/               # Cards y listas de guías
│   │   ├── tours/               # Cards y listas de tours
│   │   ├── reservas/            # Cards y listas de reservas
│   │   ├── destinos/            # Cards y listas de destinos
│   │   ├── recomendaciones/     # Cards de recomendaciones
│   │   ├── servicios/           # Cards de servicios
│   │   ├── contrataciones/      # Cards de contrataciones
│   │   └── usuarios/            # Cards de usuarios
│   ├── context/                 # Contextos globales (auth, websocket, etc.)
│   ├── hooks/                   # Hooks personalizados para cada entidad
│   ├── models/                  # Modelos TypeScript
│   ├── pages/                   # Páginas principales (Home, Dashboard, etc.)
│   ├── services/
│   │   ├── api/                 # Servicios REST (axios)
│   │   ├── graphql/             # Servicios GraphQL (si aplica)
│   │   └── websocket/           # Servicios WebSocket (si aplica)
│   ├── utils/                   # Utilidades y helpers
│   ├── App.css                  # Estilos globales
│   ├── App.jsx                  # Componente raíz
│   ├── main.jsx                 # Punto de entrada
│   └── router.tsx               # Rutas principales
├── public/
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## Instalación y uso

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Ejecuta la app en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Accede a [http://localhost:5173](http://localhost:5173) (o el puerto que indique Vite)

## Funcionalidades implementadas

- Listado y visualización de guías, tours, reservas, destinos y recomendaciones
- Formularios de registro e inicio de sesión con integración a backend Python
- Hooks personalizados para cada entidad
- Estilos globales y componentes reutilizables
- Navegación con React Router

## Dependencias principales

- React 18+
- Vite
- react-router-dom
- axios

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```
VITE_API_URL=http://localhost:8000
```

Si usas GraphQL o WebSocket, añade las siguientes variables opcionales:

```
VITE_GRAPHQL_URL=http://localhost:8000/graphql
VITE_WS_URL=ws://localhost:8080
```

## Integraciones disponibles

- REST: servicios en `src/services/api` (actualmente algunos son mocks, y `auth.service.ts` usa `axios` y `VITE_API_URL`).
- GraphQL: cliente mínimo en `src/services/graphql/client.ts`. Uso ejemplo:

```ts
import { graphqlRequest } from '../services/graphql/client';

const query = `query { reporteTopDestinos { id nombre visitas } }`;
const data = await graphqlRequest(query);
```

- WebSocket: cliente mínimo en `src/services/websocket/socket.ts` y hook `useWebsocket` en `src/hooks/useWebsocket.ts`.
   Ejemplo de uso en un componente:

```tsx
import useWebsocket from '../hooks/useWebsocket';

const Component = () => {
   const { connected, messages, send } = useWebsocket('/updates');
   return <div>Conectado: {String(connected)}</div>;
}
```

## Notas

- Puedes personalizar los estilos en `src/App.css`.
- Los servicios de ejemplo usan mocks, pero están listos para conectar con la API real.
- Para producción, adapta la configuración de rutas y seguridad según tus necesidades.
