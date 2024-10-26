const amqp = require('amqplib/callback_api');
const prisma = require('../config/database');
const redisClient = require('../config/redis');

amqp.connect(process.env.RABBITMQ_URL, (err, connection) => {
    if (err) throw err;

    connection.createChannel((error, channel) => {
        if (error) throw error;

        const queue = 'score_updates_queue';
        channel.assertQueue(queue, { durable: true });

        channel.consume(queue, async (msg) => {
            const { userId, quizId, score, scoreIncrement } = JSON.parse(msg.content.toString());
            console.log(`Received score update for userId ${userId}, quizId ${quizId}`);

            await recalculateLeaderboardFast(quizId, userId, scoreIncrement);

            try {
                await prisma.userQuizScore.update({ where: { userId_quizId: { userId, quizId } }, data: { score } });
                await recalculateLeaderboardAccurate(quizId);
                console.log(`Score updated and leaderboard recalculated for quizId ${quizId}`);
                channel.ack(msg);
            } catch (error) {
                console.error('Error updating score or recalculating leaderboard:', error);
                channel.nack(msg);
            }
        });
    });
});

async function recalculateLeaderboardFast(quizId, userId, scoreIncrement) {
    try {
        const cacheKey = `leaderboard:${quizId}`;
        let leaderboard = await redisClient.get(cacheKey);
        leaderboard = leaderboard ? JSON.parse(leaderboard) : [];
        const userEntry = leaderboard.find(entry => entry.userId === userId);
        if (userEntry) userEntry.score += scoreIncrement;
        else leaderboard.push({ userId, score: scoreIncrement });
        leaderboard.sort((a, b) => b.score - a.score);
        await redisClient.setex(cacheKey, 3600, JSON.stringify(leaderboard));
    } catch (err) {
        console.error('Error during fast leaderboard recalculation:', err);
    }
}

async function recalculateLeaderboardAccurate(quizId) {
    try {
        const cacheKey = `leaderboard:${quizId}`;
        const leaderboard = await prisma.userQuizScore.findMany({
            where: { quizId },
            include: { user: { select: { username: true } } },
            orderBy: { score: 'desc' }
        });
        await redisClient.setex(cacheKey, 3600, JSON.stringify(leaderboard));
    } catch (err) {
        console.error('Error during accurate leaderboard recalculation:', err);
    }
}
