const express = require('express');
const path = require('path');
const quizRoutes = require('./routes/quizRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { swaggerUi } = require('./config/swagger');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('docs/swagger.yaml');  // Load your YAML file

const app = express();

// Middleware
app.use(express.json());

// Serve the static HTML file at the root URL
app.use(express.static(path.join(__dirname, 'public')));

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Register routes with version prefix
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/leaderboards', leaderboardRoutes);
app.use('/api/v1/admin', adminRoutes);

module.exports = app; // Only export the app
