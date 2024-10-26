// models/quizSession.js
const redis = require('../config/redis');

class QuizSession {
    static async addUserToSession(userId, quizId) {
        await redis.sadd(`quiz:${quizId}:users`, userId);
    }

    static async getUsersInSession(quizId) {
        return await redis.smembers(`quiz:${quizId}:users`);
    }

    static async updateUserScore(userId, quizId, score) {
        await redis.zincrby(`quiz:${quizId}:leaderboard`, score, userId);
    }

    static async getLeaderboard(quizId) {
        return await redis.zrevrange(`quiz:${quizId}:leaderboard`, 0, -1, 'WITHSCORES');
    }
}

module.exports = QuizSession;
