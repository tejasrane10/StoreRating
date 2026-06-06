require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const storeRoutes = require('./routes/storeRoutes');
app.use('/stores', storeRoutes);

const ratingRoutes = require('./routes/ratingRoutes');
app.use('/ratings', ratingRoutes);

const storeOwnerRoutes = require('./routes/storeOwnerRoutes');
app.use('/store-owner', storeOwnerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
