/**
 * Clase personalizada para manejar errores operacionales
 * Los errores operacionales son aquellos que podemos predecir y manejar
 * Ejemplo: rutas no encontradas, validaciones fallidas, etc.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Captura el stack trace para un mejor manejo de errores
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Crea un error 400 (Bad Request)
   * @param {string} message - Mensaje de error
   * @returns {AppError} - Instancia de AppError
   */
  static badRequest(message = 'Solicitud incorrecta') {
    return new AppError(message, 400);
  }

  /**
   * Crea un error 401 (Unauthorized)
   * @param {string} message - Mensaje de error
   * @returns {AppError} - Instancia de AppError
   */
  static unauthorized(message = 'No autorizado') {
    return new AppError(message, 401);
  }

  /**
   * Crea un error 403 (Forbidden)
   * @param {string} message - Mensaje de error
   * @returns {AppError} - Instancia de AppError
   */
  static forbidden(message = 'Prohibido') {
    return new AppError(message, 403);
  }

  /**
   * Crea un error 404 (Not Found)
   * @param {string} message - Mensaje de error
   * @returns {AppError} - Instancia de AppError
   */
  static notFound(message = 'No encontrado') {
    return new AppError(message, 404);
  }

  /**
   * Crea un error 409 (Conflict)
   * @param {string} message - Mensaje de error
   * @returns {AppError} - Instancia de AppError
   */
  static conflict(message = 'Conflicto') {
    return new AppError(message, 409);
  }

  /**
   * Crea un error 422 (Unprocessable Entity)
   * @param {string} message - Mensaje de error
   * @returns {AppError} - Instancia de AppError
   */
  static unprocessableEntity(message = 'Entidad no procesable') {
    return new AppError(message, 422);
  }

  /**
   * Crea un error 500 (Internal Server Error)
   * @param {string} message - Mensaje de error
   * @returns {AppError} - Instancia de AppError
   */
  static internal(message = 'Error interno del servidor') {
    return new AppError(message, 500);
  }

  /**
   * Crea un error 503 (Service Unavailable)
   * @param {string} message - Mensaje de error
   * @returns {AppError} - Instancia de AppError
   */
  static serviceUnavailable(message = 'Servicio no disponible') {
    return new AppError(message, 503);
  }

  /**
   * Crea un error de validación
   * @param {Array} errors - Array de errores de validación
   * @returns {AppError} - Instancia de AppError con los errores de validación
   */
  static validationError(errors = []) {
    const error = new AppError('Error de validación', 422);
    error.errors = errors;
    return error;
  }
}

module.exports = AppError;
