const readline = require('node:readline/promises');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return rl.question(query).catch((x) => { console.error(x); });
}

const moves = [
  "feel-out",
  "jab",
  "hook",
  "uppercut",
  "body-punch",
  "body-kick",
  "leg-kick",
  "head-kick",
  "grapple"
];

const grappleMoves = [
  "progress",
  "elbow",
  "smesh",
  "headbutt-stomach",
  "knee-to-body",
  "kimura",
  "rear-naked-choke",
  "arm-bar",
  "triangle-choke",
  "guillotine"
];

submissions = ["kimura", "rear-naked-choke", "arm-bar", "triangle-choke", "guillotine"];

const successRate = {
  "jab": 45,
  "elbow": 45,
  "hook": 45,
  "uppercut": 45,
  "body-punch": 45,
  "body-kick": 55,
  "leg-kick": 55,
  "head-kick": 35,
  "grapple": 45,

  // grapple only
  "progress": 50,
  "smesh": 45,
  "headbutt-stomach": 55,
  "knee-to-body": 40,

  // submissions
  "kimura": 15,
  "rear-naked-choke": 20,
  "arm-bar": 10,
  "triangle-choke": 10,
  "guillotine": 10
}

const damageRate = {
  "jab": 5,
  "elbow": 5,
  "hook": 5,
  "uppercut": 6,
  "body-punch": 5,
  "body-kick": 4,
  "leg-kick": 4,
  "head-kick": 6,
  "smesh": 6,
  "headbutt-stomach": 1,
  "knee-to-body": 5,
}

function moveSuccessRate(move) {
  return successRate[move];
}

function blockSuccessRate(move) {
  return 100 - successRate[move];
}


//
// career vars
//

let fighterName = undefined;
let nickName = undefined;

//
// contest vars
//

let round = 1;
let t = 0;
let roundTime = 10; // note: not minutes, just moves roughly (modulo initiative chains)
let nRounds = 3;
let judgeScores = [[0, 0], [0, 0], [0, 0]];
let roundDamage = [0, 0];

//
// combat vars
//

let mode = "standing";
let health = [20, 20];
let acuity = [50, 50];
let submissionProgress = [0, 0];
let initiative = "player"; // "player" or "computer"

//
// basic utility functions
//

function displayHealth() {
  console.log(`Player Health: ${health[0]}, \tAcuity: ${acuity[0]}`);
  console.log(`Computer Health: ${health[1]}, \tAcuity: ${acuity[1]}`);
}

