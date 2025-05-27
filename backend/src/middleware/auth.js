const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * Middleware para proteger rutas que requieren autenticación
 * Verifica el token JWT y asigna el usuario a req.user
 */
const protect = async (req, res, next) => {
  try {
    // 1) Obtener el token y verificar que existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('No estás autenticado. Por favor, inicia sesión para acceder.', 401)
      );
    }

    // 2) Verificar el token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario aún existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('El usuario al que pertenece este token ya no existe.', 401)
      );
    }

    // 4) Verificar si el usuario cambió la contraseña después de que se emitió el token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('El usuario cambió recientemente su contraseña. Por favor, inicia sesión de nuevo.', 401)
      );
    }

    // 5) Otorgar acceso a la ruta protegida
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    logger.error('Error en el middleware de autenticación:', error);
    return next(new AppError('Error de autenticación. Por favor, inicia sesión de nuevo.', 401));
  }
};

/**
 * Middleware para restringir el acceso por roles
 * @param  {...String} roles - Roles permitidos para acceder a la ruta
 * @returns {Function} - Middleware de Express
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles es un array ['admin', 'supervisor', 'usuario']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tienes permiso para realizar esta acción', 403)
      );
    }
    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 * @param {String} resource - Recurso al que se intenta acceder
 * @param {String} action - Acción que se intenta realizar (create, read, update, delete)
 * @returns {Function} - Middleware de Express
 */
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Obtener el usuario actual
      const user = req.user;
      
      // Verificar si el usuario tiene el permiso requerido
      const hasPermission = await user.hasPermission(resource, action);
      
      if (!hasPermission) {
        return next(
          new AppError('No tienes permiso para realizar esta acción', 403)
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar si el usuario está autenticado (solo para vistas renderizadas)
 * No genera error si el usuario no está autenticado, solo asigna el usuario a res.locals
 */
const isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) Verificar el token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Verificar si el usuario aún existe
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Verificar si el usuario cambió la contraseña después de que se emitió el token
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // 4) HAY UN USUARIO CONECTADO
      res.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
};

module.exports = {
  protect,
  restrictTo,
  checkPermission,
  isLoggedIn
};
