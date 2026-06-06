const db = require('../config/db');
const bcrypt = require('bcrypt');

const allowedRoles = ['USER', 'ADMIN', 'STORE_OWNER'];

exports.getAllUsers = async (req, res) => {
    try {
        const { search, sort, order, page, limit } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 10);
        const offset = (pageNum - 1) * limitNum;

        let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
        const params = [];

        // Search filter
        if (search && search.trim()) {
            query += ' AND (name LIKE ? OR email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Sorting
        const allowedSortFields = ['name', 'email', 'role'];
        const sortField = sort && allowedSortFields.includes(sort) ? sort : 'id';
        const sortOrder = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortField} ${sortOrder}`;

        // Pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
            const countParams = [];
            if (search && search.trim()) {
                countQuery += ' AND (name LIKE ? OR email LIKE ?)';
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm);
            }

            db.query(countQuery, countParams, (countErr, countResults) => {
                if (countErr) {
                    console.error('Error counting users:', countErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const total = countResults[0]?.total || 0;
                const totalPages = Math.ceil(total / limitNum);

                res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                res.json({
                    data: results,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages,
                    },
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error in getAllUsers:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.createUser = async (req, res) => {
    // Accept frontend field names and normalize
    const { fullName, name: altName, email, password, address, role, status } = req.body || {};
    const userName = fullName || altName;

    if (!userName || !email || !password || !address) {
        return res.status(400).json({ error: 'Name, email, password and address are required' });
    }

    // Map frontend role values to backend role constants
    const roleMap = {
        user: 'USER',
        storeOwner: 'STORE_OWNER',
        admin: 'ADMIN',
        USER: 'USER',
        STORE_OWNER: 'STORE_OWNER',
        ADMIN: 'ADMIN',
    };

    const normalizedRole = roleMap[String(role || '').trim()] || 'USER';

    if (!allowedRoles.includes(normalizedRole)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users
            (
                name,
                email,
                password,
                address,
                role
            )
            VALUES
            (?,?,?,?,?)
        `;

        db.query(
            query,
            [userName, email, hashedPassword, address, normalizedRole],
            (error, result) => {
                if (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ error: 'Email already exists' });
                    }

                    return res.status(500).json(error);
                }

                // Return created user info (without password)
                const createdUser = {
                    id: result.insertId || null,
                    name: userName,
                    email,
                    address,
                    role: normalizedRole,
                    status: status || 'active',
                };

                res.json({ message: 'User Created', user: createdUser });
            }
        );
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createStore = (req, res) => {
    // Accept frontend field names
    const {
        storeName,
        storeEmail,
        storeAddress,
        ownerId,
        storeDescription,
        storeCategory,
        status,
        phone,
    } = req.body || {};

    const name = storeName || req.body.name;
    const email = storeEmail || req.body.email;
    const address = storeAddress || req.body.address;
    const owner_id = ownerId || req.body.owner_id || null;

    if (!name || !email || !address) {
        return res.status(400).json({ error: 'Store name, email and address are required' });
    }

    const query = `
    INSERT INTO stores
    (
      name,
      email,
      address,
      owner_id
    )
    VALUES
    (?,?,?,?)
    `;

    db.query(
        query,
        [name, email, address, owner_id],
        (error, result) => {
            if (error) {
                return res.status(500).json(error);
            }

            const created = {
                id: result.insertId || null,
                name,
                email,
                address,
                ownerId: owner_id,
                rating: 0,
                status: status || 'active',
                category: storeCategory || '',
                description: storeDescription || '',
                phone: phone || '',
            };

            res.json({ message: 'Store Created', store: created });
        }
    );
};

exports.dashboard =
(req,res)=>{

 const query =
 `
 SELECT

 (SELECT COUNT(*)
 FROM users)
 AS totalUsers,

 (SELECT COUNT(*)
 FROM stores)
 AS totalStores,

 (SELECT COUNT(*)
 FROM ratings)
 AS totalRatings
 `;

 db.query(
 query,
 (error,result)=>{

  if(error){

   return res
   .status(500)
   .json(error);

  }

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.json(
   result[0]
  );

 });

};

