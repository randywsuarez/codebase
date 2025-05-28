const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema para los hitos del proyecto
const milestoneSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  dueDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true, timestamps: true });

// Esquema para los miembros del proyecto
const projectMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Información adicional del miembro en este proyecto
  position: {
    type: String,
    trim: true,
    maxlength: 100
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  // Metadatos
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: true, timestamps: true });

// Esquema principal del Proyecto
const projectSchema = new Schema({
  // Identificador único del proyecto
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  
  // Nombre del proyecto
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // Descripción detallada
  description: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  
  // Ubicación a la que pertenece el proyecto
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true
  },
  
  // Cliente o departamento que solicitó el proyecto
  client: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Fechas importantes
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // La fecha de fin debe ser posterior a la fecha de inicio
        return !this.startDate || value > this.startDate;
      },
      message: 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  },
  actualEndDate: {
    type: Date
  },
  
  // Presupuesto
  budget: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'MXN',
      uppercase: true,
      trim: true,
      maxlength: 3
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Estado del proyecto
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'planning',
    index: true
  },
  
  // Prioridad del proyecto
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Miembros del proyecto
  members: [projectMemberSchema],
  
  // Hitos del proyecto
  milestones: [milestoneSchema],
  
  // Etiquetas para categorización
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // Configuración del proyecto
  settings: {
    // Configuración de privacidad
    isPublic: {
      type: Boolean,
      default: false
    },
    // Configuración de notificaciones
    notifyOnTaskComplete: {
      type: Boolean,
      default: true
    },
    notifyOnMilestone: {
      type: Boolean,
      default: true
    },
    // Configuración de acceso
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    // Configuración de archivos
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB en bytes
    },
    allowedFileTypes: {
      type: [String],
      default: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
    }
  },
  
  // Archivos adjuntos
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }],
  
  // Metadatos
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento de las búsquedas
projectSchema.index({ code: 1 }, { unique: true });
projectSchema.index({ name: 'text', description: 'text', tags: 'text' });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1, priority: -1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });

// Middleware para validar antes de guardar
projectSchema.pre('save', async function(next) {
  const Location = mongoose.model('Location');
  
  // Validar que el código de proyecto sea único
  if (this.isModified('code')) {
    const existingProject = await this.constructor.findOne({ 
      code: this.code,
      _id: { $ne: this._id }
    });
    
    if (existingProject) {
      throw new Error('El código de proyecto ya está en uso');
    }
  }
  
  // Validar que la ubicación existe
  if (this.isModified('location')) {
    const location = await Location.findById(this.location);
    if (!location) {
      throw new Error('La ubicación especificada no existe');
    }
  }
  
  // Actualizar la fecha de finalización real si el estado es 'completed'
  if (this.isModified('status') && this.status === 'completed' && !this.actualEndDate) {
    this.actualEndDate = new Date();
  }
  
  // Actualizar los hitos completados
  if (this.isModified('milestones')) {
    this.milestones = this.milestones.map((milestone, index) => {
      milestone.order = index;
      return milestone;
    });
  }
  
  next();
});

// Middleware para validar antes de eliminar
projectSchema.pre('remove', async function(next) {
  // Aquí podrías agregar lógica para limpiar referencias en otros modelos
  // Por ejemplo, eliminar tareas, archivos, etc. asociados a este proyecto
  
  try {
    // Ejemplo: Eliminar referencias en UserRole
    await mongoose.model('UserRole').deleteMany({ project: this._id });
    
    // Nota: En un entorno de producción, podrías querer desactivar en lugar de eliminar
    next();
  } catch (error) {
    next(error);
  }
});

// Método para verificar si un usuario es miembro del proyecto
projectSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && member.isActive
  );
};

// Método para agregar un miembro al proyecto
projectSchema.methods.addMember = async function(userId, roleIds, addedBy, options = {}) {
  const User = mongoose.model('User');
  
  // Verificar que el usuario existe
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('El usuario especificado no existe');
  }
  
  // Verificar que los roles existen
  if (roleIds && roleIds.length > 0) {
    const Role = mongoose.model('Role');
    const roles = await Role.find({ _id: { $in: roleIds } });
    
    if (roles.length !== roleIds.length) {
      throw new Error('Uno o más roles especificados no existen');
    }
  }
  
  // Verificar si el usuario ya es miembro
  const existingMemberIndex = this.members.findIndex(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMemberIndex >= 0) {
    // Actualizar roles si el usuario ya es miembro
    if (roleIds && roleIds.length > 0) {
      this.members[existingMemberIndex].roles = roleIds;
    }
    
    // Reactivar si estaba inactivo
    if (!this.members[existingMemberIndex].isActive) {
      this.members[existingMemberIndex].isActive = true;
    }
    
    // Actualizar información adicional
    if (options.position) {
      this.members[existingMemberIndex].position = options.position;
    }
    
    if (options.department) {
      this.members[existingMemberIndex].department = options.department;
    }
    
    if (options.notes) {
      this.members[existingMemberIndex].notes = options.notes;
    }
  } else {
    // Agregar nuevo miembro
    const newMember = {
      user: userId,
      roles: roleIds || [],
      addedBy: addedBy,
      joinDate: new Date(),
      isActive: true
    };
    
    if (options.position) newMember.position = options.position;
    if (options.department) newMember.department = options.department;
    if (options.notes) newMember.notes = options.notes;
    
    this.members.push(newMember);
  }
  
  return this.save();
};

