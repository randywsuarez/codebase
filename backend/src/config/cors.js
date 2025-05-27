/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Define los orígenes permitidos, métodos, encabezados y credenciales
 */

// Lista blanca de orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000', // Aplicación React en desarrollo
  'http://localhost:3001', // Posible puerto alternativo
  'https://tudominio.com', // Dominio de producción
  'https://www.tudominio.com', // Variante www del dominio de producción
];

// Opciones de CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en la lista blanca
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir el envío de credenciales (cookies, encabezados de autenticación)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Access-Token',
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Disposition',
    'X-Filename',
  ],
  maxAge: 3600, // Tiempo de caché de la respuesta CORS (en segundos)
  optionsSuccessStatus: 204, // Algunos navegadores antiguos (IE11, varios SmartTVs) se atascan con 204
};

module.exports = corsOptions;
