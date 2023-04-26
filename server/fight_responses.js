const fightResponses = {
  "fight/create": fightCreate,
  "fight/join": fightJoin,
  "fight/attack": fightAttack,
  "fight/block": fightBlock,
};

function fightCreate(data, ws) {
  // Handle fight/create
  const fightId = uuidv4();
  const fightUrl = `fight/${fightId}`;
  // Initialize fight data
  const fightData = {
    id: fightId,
    url: fightUrl,
    players: [ws],
    playerStates: {
      player1: {
        health: 20,
        acuity: 100,
        submissionProgress: 0,
        initiative: true
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
  // Add the fight data to the fights map
  fights.set(fightId, fightData);
  ws.send(JSON.stringify({ type: 'create', fightId, fightUrl }));
}

function fightJoin(data, ws) {
  // Handle fight/join
  const fightId = data.fightId;
  if (fights.has(fightId)) {
    const fightData = fights.get(fightId);
    // Check if the fight is already full
    if (fightData.players.length >= 2) {
      ws.send(JSON.stringify({ type: 'error', message: 'Fight is already full' }));
      return;
    }
    fightData.players.push(ws);
    // Send 'ready' message to both players
    const readyMessage = JSON.stringify({ type: 'ready', fightData });
    fightData.players.forEach(player => {
      player.send(readyMessage);
    });
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Fight not found' }));
  }
}

function fightAttack(data, ws) {
}

function fightBlock(data, ws) {
}

module.exports = { fightResponses };
