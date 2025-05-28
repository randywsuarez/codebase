const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

// Cargar variables de entorno
require('dotenv').config();

// Importar rutas
const mainRouter = require('./routes');

// Importar configuración de Swagger
// const swaggerDocs = require('./config/swagger');

// Inicializar la aplicación Express
const app = express();

// Middleware para bloquear URLs malformadas que contienen '://' en el path o originalUrl
app.use((req, res, next) => {
  if (req.path.includes('://') || (req.originalUrl && req.originalUrl.includes('://'))) {
    return res.status(400).json({ 
      status: 'error',
      message: 'URL malformada: la ruta o la URL original no deben contener "://".'
    });
  }
  next();
});

// 1) Middlewares globales

// Configuración de seguridad HTTP headers
app.use(helmet());

// Habilitar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Limitar peticiones de la misma API
const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX || 100,
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.'
});
app.use('/api', limiter);

// Body parser, lectura de datos del body en req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitización contra NoSQL query injection
app.use(mongoSanitize());

// Data sanitización contra XSS
app.use(xss());

// Prevenir parameter pollution
app.use(hpp({
  whitelist: [
    'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
  ]
}));

// Compresión de respuestas HTTP
app.use(compression());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// 2) Rutas
app.use('/api/v1', mainRouter);

// Ruta de prueba
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejador de rutas no encontradas
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `No se pudo encontrar ${req.originalUrl} en este servidor.`
  });
});

// Manejador global de errores
app.use(errorHandler);

module.exports = app;
