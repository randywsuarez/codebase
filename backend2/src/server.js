/**
 * Punto de entrada principal de la aplicación
 * 
 * Este archivo inicia el servidor Express y maneja las señales del proceso
 * para un apagado limpio.
 */

const app = require('./app');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/database');

// Cargar variables de entorno
require('dotenv').config();

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  try {
    await connectDB();
    logger.info(`Servidor ejecutándose en el puerto ${PORT}...`);
    logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Base de datos: ${process.env.MONGODB_URI || 'No configurada'}`);

    // Cargar documentación de Swagger en desarrollo
    if (process.env.NODE_ENV === 'development') {
      // const swaggerDocs = require('./config/swagger');
      // swaggerDocs(app, PORT);
    }
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Apagando...');
  logger.error(err.name, err.message);
  server.close(() => {
    disconnectDB();
    process.exit(1);
  });
});

// Manejar rechazos de promesas no manejados
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Apagando...');
  logger.error(err.name, err.message);
  server.close(() => {
    disconnectDB();
    process.exit(1);
  });
});

// Manejar la señal SIGTERM (para Kubernetes, etc.)
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECIBIDO. Apagando correctamente');
  server.close(() => {
    disconnectDB();
    logger.info('💥 Proceso terminado');
  });
});

// Manejar la señal SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('👋 SIGINT RECIBIDO. Apagando correctamente');
  
  // Cerrar el servidor
  server.close(async () => {
    // Cerrar conexión a la base de datos
    await disconnectDB();
    logger.info('💥 Proceso terminado');
    process.exit(0);
  });
});

// Manejar la señal SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  logger.info('👋 SIGINT RECIBIDO. Apagando correctamente');
  
  // Cerrar el servidor
  server.close(async () => {
    // Cerrar conexión a la base de datos
    await disconnectDB();
    logger.info('💥 Proceso terminado');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtExceptionMonitor', (err, origin) => {
  logger.error('UNCAUGHT EXCEPTION MONITOR', { error: err, origin });
});

// Manejo de advertencias no manejadas
process.on('warning', (warning) => {
  logger.warn(`ADVERTENCIA: ${warning.name}: ${warning.message}`);
  logger.warn(warning.stack);
});

// Manejo de salida del proceso
process.on('exit', (code) => {
  logger.info(`Proceso terminado con código: ${code}`);
});

// Exportar el servidor para pruebas
module.exports = server;
