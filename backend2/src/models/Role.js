const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema para permisos anidados
const permissionSchema = new Schema({
  // Módulo de Perfil
  profile: {
    type: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete'],
      required: true
    }],
    default: []
  },
  
  // Módulo de Trabajo
  job: {
    type: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete'],
      required: true
    }],
    default: []
  },
  
  // Módulo de Detalles Salariales
  salaryDetails: {
    type: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete'],
      required: true
    }],
    default: []
  },
  
  // Módulo de Tiempo Libre
  timeOff: {
    type: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete'],
      required: true
    }],
    default: []
  },
  
  // Módulo de Documentos
  documents: {
    type: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete'],
      required: true
    }],
    default: []
  },
  
  // Módulo de Capacitación
  training: {
    type: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete'],
      required: true
    }],
    default: []
  },
  
  // Módulo de Beneficios
  benefits: {
    type: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete'],
      required: true
    }],
    default: []
  },
  
  // Configuraciones del sistema
  settings: {
    // Configuración de Roles
    roles: {
      type: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete'],
        required: true
      }],
      default: []
    },
    
    // Configuración de Usuarios
    users: {
      type: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete'],
        required: true
      }],
      default: []
    },
    
    // Configuración de Roles de Usuario
    userRoles: {
      type: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete'],
        required: true
      }],
      default: []
    },
    
    // Configuración de Ubicaciones
    locations: {
      type: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete'],
        required: true
      }],
      default: []
    },
    
    // Configuración de Proyectos
    projects: {
      type: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete'],
        required: true
      }],
      default: []
    },
    
    // Configuración de Menús
    menus: {
      type: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete'],
        required: true
      }],
      default: []
    }
  }
});

// Esquema para el alcance del rol
const scopeSchema = new Schema({
  // Ubicaciones a las que aplica este rol
  locations: [{
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  }],
  
  // Proyectos específicos a los que aplica este rol
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  
  // Si es true, aplica a todas las ubicaciones
  allLocations: {
    type: Boolean,
    default: false
  },
  
  // Si es true, aplica a todos los proyectos en las ubicaciones especificadas
  allProjects: {
    type: Boolean,
    default: false
  }
});

// Esquema principal del Rol
const roleSchema = new Schema({
  // Nombre del rol (ej: 'Administrador', 'Gerente', 'Empleado')
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  
  // Descripción del rol
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Permisos detallados
  permissions: {
    type: permissionSchema,
    required: true,
    default: () => ({})
  },
  
  // Alcance del rol (dónde se aplica)
  scope: {
    type: scopeSchema,
    required: true,
    default: () => ({
      locations: [],
      projects: [],
      allLocations: false,
      allProjects: false
    })
  },
  
  // Si es un rol del sistema que no se puede eliminar
  isSystem: {
    type: Boolean,
    default: false
  },
  
  // Si está activo
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Orden para mostrar en listas
  order: {
    type: Number,
    default: 0
  },
  
  // Metadatos
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

// Índices para mejorar el rendimiento
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ isActive: 1 });
roleSchema.index({ 'scope.locations': 1 });
roleSchema.index({ 'scope.projects': 1 });

// Middleware para prevenir la eliminación de roles del sistema
roleSchema.pre('remove', async function(next) {
  if (this.isSystem) {
    throw new Error('No se puede eliminar un rol del sistema');
  }
  
  // Verificar si hay usuarios con este rol
  const userCount = await mongoose.model('UserRole').countDocuments({ role: this._id });
  
  if (userCount > 0) {
    throw new Error('No se puede eliminar un rol que está asignado a usuarios');
  }
  
  next();
});

// Método para verificar si el rol tiene un permiso específico
roleSchema.methods.hasPermission = function(module, action) {
  // Si el módulo está anidado (ej: 'settings.roles')
  const parts = module.split('.');
  let current = this.permissions;
  
  for (const part of parts) {
    if (!current[part]) return false;
    current = current[part];
  }
  
  // Si llegamos al final, verificar si la acción está permitida
  if (Array.isArray(current)) {
    return current.includes(action);
  }
  
  return false;
};

// Método para verificar si el rol aplica a una ubicación específica
roleSchema.methods.appliesToLocation = function(locationId) {
  // Si aplica a todas las ubicaciones
  if (this.scope.allLocations) return true;
  
  // Verificar si la ubicación está en la lista de ubicaciones del rol
  return this.scope.locations.some(loc => 
    loc.toString() === locationId.toString()
  );
};

