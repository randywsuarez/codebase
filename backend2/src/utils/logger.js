const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { format } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  // Si hay un stack trace (para errores), incluirlo
  if (stack) {
    log += `\n${stack}`;
  }
  
  // Si hay metadatos adicionales, convertirlos a string
  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }
  
  return log;
});

// Configuración de niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores personalizados para la consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Aplicar colores
winston.addColors(colors);

// Filtro para mostrar solo logs de error en el archivo de errores
const errorFilter = format((info, opts) => {
  return info.level === 'error' ? info : false;
});

// Filtro para excluir errores del archivo de logs general
const excludeErrorFilter = format((info, opts) => {
  return info.level === 'error' ? false : info;
});

// Configuración de los transportes (salidas de log)
const transports = [
  // Consola con colores
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      logFormat
    ),
  }),
  
  // Archivo de logs general (todos los niveles excepto error)
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    level: 'debug',
    format: combine(
      timestamp(),
      excludeErrorFilter(),
      json()
    ),
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true,
  }),
  
  // Archivo de errores (solo nivel error)
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: combine(
      timestamp(),
      errorFilter(),
      json()
    ),
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true,
  }),
];

// Crear el logger
const logger = winston.createLogger({
  levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'backend' },
  transports,
  exitOnError: false, // No salir del proceso en excepciones manejadas
});

// Si no estamos en producción, también mostramos los logs en la consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  );
}

// Función para registrar solicitudes HTTP
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Capturar excepciones no manejadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Opcional: puedes decidir si quieres cerrar la aplicación
  // process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  // Opcional: puedes decidir si quieres cerrar la aplicación
  // process.exit(1);
});

module.exports = logger;
