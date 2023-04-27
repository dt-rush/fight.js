const express = require('express');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const fights = require('./fight-store');
const port = 8080;

//
// our imports
//
const { fightResponses } = require('./fight-responses.js');

//
// build server
//

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'dist')));

//
// API
//

app.get('/api/challenge', (req, res) => {
  const fightId = uuidv4();
  const fightUrl = `/fight/${fightId}`;
  const fightData = {
    id: fightId,
    url: fightUrl,
    players: [],
    playerStates: {
      player1: {
        health: 20,
        acuity: 100,
        submissionProgress: 0,
        initiative: false
      },
      player2: {
        health: 20,
        acuity: 100,
        submissionProgress: 0,
        initiative: false
      }
    },
    status: 'waiting' // Possible statuses: 'waiting', 'in-progress', 'finished'
  };
  fights.set(fightId, fightData);
  res.json({ fightId, fightUrl });
});

// TODO: fighter creation/naming (/api/fighter/...)
// TODO: fight record lookup (/api/fighter/record)

//
// Websocket connection
//
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (fightResponses.hasOwnProperty(data.type)) {
      fightResponses[data.type](data, ws);
    } else {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid type' }));
    }
  });
  ws.on('close', () => {
    // Handle disconnection
    // TODO: Remove the WebSocket reference from the fight
  });
});

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
