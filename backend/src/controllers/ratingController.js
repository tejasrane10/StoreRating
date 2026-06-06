const db = require('../config/db');

// Create a new rating
exports.createRating = (req, res) => {
    try {
        const { store_id, user_id, rating, comment } = req.body;

        if (!store_id || !user_id || !rating) {
            return res.status(400).json({ error: 'store_id, user_id, and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const query = `
            INSERT INTO ratings (store_id, user_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `;

        db.query(query, [store_id, user_id, rating, comment || ''], (error, result) => {
            if (error) {
                console.error('Error creating rating:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(201).json({ 
                message: 'Rating created successfully',
                id: result.insertId 
            });
        });
    } catch (error) {
        console.error('Unexpected error in createRating:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all ratings
exports.getAllRatings = (req, res) => {
    try {
        const query = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at as date,
                r.store_id,
                r.user_id,
                u.name as user,
                u.email as userEmail,
                s.name as storeName,
                s.email as storeEmail,
                s.address as storeAddress
            FROM ratings r
            LEFT JOIN users u ON u.id = r.user_id
            LEFT JOIN stores s ON s.id = r.store_id
            ORDER BY r.created_at DESC
        `;

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching all ratings:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error in getAllRatings:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all ratings for a specific store
exports.getStoreRatings = (req, res) => {
    try {
        const { store_id } = req.params;

        const query = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at as date,
                u.name as user,
                u.email as userEmail
            FROM ratings r
            LEFT JOIN users u ON u.id = r.user_id
            WHERE r.store_id = ?
            ORDER BY r.created_at DESC
        `;

        db.query(query, [store_id], (error, results) => {
            if (error) {
                console.error('Error fetching store ratings:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error in getStoreRatings:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all ratings by a specific user
exports.getUserRatings = (req, res) => {
    try {
        const { user_id } = req.params;

        const query = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at as date,
                r.store_id,
                s.name as storeName,
                s.email as storeEmail,
                s.address as storeAddress
            FROM ratings r
            LEFT JOIN stores s ON s.id = r.store_id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;

        db.query(query, [user_id], (error, results) => {
            if (error) {
                console.error('Error fetching user ratings:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error in getUserRatings:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a rating
exports.updateRating = (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!rating) {
            return res.status(400).json({ error: 'Rating is required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const query = `
            UPDATE ratings
            SET rating = ?, comment = ?
            WHERE id = ?
        `;

        db.query(query, [rating, comment || '', id], (error, result) => {
            if (error) {
                console.error('Error updating rating:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Rating not found' });
            }

            res.json({ message: 'Rating updated successfully' });
        });
    } catch (error) {
        console.error('Unexpected error in updateRating:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a rating
exports.deleteRating = (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM ratings WHERE id = ?';

        db.query(query, [id], (error, result) => {
            if (error) {
                console.error('Error deleting rating:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Rating not found' });
            }

            res.json({ message: 'Rating deleted successfully' });
        });
    } catch (error) {
        console.error('Unexpected error in deleteRating:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get rating by ID
exports.getRatingById = (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at as createdAt,
                r.store_id,
                r.user_id,
                u.name as userName,
                u.email as userEmail,
                s.name as storeName,
                s.email as storeEmail
            FROM ratings r
            LEFT JOIN users u ON u.id = r.user_id
            LEFT JOIN stores s ON s.id = r.store_id
            WHERE r.id = ?
        `;

        db.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error fetching rating:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'Rating not found' });
            }

            res.json(results[0]);
        });
    } catch (error) {
        console.error('Unexpected error in getRatingById:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
