const express = require('express');
const router = express.Router();

const {
    createRating,
    getAllRatings,
    getStoreRatings,
    getUserRatings,
    updateRating,
    deleteRating,
    getRatingById,
} = require('../controllers/ratingController');

// Public routes (no auth required for testing)
router.get('/', getAllRatings);
router.get('/store/:store_id', getStoreRatings);
router.get('/user/:user_id', getUserRatings);

// Protected routes
router.post('/', createRating);
router.get('/:id', getRatingById);
router.put('/:id', updateRating);
router.delete('/:id', deleteRating);

module.exports = router;