// Método para verificar si el rol aplica a un proyecto específico
roleSchema.methods.appliesToProject = function(projectId) {
  // Si aplica a todos los proyectos en las ubicaciones del rol
  if (this.scope.allProjects) return true;
  
  // Verificar si el proyecto está en la lista de proyectos del rol
  return this.scope.projects.some(proj => 
    proj.toString() === projectId.toString()
  );
};

// Método estático para obtener roles por usuario y contexto
roleSchema.statics.findByUserAndContext = async function(userId, locationId, projectId = null) {
  const UserRole = mongoose.model('UserRole');
  
  // Construir la consulta
  const query = {
    user: userId,
    location: locationId
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
  
  // Obtener las asignaciones de roles del usuario
  const userRoles = await UserRole.find(query).populate('role');
  
  // Extraer y devolver los roles únicos
  const roleMap = new Map();
  userRoles.forEach(ur => {
    if (ur.role) {
      roleMap.set(ur.role._id.toString(), ur.role);
    }
  });
  
  return Array.from(roleMap.values());
};

// Método estático para inicializar roles del sistema
roleSchema.statics.initializeSystemRoles = async function() {
  const Role = this;
  
  // Rol de Administrador (acceso total)
  await Role.findOneAndUpdate(
    { name: 'Administrador' },
    {
      name: 'Administrador',
      description: 'Acceso total a todas las funcionalidades del sistema',
      permissions: {
        profile: ['create', 'read', 'update', 'delete'],
        job: ['create', 'read', 'update', 'delete'],
        salaryDetails: ['create', 'read', 'update', 'delete'],
        timeOff: ['create', 'read', 'update', 'delete'],
        documents: ['create', 'read', 'update', 'delete'],
        training: ['create', 'read', 'update', 'delete'],
        benefits: ['create', 'read', 'update', 'delete'],
        settings: {
          roles: ['create', 'read', 'update', 'delete'],
          users: ['create', 'read', 'update', 'delete'],
          userRoles: ['create', 'read', 'update', 'delete'],
          locations: ['create', 'read', 'update', 'delete'],
          projects: ['create', 'read', 'update', 'delete'],
          menus: ['create', 'read', 'update', 'delete']
        }
      },
      scope: {
        allLocations: true,
        allProjects: true,
        locations: [],
        projects: []
      },
      isSystem: true,
      isActive: true,
      order: 0
    },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  );
  
  // Rol de Gerente (acceso casi total, sin configuración del sistema)
  await Role.findOneAndUpdate(
    { name: 'Gerente' },
    {
      name: 'Gerente',
      description: 'Acceso a la mayoría de las funcionalidades, excepto configuración del sistema',
      permissions: {
        profile: ['read', 'update'],
        job: ['create', 'read', 'update'],
        salaryDetails: ['read'],
        timeOff: ['create', 'read', 'update'],
        documents: ['create', 'read', 'update'],
        training: ['create', 'read', 'update'],
        benefits: ['read'],
        settings: {
          roles: ['read'],
          users: ['read'],
          userRoles: ['read'],
          locations: ['read'],
          projects: ['read'],
          menus: ['read']
        }
      },
      scope: {
        allLocations: true,
        allProjects: true,
        locations: [],
        projects: []
      },
      isSystem: true,
      isActive: true,
      order: 10
    },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  );
  
  // Rol de Empleado (acceso limitado)
  await Role.findOneAndUpdate(
    { name: 'Empleado' },
    {
      name: 'Empleado',
      description: 'Acceso básico para empleados regulares',
      permissions: {
        profile: ['read', 'update'],
        job: ['read'],
        salaryDetails: ['read'],
        timeOff: ['create', 'read', 'update'],
        documents: ['read'],
        training: ['read'],
        benefits: ['read'],
        settings: {
          roles: [],
          users: [],
          userRoles: [],
          locations: [],
          projects: [],
          menus: []
        }
      },
      scope: {
        allLocations: false,
        allProjects: false,
        locations: [],
        projects: []
      },
      isSystem: true,
      isActive: true,
      order: 20
    },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  );
  
  console.log('Roles del sistema inicializados correctamente');
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
