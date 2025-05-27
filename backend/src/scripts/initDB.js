#!/usr/bin/env node

/**
 * Script de inicialización de la base de datos
 * 
 * Este script se encarga de:
 * 1. Conectar a la base de datos
 * 2. Crear roles por defecto
 * 3. Crear ubicaciones por defecto
 * 4. Crear proyectos de ejemplo
 * 5. Crear menú por defecto
 * 6. Crear un usuario administrador
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { connectDB, disconnectDB } = require('../config/database');

// Importar modelos
const User = require('../models/User');
const Role = require('../models/Role');
const Location = require('../models/Location');
const Project = require('../models/Project');
const MenuItem = require('../models/Menu');

// Configuración
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Admin';
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'Sistema';

// Función principal
const initializeDatabase = async () => {
  try {
    logger.info('Iniciando inicialización de la base de datos...');
    
    // Conectar a la base de datos
    await connectDB();
    
    // Inicializar roles
    logger.info('Inicializando roles...');
    await Role.initializeSystemRoles();
    
    // Inicializar ubicaciones
    logger.info('Inicializando ubicaciones...');
    await Location.initializeDefaultLocations();
    
    // Obtener la ubicación por defecto (la primera que se creó)
    const defaultLocation = await Location.findOne().sort({ createdAt: 1 });
    
    if (!defaultLocation) {
      throw new Error('No se pudo encontrar una ubicación por defecto');
    }
    
    // Inicializar proyectos
    logger.info('Inicializando proyectos de ejemplo...');
    await Project.initializeSampleProjects();
    
    // Inicializar menú
    logger.info('Inicializando menú...');
    await MenuItem.initializeDefaultMenu();
    
    // Verificar si ya existe un usuario administrador
    const adminRole = await Role.findOne({ name: 'Administrador' });
    
    if (!adminRole) {
      throw new Error('No se pudo encontrar el rol de administrador');
    }
    
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!adminUser) {
      logger.info('Creando usuario administrador...');
      
      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Crear el usuario administrador
      adminUser = new User({
        username: ADMIN_EMAIL.split('@')[0],
        email: ADMIN_EMAIL,
        password: hashedPassword,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        location: defaultLocation._id,
        isAdmin: true,
        active: true,
        emailVerified: true,
        createdBy: null, // Es el primer usuario
        updatedBy: null
      });
      
      await adminUser.save();
      
      // Asignar el rol de administrador al usuario
      const UserRole = require('../models/UserRole');
      await UserRole.assignRole(
        adminUser._id,
        adminRole._id,
        defaultLocation._id,
        null, // Sin proyecto específico
        adminUser._id, // Asignado por sí mismo
        {
          startDate: new Date(),
          notes: 'Usuario administrador inicial'
        }
      );
      
      logger.info(`Usuario administrador creado con éxito. Email: ${ADMIN_EMAIL}, Contraseña: ${ADMIN_PASSWORD}`);
    } else {
      logger.info('El usuario administrador ya existe en la base de datos');
    }
    
    logger.info('Inicialización de la base de datos completada con éxito');
    
  } catch (error) {
    logger.error(`Error durante la inicialización de la base de datos: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  } finally {
    // Cerrar la conexión a la base de datos
    await disconnectDB();
    process.exit(0);
  }
};

// Ejecutar la inicialización
initializeDatabase();
