const storeOwner = (req, res, next) => {
    const role = (req.user && (req.user.role || '')) || '';
    if (role && String(role).toUpperCase() === 'STORE_OWNER') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied, store owner only' });
};

module.exports = storeOwner;
