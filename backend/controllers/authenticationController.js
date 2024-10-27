// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database'); // Assuming Prisma is used

const generateToken = (user) => {
    return jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.login = async (req, res) => {
    const { username } = req.body;

    try {
        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { username },
        });

        // If not, create a new user
        if (!user) {
            user = await prisma.user.create({
                data: { username,
                    email: `${username}@default.com` },
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            data: {
                userId: user.id,
                username: user.username,
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Authentication failed' });
    }
};
