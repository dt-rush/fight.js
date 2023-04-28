const express = require('express');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const { fights, fightsHidden, players } = require('./fight-store');
const { fightAfterlife } = require('./fight-afterlife');

setInterval(() => {
  // Iterate over the fights Map
  fights.forEach((fightData, uuid) => {
    const [playerName1, playerName2] = fightData.names;

    // If both player names are not present, skip this iteration
    if (!playerName1 || !playerName2) {
      return;
    }

    // Check if both players have disconnected their websockets
    const playerWebSocket1 = players.get(playerName1);
    const playerWebSocket2 = players.get(playerName2);
    const bothPlayersDisconnected =
      playerWebSocket1.readyState === WebSocket.CLOSED &&
      playerWebSocket2.readyState === WebSocket.CLOSED;

    if (bothPlayersDisconnected) {
      // Call fightAfterlife on fightData
      fightAfterlife(fightData);
    }
  });
}, 5 * 1000);

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
  // TODO: should we do this somewhere else like in a setInterval?

  const fightId = uuidv4();
  const fightUrl = `/fight/${fightId}`;
  const fightData = {
    id: fightId,
    url: fightUrl,
    names: [],
    round: 1,
    roundTime: 12,
    nRounds: 3,
    t: 0,
    states: {},
    initiative: -1,
    mode: 'standing',
    status: 'waiting', // Possible statuses: 'waiting', 'in-progress', 'finished'
    roundPoints: [0, 0],
    judgeScores: [[0, 0], [0, 0], [0, 0]],
  };
  fights.set(fightId, fightData);
  fightsHidden.set(fightId, {});
  fightsHidden.set('initiativeStrike', 0);
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
    console.log(data);
    if (fightResponses.hasOwnProperty(data.type)) {
      const fightData = fights.get(data.fightId);
      fightResponses[data.type](fightData, data, ws);
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
