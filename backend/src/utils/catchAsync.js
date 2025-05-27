/**
 * Envuelve una función asíncrona para manejar errores de manera centralizada
 * @param {Function} fn - Función asíncrona a envolver
 * @returns {Function} - Función middleware de Express
 */
module.exports = (fn) => {
  return (req, res, next) => {
    // Ejecutar la función asíncrona y capturar cualquier error
    // Si hay un error, pasarlo al siguiente middleware (manejador de errores)
    fn(req, res, next).catch(next);
  };
};
