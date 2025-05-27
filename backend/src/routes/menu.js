const express = require('express');
const router = express.Router();

// Ruta de ejemplo para el menú
router.get('/', (req, res) => {
  res.json({ message: 'Menu endpoint' });
});

module.exports = router;
