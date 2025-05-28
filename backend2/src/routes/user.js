const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// RUTAS PÚBLICAS
router.post('/signup', authController.signup);

// RUTAS PROTEGIDAS (requieren autenticación)
router.use(authController.protect);

// Rutas para el usuario autenticado
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);
router.patch('/update-password', authController.updatePassword);

// Rutas para dispositivos del usuario
router.get('/me/devices', userController.getMyDevices);
router.delete('/devices/:deviceId', userController.deleteDevice);

// Rutas para preferencias de notificación
router.patch('/me/notification-preferences', userController.updateNotificationPreferences);

// RUTAS RESTRINGIDAS A ADMINISTRADORES
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
