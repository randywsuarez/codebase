const mongoose = require('mongoose');
const app = require('./src/app');

// Cargar variables de entorno
require('dotenv').config();

const port = process.env.PORT || 3000;

// MongoDB connection string for Mongoose
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Conectar a MongoDB
mongoose
  .connect(dbURI)
  .then(() => console.log('MongoDB connected using Mongoose...'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Iniciar el servidor
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});

// Manejar errores no manejados de promesas
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Manejar la señal SIGTERM (para terminación correcta en producción)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Cerrar conexiones cuando la aplicación se cierra
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});