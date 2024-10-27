const prisma = require('../config/database');
const redis = require('../config/redis'); // Assuming redis connection is already set up

exports.getTotalScore = async (req, res) => {
    const { username, userId } = req.authenticatedUser; // Extract the username from the authenticated user
    const redisKey = `user:${username}:score`;

    try {
        // Check Redis for the user's total score
        let userTotalScore = await redis.get(redisKey);

        if (userTotalScore !== null) {
            // If score is found in Redis, parse and return it
            userTotalScore = parseInt(userTotalScore, 10);
            return res.status(200).json({ success: true, score: userTotalScore });
        }

        // If score is not in Redis, calculate it from the database
        const cumulativeScore = await prisma.userQuizScore.aggregate({
            _sum: { score: true },
            where: { userId }
        });

        // Set the calculated score in Redis for future requests
        userTotalScore = cumulativeScore._sum.score || 0;
        await redis.set(redisKey, userTotalScore);

        // Return the calculated score in the response
        res.status(200).json({ success: true, score: userTotalScore });
    } catch (error) {
        console.error('Error fetching total score:', error);
        res.status(500).json({ success: false, message: 'Error fetching total score' });
    }
};
