const { fights, fightsHidden } = require('./fight-store');
const { standingMoves, grapplingMoves, submissions, damageRate, blockSuccessRate } = require('./moves');
const { assignRoundScores, stoppage, judgeDecision } = require('./victory.js');

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
    if (fightData.states[user].submissionProgress > 0 || Math.random() < 0.10) {
      availableMoves = availableMoves.concat(submissions);
    }
  }
  return availableMoves;
}

function damage(fightData, recipient, move) {
  const rollD6 = () => {
    return Math.floor(Math.random() * 6) + 1;
  }
  const targetState = fightData.states[recipient];
  const otherState = fightData.states[fightData.names.find(name => name !== recipient)];
  let damage = Math.floor(rollD6() * damageRate[move] / 6.0);
  if (move != "headbutt-stomach" && damage == 0) {
    damage = 1;
  }
  targetState.health -= damage;
  targetState.acuity = Math.max(0, targetState.acuity - Math.floor(damage * Math.random() * 3));
  otherState.roundPoints += damage;
  if (move != "headbutt-stomach") {
    otherState.roundPoints++;
  }
}

function notifyFightData(fightData) {
  const dataPayload = {
    type: 'fight/data',
    fightData: fightData,
  };
  for (const name of fightData.names) {
    const playerWebSocket = sockets.get(name);
    playerWebSocket.send(JSON.stringify(dataPayload));
  }
}

function notifyBlocked(fightData, move) {
  const blockPayload = {
    type: 'fight/moveBlocked',
    fighter: fightData.names[fightData.initiative],
    move: move,
    fightData: fightData,
  };
  for (const name of fightData.names) {
    const playerWebSocket = sockets.get(name);
    playerWebSocket.send(JSON.stringify(blockPayload));
  }
}

function notifyConnects(fightData, move) {
  const blockPayload = {
    type: 'fight/moveConnects',
    fighter: fightData.names[fightData.initiative],
    move: move,
    fightData: fightData,
  };
  for (const name of fightData.names) {
    const playerWebSocket = sockets.get(name);
    playerWebSocket.send(JSON.stringify(blockPayload));
  }
}

function canAttack(fightData) {
  const user = fightData.names[fightData.initiative];
  const payload = {
    type: 'fight/canAttack',
    options: getAvailableMoves(fightData, user),
  };
  sockets.get(user).send(JSON.stringify(payload));
}

function canBlock(fightData, telegraphMoves) {
  const user = fightData.names[(fightData.initiative + 1) % 2];
  const payload = {
    type: 'fight/canBlock',
    options: telegraphMoves,
  };
  sockets.get(user).send(JSON.stringify(payload));
}

