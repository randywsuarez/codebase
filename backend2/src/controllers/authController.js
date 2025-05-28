const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const Email = require('../utils/email');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - passwordConfirm
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *           default: user
 *           description: Rol del usuario
 *         active:
 *           type: boolean
 *           default: true
 *           description: Indica si la cuenta del usuario está activa
 *         emailVerified:
 *           type: boolean
 *           default: false
 *           description: Indica si el correo electrónico ha sido verificado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización del usuario
 *       example:
 *         id: 60d21b4667d0d8992e610c85
 *         username: johndoe
 *         email: john@example.com
 *         firstName: John
 *         lastName: Doe
 *         role: user
 *         active: true
 *         emailVerified: true
 *         createdAt: 2023-06-15T10:30:00.000Z
 *         updatedAt: 2023-06-15T10:30:00.000Z
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         token:
 *           type: string
 *           description: Token JWT para autenticación
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           description: Mensaje de error descriptivo
 *           example: Error al procesar la solicitud
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: Campo que generó el error
 *                 example: email
 *               message:
 *                 type: string
 *                 description: Mensaje de error específico
 *                 example: El correo electrónico es obligatorio
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para autenticación y gestión de usuarios
 */

// Función para firmar el token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Función para crear y enviar el token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  
  // Opciones de la cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  };

  // Si estamos en producción, configuramos la cookie como segura
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Enviar la cookie con el token JWT
  res.cookie('jwt', token, cookieOptions);

  // Eliminar la contraseña de la salida
  user.password = undefined;

  // Enviar respuesta
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - passwordConfirm
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: Password123!
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *                 default: user
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Error de validación o credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 */
exports.signup = async (req, res, next) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { username, email, password, passwordConfirm, firstName, lastName, role } = req.body;

    // Crear el nuevo usuario
    const newUser = await User.create({
      username,
      email,
      password,
      passwordConfirm,
      firstName,
      lastName,
      role: role || 'usuario', // Por defecto, el rol es 'usuario'
    });

    // Generar el token de verificación de correo electrónico
    const emailVerificationToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // Enviar correo de verificación
    try {
      const verificationURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${emailVerificationToken}`;
      
      await new Email(newUser, verificationURL).sendWelcome();
      
      // Crear y enviar el token para autenticación automática
      createSendToken(newUser, 201, req, res);
    } catch (err) {
      // Si hay un error al enviar el correo, eliminar al usuario creado
      await User.findByIdAndDelete(newUser._id);
      
      return next(
        new AppError('Hubo un error al enviar el correo de verificación. Por favor, inténtalo de nuevo.', 500)
      );
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Faltan credenciales o son inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Verificar si el correo y la contraseña existen
    if (!email || !password) {
      return next(new AppError('Por favor, proporciona correo electrónico y contraseña', 400));
    }

    // 2) Verificar si el usuario existe y la contraseña es correcta
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Correo electrónico o contraseña incorrectos', 401));
    }

    // 3) Verificar si el correo electrónico está verificado
    if (!user.emailVerified) {
      return next(new AppError('Por favor, verifica tu correo electrónico antes de iniciar sesión', 401));
    }

    // 4) Si todo está bien, enviar el token al cliente
    createSendToken(user, 200, req, res);

    // 5) Enviar correo de notificación de inicio de sesión (sin bloquear la respuesta)
    // No usamos await aquí para no hacer esperar al usuario por el envío del correo.
    try {
      const loginDetails = {
        dateTime: new Date(), // Se formateará en la plantilla o en la clase Email
        ipAddress: req.ip, // Express debería proporcionar esto
        deviceInfo: req.headers['user-agent'] || 'Desconocido',
        location: 'Desconocida' // Mejorar esto en el futuro si es necesario
      };
      // La URL podría ser una URL a la página de configuración de seguridad o al dashboard
      const appUrl = `${req.protocol}://${req.get('host')}`;
      // No se necesita una URL específica para la notificación de login, pero la clase Email espera una.
      // Podríamos pasar la URL base de la app o una URL de 'mi cuenta'.
      new Email(user, `${appUrl}/my-account`).sendLoginNotification(loginDetails);
      logger.info(`Intento de envío de correo de notificación de login para ${user.email}`);
    } catch (emailError) {
      // Loggear el error pero no impedir el login
      logger.error(`Error al intentar enviar correo de notificación de login para ${user.email}:`, emailError);
    }

  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada exitosamente
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(200).json({ status: 'success' });
};

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token de autenticación JWT
 */

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware para restringir el acceso por roles
 * @param {...string} roles - Roles permitidos para acceder a la ruta
 * @returns {Function} Middleware de Express
 * 
 * @example
 * // Solo usuarios con rol 'admin' pueden acceder
 * router.get('/admin-only', authController.restrictTo('admin'), adminController.dashboard);
 */
exports.restrictTo = (...roles) => {
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
 * @swagger
 * /api/v1/auth/verify-email/{token}:
 *   get:
 *     summary: Verificar correo electrónico
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Token de verificación enviado por correo electrónico
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Correo electrónico verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Correo electrónico verificado exitosamente
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    // 1) Obtener el token de la URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2) Buscar al usuario con el token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    // 3) Si el token no es válido o ha expirado
    if (!user) {
      return next(new AppError('El token es inválido o ha expirado', 400));
    }

    // 4) Marcar el correo como verificado y eliminar el token
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // 5) Redirigir al usuario a la página de inicio de sesión
    res.status(200).json({
      status: 'success',
      message: 'Correo electrónico verificado correctamente',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Envía un correo electrónico con un enlace para restablecer la contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *     responses:
 *       200:
 *         description: Enlace de restablecimiento enviado al correo electrónico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Se ha enviado un correo con las instrucciones para restablecer la contraseña
 *       404:
 *         description: No existe un usuario con ese correo electrónico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Obtener el usuario según el correo electrónico
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('No hay ningún usuario con esa dirección de correo electrónico', 404));
    }

    // 2) Generar el token de restablecimiento
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Enviar el token por correo electrónico
    try {
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
      
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token enviado al correo electrónico',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('Hubo un error al enviar el correo. Por favor, inténtalo de nuevo más tarde.', 500)
      );
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   patch:
 *     summary: Restablecer contraseña
 *     description: Restablece la contraseña usando el token enviado por correo electrónico
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Token de restablecimiento de contraseña
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirm
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NuevaContraseña123!
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 example: NuevaContraseña123!
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Token inválido o expirado, o contraseñas no coinciden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Obtener el usuario según el token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) Si el token no es válido o ha expirado
    if (!user) {
      return next(new AppError('El token es inválido o ha expirado', 400));
    }

    // 3) Actualizar la contraseña
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Iniciar sesión del usuario, enviar JWT
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/v1/auth/update-password:
 *   patch:
 *     summary: Actualizar contraseña
 *     description: Permite a un usuario autenticado actualizar su contraseña
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - password
 *               - passwordConfirm
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Contraseña actual
 *                 example: ContraseñaActual123!
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Nueva contraseña
 *                 example: NuevaContraseña123!
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 description: Confirmación de la nueva contraseña
 *                 example: NuevaContraseña123!
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Contraseña actual incorrecta o no autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Obtener el usuario de la colección
    const user = await User.findById(req.user.id).select('+password');

    // 2) Verificar si la contraseña actual es correcta
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Tu contraseña actual es incorrecta', 401));
    }

    // 3) Si es correcta, actualizar la contraseña
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Iniciar sesión del usuario, enviar JWT
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};
