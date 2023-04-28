const WebSocket = require('ws');



// stores fight data like health, acuity, round, etc.
const fights = new Map();
// fight data not sent to players
const fightsHidden = new Map();
// stores the websockets for players
const sockets = new Map();

function cleanupFights() {
  fights.forEach((fightData, uuid) => {
    const [playerName1, playerName2] = fightData.names;

    // If both player names are not present, skip this iteration
    if (!playerName1 || !playerName2) {
      return;
    }

    // Check if both players have disconnected their websockets
    const playerWebSocket1 = sockets.get(playerName1);
    const playerWebSocket2 = sockets.get(playerName2);
    const bothPlayersDisconnected =
      playerWebSocket1.readyState === WebSocket.CLOSED &&
      playerWebSocket2.readyState === WebSocket.CLOSED;

    if (bothPlayersDisconnected) {
      // Call fightAfterlife on fightData
      fightAfterlife(fightData);
    }
  });
}

function fightAfterlife(fightData) {
  const fightEndPayload = {
    type: 'fight/end'
  };
  fightData.names.forEach((name) => {
    const ws = sockets.get(name);
    ws.send(JSON.stringify(fightEndPayload));
  });
  // TODO: record the fight to the fighter's records
  console.log(`[${fightData.id}] fight data:`);
  console.log(`[${fightData.id}] ` + JSON.stringify(fightData, undefined, 2));
  console.log(`[${fightData.id}] hidden fight data:`);
  console.log(`[${fightData.id}] ` + JSON.stringify(fightsHidden.get(fightData.id), undefined, 2));
  // cleanup the fight state from stores
  fightData.names.forEach((name) => {
    sockets.delete(name);
  });
  fights.delete(fightData.id);
  fightsHidden.delete(fightData.id);
}

module.exports = {
  fights,
  fightsHidden,
  sockets,
  cleanupFights,
  fightAfterlife,
};
