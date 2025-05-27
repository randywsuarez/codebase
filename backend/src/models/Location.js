const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  // Identificador único de la ubicación
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  
  // Nombre descriptivo de la ubicación
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Dirección física
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: 200
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100
    },
    state: {
      type: String,
      trim: true,
      maxlength: 100
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: 20
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'México'
    },
    coordinates: {
      // Coordenadas geográficas [longitud, latitud]
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  
  // Información de contacto
  contact: {
    phone: {
      type: String,
      trim: true,
      maxlength: 20
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un correo electrónico válido']
    },
    website: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  
  // Horario de operación
  businessHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '14:00' },
      isOpen: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '14:00' },
      isOpen: { type: Boolean, default: false }
    }
  },
  
  // Configuración de la ubicación
  settings: {
    timezone: {
      type: String,
      default: 'America/Mexico_City',
      trim: true
    },
    locale: {
      type: String,
      default: 'es-MX',
      trim: true
    },
    currency: {
      type: String,
      default: 'MXN',
      uppercase: true,
      trim: true,
      maxlength: 3
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
      trim: true
    },
    timeFormat: {
      type: String,
      default: 'HH:mm',
      trim: true
    }
  },
  
  // Información adicional
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Imágenes
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Estado de la ubicación
  isActive: {
    type: Boolean,
    default: true
  },
  
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
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento de las búsquedas
locationSchema.index({ code: 1 }, { unique: true });
locationSchema.index({ name: 1 });
locationSchema.index({ 'address.city': 1 });
locationSchema.index({ 'address.country': 1 });
locationSchema.index({ 'address.coordinates': '2dsphere' });
locationSchema.index({ isActive: 1 });

// Middleware para validar antes de guardar
locationSchema.pre('save', async function(next) {
  // Validar que el código de ubicación sea único
  if (this.isModified('code')) {
    const existingLocation = await this.constructor.findOne({ 
      code: this.code,
      _id: { $ne: this._id }
    });
    
    if (existingLocation) {
      throw new Error('El código de ubicación ya está en uso');
    }
  }
  
  // Validar que haya al menos una imagen principal
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    
    // Si no hay imagen principal, establecer la primera como principal
    if (primaryImages.length === 0) {
      this.images[0].isPrimary = true;
    }
    // Si hay más de una imagen principal, marcar solo la primera como principal
    else if (primaryImages.length > 1) {
      let firstPrimaryFound = false;
      this.images.forEach(img => {
        if (img.isPrimary) {
          if (!firstPrimaryFound) {
            firstPrimaryFound = true;
          } else {
            img.isPrimary = false;
          }
        }
      });
    }
  }
  
  next();
});

// Middleware para validar antes de eliminar
locationSchema.pre('remove', async function(next) {
  const User = mongoose.model('User');
  const Project = mongoose.model('Project');
  
  try {
    // Verificar que no haya usuarios asociados a esta ubicación
    const userCount = await User.countDocuments({ location: this._id });
    if (userCount > 0) {
      throw new Error('No se puede eliminar la ubicación porque tiene usuarios asociados');
    }
    
    // Verificar que no haya proyectos asociados a esta ubicación
    const projectCount = await Project.countDocuments({ location: this._id });
    if (projectCount > 0) {
      throw new Error('No se puede eliminar la ubicación porque tiene proyectos asociados');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Método para obtener la imagen principal
locationSchema.methods.getPrimaryImage = function() {
  if (!this.images || this.images.length === 0) {
    return null;
  }
  
  const primaryImage = this.images.find(img => img.isPrimary);
  return primaryImage || this.images[0];
};

// Método para verificar si la ubicación está abierta en un momento dado
locationSchema.methods.isOpen = function(date = new Date()) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const hours = this.businessHours[dayOfWeek];
  
  if (!hours || !hours.isOpen) {
    return false;
  }
  
  const currentTime = date.toTimeString().slice(0, 5); // Formato HH:mm
  return currentTime >= hours.open && currentTime <= hours.close;
};

// Método estático para buscar ubicaciones cercanas
locationSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance // en metros
      }
    },
    isActive: true
  });
};

// Método estático para inicializar ubicaciones por defecto
locationSchema.statics.initializeDefaultLocations = async function(adminUserId) {
  const defaultLocations = [
    {
      code: 'OFICINA',
      name: 'Oficina Central',
      address: {
        street: 'Av. Principal #123',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '12345',
        country: 'México',
        coordinates: {
          type: 'Point',
          coordinates: [-99.1332, 19.4326] // Coordenadas de CDMX
        }
      },
      contact: {
        phone: '+52 55 1234 5678',
        email: 'contacto@empresa.com',
        website: 'https://www.empresa.com'
      },
      description: 'Oficinas corporativas de la empresa',
      createdBy: adminUserId,
      updatedBy: adminUserId
    },
    {
      code: 'SUCURSAL',
      name: 'Sucursal Norte',
      address: {
        street: 'Blvd. Universidad #456',
        city: 'Monterrey',
        state: 'Nuevo León',
        postalCode: '64700',
        country: 'México',
        coordinates: {
          type: 'Point',
          coordinates: [-100.3161, 25.6866] // Coordenadas de Monterrey
        }
      },
      contact: {
        phone: '+52 81 1234 5678',
        email: 'sucursal@empresa.com'
      },
      description: 'Sucursal en la zona norte del país',
      createdBy: adminUserId,
      updatedBy: adminUserId
    },
    {
      code: 'ALMACEN',
      name: 'Almacén Principal',
      address: {
        street: 'Calle Industrial #789',
        city: 'Guadalajara',
        state: 'Jalisco',
        postalCode: '44100',
        country: 'México',
        coordinates: {
          type: 'Point',
          coordinates: [-103.3496, 20.6597] // Coordenadas de Guadalajara
        }
      },
      contact: {
        phone: '+52 33 1234 5678',
        email: 'almacen@empresa.com'
      },
      description: 'Almacén central de la empresa',
      createdBy: adminUserId,
      updatedBy: adminUserId
    }
  ];
  
  // Insertar ubicaciones por defecto si no existen
  for (const loc of defaultLocations) {
    await this.findOneAndUpdate(
      { code: loc.code },
      loc,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  
  console.log('Ubicaciones por defecto inicializadas correctamente');
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
