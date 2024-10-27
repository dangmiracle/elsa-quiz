module.exports = {
    connect: jest.fn().mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(),
            consume: jest.fn(),
            ack: jest.fn(),
        }),
        close: jest.fn(),
    }),
};