const { createClient } = require('@maxmind/geoip2-node');
const uaParser = require('ua-parser-js');
const User = require('../models/User');
const logger = require('../utils/logger');
const AppError = require('../utils/appError');

// Configuración del cliente de MaxMind (GeoIP2)
let geoipReader;

try {
  // Cargar la base de datos de MaxMind (debes tener el archivo .mmdb en tu proyecto)
  // Puedes descargar la base de datos de MaxMind o usar un servicio como ipstack o ipinfo
  // Por ahora, lo dejamos como null y manejamos el caso cuando no está disponible
  geoipReader = null;
  // Si tienes la base de datos, descomenta la siguiente línea:
  // geoipReader = createClient.reader(path.join(__dirname, '../../geoip/GeoLite2-City.mmdb'));
} catch (error) {
  logger.warn('No se pudo cargar la base de datos de GeoIP. La detección de ubicación estará limitada.');
  geoipReader = null;
}

/**
 * Middleware para detectar información del dispositivo y ubicación del usuario
 * y verificar si es un dispositivo conocido o no
 */
const detectDevice = async (req, res, next) => {
  try {
    // Solo procesar si el usuario está autenticado
    if (!req.user) return next();
    
    const user = req.user;
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    // Parsear el User-Agent
    const ua = uaParser(userAgent);
    
    // Obtener información de ubicación (si está disponible)
    let location = {};
    
    if (geoipReader && ip) {
      try {
        const geoData = await geoipReader.city(ip);
        location = {
          country: geoData.country?.names?.en || 'Desconocido',
          city: geoData.city?.names?.en || 'Desconocida',
          region: geoData.subdivisions?.[0]?.names?.en || 'Desconocida',
          latitude: geoData.location?.latitude,
          longitude: geoData.location?.longitude,
          timezone: geoData.location?.timeZone || 'UTC'
        };
      } catch (error) {
        logger.warn(`No se pudo obtener la ubicación para la IP ${ip}: ${error.message}`);
      }
    }
    
    // Crear un ID único para el dispositivo basado en el user agent y la IP
    const deviceId = crypto
      .createHash('md5')
      .update(`${userAgent}${ip}`)
      .digest('hex');
    
    // Información del dispositivo
    const deviceInfo = {
      id: deviceId,
      ip,
      browser: ua.browser.name ? `${ua.browser.name} ${ua.browser.version}` : 'Desconocido',
      os: ua.os.name ? `${ua.os.name} ${ua.os.version || ''}`.trim() : 'Desconocido',
      device: ua.device.type || 'Desktop',
      userAgent,
      location,
      lastUsed: new Date(),
      isNew: true
    };
    
    // Verificar si el dispositivo es conocido
    if (user.knownDevices && user.knownDevices.some(device => device.id === deviceId)) {
      // Dispositivo conocido, actualizar la fecha de último uso
      deviceInfo.isNew = false;
      await User.updateOne(
        { _id: user._id, 'knownDevices.id': deviceId },
        { $set: { 'knownDevices.$.lastUsed': new Date() } }
      );
    } else {
      // Dispositivo nuevo, agregar a la lista de dispositivos conocidos
      await User.findByIdAndUpdate(
        user._id,
        { $push: { knownDevices: deviceInfo } },
        { new: true, runValidators: true }
      );
      
      // Agregar información del dispositivo a la solicitud para su uso posterior
      req.newDevice = deviceInfo;
      
      // Si es un dispositivo nuevo, podrías querer notificar al usuario
      if (process.env.NODE_ENV === 'production' && user.notificationPreferences?.email?.loginFromNewDevice) {
        try {
          const resetUrl = `${req.protocol}://${req.get('host')}/account/security`;
          await new Email(user, resetUrl).sendLoginNotification(deviceInfo);
        } catch (error) {
          logger.error('Error al enviar notificación de nuevo dispositivo:', error);
        }
      }
    }
    
    // Adjuntar información del dispositivo a la solicitud para su uso en controladores posteriores
    req.deviceInfo = deviceInfo;
    
    next();
  } catch (error) {
    logger.error('Error en el middleware de detección de dispositivo:', error);
    next(); // Continuar incluso si hay un error
  }
};

module.exports = detectDevice;
