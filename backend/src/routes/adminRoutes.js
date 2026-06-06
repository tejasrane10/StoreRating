const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    createStore,
    getStoreById,
    dashboard,
    getAllStores,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Users
router.get('/users', auth, admin, getAllUsers);
router.get('/users/:id', auth, admin, getUserById);
router.post('/users', auth, admin, createUser);
router.put('/users/:id', auth, admin, updateUser);
router.delete('/users/:id', auth, admin, deleteUser);

// Stores
router.get('/stores', auth, admin, getAllStores);
router.get('/stores/:id', auth, admin, getStoreById);
router.post('/stores', auth, admin, createStore);

// Dashboard
router.get('/dashboard', auth, admin, dashboard);

module.exports = router;
