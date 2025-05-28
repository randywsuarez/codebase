const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema para elementos de menú anidados
const menuItemSchema = new Schema({
  // Título que se mostrará en la interfaz
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  // Nombre del ícono (según la biblioteca de íconos que uses, ej: Material Icons)
  icon: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Ruta a la que lleva el ítem del menú (para react-router)
  path: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Componente a renderizar (opcional, podría usarse para carga dinámica)
  component: {
    type: String,
    trim: true
  },
  
  // Roles que tienen acceso a este ítem de menú
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  
  // Permisos específicos requeridos (alternativa a roles)
  permissions: [{
    module: String,
    action: String // 'create', 'read', 'update', 'delete'
  }],
  
  // Si el ítem está habilitado
  enabled: {
    type: Boolean,
    default: true
  },
  
  // Si el ítem debe mostrarse en la barra lateral
  showInSidebar: {
    type: Boolean,
    default: true
  },
  
  // Si el ítem debe mostrarse en la barra superior
  showInTopbar: {
    type: Boolean,
    default: false
  },
  
  // Si el ítem debe mostrarse en el menú de usuario
  showInUserMenu: {
    type: Boolean,
    default: false
  },
  
  // Si el ítem es visible solo para usuarios autenticados
  authRequired: {
    type: Boolean,
    default: true
  },
  
  // Si el ítem es visible solo para usuarios no autenticados
  guestOnly: {
    type: Boolean,
    default: false
  },
  
  // Si el ítem es un separador (no tiene funcionalidad, solo separa)
  divider: {
    type: Boolean,
    default: false
  },
  
  // Clase CSS personalizada
  className: {
    type: String,
    trim: true
  },
  
  // Ítems hijos (para menús anidados)
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  
  // Orden de aparición en el menú
  order: {
    type: Number,
    default: 0
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
  },
  
  // Si el ítem está activo
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

// Índices para mejorar el rendimiento
menuItemSchema.index({ path: 1 });
menuItemSchema.index({ order: 1 });
menuItemSchema.index({ 'roles': 1 });
menuItemSchema.index({ isActive: 1, showInSidebar: 1 });
menuItemSchema.index({ isActive: 1, showInTopbar: 1 });

// Middleware para validar antes de guardar
menuItemSchema.pre('save', async function(next) {
  // Validar que no haya referencias circulares en los hijos
  if (this.children && this.children.length > 0) {
    const checkCircular = async (itemId, path = new Set()) => {
      if (path.has(itemId.toString())) {
        throw new Error('Referencia circular detectada en los ítems de menú');
      }
      
      path.add(itemId.toString());
      
      const item = await this.constructor.findById(itemId);
      if (!item) return;
      
      if (item.children && item.children.length > 0) {
        for (const childId of item.children) {
          await checkCircular(childId, new Set(path));
        }
      }
    };
    
    for (const childId of this.children) {
      await checkCircular(childId, new Set([this._id.toString()]));
    }
  }
  
  // Validar que no haya rutas duplicadas al mismo nivel
  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      const existingSibling = await this.constructor.findOne({
        _id: { $ne: this._id },
        parent: this.parent,
        path: this.path,
        isActive: true
      });
      
      if (existingSibling) {
        throw new Error('Ya existe un ítem de menú con la misma ruta en este nivel');
      }
    }
  } else if (this.path) {
    // Para elementos de menú raíz
    const existingRoot = await this.constructor.findOne({
      _id: { $ne: this._id },
      parent: { $exists: false },
      path: this.path,
      isActive: true
    });
    
    if (existingRoot) {
      throw new Error('Ya existe un ítem de menú raíz con la misma ruta');
    }
  }
  
  next();
});

// Middleware para limpiar referencias al eliminar
menuItemSchema.pre('remove', async function(next) {
  // Eliminar referencias de los padres
  await this.model('MenuItem').updateMany(
    { children: this._id },
    { $pull: { children: this._id } }
  );
  
  // Eliminar referencias de los hijos (si los hay)
  if (this.children && this.children.length > 0) {
    await this.model('MenuItem').updateMany(
      { _id: { $in: this.children } },
      { $unset: { parent: '' } }
    );
  }
  
  next();
});

