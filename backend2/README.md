# Backend del Sistema de Gestión

Este es el backend de un sistema de gestión empresarial desarrollado con Node.js, Express y MongoDB. Proporciona una API RESTful para gestionar usuarios, roles, ubicaciones, proyectos y más.

## Características

- Autenticación y autorización con JWT
- Gestión de usuarios y roles
- Control de acceso basado en roles (RBAC)
- Gestión de ubicaciones y proyectos
- API documentada con Swagger/OpenAPI
- Validación de datos con Joi
- Manejo centralizado de errores
- Logging estructurado
- Seguridad mejorada (CORS, rate limiting, sanitización)

## Requisitos Previos

- Node.js (v14.x o superior)
- npm (v6.x o superior) o yarn
- MongoDB (v4.4 o superior)
- Git (opcional, para control de versiones)

## Instalación

1. **Clonar el repositorio** (si no lo has hecho ya):
   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio/backend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   
   Luego, edita el archivo `.env` con tus configuraciones.

4. **Iniciar la base de datos**:
   Asegúrate de que MongoDB esté en ejecución. Si usas Docker, puedes iniciar una instancia con:
   ```bash
   docker run --name mongodb -p 27017:27017 -d mongo:latest
   ```

5. **Inicializar la base de datos** (opcional, para datos de prueba):
   ```bash
   npm run db:init
   # o
   yarn db:init
   ```
   
   Esto creará un usuario administrador con las credenciales especificadas en `.env`.

## Uso

### Iniciar el servidor en desarrollo:
```bash
npm run dev
# o
yarn dev
```

### Iniciar el servidor en producción:
```bash
npm start
# o
yarn start
```

### Ejecutar pruebas:
```bash
npm test
# o
yarn test
```

### Lint y formateo:
```bash
# Corregir problemas de estilo
npm run lint:fix
# o
yarn lint:fix

# Formatear código
npm run format
# o
yarn format
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuraciones de la aplicación
│   ├── controllers/      # Controladores de la API
│   ├── middleware/       # Middlewares personalizados
│   ├── models/          # Modelos de Mongoose
│   ├── routes/          # Rutas de la API
│   ├── scripts/         # Scripts de utilidad
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades y helpers
│   ├── validators/      # Esquemas de validación
│   ├── app.js           # Aplicación Express
│   └── server.js        # Punto de entrada del servidor
├── tests/               # Pruebas
├── .env.example         # Variables de entorno de ejemplo
├── .eslintrc.js         # Configuración de ESLint
├── .prettierrc          # Configuración de Prettier
├── package.json         # Dependencias y scripts
└── README.md            # Este archivo
```

## Autenticación

La autenticación se realiza mediante JWT (JSON Web Tokens). Para acceder a los endpoints protegidos, incluye el token JWT en el encabezado `Authorization`:

```
Authorization: Bearer <token>
```

## Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las siguientes variables:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| NODE_ENV | Entorno de ejecución | `development` |
| PORT | Puerto del servidor | `3000` |
| MONGODB_URI | URI de conexión a MongoDB | `mongodb://localhost:27017/empresa-db` |
| JWT_SECRET | Clave secreta para firmar JWT | `tu_clave_secreta_muy_segura_aqui` |
| JWT_EXPIRE | Tiempo de expiración del token | `30d` |
| ADMIN_EMAIL | Email del administrador | `admin@example.com` |
| ADMIN_PASSWORD | Contraseña del administrador | `Admin123!` |

## Documentación de la API

La documentación de la API está disponible en formato OpenAPI (Swagger). Cuando el servidor esté en ejecución, accede a:

- Documentación interactiva: `http://localhost:3000/api-docs`
- Esquema JSON: `http://localhost:3000/api-docs.json`

## Despliegue

### Docker

Puedes desplegar la aplicación usando Docker:

```bash
# Construir la imagen
docker build -t tu-app-backend .

# Ejecutar el contenedor
docker run -d \
  --name backend \
  -p 3000:3000 \
  --env-file .env \
  tu-app-backend
```

### Plataformas en la Nube

- **Heroku**: Usa el botón "Deploy to Heroku" o sigue la [guía de despliegue](https://devcenter.heroku.com/articles/deploying-nodejs).
- **AWS**: Usa Elastic Beanstalk o ECS con Fargate.
- **Google Cloud**: Usa App Engine o Google Kubernetes Engine.
- **Vercel/Netlify**: Aunque están más orientados a frontends, puedes usarlos con funciones serverless.

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -am 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## Soporte

Si encuentras algún problema o tienes preguntas, por favor [abre un issue](https://github.com/tu-usuario/tu-repositorio/issues).

---

Desarrollado con ❤️ por [Tu Nombre]