exports.getAllStores = (req, res) => {
    try {
        const { search, sort, order, page, limit } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 10);
        const offset = (pageNum - 1) * limitNum;

        let query = `
            SELECT
                s.id, s.name, s.email, s.address, s.owner_id AS ownerId,
                u.name AS ownerName,
                COALESCE(AVG(r.rating), 0) AS rating,
                COUNT(r.id) AS totalReviews
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            LEFT JOIN users u ON u.id = s.owner_id
            WHERE 1=1
        `;
        const params = [];

        // Search filter
        if (search && search.trim()) {
            query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' GROUP BY s.id';

        // Sorting
        const allowedSortFields = ['name', 'rating', 'totalReviews'];
        const sortField = sort && allowedSortFields.includes(sort) ? sort : 'id';
        const sortOrder = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY s.${sortField === 'rating' ? 'rating' : sortField === 'totalReviews' ? 'totalReviews' : 'id'} ${sortOrder}`;

        // Pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        db.query(query, params, (err, results) => {
            if (err) {
                console.warn('Aggregated stores query failed:', err && err.message ? err.message : err);
                // Fallback to simple query
                const simple = `SELECT id, name, email, address, owner_id AS ownerId FROM stores LIMIT ? OFFSET ?`;
                return db.query(simple, [limitNum, offset], (e2, rows) => {
                    if (e2) {
                        console.error('Error fetching stores (fallback):', e2);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    const out2 = rows.map((r) => ({
                        id: r.id,
                        name: r.name,
                        email: r.email,
                        address: r.address,
                        ownerId: r.ownerId || null,
                        ownerName: null,
                        rating: 0,
                        totalReviews: 0,
                        category: 'General',
                        phone: '',
                        description: '',
                        status: 'active',
                        reviews: [],
                    }));
                    return res.json({
                        data: out2,
                        pagination: {
                            page: pageNum,
                            limit: limitNum,
                            total: 0,
                            totalPages: 0,
                        },
                    });
                });
            }

            // Get total count for pagination
            let countQuery = `
                SELECT COUNT(DISTINCT s.id) as total FROM stores s
                WHERE 1=1
            `;
            const countParams = [];
            if (search && search.trim()) {
                countQuery += ' AND (s.name LIKE ? OR s.address LIKE ?)';
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm);
            }

            db.query(countQuery, countParams, (countErr, countResults) => {
                if (countErr) {
                    console.error('Error counting stores:', countErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const total = countResults[0]?.total || 0;
                const totalPages = Math.ceil(total / limitNum);

                const out = results.map((row) => ({
                    ...row,
                    rating: Number(row.rating) || 0,
                    totalReviews: Number(row.totalReviews) || 0,
                    ownerId: row.ownerId || null,
                    category: row.category || 'General',
                    phone: row.phone || '',
                    description: row.description || '',
                    status: row.status || 'active',
                    reviews: [], // Empty array for list view, populated in detail view
                }));

                res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                res.json({
                    data: out,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages,
                    },
                });
            });
        });
    } catch (ex) {
        console.error('Unexpected error in getAllStores:', ex);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Get user details by ID
exports.getUserById = (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const query = 'SELECT id, name, email, address, role FROM users WHERE id = ?';

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(results[0]);
        });
    } catch (error) {
        console.error('Unexpected error in getUserById:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get store details by ID
exports.getStoreById = (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid store ID' });
        }

        const query = `
            SELECT
                s.id, s.name, s.email, s.address, s.owner_id AS ownerId,
                u.name AS ownerName,
                u.email AS ownerEmail,
                COALESCE(AVG(r.rating), 0) AS averageRating,
                COUNT(r.id) AS totalReviews
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            LEFT JOIN users u ON u.id = s.owner_id
            WHERE s.id = ?
            GROUP BY s.id
        `;

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error fetching store:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'Store not found' });
            }

            const store = results[0];
            // Get all reviews for this store
            const reviewsQuery = `
                SELECT r.id, r.rating, r.comment, u.name as user, u.email as userEmail, r.created_at as date
                FROM ratings r
                LEFT JOIN users u ON u.id = r.user_id
                WHERE r.store_id = ?
                ORDER BY r.created_at DESC
            `;

            db.query(reviewsQuery, [id], (reviewErr, reviews) => {
                if (reviewErr) {
                    console.error('Error fetching reviews:', reviewErr);
                    return res.json({
                        ...store,
                        rating: Number(store.averageRating) || 0,
                        totalReviews: Number(store.totalReviews) || 0,
                        reviews: [],
                    });
                }

                res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                res.json({
                    ...store,
                    rating: Number(store.averageRating) || 0,
                    totalReviews: Number(store.totalReviews) || 0,
                    category: store.category || 'General',
                    phone: store.phone || '',
                    description: store.description || '',
                    status: store.status || 'active',
                    createdAt: store.createdAt || new Date().toISOString(),
                    reviews: reviews || [],
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error in getStoreById:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update user
exports.updateUser = (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address, role, status } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        if (!name || !email || !address) {
            return res.status(400).json({ error: 'Name, email, and address are required' });
        }

        const query = `
            UPDATE users
            SET name = ?, email = ?, address = ?, role = ?
            WHERE id = ?
        `;

        const roleMap = {
            user: 'USER',
            storeOwner: 'STORE_OWNER',
            admin: 'ADMIN',
            USER: 'USER',
            STORE_OWNER: 'STORE_OWNER',
            ADMIN: 'ADMIN',
        };

        const normalizedRole = roleMap[String(role || '').trim()] || 'USER';

        db.query(query, [name, email, address, normalizedRole, id], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                console.error('Error updating user:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User updated successfully' });
        });
    } catch (error) {
        console.error('Unexpected error in updateUser:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete user
exports.deleteUser = (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const query = 'DELETE FROM users WHERE id = ?';

        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Error deleting user:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        });
    } catch (error) {
        console.error('Unexpected error in deleteUser:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
