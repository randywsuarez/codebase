const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');

/**
 * Función auxiliar para filtrar los campos permitidos en las actualizaciones
 */
const filterAllowedFields = (obj, ...allowedFields) => {
  return filterObj(obj, ...allowedFields);
};

/**
 * Controlador para obtener todos los usuarios (solo administradores)
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

/**
 * Controlador para obtener un usuario por ID
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * Controlador para obtener el perfil del usuario autenticado
 */
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * Controlador para actualizar el perfil del usuario autenticado
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Crear un error si el usuario intenta actualizar la contraseña
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Esta ruta no es para actualizar contraseñas. Por favor, usa /updateMyPassword.',
        400
      )
    );
  }
  
  // 2) Filtrar campos no permitidos
  const filteredBody = filterAllowedFields(
    req.body,
    'firstName',
    'lastName',
    'email',
    'phone',
    'avatar',
    'preferences'
  );
  
  // 3) Actualizar el documento del usuario
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Controlador para desactivar la cuenta del usuario autenticado
 */
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Controlador para crear un usuario (solo administradores)
 */
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  
  // No enviar la contraseña en la respuesta
  newUser.password = undefined;
  
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

/**
 * Controlador para actualizar un usuario (solo administradores)
 * No se usa para actualizar contraseñas
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Obtener el usuario de la base de datos
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }
  
  // 2) Filtrar campos no permitidos
  const filteredBody = filterAllowedFields(
    req.body,
    'firstName',
    'lastName',
    'email',
    'role',
    'active',
    'emailVerified',
    'phone',
    'avatar',
    'preferences'
  );
  
  // 3) Actualizar el documento del usuario
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Controlador para eliminar un usuario (solo administradores)
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Controlador para obtener los dispositivos conocidos del usuario autenticado
 */
exports.getMyDevices = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('knownDevices');
  
  res.status(200).json({
    status: 'success',
    results: user.knownDevices.length,
    data: {
      devices: user.knownDevices,
    },
  });
});

/**
 * Controlador para eliminar un dispositivo de la lista de dispositivos conocidos
 */
exports.deleteDevice = catchAsync(async (req, res, next) => {
  const { deviceId } = req.params;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { knownDevices: { id: deviceId } } },
    { new: true, runValidators: true }
  );
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * Controlador para actualizar las preferencias de notificación del usuario
 */
exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const { notificationPreferences } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { notificationPreferences },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