// Método para obtener la ruta completa (para breadcrumbs)
menuItemSchema.methods.getFullPath = async function() {
  const path = [];
  let current = this;
  
  while (current) {
    path.unshift({
      _id: current._id,
      title: current.title,
      path: current.path
    });
    
    if (current.parent) {
      current = await this.constructor.findById(current.parent);
    } else {
      current = null;
    }
  }
  
  return path;
};

// Método para verificar si un usuario tiene acceso a este ítem de menú
menuItemSchema.methods.userHasAccess = async function(user) {
  // Si no requiere autenticación y es para invitados, cualquier usuario puede verlo
  if (this.guestOnly && !user) return true;
  
  // Si requiere autenticación y no hay usuario, no tiene acceso
  if (this.authRequired && !user) return false;
  
  // Si es solo para invitados y hay un usuario autenticado, no tiene acceso
  if (this.guestOnly && user) return false;
  
  // Si no hay restricciones de roles ni permisos, está disponible para todos los autenticados
  if ((!this.roles || this.roles.length === 0) && 
      (!this.permissions || this.permissions.length === 0)) {
    return true;
  }
  
  // Verificar roles
  if (this.roles && this.roles.length > 0 && user) {
    const UserRole = mongoose.model('UserRole');
    const userRoles = await UserRole.find({ user: user._id, isActive: true });
    
    const hasRole = userRoles.some(userRole => 
      this.roles.some(roleId => 
        roleId.toString() === userRole.role.toString()
      )
    );
    
    if (hasRole) return true;
  }
  
  // Verificar permisos específicos
  if (this.permissions && this.permissions.length > 0 && user) {
    for (const perm of this.permissions) {
      const hasPerm = await user.hasPermission(perm.module, perm.action);
      if (hasPerm) return true;
    }
  }
  
  return false;
};

// Método estático para obtener el menú completo para un usuario específico
menuItemSchema.statics.getMenuForUser = async function(user, options = {}) {
  const { locationId, projectId } = options;
  
  // Obtener todos los ítems de menú activos
  const menuItems = await this.find({ isActive: true })
    .sort({ order: 1 })
    .lean();
  
  // Función para construir el árbol de menú recursivamente
  const buildMenuTree = async (parentId = null) => {
    const items = menuItems.filter(item => {
      if (parentId === null) {
        return !item.parent;
      } else {
        return item.parent && item.parent.toString() === parentId.toString();
      }
    });
    
    const result = [];
    
    for (const item of items) {
      // Verificar si el usuario tiene acceso a este ítem
      const hasAccess = user ? 
        await this.model('MenuItem')
          .findById(item._id)
          .then(menuItem => menuItem.userHasAccess(user)) : 
        // Si no hay usuario, solo mostrar ítems para invitados
        (item.guestOnly || !item.authRequired);
      
      if (!hasAccess) continue;
      
      // Clonar el ítem para no modificar el original
      const menuItem = { ...item };
      
      // Procesar hijos recursivamente
      const children = await buildMenuTree(item._id);
      if (children.length > 0) {
        menuItem.children = children;
      }
      
      // Si es un ítem sin hijos y no tiene ruta, omitirlo
      if ((!menuItem.children || menuItem.children.length === 0) && !menuItem.path) {
        continue;
      }
      
      // Si es un ítem con hijos pero sin ruta, establecer la ruta del primer hijo con ruta
      if (menuItem.children && menuItem.children.length > 0 && !menuItem.path) {
        const firstChildWithPath = findFirstChildWithPath(menuItem.children);
        if (firstChildWithPath) {
          menuItem.path = firstChildWithPath;
        } else {
          continue; // Omitir si ningún hijo tiene ruta
        }
      }
      
      // Limpiar campos innecesarios para el frontend
      delete menuItem.__v;
      delete menuItem.roles;
      delete menuItem.permissions;
      delete menuItem.createdAt;
      delete menuItem.updatedAt;
      delete menuItem.isActive;
      delete menuItem.createdBy;
      delete menuItem.updatedBy;
      
      result.push(menuItem);
    }
    
    return result;
  };
  
  // Función auxiliar para encontrar la primera ruta en los hijos
  const findFirstChildWithPath = (children) => {
    for (const child of children) {
      if (child.path) return child.path;
      if (child.children && child.children.length > 0) {
        const path = findFirstChildWithPath(child.children);
        if (path) return path;
      }
    }
    return null;
  };
  
  return buildMenuTree();
};

