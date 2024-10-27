const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { swaggerUi } = require('./config/swagger');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('docs/swagger.yaml');  // Load your YAML file
const authenticateJWT = require('./middleware/authMiddleware');

const app = express();
app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authenticateJWT,userRoutes);
app.use('/api/v1/quizzes', authenticateJWT,quizRoutes);
app.use('/api/v1/leaderboards', authenticateJWT,leaderboardRoutes);
app.use('/api/v1/admin', authenticateJWT,adminRoutes);
module.exports = app; // Only export the app