function coinFlipInitiative() {
  if (Math.random() > 0.5) {
    initiative = "computer";
  } else {
    initiative = "player";
  }
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function damage(recipient, move) {
  let damage = Math.floor(rollD6() * damageRate[move]/6.0);
  if (move != "headbutt-stomach" && damage == 0) {
    damage = 1;
  }
  switch (recipient) {
    case "player":
      health[0] -= damage;
      acuity[0] = Math.max(0, acuity[0] - Math.floor(damage * Math.random() * 4));
      roundDamage[1] += damage + 1;
      break;
    case "computer":
      health[1] -= damage;
      acuity[1] = Math.max(0, acuity[1] - Math.floor(damage * Math.random() * 4));
      roundDamage[0] += damage + 1;
      break;
  }
}

async function getFighterName(query) {
  const name = await askQuestion(query);
  if (!name) {
    console.log("Please enter a valid name.");
    return getFighterName(query);
  }
  return name;
}

//
// contest result functions
//

function victory(victor) {
  let victorName = undefined;
  if (victor == "player") {
    victorName = fancyName();
  } else {
    victorName = "Computer ... 'The Computer' ... Computer!!!";
  }
  victorName = victorName.toUpperCase();
  console.log(`... declaring the winner... your NEW... Light Heavyweight Champion of the Woooooorrrld!!!! ${victorName}`);
  rl.close();
}

function assignRoundScores() {
  const scores = [];
  for (let i = 0; i < 3; i++) {
    let playerScore, computerScore;

    if (roundDamage[0] >= roundDamage[1]) {
      playerScore = 10;
      computerScore = Math.round((roundDamage[1] / roundDamage[0]) * 10);
    } else {
      computerScore = 10;
      playerScore = Math.round((roundDamage[0] / roundDamage[1]) * 10);
    }

    // random judge error
    let playerError = 0;
    let computerError = 0;
    // one third chance (expected value one judge has a deviation, but it can be more or 0)
    if (Math.random() > 0.333) {
      playerError = Math.floor(Math.random() * 2 - 1); // Random error between -1 and 0
      computerError = Math.floor(Math.random() * 2 - 1); // Random error between -1 and 0
    }

    const adjustedPlayerScore = Math.max(Math.min(playerScore + playerError, 10), 0); // Clamp scores between 0 and 10
    const adjustedComputerScore = Math.max(Math.min(computerScore + computerError, 10), 0); // Clamp scores between 0 and 10

    scores.push([adjustedPlayerScore, adjustedComputerScore]);
  }
  return scores;
}

function scoreRound() {
  const roundScores = assignRoundScores();
  for (let i = 0; i < 3; i++) {
    judgeScores[i][0] += roundScores[i][0];
    judgeScores[i][1] += roundScores[i][1];
  }
  // Reset damage counters for the next round
  roundDamage[0] = 0;
  roundDamage[1] = 0;
}

function judgeDecision() {
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log(`After ${nRounds} rounds, we go to the judge's scorecards...`);
  let playerTotal = 0;
  let computerTotal = 0;

  for (let i = 0; i < 3; i++) {
    console.log(`Judge ${i + 1} scores the contest ${judgeScores[i][0]}, ${judgeScores[i][1]}...`);
    playerTotal += judgeScores[i][0];
    computerTotal += judgeScores[i][1];
  }

  if (playerTotal > computerTotal) {
    victory("player");
  } else if (playerTotal < computerTotal) {
    victory("computer");
  } else {
    console.log("This contest is declared a drawwwww!");
    rl.close();
  }
}

function stoppage(victor, method) {
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log();
  console.log(`The referee has called a stop to the contest due to ${method} in round ${round}`);
  console.log();
  displayHealth();
  victory(victor);
}

function fancyName() {
  // Split the fighter name into first and last name
  var nameParts = fighterName.split(" ");
  var firstName = nameParts[0];
  var lastName = nameParts[1];

  // Construct the fancy name
  var fancy = firstName + "... '" + nickName + "'... " + lastName + "!!!";
  return fancy;
}




//
// main
//

async function main() {
  /*
   * TODO: implement fighter save/load
  fighterName = await getFighterName("Enter name: ");
  nickName = await getFighterName("Enter nickname: ");
  */
  fighterName = "Ronaldo Guzman";
  nickName = "The Goose";

  return promptUser();
}

main()
  .then(() => {
    console.log("GAME END"); rl.close(); 
  });



//
// I/O / decision / fight-logic functions
//

function promptUser() {
  console.log();
  console.log("--------");

  if (t == 0 && round == 1) {
    console.log(`===================== START OF ROUND 1 ===========================`);
    coinFlipInitiative();
  }

  t++;
  if (t == roundTime) {
    t = 0;
    console.log();
    console.log();
    console.log(`===================== END OF ROUND ${round} =====================`);
    console.log();
    displayHealth();
    scoreRound();
    round++;
    if (round > nRounds) {
      return judgeDecision();
    }
    console.log(`===================== START OF ROUND ${round} ===========================`);
    let acuityAvg = (acuity[0] + acuity[1])/2;
    acuity[0] = acuityAvg;
    acuity[1] = acuityAvg;
    mode = "standing";
    coinFlipInitiative();
  }

  if (initiative === "player") {
    acuity[0] = 0.8 * acuity[0] + 0.2 * acuity[1];
    if (Math.random() < 0.2) {
      acuity[0] = Math.max(acuity[1], acuity[0] + 10);
    }
    return playerAttack();
  } else {
    acuity[1] = 0.8 * acuity[1] + 0.2 * acuity[0];
    if (Math.random() < 0.2) {
      acuity[1] = Math.max(acuity[0], acuity[1] + 10);
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

  console.log();
  displayHealth();
  console.log();

  if (mode === "grappling" && initiativeStrike > 1) {
    const breakGrappleAnswer = await askQuestion("Break grapple? y/[N]: ");
    if (breakGrappleAnswer.toLowerCase() === "y") {
      mode = "standing";
      console.log("You broke the grapple!");
      if (Math.random() < 0.67) {
        return playerAttack();
      } else {
        initiative = "computer";
        return computerAttack();
      }
    }
  }

  const availableMoves = mode === "grappling" ? grappleMoves : moves;
  console.log(`Choose your ${mode} move:`);
  availableMoves.forEach((move, index) => console.log(`${index + 1}: ${move}`));

  const attackChoice = await askQuestion("> ");
  let move;
  if (!isNaN(parseInt(attackChoice)) && parseInt(attackChoice) >= 1 && parseInt(attackChoice) <= availableMoves.length) {
    move = availableMoves[parseInt(attackChoice) - 1];
  } else if (availableMoves.includes(attackChoice.trim())) {
    move = attackChoice.trim();
  }

  if (move == "feel-out") {
    console.log("You feel out the opponent...");
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
  if (!move) {
    console.log("Invalid choice! Your attack fails!");
    initiative = "computer";
  } else {

    console.log(`You attempted ${move}!`);

    let block;

    switch (mode) {
      case "standing":
        block = (Math.random() * 100) < (blockSuccessRate(move) - acuity[0] + acuity[1]);
        if (block) {
          console.log("They blocked your attack.");
          initiative = "computer";
          return promptUser();
        }
        if (move === "grapple") {
          console.log(`Takedown by ${fighterName}!`);
          roundDamage[0] += 5;
          submissionProgress[0] = Math.floor(Math.random() * 2 + Math.random());
          mode = "grappling";
          return playerAttack();
        }
        console.log(`'${move}' connects!`);
        damage("computer", move);
        if (health[1] < 6 || (Math.random() * 100) < 37 / initiativeStrike) {
          console.log("You maintain the initiative!");
          return playerAttack(initiativeStrike + 1);
        }
        initiative = "computer";
        break;
      case "grappling":
        let blockRate = blockSuccessRate(move);
        if (submissions.includes(move)) {
          blockRate /= (submissionProgress[0] + 1);
        }
        block = Math.random() * 100 < (blockRate - acuity[0] + acuity[1]);
        let inspiredSubmission = submissions.includes(move) && (Math.random() * 100 < 5);
        if (block && !inspiredSubmission) {
          console.log("They blocked your attack.");
          initiative = "computer";
          return promptUser();
        }
        console.log("Your grapple move is successful!");
        if (move == "progress") {
          submissionProgress[0] += 1;
          return playerAttack(initiativeStrike + 1);
        }
        if (inspiredSubmission) {
          console.log("A truly inspired submission!");
        }
        if (submissions.includes(move)) {
          return stoppage("player", `submission by ${move}`);
        } else {
          damage("computer", move);
        }
        if (health[1] < 6 || Math.random() < (0.70 / initiativeStrike)) {
          console.log("You maintain the initiative grappling");
          return playerAttack(initiativeStrike + 1);
        } else {
          initiative = "computer";
        }
        break;
    }
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

  console.log();
  displayHealth();
  console.log();

  if (mode === "grappling") {
    const breakGrappleChance = Math.random() < 0.25 || Math.random() < 0.10;
    if (breakGrappleChance) {
      mode = "standing";
      console.log("Computer broke the grapple!");
      if (Math.random() < 0.67) {
        return computerAttack();
      } else {
        initiative = "player";
        return playerAttack();
      }
      return computerAttack();
    }
  }

  const availableMoves = mode === "grappling" ? grappleMoves : moves;
  let [realMove, computerMoves] = getComputerMove(availableMoves);

  // 20% of the time while standing, feel out
  if (mode == "standing" && Math.random() < 0.20) {
    realMove = "feel-out";
  }

  if (realMove == "feel-out") {
    console.log("The computer feels you out...");
    if (Math.random() < 0.5) {
      acuity[1] += Math.floor(Math.random() * 10);
      return computerAttack();
    } else {
      initiative = "player";
      return playerAttack();
    }
  }

  console.log(`Computer is attacking in ${mode} mode! Choose a block:`);
  console.log(`1: block ${computerMoves[0]}`);
  console.log(`2: block ${computerMoves[1]}`);
  console.log(`3: block ${computerMoves[2]}`);

  const blockChoice = await askQuestion("> ");
  return computerAttempt(realMove, computerMoves, initiativeStrike, blockChoice);
}

function computerAttempt(realMove, computerMoves, initiativeStrike, blockChoice) {
  const userChoice = parseInt(blockChoice);
  if (userChoice < 1 || userChoice > 3) {
    console.log(`Invalid choice! Computer attack '${realMove}' goes unblocked!`);
    damage("player", realMove);
  } else {
    const userMove = computerMoves[userChoice - 1];
    let blockRate = blockSuccessRate(userMove);

    if (userMove === realMove) {
      // User guessed the real move
      blockRate *= 1.5;
    }

    if (submissions.includes(realMove)) {
      blockRate /= (submissionProgress[1] + 1);
    }

    if (Math.random() * 100 < (blockRate + acuity[0] - acuity[1])) {
      console.log(`You successfully blocked '${realMove}'!`);
      initiative = "player";
    } else {
      console.log(`You failed to block '${realMove}'!`);

      switch(mode) {
        case "standing":
          if (realMove === "grapple") {
            console.log("Takedown by computer!");
            roundDamage[1] += 5;
            submissionProgress[1] = Math.floor(Math.random() * 2 + Math.random());
            mode = "grappling";
            return computerAttack();
          } else {
            damage("player", realMove);
          }
          break;
        case "grappling":
          if (realMove == "progress") {
            submissionProgress[1] += 1;
            return computerAttack(initiativeStrike + 1);
          }
          if (mode === "grappling" && submissions.includes(realMove)) {
            return stoppage("computer", `submission by ${realMove}`);
          } else {
            damage("player", realMove);
          }
          break;
      }

      if (health[0] < 6 || (Math.random() * 100) < (70 / initiativeStrike)) {
        console.log("Computer maintains the initiative!");
        return computerAttack(initiativeStrike + 1);
      } else {
        initiative = "player";
      }
    }
  }
  return promptUser();
}
