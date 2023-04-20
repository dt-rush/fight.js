//
// I/O / decision / fight-logic functions
//

function recoverBetweenRounds() {
  // modify acuity
  let acuityAvg = (acuity[0] + acuity[1])/2;
  // decay down to avg if below 16 health
  if (Math.random() < 0.6) {
    if (health[0] < 16 && acuity[0] > acuityAvg) {
      acuity[0] = acuityAvg;
    }
  }
  if (Math.random() < 0.6) {
    if (health[1] < 16 && acuity[1] > acuityAvg) {
      acuity[1] = acuityAvg;
    }
  }
  // decay up to avg *unless* below 8 health
  if (health[0] >= 8 && acuity[0] < acuityAvg) {
    acuity[0] = acuityAvg;
  }
  if (health[1] >= 8 && acuity[1] < acuityAvg) {
    acuity[1] = acuityAvg;
  }

  // recover some health randomly
  health[0] = Math.min(20, health[0] + Math.round(Math.random() * 4));
  health[1] = Math.min(20, health[1] + Math.round(Math.random() * 4));
}

function promptUser() {
  if (health[0] <= 0) {
    return stoppage("computer", "TKO");
  }
  if (health[1] <= 0) {
    return stoppage("player", "TKO");
  }

  displayRound();

  if (t == 0 && round == 1) {
    writeToOutput(`=== START OF ROUND 1 ===`);
    coinFlipInitiative();
  }

  t++;
  if (t == roundTime) {
    t = 0;
    writeToOutput(`=== END OF ROUND ${round} ===`);
    displayVitals();
    scoreRound();
    round++;
    if (round > nRounds) {
      return judgeDecision();
      hideRound();
    } else {
      displayRound();
    }
    writeToOutput(`=== START OF ROUND ${round} ===`);

    recoverBetweenRounds();

    mode = "standing";
    coinFlipInitiative();
  }

  if (mode == "standing") {
    submissionProgress = [0, 0];
  }

  // NOTE: in the below, acuities interpolate toward each other slightly
  // and 10% of the time get a boost of 10 *or* catch up to the other mostly
  if (initiative === "player") {
    acuity[0] = 0.8 * acuity[0] + 0.2 * acuity[1];
    if (Math.random() < 0.2) {
      acuity[0] = Math.round(Math.max(acuity[1] * 0.9, acuity[0] + 10));
    }
    return playerAttack();
  } else {
    acuity[1] = 0.8 * acuity[1] + 0.2 * acuity[0];
    if (Math.random() < 0.2) {
      acuity[1] = Math.round(Math.max(acuity[0] * 0.9, acuity[1] + 10));
    }
    return computerAttack();
  }
}

//
// player attack
//

async function playerAttack(initiativeStrike = 1) {
  if (health[1] <= 0) {
    return stoppage("player", "TKO");
  }

  displayVitals();

  let availableMoves = [];
  if (mode === "standing") {
    availableMoves = [...standingMoves];
  } else if (mode === "grappling") {
    availableMoves = [...grapplingMoves];
    if (submissionProgress[0] > 0) {
      availableMoves = availableMoves.concat(submissions);
    }
  }

  const attackChoice = await displayClickableDivs(availableMoves, "your move");
  let move;
  if (!isNaN(parseInt(attackChoice)) && parseInt(attackChoice) >= 1 && parseInt(attackChoice) <= availableMoves.length) {
    move = availableMoves[parseInt(attackChoice) - 1];
  } else if (availableMoves.includes(attackChoice.trim())) {
    move = attackChoice.trim();
  }

  if (move == "feel-out") {
    writeToOutput(`<span class="move feelOut">You feel out the computer...</span>`, "player");
    if (Math.random() < 0.5) {
      acuity[0] += Math.floor(Math.random() * 10);
      return playerAttack();
    } else {
      initiative = "computer";
      return computerAttack();
    }
  }

  return playerAttempt(move, initiativeStrike);
}

function playerAttempt(move, initiativeStrike) {
  writeToOutput(`You attempted ${move}`, "player");
  let block;
  switch (mode) {
    case "standing":
      block = (Math.random() * 100) < (blockSuccessRate(move) - acuity[0] + acuity[1]);
      if (block) {
        writeToOutput("Computer blocked your attack.", "computer blocked");
        initiative = "computer";
        return promptUser();
      }
      if (move === "grapple") {
        writeToOutput(`Takedown by ${firstName()}!`, "player green");
        roundPoints[0] += 3;
        submissionProgress[0] = Math.floor(Math.random() * 1.1);
        mode = "grappling";
        return playerAttack();
      }
      writeToOutput(`'${move}' connects!`, "player green");
      damage("computer", move);
      if (health[1] < 6 || Math.random() < (0.37 / initiativeStrike)) {
        writeToOutput("You maintain the initiative!", "player");
        return playerAttack(initiativeStrike + 1);
      }
      initiative = "computer";
      break;
    case "grappling":
      let blockRate = blockSuccessRate(move);
      if (submissions.includes(move)) {
        blockRate /= (submissionProgress[0]/3.0 + 1);
        if (health[1] < 6) {
          blockRate *= 0.7;
        }
      }
      block = Math.random() * 100 < (blockRate - acuity[0] + acuity[1]);
      // 3% of the time, an unblockable "inspired" submission
      let inspiredSubmission = submissions.includes(move) && (Math.random() * 100 < 3);
      if (block && !inspiredSubmission) {
        writeToOutput("They blocked your attack.", "computer");
        initiative = "computer";
        return promptUser();
      }
      // below here, block is false 
      writeToOutput(`${move} is successful!`, "player green");
      if (move == "progress") {
        submissionProgress[0] += 1;
        return playerAttack(initiativeStrike + 1);
      }
      if (move == "escape") {
        if (submissionProgress[1] == 0) {
          mode = "standing";
          return playerAttack();
        } else {
          submissionProgress[1] = Math.max(0, submissionProgress[1] - 1);
          return playerAttack(initiativeStrike);
        }
      }
      if (inspiredSubmission) {
        writeToOutput("A truly inspired submission!", "commentary");
      }
      if (submissions.includes(move)) {
        return stoppage("player", `submission by ${move}`);
      } else {
        damage("computer", move);
      }
      if (health[1] < 6 || Math.random() < (0.70 / initiativeStrike)) {
        writeToOutput("You maintain the initiative grappling", "player");
        return playerAttack(initiativeStrike + 1);
      } else {
        initiative = "computer";
      }
      break;
  }
  return promptUser();
}

