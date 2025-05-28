const Joi = require('joi');
const AppError = require('../utils/appError');

// Esquema de validación para el registro de usuarios
const signupSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede tener más de 50 caracteres',
  }),
  lastName: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'El apellido es obligatorio',
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede tener más de 50 caracteres',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Por favor, proporciona un correo electrónico válido',
    'string.empty': 'El correo electrónico es obligatorio',
  }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'password'
    )
    .messages({
      'string.empty': 'La contraseña es obligatoria',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.name':
        'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial',
    }),
  passwordConfirm: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'string.empty': 'La confirmación de contraseña es obligatoria',
    }),
  role: Joi.string().valid('user', 'admin', 'moderator').default('user'),
});

// Esquema de validación para el inicio de sesión
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Por favor, proporciona un correo electrónico válido',
    'string.empty': 'El correo electrónico es obligatorio',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria',
  }),
});

// Esquema de validación para la actualización de perfil
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede tener más de 50 caracteres',
  }),
  lastName: Joi.string().min(2).max(50).messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede tener más de 50 caracteres',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Por favor, proporciona un correo electrónico válido',
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .messages({
      'string.pattern.base':
        'El número de teléfono debe tener entre 10 y 15 dígitos',
    }),
  avatar: Joi.string().uri().messages({
    'string.uri': 'La URL del avatar no es válida',
  }),
});

// Esquema de validación para el restablecimiento de contraseña
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Por favor, proporciona un correo electrónico válido',
    'string.empty': 'El correo electrónico es obligatorio',
  }),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .required()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'password'
    )
    .messages({
      'string.empty': 'La contraseña es obligatoria',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.name':
        'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial',
    }),
  passwordConfirm: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'string.empty': 'La confirmación de contraseña es obligatoria',
    }),
});

// Middleware de validación genérico
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false, // Mostrar todos los errores
      allowUnknown: true, // Permitir campos adicionales
      stripUnknown: true, // Eliminar campos adicionales
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));

      return next(new AppError('Error de validación', 400, errors));
    }

    next();
  };
};

// Exportar los esquemas y el validador
module.exports = {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validate,
};