// Método para eliminar un miembro del proyecto
projectSchema.methods.removeMember = async function(userId, removedBy) {
  const memberIndex = this.members.findIndex(member => 
    member.user.toString() === userId.toString() && member.isActive
  );
  
  if (memberIndex === -1) {
    throw new Error('El usuario no es un miembro activo de este proyecto');
  }
  
  // Marcar como inactivo en lugar de eliminar para mantener el historial
  this.members[memberIndex].isActive = false;
  this.members[memberIndex].removedAt = new Date();
  this.members[memberIndex].removedBy = removedBy;
  
  return this.save();
};

// Método para agregar un hito al proyecto
projectSchema.methods.addMilestone = function(name, dueDate, createdBy, options = {}) {
  const newMilestone = {
    name,
    dueDate,
    createdBy,
    order: this.milestones.length
  };
  
  if (options.description) newMilestone.description = options.description;
  
  this.milestones.push(newMilestone);
  return this.save();
};

// Método para marcar un hito como completado
projectSchema.methods.completeMilestone = async function(milestoneId, completedBy) {
  const milestone = this.milestones.id(milestoneId);
  
  if (!milestone) {
    throw new Error('Hito no encontrado');
  }
  
  milestone.completed = true;
  milestone.completedAt = new Date();
  milestone.completedBy = completedBy;
  
  // Verificar si todos los hitos están completos para marcar el proyecto como completado
  const allMilestonesCompleted = this.milestones.every(m => m.completed);
  if (allMilestonesCompleted && this.status !== 'completed') {
    this.status = 'completed';
    this.actualEndDate = new Date();
  }
  
  return this.save();
};

// Método estático para buscar proyectos por ubicación
projectSchema.statics.findByLocation = function(locationId, options = {}) {
  const query = {
    location: locationId,
    isActive: true
  };
  
  // Filtrar por estado si se especifica
  if (options.status) {
    query.status = options.status;
  }
  
  // Ordenar por fecha de inicio (más reciente primero)
  const sort = { startDate: -1 };
  
  return this.find(query)
    .sort(sort)
    .populate('location', 'name code')
    .populate('createdBy', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email avatar')
    .populate('members.roles', 'name description');
};

// Método estático para buscar proyectos por miembro
projectSchema.statics.findByMember = function(userId, options = {}) {
  const query = {
    'members.user': userId,
    'members.isActive': true,
    isActive: true
  };
  
  // Filtrar por estado si se especifica
  if (options.status) {
    query.status = options.status;
  }
  
  // Ordenar por fecha de inicio (más reciente primero)
  const sort = { startDate: -1 };
  
  return this.find(query)
    .sort(sort)
    .populate('location', 'name code')
    .populate('createdBy', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email avatar')
    .populate('members.roles', 'name description');
};

// Método estático para inicializar proyectos de ejemplo
projectSchema.statics.initializeSampleProjects = async function(adminUserId) {
  const Location = mongoose.model('Location');
  const Role = mongoose.model('Role');
  
  // Obtener ubicaciones existentes
  const locations = await Location.find({ isActive: true }).limit(3);
  if (locations.length === 0) {
    console.log('No hay ubicaciones disponibles. Crea ubicaciones primero.');
    return;
  }
  
  // Obtener roles existentes
  const roles = await Role.find({ isActive: true }).limit(3);
  if (roles.length === 0) {
    console.log('No hay roles disponibles. Crea roles primero.');
    return;
  }
  
  const sampleProjects = [
    {
      code: 'DEV-2023',
      name: 'Desarrollo de Aplicación Móvil',
      description: 'Desarrollo de una aplicación móvil para gestión de proyectos',
      location: locations[0]._id,
      client: 'Departamento de TI',
      startDate: new Date('2023-01-15'),
      endDate: new Date('2023-06-30'),
      status: 'in_progress',
      priority: 'high',
      budget: {
        amount: 500000,
        currency: 'MXN',
        spent: 250000
      },
      tags: ['desarrollo', 'movil', 'ti'],
      createdBy: adminUserId,
      updatedBy: adminUserId
    },
    {
      code: 'MK-2023-Q2',
      name: 'Campaña de Marketing Q2 2023',
      description: 'Campaña de marketing para el segundo trimestre del 2023',
      location: locations[1] ? locations[1]._id : locations[0]._id,
      client: 'Departamento de Marketing',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2023-06-30'),
      status: 'planning',
      priority: 'medium',
      budget: {
        amount: 300000,
        currency: 'MXN',
        spent: 0
      },
      tags: ['marketing', 'campaña', 'q2'],
      createdBy: adminUserId,
      updatedBy: adminUserId
    },
    {
      code: 'INV-2023',
      name: 'Inventario Anual 2023',
      description: 'Conteo físico de inventario en todas las ubicaciones',
      location: locations[2] ? locations[2]._id : locations[0]._id,
      client: 'Departamento de Operaciones',
      startDate: new Date('2023-11-01'),
      endDate: new Date('2023-12-15'),
      status: 'planning',
      priority: 'high',
      budget: {
        amount: 150000,
        currency: 'MXN',
        spent: 0
      },
      tags: ['inventario', 'operaciones', 'anual'],
      createdBy: adminUserId,
      updatedBy: adminUserId
    }
  ];
  
  // Insertar proyectos de ejemplo si no existen
  for (const proj of sampleProjects) {
    await this.findOneAndUpdate(
      { code: proj.code },
      proj,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  
  console.log('Proyectos de ejemplo inicializados correctamente');
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
