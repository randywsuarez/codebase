const express = require('express');
const router = express.Router();

// Ruta de ejemplo para proyectos
router.get('/', (req, res) => {
  res.json({ message: 'Projects endpoint' });
});

module.exports = router;
