// backend/src/config/i18n.js
const i18next = require('../../node_modules/i18next');
const FsBackend = require('i18next-fs-backend');
const path = require('path');
const fs = require('fs');

// Obtener el directorio actual
const localesPath = path.join(__dirname, '../locales');

// Asegurarse de que el directorio de locales exista
if (!fs.existsSync(localesPath)) {
  console.warn('El directorio de locales no existe:', localesPath);
}

// Inicializar i18next
i18next
  .use(FsBackend)
  .init({
    // debug: process.env.NODE_ENV === 'development', // Descomenta para ver logs en desarrollo
    initImmediate: false, // false: Carga las traducciones antes de que se puedan usar (recomendado para backend)
    fallbackLng: 'en',    // Idioma de respaldo si una traducción no se encuentra
    lng: 'es',            // Idioma predeterminado (puede ser sobrescrito por petición)
    supportedLngs: ['en', 'es'], // Idiomas soportados (puedes añadir más aquí)
    ns: ['emails'],       // Namespaces (usaremos 'emails' para nuestras traducciones de correo)
    defaultNS: 'emails',  // Namespace por defecto
    backend: {
      loadPath: path.join(localesPath, '{{lng}}/{{ns}}.json'), // Ruta a tus archivos de traducción
    },
    interpolation: {
      escapeValue: false, // Pug ya se encarga del escape, o no es necesario para texto de email
    }
  }, (err, t) => {
    if (err) return console.error('Error al inicializar i18next:', err);
    console.log('i18next está inicializado y listo.');
  });

module.exports = i18next;