//
// computer attack
//

function getRandomMove(movesArray) {
  return movesArray[Math.floor(Math.random() * movesArray.length)];
}

function getComputerMove(movesArray) {
  // put the real move 1-3 times (TODO: this is telegraphing mechanic. enrich it)
  const move = getRandomMove(movesArray);
  const computerMoves = [move];
  const realRepetition = Math.floor(Math.random() * 3) + 1;
  for (let i = 1; i < realRepetition; i++) {
    computerMoves.push(move);
  }
  while (computerMoves.length < 3) {
    const fake = getRandomMove(movesArray);
    if (!computerMoves.includes(fake)) {
      computerMoves.push(fake);
    }
  }
  // Permute the computerMoves array
  for (let i = computerMoves.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [computerMoves[i], computerMoves[j]] = [computerMoves[j], computerMoves[i]];
  }

  return [move, computerMoves];
}

async function computerAttack(initiativeStrike = 1) {
  if (health[0] <= 0) {
    return stoppage("computer", "TKO");
  }

  displayVitals();

  let availableMoves = [];
  if (mode === "standing") {
    availableMoves = [...standingMoves];
  } else if (mode === "grappling") {
    availableMoves = [...grapplingMoves];
    if (submissionProgress[1] > 0) {
      availableMoves = availableMoves.concat(submissions);
    }
  }

  let [realMove, computerMoves] = getComputerMove(availableMoves);

  // escape override if submission progress
  if (submissionProgress[0] > 0 && Math.random() < 0.6) {
    realMove = "escape";
    computerMoves[Math.round(Math.random() * 2)] = "escape";
  }

  // 20% of the time while standing, feel out,
  // or 70% of the time feel-out if behind by 20 acuity
  if (mode == "standing" &&
    (Math.random() < 0.30 || (Math.random() < 0.70 && (acuity[1] - acuity[0]) <= -15))) {
    realMove = "feel-out";
  }

  if (realMove == "feel-out") {
    writeToOutput(`<span class="move feelOut">The computer feels you out...</span>`, "computer");
    if (Math.random() < 0.5) {
      acuity[1] += Math.floor(Math.random() * 10);
      return computerAttack();
    } else {
      initiative = "player";
      return playerAttack();
    }
  }

  const blockChoice = await displayClickableDivs(computerMoves, "block");
  return computerAttempt(realMove, computerMoves, initiativeStrike, blockChoice);
}

function computerAttempt(realMove, computerMoves, initiativeStrike, blockChoice) {
  const userChoice = parseInt(blockChoice);
  const userMove = computerMoves[userChoice - 1];
  let blockRate = blockSuccessRate(userMove);

  if (userMove === realMove) {
    // User guessed the real move
    blockRate *= 1.5;
  }

  if (submissions.includes(realMove)) {
    blockRate /= (submissionProgress[1]/3.0 + 1);
    if (health[0] < 6) {
      blockRate *= 0.7;
    }
  }

  writeToOutput(`Computer attemped ${realMove}`, "computer");
  if (Math.random() * 100 < (blockRate + acuity[0] - acuity[1])) {
    writeToOutput(`You blocked '${realMove}'!`, "player block");
    initiative = "player";
  } else {
    switch(mode) {
      case "standing":
        writeToOutput(`'${realMove}' connects!`, "computer red");
        if (realMove === "grapple") {
          writeToOutput("Takedown by computer!", "computer red");
          roundPoints[1] += 3;
          submissionProgress[1] = Math.floor(Math.random() * 1.1);
          mode = "grappling";
          return computerAttack();
        } else {
          damage("player", realMove);
        }
        break;
      case "grappling":
        writeToOutput(`'${realMove}' is successful!`, "computer red");
        if (realMove == "progress") {
          submissionProgress[1] += 1;
          return computerAttack(initiativeStrike + 1);
        }
        if (realMove == "escape") {
          if (submissionProgress[0] == 0) {
            mode = "standing";
            return computerAttack();
          } else {
            submissionProgress[0] = Math.max(0, submissionProgress[0] - 1);
            return computerAttack(initiativeStrike);
          }
        }
        if (mode === "grappling" && submissions.includes(realMove)) {
          return stoppage("computer", `submission by ${realMove}`);
        } else {
          damage("player", realMove);
        }
        break;
    }

    if (health[0] < 6 || (Math.random() * 100) < (70 / initiativeStrike)) {
      writeToOutput("Computer maintains the initiative!", "computer");
      return computerAttack(initiativeStrike + 1);
    } else {
      initiative = "player";
    }
  }
  return promptUser();
}
