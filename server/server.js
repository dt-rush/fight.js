const express = require('express');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const fights = new Map();
const port = 8080;

//
// our imports
//
const { fightResponses } = require('./fight_responses.js');

//
// build server
//

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

//
// API
//

// TODO: fighter creation/naming and fight record lookup

//
// Websocket connection
//
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (fightResponses.hasOwnProperty(data.method)) {
      fightResponses[data.method](data, ws);
    } else {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid method' }));
    }
  });
  ws.on('close', () => {
    // Handle disconnection
    // TODO: Remove the WebSocket reference from the fight
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
