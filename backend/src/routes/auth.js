const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// RUTAS PÚBLICAS
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// RUTAS PARA RESTABLECER CONTRASEÑA
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// RUTAS PROTEGIDAS (requieren autenticación)
router.use(authController.protect);

// RUTAS PARA USUARIOS AUTENTICADOS
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);
router.patch('/update-password', authController.updatePassword);

// RUTAS PARA ADMINISTRADORES
router.use(authController.restrictTo('admin'));

// Aquí irían rutas adicionales solo para administradores

module.exports = router;
