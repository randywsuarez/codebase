const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Cargar variables de entorno
require('dotenv').config();

// Opciones de conexión
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Tiempo de espera para la selección del servidor
  socketTimeoutMS: 45000, // Cierra sockets después de 45 segundos de inactividad
  family: 4, // Usa IPv4, omite IPv6
  maxPoolSize: 10, // Mantener hasta 10 conexiones de socket
  serverSelectionTimeoutMS: 5000, // Mantener intentando enviar operaciones por 5 segundos
  socketTimeoutMS: 45000, // Cierra sockets después de 45 segundos de inactividad
  family: 4 // Usa IPv4, omite IPv6
};

// URI de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/empresa-db';

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    
    logger.info('Conexión a MongoDB establecida correctamente');
    
    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      logger.error(`Error de conexión a MongoDB: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado');
    });
    
    // Cuando la conexión se reconecta
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconectado');
    });
    
    // Cuando la conexión se cierra por alguna razón
    mongoose.connection.on('close', () => {
      logger.warn('Conexión a MongoDB cerrada');
    });
    
    return mongoose.connection;
  } catch (error) {
    logger.error(`Error al conectar a MongoDB: ${error.message}`);
    // Salir del proceso con error
    process.exit(1);
  }
};

// Función para desconectar la base de datos
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Conexión a MongoDB cerrada correctamente');
    return true;
  } catch (error) {
    logger.error(`Error al cerrar la conexión a MongoDB: ${error.message}`);
    return false;
  }
};

// Función para verificar el estado de la conexión
const getDbStatus = () => {
  return {
    dbState: mongoose.STATES[mongoose.connection.readyState],
    dbName: mongoose.connection.name,
    dbHost: mongoose.connection.host,
    dbPort: mongoose.connection.port,
    dbUser: mongoose.connection.user,
    dbVersion: mongoose.version
  };
};

module.exports = {
  connectDB,
  disconnectDB,
  getDbStatus,
  connection: mongoose.connection
};
