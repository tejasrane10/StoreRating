const admin = (req, res, next) => {
    const role = (req.user && (req.user.role || '')) || '';
    if (role && String(role).toUpperCase() === 'ADMIN') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied, admin only' });
};

module.exports = admin;