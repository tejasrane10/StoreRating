const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = [
	process.env.FRONTEND_URL || 'http://localhost:5173'
];

app.use(cors({
	origin: allowedOrigins,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok', time: new Date().toISOString() });
});

module.exports = app;
