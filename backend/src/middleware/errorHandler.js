const AppError = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * Maneja los errores de validación de Mongoose
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Datos de entrada no válidos. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Maneja los errores de duplicación de campos únicos en MongoDB
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Valor duplicado: ${value}. Por favor, utiliza otro valor.`;
  return new AppError(message, 400);
};

/**
 * Maneja los errores de validación de JWT
 */
const handleJWTError = () =>
  new AppError('Token inválido. Por favor, inicia sesión de nuevo.', 401);

/**
 * Maneja los errores de expiración de JWT
 */
const handleJWTExpiredError = () =>
  new AppError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 401);

/**
 * Envía el error en desarrollo (con más detalles)
 */
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: '¡Algo salió mal!',
    msg: err.message,
  });
};

/**
 * Envía el error en producción (sin detalles sensibles)
 */
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Errores operacionales, de confianza: enviar mensaje al cliente
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    
    // 1) Log error
    logger.error('ERROR 💥', err);

    // 2) Enviar mensaje genérico
    return res.status(500).json({
      status: 'error',
      message: '¡Algo salió muy mal!',
    });
  }

  // RENDERED WEBSITE
  // Errores operacionales, de confianza: enviar mensaje al cliente
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: '¡Algo salió mal!',
      msg: err.message,
    });
  }
  
  // 1) Log error
  logger.error('ERROR 💥', err);

  // 2) Enviar mensaje genérico
  return res.status(err.statusCode).render('error', {
    title: '¡Algo salió mal!',
    msg: 'Por favor, inténtalo de nuevo más tarde.',
  });
};

/**
 * Middleware de manejo de errores global
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
