const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userRoleSchema = new Schema({
  // Referencia al usuario
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Referencia al rol
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true
  },
  
  // Referencia a la ubicación (obligatoria)
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true
  },
  
  // Referencia al proyecto (opcional, para roles específicos de proyecto)
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true,
    default: null
  },
  
  // Fecha de inicio de la asignación del rol
  startDate: {
    type: Date,
    default: Date.now
  },
  
  // Fecha de finalización de la asignación del rol (opcional, para roles temporales)
  endDate: {
    type: Date,
    default: null
  },
  
  // Estado de la asignación
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Notas o comentarios sobre la asignación
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Quién asignó este rol
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metadatos
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice compuesto para garantizar unicidad de asignación de roles
userRoleSchema.index(
  { 
    user: 1, 
    role: 1, 
    location: 1, 
    project: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: { 
      project: { $type: "objectId" } 
    }
  }
);

// Índice para búsquedas comunes
userRoleSchema.index({ user: 1, isActive: 1 });
userRoleSchema.index({ role: 1, isActive: 1 });
userRoleSchema.index({ location: 1, isActive: 1 });
userRoleSchema.index({ project: 1, isActive: 1 });

// Middleware para validar la asignación de roles
userRoleSchema.pre('save', async function(next) {
  const User = mongoose.model('User');
  const Role = mongoose.model('Role');
  const Location = mongoose.model('Location');
  const Project = mongoose.model('Project');
  
  try {
    // Verificar que el usuario existe
    const user = await User.findById(this.user);
    if (!user) {
      throw new Error('El usuario especificado no existe');
    }
    
    // Verificar que el rol existe
    const role = await Role.findById(this.role);
    if (!role) {
      throw new Error('El rol especificado no existe');
    }
    
    // Verificar que la ubicación existe
    const location = await Location.findById(this.location);
    if (!location) {
      throw new Error('La ubicación especificada no existe');
    }
    
    // Verificar que el proyecto existe si se especifica
    if (this.project) {
      const project = await Project.findById(this.project);
      if (!project) {
        throw new Error('El proyecto especificado no existe');
      }
      
      // Verificar que el proyecto pertenece a la ubicación especificada
      if (project.location.toString() !== this.location.toString()) {
        throw new Error('El proyecto no pertenece a la ubicación especificada');
      }
    }
    
    // Verificar que no exista una asignación duplicada
    const existingAssignment = await mongoose.model('UserRole').findOne({
      user: this.user,
      role: this.role,
      location: this.location,
      project: this.project || { $exists: false },
      _id: { $ne: this._id }
    });
    
    if (existingAssignment) {
      throw new Error('Ya existe una asignación idéntica para este usuario');
    }
    
    // Actualizar la fecha de modificación
    this.updatedAt = Date.now();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para validar antes de eliminar
userRoleSchema.pre('remove', async function(next) {
  const Role = mongoose.model('Role');
  
  try {
    // Obtener el rol
    const role = await Role.findById(this.role);
    
    // No permitir eliminar asignaciones de roles del sistema
    if (role && role.isSystem) {
      throw new Error('No se puede eliminar la asignación de un rol del sistema');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Método para verificar si la asignación está activa
userRoleSchema.methods.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  // Verificar si la fecha actual está dentro del rango de fechas de la asignación
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  
  return true;
};

// Método estático para obtener los roles de un usuario en un contexto específico
userRoleSchema.statics.getUserRoles = async function(userId, locationId, projectId = null) {
  const query = {
    user: userId,
    location: locationId,
    isActive: true,
    $or: [
      { startDate: { $lte: new Date() } },
      { startDate: { $exists: false } }
    ],
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: { $exists: false } }
    ]
  };
  
  // Si se especifica un proyecto, incluir roles específicos de ese proyecto
  // o roles que no estén vinculados a un proyecto específico
  if (projectId) {
    query.$or = [
      { project: projectId },
      { project: { $exists: false } }
    ];
  } else {
    // Si no se especifica proyecto, solo roles que no estén vinculados a un proyecto
    query.project = { $exists: false };
  }
  
  return this.find(query)
    .populate('role')
    .populate('location')
    .populate('project');
};

// Método estático para verificar si un usuario tiene un rol específico
userRoleSchema.statics.hasRole = async function(userId, roleName, locationId, projectId = null) {
  const Role = mongoose.model('Role');
  
  // Primero, obtener el ID del rol por su nombre
  const role = await Role.findOne({ name: roleName });
  if (!role) return false;
  
  // Construir la consulta
  const query = {
    user: userId,
    role: role._id,
    location: locationId,
    isActive: true,
    $or: [
      { startDate: { $lte: new Date() } },
      { startDate: { $exists: false } }
    ],
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: { $exists: false } }
    ]
  };
  
  // Si se especifica un proyecto, buscar roles específicos para ese proyecto
  // o roles que no estén vinculados a un proyecto específico
  if (projectId) {
    query.$or = [
      { project: projectId },
      { project: { $exists: false } }
    ];
  } else {
    // Si no se especifica proyecto, solo roles que no estén vinculados a un proyecto
    query.project = { $exists: false };
  }
  
  const count = await this.countDocuments(query);
  return count > 0;
};

// Método estático para asignar un rol a un usuario
userRoleSchema.statics.assignRole = async function(userId, roleId, locationId, projectId = null, assignedBy, options = {}) {
  const User = mongoose.model('User');
  const Role = mongoose.model('Role');
  const Location = mongoose.model('Location');
  const Project = mongoose.model('Project');
  
  // Verificar que el usuario existe
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('El usuario especificado no existe');
  }
  
  // Verificar que el rol existe
  const role = await Role.findById(roleId);
  if (!role) {
    throw new Error('El rol especificado no existe');
  }
  
  // Verificar que la ubicación existe
  const location = await Location.findById(locationId);
  if (!location) {
    throw new Error('La ubicación especificada no existe');
  }
  
  // Verificar que el proyecto existe si se especifica
  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('El proyecto especificado no existe');
    }
    
    // Verificar que el proyecto pertenece a la ubicación especificada
    if (project.location.toString() !== locationId.toString()) {
      throw new Error('El proyecto no pertenece a la ubicación especificada');
    }
  }
  
  // Verificar que no exista una asignación duplicada
  const existingAssignment = await this.findOne({
    user: userId,
    role: roleId,
    location: locationId,
    project: projectId || { $exists: false },
    isActive: true
  });
  
  if (existingAssignment) {
    throw new Error('El usuario ya tiene asignado este rol en el contexto especificado');
  }
  
  // Crear la nueva asignación
  const userRole = new this({
    user: userId,
    role: roleId,
    location: locationId,
    project: projectId || undefined,
    startDate: options.startDate || Date.now(),
    endDate: options.endDate || null,
    isActive: true,
    notes: options.notes || '',
    assignedBy: assignedBy
  });
  
  return userRole.save();
};

// Método estático para revocar un rol de un usuario
userRoleSchema.statics.revokeRole = async function(userId, roleId, locationId, projectId = null, revokedBy) {
  const query = {
    user: userId,
    role: roleId,
    location: locationId,
    isActive: true
  };
  
  if (projectId) {
    query.project = projectId;
  } else {
    query.project = { $exists: false };
  }
  
  const userRole = await this.findOne(query);
  
  if (!userRole) {
    throw new Error('No se encontró una asignación de rol activa para revocar');
  }
  
  // Desactivar la asignación en lugar de eliminarla
  userRole.isActive = false;
  userRole.revokedAt = Date.now();
  userRole.revokedBy = revokedBy;
  
  return userRole.save();
};

const UserRole = mongoose.model('UserRole', userRoleSchema);

module.exports = UserRole;
