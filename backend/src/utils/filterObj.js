/**
 * Filtra un objeto para incluir solo los campos permitidos
 * @param {Object} obj - Objeto a filtrar
 * @param  {...String} allowedFields - Campos permitidos
 * @returns {Object} - Nuevo objeto con solo los campos permitidos
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  
  // Recorrer todas las claves del objeto
  Object.keys(obj).forEach((el) => {
    // Si el campo está en la lista de permitidos, lo incluimos en el nuevo objeto
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  
  return newObj;
};

module.exports = filterObj;
