const prisma = require('../config/database');
const redis = require('../config/redis');

exports.getGlobalLeaderboard = async (req, res) => {
    const cacheKey = `global:leaderboard`;
    redis.get(cacheKey, async (err, data) => {
        if (err) return res.status(500).json({ success: false, message: 'Redis error' });
        if (data) return res.status(200).json({ success: true, data: JSON.parse(data) });

        try {
            const leaderboard = await prisma.userQuizScore.groupBy({
                by: ['userId'],
                _sum: { score: true },
                orderBy: { _sum: { score: 'desc' } },
            });

            // Fetch user information for each userId to include in the leaderboard
            const leaderboardWithUsernames = await Promise.all(
                leaderboard.map(async (entry) => {
                    const user = await prisma.user.findUnique({
                        where: { id: entry.userId },
                        select: { username: true },
                    });
                    return {
                        userId: entry.userId,
                        username: user ? user.username : 'Unknown User',
                        score: entry._sum.score,
                    };
                })
            );

            redis.setex(cacheKey, 3600, JSON.stringify(leaderboardWithUsernames));
            res.status(200).json({ success: true, data: leaderboardWithUsernames });
        } catch (error) {
            console.error('Error fetching global leaderboard:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
        }
    });
};

exports.getQuizLeaderboard = async (req, res) => {
    const { quizId } = req.params;
    const cacheKey = `leaderboard:${quizId}`;
    redis.get(cacheKey, async (err, data) => {
        if (err) return res.status(500).json({ success: false, message: 'Redis error' });
        if (data) return res.status(200).json({ success: true, data: JSON.parse(data) });

        try {
            const leaderboard = await prisma.userQuizScore.findMany({
                where: { quizId },
                include: { user: { select: { username: true } } },
                orderBy: { score: 'desc' },
            });

            // Structure the leaderboard data consistently with the global leaderboard
            const leaderboardWithScores = leaderboard.map((entry) => ({
                userId: entry.userId,
                username: entry.user.username,
                score: entry.score,
            }));

            redis.setex(cacheKey, 3600, JSON.stringify(leaderboardWithScores));
            res.status(200).json({ success: true, data: leaderboardWithScores });
        } catch (error) {
            console.error('Error fetching quiz leaderboard:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
        }
    });
};


