const express = require('express');
const router = express.Router();

const { getAllStores } = require('../controllers/adminController');

// Public stores listing
router.get('/', getAllStores);

module.exports = router;
