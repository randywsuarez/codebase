const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un correo electrónico válido']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8,
    select: false // No devolver la contraseña en las consultas por defecto
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  location: { 
    type: Schema.Types.ObjectId, 
    ref: 'Location',
    required: true 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date 
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  refreshToken: {
    type: String,
    select: false
  },
  refreshTokenExpires: {
    type: Date,
    select: false
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  language: {
    type: String,
    enum: ['en', 'es'], // Idiomas soportados actualmente
    default: 'es'       // Idioma por defecto para nuevos usuarios o si no se especifica
  },
  // Campos para seguimiento
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento de las búsquedas
// Nota: username y email ya tienen índices únicos definidos en el esquema
userSchema.index({ location: 1 });
userSchema.index({ active: 1 });

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para crear un refresh token
userSchema.methods.createRefreshToken = function() {
  const refreshToken = crypto.randomBytes(32).toString('hex');
  this.refreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  
  this.refreshTokenExpires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 días
  return refreshToken;
};

// Método para verificar si el usuario cambió la contraseña después de que se emitió el token JWT
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Método para crear un token de restablecimiento de contraseña
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
  
  return resetToken;
};

// Método para obtener el nombre completo
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Middleware para eliminar referencias relacionadas al eliminar un usuario
userSchema.pre('remove', async function(next) {
  // Eliminar referencias en UserRole
  await this.model('UserRole').deleteMany({ user: this._id });
  // Eliminar referencias en Project.members
  await this.model('Project').updateMany(
    { 'members.user': this._id },
    { $pull: { members: { user: this._id } } }
  );
  next();
});

// Método para obtener los roles de un usuario en un contexto específico
userSchema.methods.getRoles = async function(locationId, projectId = null) {
  const query = { 
    user: this._id,
    location: locationId
  };
  
  if (projectId) {
    query.$or = [
      { project: projectId },
      { project: { $exists: false } }
    ];
  } else {
    query.project = { $exists: false };
  }
  
  const userRoles = await this.model('UserRole').find(query).populate('role');
  return userRoles.map(ur => ur.role);
};

// Método para verificar si el usuario tiene un permiso específico
userSchema.methods.hasPermission = async function(module, action, locationId, projectId = null) {
  // Los administradores tienen todos los permisos
  const adminRole = await this.model('Role').findOne({ name: 'admin' });
  if (adminRole) {
    const isAdmin = await this.model('UserRole').exists({
      user: this._id,
      role: adminRole._id
    });
    
    if (isAdmin) return true;
  }
  
  // Obtener los roles del usuario en el contexto dado
  const roles = await this.getRoles(locationId, projectId);
  
  // Verificar si algún rol tiene el permiso
  return roles.some(role => {
    // Verificar permisos en el módulo raíz (ej: 'profile')
    if (role.permissions[module]?.includes(action)) {
      return true;
    }
    
    // Verificar permisos anidados (ej: 'settings.roles')
    const moduleParts = module.split('.');
    let current = role.permissions;
    
    for (const part of moduleParts) {
      if (!current[part]) return false;
      current = current[part];
      
      // Si llegamos al final, verificar si la acción está permitida
      if (part === moduleParts[moduleParts.length - 1] && Array.isArray(current)) {
        return current.includes(action);
      }
    }
    
    return false;
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
