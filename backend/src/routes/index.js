const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./user');

const router = express.Router();

// Ruta de estado de la API
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Montar rutas de autenticación
router.use('/auth', authRoutes);

// Montar rutas de usuarios
router.use('/users', userRoutes);

// Ruta para manejar rutas no encontradas
router.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `No se pudo encontrar ${req.originalUrl} en este servidor.`,
  });
});

module.exports = router;
