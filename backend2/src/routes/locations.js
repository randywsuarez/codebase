const express = require('express');
const router = express.Router();

// Ruta de ejemplo para ubicaciones
router.get('/', (req, res) => {
  res.json({ message: 'Locations endpoint' });
});

module.exports = router;
