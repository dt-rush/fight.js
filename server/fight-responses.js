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

  if (fightData.players.length === 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Fight already has two players' }));
    return;
  }

  fightData.players.push(ws);

  if (fightData.players.length === 2) {
    // Notify both players that the fight can start
    for (const player of fightData.players) {
      player.send(JSON.stringify({ type: 'start', fightId: fightData.id }));
    }
  }
}

function fightAttack(data, ws) {
}

function fightBlock(data, ws) {
}

module.exports = { fightResponses };