// Método estático para inicializar el menú por defecto
menuItemSchema.statics.initializeDefaultMenu = async function(adminUserId) {
  const Role = mongoose.model('Role');
  
  // Obtener roles del sistema
  const adminRole = await Role.findOne({ name: 'Administrador' });
  const managerRole = await Role.findOne({ name: 'Gerente' });
  const employeeRole = await Role.findOne({ name: 'Empleado' });
  
  if (!adminRole || !managerRole || !employeeRole) {
    throw new Error('No se encontraron los roles del sistema. Ejecuta la inicialización de roles primero.');
  }
  
  // Elementos de menú por defecto
  const defaultMenuItems = [
    // Dashboard
    {
      title: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard',
      order: 0,
      showInSidebar: true,
      authRequired: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      isActive: true,
      roles: [adminRole._id, managerRole._id, employeeRole._id]
    },
    
    // Perfil
    {
      title: 'Mi Perfil',
      icon: 'person',
      path: '/profile',
      order: 100,
      showInSidebar: true,
      authRequired: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      isActive: true,
      roles: [adminRole._id, managerRole._id, employeeRole._id]
    },
    
    // Proyectos
    {
      title: 'Proyectos',
      icon: 'folder',
      path: '/projects',
      order: 200,
      showInSidebar: true,
      authRequired: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      isActive: true,
      roles: [adminRole._id, managerRole._id]
    },
    
    // Configuración (solo para administradores)
    {
      title: 'Configuración',
      icon: 'settings',
      order: 1000,
      showInSidebar: true,
      authRequired: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      isActive: true,
      roles: [adminRole._id],
      // Los hijos se agregarán después
      children: []
    },
    
    // Elementos de configuración (hijos)
    {
      title: 'Usuarios',
      icon: 'people',
      path: '/settings/users',
      order: 10,
      showInSidebar: false,
      authRequired: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      isActive: true,
      roles: [adminRole._id]
    },
    {
      title: 'Roles',
      icon: 'admin_panel_settings',
      path: '/settings/roles',
      order: 20,
      showInSidebar: false,
      authRequired: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      isActive: true,
      roles: [adminRole._id]
    },
    {
      title: 'Ubicaciones',
      icon: 'location_on',
      path: '/settings/locations',
      order: 30,
      showInSidebar: false,
      authRequired: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      isActive: true,
      roles: [adminRole._id]
    },
    {
      title: 'Menú',
      icon: 'menu',
      path: '/settings/menu',
      order: 40,
      showInSidebar: false,
      authRequired: true,
      createdBy: adminUserId,
      updatedBy: adminUserId,
      isActive: true,
      roles: [adminRole._id]
    }
  ];
  
  // Primero, crear todos los ítems de menú sin hijos
  const createdItems = [];
  
  for (const item of defaultMenuItems) {
    // Si el ítem tiene hijos, los procesaremos después
    const children = item.children || [];
    delete item.children;
    
    const createdItem = await this.findOneAndUpdate(
      { path: item.path || null, parent: null },
      item,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    // Si el ítem tenía hijos, los guardamos para procesarlos después
    if (children.length > 0) {
      createdItem.children = [];
      
      for (const child of children) {
        const createdChild = await this.findOneAndUpdate(
          { path: child.path, parent: createdItem._id },
          { ...child, parent: createdItem._id },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        createdItem.children.push(createdChild._id);
      }
      
      await createdItem.save();
    }
    
    createdItems.push(createdItem);
  }
  
  console.log('Menú por defecto inicializado correctamente');
  return createdItems;
};

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
