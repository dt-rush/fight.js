const { fights, fightsHidden, players } = require('./fight-store');
const { standingMoves, grapplingMoves } = require('./moves');


const fightResponses = {
  "fight/join": fightJoin,
  "fight/attack": fightAttack,
  "fight/block": fightBlock,
};

function getAvailableMoves(fightData, user) {
  // TODO: implement differential movesets for players
  let availableMoves = [];
  if (fightData.mode === "standing") {
    availableMoves = [...standingMoves];
  } else if (fightData.mode === "grappling") {
    availableMoves = [...grapplingMoves];
    // in order to be able to try a submission you have to have some submissionProgress
    // *or* 10% of the time, you can seize a wild opportunity knowing it's a long shot
    // statistics-wise (submission progress changes submission probability)
    if (submissionProgress[0] > 0 || Math.random() < 0.10) {
      availableMoves = availableMoves.concat(submissions);
    }
  }
  return availableMoves;
}

function canAttack(fightData) {
  console.log(fightData.initiative);
  const user = fightData.names[fightData.initiative];
  console.log(user);
  const payload = {
    type: 'fight/canAttack',
    options: getAvailableMoves(fightData, user),
  };
  players.get(user).send(JSON.stringify(payload));
}

function canBlock(fightData, telegraphMoves) {
  const user = fightData.names[(fightData.initiative + 1) % 2];
  const payload = {
    type: 'fight/canBlock',
    options: telegraphMoves,
  };
  players.get(user).send(JSON.stringify(payload));
}

function getTelegraphMoves(fightData, realMove, availableMoves) {
  // put the real move 1-3 times (TODO: this is telegraphing mechanic. enrich it)
  const telegraphMoves = [realMove];
  const realRepetition = Math.floor(Math.random() * 3) + 1;
  for (let i = 1; i < realRepetition; i++) {
    telegraphMoves.push(realMove);
  }
  // fill the rest with random moves
  while (telegraphMoves.length < 3) {
    const fake = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    if (!telegraphMoves.includes(fake)) {
      telegraphMoves.push(fake);
    }
  }
  // Permute the telegraphMoves array
  for (let i = telegraphMoves.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [telegraphMoves[i], telegraphMoves[j]] = [telegraphMoves[j], telegraphMoves[i]];
  }

  return telegraphMoves;
}



function fightJoin(fightData, data, ws) {
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
  };

  if (fightData.names.length === 2) {
    // Notify both players that the fight can start
    for (const name of fightData.names) {
      const playerWebSocket = players.get(name);
      playerWebSocket.send(JSON.stringify({ type: 'fight/start', fightData: fightData }));
    }
    // give one of them initiative
    const initiativeIx = Math.round(Math.random());
    fightData.initiative = initiativeIx;
    canAttack(fightData);
  }
}

function fightAttack(fightData, data, ws) {
  const realMove = data.attack;
  const hiddenData = fightsHidden.get(data.fightId);
  hiddenData["realMove"] = realMove;
  const telegraphMoves = getTelegraphMoves(fightData, realMove, getAvailableMoves(fightData, data.user));
  canBlock(fightData, telegraphMoves);
}

function fightBlock(fightData, data, ws) {
  const realMove = fightsHidden.get(data.fightId).realMove;
  const userMove = data.block;
  let blockRate = blockSuccessRate(userMove);

  if (userMove === realMove) {
    // User guessed the real move
    blockRate *= 1.5;
  }

  // player is the blocker, opponent is the attacker
  const playerState = fightData.states[fightData.names[fightData.initiative]];
  const opponentState = fightData.states[fightData.names[(fightData.initiative + 1) % 2]];

  if (submissions.includes(realMove)) {
    blockRate /= (opponentState.submissionProgress / 3.0 + 1);
    if (playerState.health < 6) {
      blockRate *= 0.7;
    }
  }

  if (Math.random() * 100 < (blockRate + playerState.acuity - opponentState.acuity)) {
    // Blocked
    // TODO: Notify both players about the blocked move
  } else {
    // Move connects
    // TODO: Apply damage, submission progress, or mode change based on the realMove
    // TODO: Notify both players about the successful move

    if ((playerState.health < 6 && Math.random() < 0.70) || (Math.random() * 100) < (70 / fightData.initiativeStrike)) {
      // Computer maintains the initiative
      fightData.initiativeStrike += 1;
      canAttack(fightData);
    } else {
      // Player gains the initiative
      fightData.initiative = (fightData.initiative + 1) % 2;
      fightData.initiativeStrike = 1;
      canAttack(fightData);
    }
  }
}


module.exports = { fightResponses };
