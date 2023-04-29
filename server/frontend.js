const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const apiRouter = require('./api');
const { cleanupFights } = require('./fight-store');
const { v4: uuidv4 } = require('uuid');
const { RabbitMQHandler } = require('./mq-handler');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

setInterval(cleanupFights, 5 * 1000);

const port = process.env.PORT || 8080;
const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
const instanceId = uuidv4();

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use('/api', apiRouter);

// Set up a map to store WebSocket connections by username
const usernameToWebSocket = new Map();

// map to store rmq handlers for 'mq' and the fight UUIDs (fight backend instances)
const rabbitMQHandlers = new Map();

// Set up the RabbitMQ connection for this frontend instance to forward messages to its connected users
const frontendHandler = new RabbitMQHandler(rabbitMQUrl, instanceId, (backendMessage) => {
  const ws = usernameToWebSocket.get(backendMessage.username);
  if (ws) {
    ws.send(JSON.stringify(backendMessage));
  }
});

wss.on('connection', (ws) => {
  ws.instanceId = instanceId;

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    data.instanceId = ws.instanceId;
    // Store the WebSocket connection by username
    if (data.type === 'fight/join') {
      usernameToWebSocket.set(data.username, ws);
    }
    // Send to the MQ with the game UUID
    await sendToMQ(data.fightId, data);

  });

  ws.on('close', () => {
    // TODO: Remove the WebSocket reference from the fight
    // and from the usernameToWebSocket map
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGUSR2', () => {
  console.log('Received SIGUSR2. Gracefully shutting down the server...');
  server.close(() => {
    console.log('Server closed. Exiting...');
    process.exit(0);
  });
});
