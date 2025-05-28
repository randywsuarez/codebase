const express = require('express');
const router = express.Router();

// Ruta de ejemplo para roles
router.get('/', (req, res) => {
  res.json({ message: 'Roles endpoint' });
});

module.exports = router;