function getTelegraphMoves(fightData, realMove, availableMoves) {
  // put the real move 1-3 times (TODO: this is telegraphing mechanic. enrich it)
  const telegraphMoves = [realMove];
  let realRepetition = 1;
  if (Math.random() < 0.33) {
    realRepetition = 2;
  }
  if (Math.random() < 0.05) {
    realRepetition = 3;
  }
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

function tickTime(fightData) {
  console.log(`tick t=${fightData.t}`);

  const hiddenData = fightsHidden.get(fightData.id);

  for (const name of fightData.names) {
    if (fightData.states[name].health <= 0) {
      const victor = fightData.names.find(name_ => name_ !== name);
      stoppage(fightData, victor, "TKO");
    }
  }

  // Update acuity
  const a = fightData.names[fightData.initiative];
  const aState = fightData.states[a];
  const b = fightData.names[(fightData.initiative + 1) % 2];
  const bState = fightData.states[a];
  // interpolate the player's acuity;
  aState.acuity = 0.8 * aState.acuity + 0.2 * bState.acuity;

  if (Math.random() < 0.2) {
    aState.acuity = Math.round(Math.max(aState.acuity * 0.9, aState.acuity + 10));
  }

  // Handle round time and progression
  fightData.t++;
  if (fightData.t === fightData.roundTime) {
    // End this round
    endRound(fightData);
    assignRoundScores(fightData);
    // advance round
    fightData.t = 0;
    fightData.round++;

    if (fightData.round > fightData.nRounds) {
      return judgeDecision(fightData);
    } else {
      // TODO recoverBetweenRounds()
      startRound(fightData);
      fightData.mode = "standing";
      // Coin flip for initiative at the beginning of the round
      fightData.initiative = Math.floor(Math.random() * 2);
    }
  }
  if (fightData.mode === "standing") {
    fightData.submissionProgress = [0, 0];
  }
  hiddenData.initiativeStrike = 0;
  canAttack(fightData);
}

function startFight(fightData) {
  fightData.status = 'in-progress';
  for (const name of fightData.names) {
    const playerWebSocket = sockets.get(name);
    playerWebSocket.send(JSON.stringify({ type: 'fight/start' }));
  }
}

function startRound(fightData) {
  for (const name of fightData.names) {
    const playerWebSocket = sockets.get(name);
    playerWebSocket.send(JSON.stringify({ type: 'fight/roundStart' , fightData: fightData }));
  }
}

function endRound(fightData) {
  for (const name of fightData.names) {
    const playerWebSocket = sockets.get(name);
    playerWebSocket.send(JSON.stringify({ type: 'fight/roundEnd' , fightData: fightData }));
  }
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

  console.log(`${data.username} joins fight ${fightData.id}`);

  const hiddenData = fightsHidden.get(fightData.id);
  hiddenData.socketInstances[data.username] = data.instanceId;

  fightData.names.push(data.username);
  fightData.states[data.username] = {
    health: 20,
    acuity: 100,
    submissionProgress: 0,
  };

  if (fightData.names.length === 2) {
    // Notify both players that the fight can start
    startFight(fightData);
    startRound(fightData);

    // give one of them initiative
    const initiativeIx = Math.round(Math.random());
    fightData.initiative = initiativeIx;
    canAttack(fightData);
  }
}

function fightAttack(fightData, data, ws) {
  const realMove = data.attack;
  const hiddenData = fightsHidden.get(data.fightId);
  const attacker = fightData.names[fightData.initiative];

  if (realMove === "feel-out") {
    const attackerName = attacker;
    const attackerIndex = fightData.initiative;
    const blockerIndex = (attackerIndex + 1) % 2;
    const blockerName = fightData.names[blockerIndex];

    const feelOutMessage = {
      content: `<span class="move feelOut">feel out...</span>`,
    };

    // Send the feel-out message to the client
    const dataPayload = {
      type: "fight/output",
      message: feelOutMessage,
    };
    for (const name of fightData.names) {
      const playerWebSocket = sockets.get(name);
      dataPayload.message.className = name === attackerName ? 'player' : 'opponent';
      playerWebSocket.send(JSON.stringify(dataPayload));
    }

    if (Math.random() < 0.5) {
      fightData.states[fightData.names[attackerIndex]].acuity += Math.floor(Math.random() * 10);
      // Send the updated fight data to both clients
      notifyFightData(fightData);
    } else {
      // switch initiative
      fightData.initiative = (fightData.initiative + 1) % 2;
    }
    canAttack(fightData);
  } else {
    hiddenData.realMove = realMove;
    const telegraphMoves = getTelegraphMoves(fightData, realMove, getAvailableMoves(fightData, data.user));
    canBlock(fightData, telegraphMoves);
  }
}

function fightBlock(fightData, data, ws) {
  const hiddenData = fightsHidden.get(data.fightId)

  const realMove = hiddenData.realMove;
  const userMove = data.block;

  let blockRate = blockSuccessRate(userMove);

  if (userMove === realMove) {
    // User guessed the real move
    blockRate *= 1.5;
  }

  // blocker is the one blocking, attacker is the one attacking
  const attacker = fightData.names[fightData.initiative];
  const attackerState = fightData.states[attacker];
  const blocker = fightData.names[(fightData.initiative + 1) % 2];
  const blockerState = fightData.states[blocker];

  if (submissions.includes(realMove)) {
    blockRate /= (attackerState.submissionProgress / 3.0 + 1);
    if (blockerState.health < 6) {
      blockRate *= 0.7;
    }
  }

  if (Math.random() * 100 < (blockRate + blockerState.acuity - attackerState.acuity)) {
    notifyBlocked(fightData, realMove);
    fightData.initiative = (fightData.initiative + 1) % 2;
    return tickTime(fightData);
  } else {
    notifyConnects(fightData, realMove);
    // Move connects, so apply damage, submission progress, or mode change 
    // based on the realMove
    switch (fightData.mode) {
      case "standing":
        if (realMove === "grapple") {
          fightData.mode = "grappling";
          attackerState.submissionProgress = Math.floor(Math.random() * 0.8);
          hiddenData.initiativeStrike = 0;
        } else {
          hiddenData.initiativeStrike++;
          damage(fightData, blocker, realMove);
        }
        break;
      case "grappling":
        if (realMove === "progress") {
          attackerState.submissionProgress += 1;
        } else if (realMove === "escape") {
          if (blockerState.submissionProgress === 0) {
            fightData.mode = "standing";
            hiddenData.initiativeStrike = 0;
          } else {
            blockerState.submissionProgress = 0;
          }
        } else if (submissions.includes(realMove)) {
          // Call stoppage function with appropriate arguments
          return stoppage(fightData, attacker, `submission by ${realMove}`);
        } else {
          damage(fightData, blocker, realMove);
        }
        break;
    }
  }
  notifyFightData(fightData);
  // maintain or switch initiative
  if ((blockerState.health < 6 && Math.random() < 0.70) || (Math.random() * 100) < (70 / hiddenData.initiativeStrike)) {
    hiddenData.initiativeStrike += 1;
    return canAttack(fightData);
  } else {
    fightData.initiative = (fightData.initiative + 1) % 2;
    return canAttack(fightData);
  }
}



const fightResponses = {
  "fight/join": fightJoin,
  "fight/attack": fightAttack,
  "fight/block": fightBlock,
};

module.exports = { fightResponses };
