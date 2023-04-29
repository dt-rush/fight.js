const amqp = require('amqplib/callback_api');
const uuidv4 = require('uuid').v4;

class RabbitMQHandler {
  constructor(url, queue, onMessageReceived) {
    this.url = url || 'amqp://localhost';
    this.queue = queue;
    this.channel = null;
    this.onMessageReceived = onMessageReceived;

    this.setupRabbitMQConnection();
  }

  connectRabbitMQ(url, queue, onMessageReceived, onConnected) {
    amqp.connect(url, (error, connection) => {
      if (error) throw error;

      connection.createChannel((error, channel) => {
        if (error) throw error;

        channel.assertQueue(queue, { durable: false });

        onConnected(channel);

        channel.consume(
          queue,
          (msg) => {
            onMessageReceived(JSON.parse(msg.content.toString()));
          },
          { noAck: true }
        );
      });
    });
  }

  setupRabbitMQConnection() {
    this.connectRabbitMQ(this.url, this.queue, this.onMessageReceived, (connectedChannel) => {
      this.channel = connectedChannel;
      this.channel.on('error', (error) => {
        console.error('RabbitMQ channel error:', error);
        console.log('Attempting to reconnect to RabbitMQ...');
        this.setupRabbitMQConnection();
      });
    });
  }

  waitForChannel() {
    return new Promise((resolve) => {
      const checkChannel = () => {
        if (this.channel) {
          resolve(this.channel);
        } else {
          setTimeout(checkChannel, 500);
        }
      };
      checkChannel();
    });
  }

  async sendToMQ(message, callback) {
    const availableChannel = await this.waitForChannel();
    const msgProperties = callback ? { correlationId: uuidv4(), replyTo: this.queue } : {};
    availableChannel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)), msgProperties);

    if (callback) {
      const callbackHandler = (msg) => {
        if (msg.properties.correlationId === msgProperties.correlationId) {
          callback(JSON.parse(msg.content.toString()));
          availableChannel.cancel(msg.fields.consumerTag);
        }
      };

      availableChannel.consume(this.queue, callbackHandler, { noAck: true });
    }
  }
}

module.exports = { RabbitMQHandler };
