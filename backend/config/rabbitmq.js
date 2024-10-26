const amqp = require('amqplib/callback_api');

let channel = null;

amqp.connect(process.env.RABBITMQ_URL, (error, connection) => {
    if (error) {
        throw new Error('Error connecting to RabbitMQ');
    }
    connection.createChannel((err, ch) => {
        if (err) throw new Error('Error creating RabbitMQ channel');
        console.log('Connected to RabbitMQ');
        channel = ch;
    });
});

module.exports = {
    sendToQueue: (queue, message) => {
        if (!channel) throw new Error('RabbitMQ channel not established');
        channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    }
};
