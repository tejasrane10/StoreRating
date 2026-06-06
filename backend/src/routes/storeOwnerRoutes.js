const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

const {
    getStoreById,
} = require('../controllers/adminController');

// Get stores owned by the current store owner
router.get('/mystores', (req, res) => {
    try {
        // Get user ID from query param for testing, or from auth if available
        const userId = req.query.userId ? parseInt(req.query.userId) : (req.user?.id || 2);

        const query = `
            SELECT
                s.id, s.name, s.email, s.address, s.owner_id AS ownerId,
                u.name AS ownerName,
                u.email AS ownerEmail,
                COALESCE(AVG(r.rating), 0) AS rating,
                COUNT(r.id) AS totalReviews
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            LEFT JOIN users u ON u.id = s.owner_id
            WHERE s.owner_id = ?
            GROUP BY s.id
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching stores:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const out = results.map((row) => ({
                ...row,
                rating: Number(row.rating) || 0,
                totalReviews: Number(row.totalReviews) || 0,
                ownerId: row.ownerId || null,
                category: row.category || 'General',
                phone: row.phone || '',
                description: row.description || '',
                status: row.status || 'active',
                reviews: [],
            }));

            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.json(out);
        });
    } catch (error) {
        console.error('Unexpected error in mystores:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get store details with reviews for store owner
router.get('/stores/:id', (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId) : (req.user?.id || 2);
    const storeId = req.params.id;

    // First verify the store belongs to the user
    const verifyQuery = 'SELECT owner_id FROM stores WHERE id = ?';
    db.query(verifyQuery, [storeId], (verifyErr, verifyResults) => {
        if (verifyErr) {
            console.error('Error verifying store ownership:', verifyErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (verifyResults.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }

        if (verifyResults[0].owner_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Store belongs to user, proceed with getStoreById
        getStoreById(req, res);
    });
});

module.exports = router;
