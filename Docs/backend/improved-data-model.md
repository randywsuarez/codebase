# Modelo de Datos Mejorado para el Backend

Este documento describe el modelo de datos mejorado para el backend, implementado con Mongoose para MongoDB, integrando la información de los archivos JSON del frontend.

## Modelos

### 1. User (Usuario)

Representa un usuario en el sistema.

```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  location: { 
    type: Schema.Types.ObjectId, 
    ref: 'Location',
    required: true 
  },
  active: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 2. Role (Rol)

Define los roles del sistema con sus permisos.

```javascript
{
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: {
    profile: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
    job: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
    salaryDetails: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
    timeOff: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
    documents: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
    training: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
    benefits: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
    settings: {
      roles: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
      users: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }],
      userRoles: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }]
    }
  },
  appliesTo: {
    locations: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Location' 
    }],
    projects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }]
  },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 3. UserRole (Rol de Usuario)

Relación entre usuarios, roles, ubicaciones y proyectos.

```javascript
{
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  role: { 
    type: Schema.Types.ObjectId, 
    ref: 'Role',
    required: true 
  },
  location: { 
    type: Schema.Types.ObjectId, 
    ref: 'Location',
    required: true 
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 4. Location (Ubicación)

Representa una ubicación física.

```javascript
{
  name: { type: String, required: true, unique: true },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 5. Project (Proyecto)

Representa un proyecto en el sistema.

```javascript
{
  name: { type: String, required: true },
  description: { type: String },
  location: { 
    type: Schema.Types.ObjectId, 
    ref: 'Location',
    required: true 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  members: [{
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    role: { 
      type: Schema.Types.ObjectId, 
      ref: 'Role' 
    },
    joinDate: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 6. Menu (Menú)

Define la estructura del menú de navegación.

```javascript
{
  title: { type: String, required: true },
  icon: { type: String },
  link: { type: String },
  order: { type: Number, default: 0 },
  parent: { 
    type: Schema.Types.ObjectId, 
    ref: 'Menu' 
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

## Relaciones

1. **Usuario -> Ubicación (Many-to-One)**
   - Un usuario pertenece a una ubicación.
   - Una ubicación puede tener muchos usuarios.

2. **Usuario <-> Rol (Many-to-Many a través de UserRole)**
   - Un usuario puede tener múltiples roles en diferentes contextos (ubicación/proyecto).
   - Un rol puede ser asignado a múltiples usuarios.

3. **Rol -> Permisos (Embedded)**
   - Los permisos están incrustados dentro del modelo Role.

4. **Proyecto -> Ubicación (Many-to-One)**
   - Un proyecto pertenece a una ubicación.
   - Una ubicación puede tener múltiples proyectos.

5. **Proyecto <-> Usuario (Many-to-Many a través de members)**
   - Un proyecto puede tener múltiples miembros (usuarios).
   - Un usuario puede ser miembro de múltiples proyectos.

6. **Menú -> Rol (Many-to-Many)**
   - Un ítem de menú puede ser visible para múltiples roles.
   - Un rol puede tener acceso a múltiples ítems de menú.

## Mejoras Implementadas

1. **Sistema de Permisos Granulares**:
   - Permisos detallados para cada módulo (profile, job, salaryDetails, etc.)
   - Soporte para operaciones CRUD en cada módulo

2. **Jerarquía de Ubicaciones y Proyectos**:
   - Los usuarios pueden tener diferentes roles en diferentes ubicaciones y proyectos
   - Soporte para herencia de permisos (ej: acceso a todos los proyectos en una ubicación)

3. **Auditoría**:
   - Campos createdAt y updatedAt en todos los modelos
   - Historial de inicios de sesión

4. **Menú Dinámico**:
   - Estructura jerárquica de menús
   - Control de acceso basado en roles
   - Ordenamiento personalizado de ítems

5. **Relaciones Mejoradas**:
   - Modelo UserRole para manejar la relación muchos a muchos entre usuarios y roles
   - Soporte para miembros de proyecto con roles específicos

## Migración de Datos

Para migrar los datos existentes de los archivos JSON al nuevo esquema, se recomienda crear scripts de migración que:

1. Primero importen las ubicaciones (locations.json)
2. Luego importen los proyectos (projects.json) con referencias a ubicaciones
3. Importar los roles (roles.json)
4. Importar los usuarios (users.json) con referencias a ubicaciones
5. Finalmente, importar las relaciones de usuario-rol (userRoles.json)

## Consideraciones de Seguridad

1. Las contraseñas deben almacenarse con hash (bcrypt recomendado)
2. Validar permisos en cada endpoint
3. Implementar rate limiting para prevenir ataques de fuerza bruta
4. Usar JWT para autenticación con expiración corta
5. Implementar refresh tokens para renovar la sesión

## Endpoints Recomendados

- `POST /api/auth/login` - Autenticación de usuario
- `POST /api/auth/refresh-token` - Renovar token de acceso
- `GET /api/users/me` - Obtener perfil del usuario actual
- `GET /api/menus` - Obtener menú según los roles del usuario
- `GET /api/projects` - Listar proyectos accesibles
- `GET /api/locations` - Listar ubicaciones accesibles
- `POST /api/user-roles` - Asignar rol a usuario (solo administradores)

Esta estructura proporciona una base sólida para construir un backend escalable y seguro que cumpla con los requisitos del sistema.
