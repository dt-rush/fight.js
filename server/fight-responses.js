const { fights, players } = require('./fight-store');



const fightResponses = {
  "fight/join": fightJoin,
  "fight/attack": fightAttack,
  "fight/block": fightBlock,
};

function fightJoin(data, ws) {
  const fightData = fights.get(data.fightId);

  if (!fightData) {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid fight ID' }));
    return;
  }

  if (fightData.names.length === 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Fight already has two players' }));
    return;
  }

  players.set(data.username, ws);
  fightData.names.push(data.username);
  fightData.states[data.username] = {
    health: 20,
    acuity: 100,
    submissionProgress: 0,
    initiative: false
  };

  if (fightData.names.length === 2) {
    // Notify both players that the fight can start
    for (const name of fightData.names) {
      console.log(`sending fight/start to player ${name}`);
      const playerWebSocket = players.get(name);
      playerWebSocket.send(JSON.stringify({ type: 'fight/start', fightData: fightData }));
    }
  }
}

function fightAttack(data, ws) {
}

function fightBlock(data, ws) {
}

module.exports = { fightResponses };
