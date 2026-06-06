const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authorizationHeader = req.headers.authorization || '';
    const token = authorizationHeader.startsWith('Bearer ')
     ? authorizationHeader.slice(7)
     : authorizationHeader;

   if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
   }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }   
};

module.exports = authMiddleware;