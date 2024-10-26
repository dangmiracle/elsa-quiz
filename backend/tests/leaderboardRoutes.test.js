const request = require('supertest');
const app = require('../app');
const prisma = require('../config/database');
const redisClient = require('../config/redis'); // Redis client
const rabbitmqConnection = require('../config/rabbitmq'); // RabbitMQ client

// Mock ioredis and amqplib
jest.mock('ioredis');
jest.mock('amqplib');

// Mock Prisma database interactions
jest.mock('../config/database', () => ({
    userQuizScore: {
        groupBy: jest.fn(),
        findMany: jest.fn(),
    },
}));

jest.spyOn(console, 'log').mockImplementation(() => {});


describe('Leaderboard Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/leaderboards/global', () => {
        it('should fetch the global leaderboard', async () => {
            redisClient.get.mockImplementation((key, callback) => callback(null, null)); // Mock Redis cache miss
            prisma.userQuizScore.groupBy.mockResolvedValue([
                { userId: 'user123', _sum: { score: 50 } },
            ]);

            const res = await request(app).get('/api/v1/leaderboards/global');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data[0]).toHaveProperty('userId', 'user123');
        });
    });

    describe('GET /api/v1/leaderboards/:quizId', () => {
        it('should fetch the leaderboard for a specific quiz', async () => {
            redisClient.get.mockImplementation((key, callback) => callback(null, null)); // Mock Redis cache miss
            prisma.userQuizScore.findMany.mockResolvedValue([
                {
                    userId: 'user123',
                    score: 30,
                },
            ]);

            const res = await request(app).get('/api/v1/leaderboards/quiz123');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data[0]).toHaveProperty('userId', 'user123');
        });
    });
});

// Close Redis and RabbitMQ connections after all tests in this suite
afterAll(async () => {
    if (redisClient && typeof redisClient.quit === 'function') {
        await redisClient.quit();
    }

    if (rabbitmqConnection && typeof rabbitmqConnection.close === 'function') {
        await rabbitmqConnection.close();
    }
});
