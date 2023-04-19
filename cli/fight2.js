const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const moves = [
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
  "smesh",
  "headbutt-stomach",
  "knee-to-body",
  "kimura",
  "rear-naked-choke",
  "arm-bar",
  "triangle-choke",
  "guillotine"
];

const successRate = {
  "jab": 30,
  "hook": 35,
  "uppercut": 35,
  "body-punch": 25,
  "body-kick": 45,
  "leg-kick": 25,
  "head-kick": 50,
  "grapple": 45,
  "smesh": 35,
  "headbutt-stomach": 55,
  "knee-to-body": 30,
  "kimura": 15,
  "rear-naked-choke": 20,
  "arm-bar": 10,
  "triangle-choke": 10,
  "guillotine": 10
}

function moveSuccessRate(move) {
  return successRate[move];
}

function blockSuccessRate(move) {
  return 100 - successRate[move];
}

submissions = ["kimura", "rear-naked-choke", "arm-bar", "triangle-choke", "guillotine"];

let fighterName = undefined;
let nickName = undefined;

let round = 1;
let t = 0;
let roundTime = 10; // note: not minutes, just moves roughly (modulo initiative chains)
let nRounds = 3;
let judgeScores = [[0, 0], [0, 0], [0, 0]];
let playerRoundDamage = 0;
let computerRoundDamage = 0;

let mode = "standing";
let playerHealth = 20;
let computerHealth = 20;
let initiative = "player"; // "player" or "computer"

function displayHealth() {
  console.log(`Player Health: ${playerHealth}`);
  console.log(`Computer Health: ${computerHealth}`);
}

function getFighterName(next) {
  rl.question("What is your name? (two words eg. mike tyson): ", (name) => {
    fighterName = name;
    rl.question("What is your nickname?: ", (nickname) => {
      nickName = nickname;
      next();
    });
  });
}

function victory(victor) {
  let victorName = undefined;
  if (victor == "player") {
    victorName = fancyName();
  } else {
    victorName = "Computer ... 'The Computer' ... Computer!!!";
  }
  victorName = victorName.toUpperCase();
  console.log(`Aaaaand, your NEW... Light Heavyweight Champion of the Woooooorrrld!!!! ${victorName}`);
  rl.close();
}

function assignRoundScores() {
  const scores = [];
  for (let i = 0; i < 3; i++) {
    let playerScore, computerScore;

    if (playerRoundDamage >= computerRoundDamage) {
      playerScore = 10;
      computerScore = Math.round((computerRoundDamage / playerRoundDamage) * 10);
    } else {
      computerScore = 10;
      playerScore = Math.round((playerRoundDamage / computerRoundDamage) * 10);
    }

    const playerError = Math.floor(Math.random() * 2 - 1); // Random error between -1 and 0
    const computerError = Math.floor(Math.random() * 2 - 1); // Random error between -1 and 0

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
  playerRoundDamage = 0;
  computerRoundDamage = 0;
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
    console.log("This contest is declared a draw!");
    rl.close();
  }
}

function stoppage(victor, method) {
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log("[ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [ [");
  console.log(`The referee has called a stop to the contest due to ${method} in round ${round}`);
  console.log(`Player Health: ${playerHealth}`);
  console.log(`Computer Health: ${computerHealth}`);
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



function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function damage(recipient, move) {
  let damage = rollD6();
  switch (recipient) {
    case "player":
      playerHealth -= damage;
      computerRoundDamage += damage + 1;
      break;
    case "computer":
      computerHealth -= damage;
      playerRoundDamage += damage + 1;
      break;
  }
}

function promptUser() {
  console.log();
  console.log("--------");

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
    mode = "standing";
  }

  if (initiative === "player") {
    playerAttack()
  } else {
    computerAttack()
  }
}

function playerAttack(initiativeStrike = 1) {
  if (computerHealth <= 0) {
    return stoppage("player", "TKO");
  }

  console.log();
  displayHealth();
  console.log();

  const availableMoves = (mode === "grappling") ? grappleMoves : moves;
  console.log(`Choose your ${mode} move:`);
  availableMoves.forEach((move, index) => console.log(`${index + 1}: ${move}`));

  rl.question("> ", (attackChoice) => {
    let move;

    if (!isNaN(parseInt(attackChoice)) && parseInt(attackChoice) >= 1 && parseInt(attackChoice) <= availableMoves.length) {
      move = availableMoves[parseInt(attackChoice) - 1];
    } else if (availableMoves.includes(attackChoice.trim())) {
      move = attackChoice.trim();
    }

    if (!move) {
      console.log("Invalid choice! Your attack fails!");
      initiative = "computer";
    } else {
      console.log(`You attempted ${move}!`);

      if (mode === "standing") {
        let block = (Math.random() * 100) < blockSuccessRate(move);
        if (block) {
          console.log("They blocked your attack.");
          initiative = "computer";
          return promptUser();
        }

        if (move === "grapple") {
          console.log("Takedown!");
          playerRoundDamage += 5;
          mode = "grappling";
          return playerAttack(mode);
        }

        console.log(`'${move}' connects!`);
        damage("computer", move);
        if (computerHealth < 6 || (Math.random() * 100) < 37 / initiativeStrike) {
          console.log("You maintain the initiative!");
          return playerAttack(mode, initiativeStrike + 1);
        }
        initiative = "computer";
      } else {
        // Grappling mode
        grappleSuccess = Math.random() * 100 < moveSuccessRate(move);
        inspiredSubmission = submissions.includes(move) && (Math.random() * 100 < 5);
        if (grappleSuccess || inspiredSubmission) {
          console.log("Your grapple move is successful!");
          if (inspiredSubmission) {
            console.log("A truly inspired submission!");
          }
          if (submissions.includes(move)) {
            return stoppage("player", "submission");
          } else {
            damage("computer", move);
          }
          if (computerHealth < 6 || Math.random() < 0.33) {
            console.log("You maintain the initiative grappling");
            return playerAttack(mode);
          } else {
            initiative = "computer";
          }
        } else {
          console.log("Your grapple move failed!");
          initiative = "computer";
        }
      }
    }
    return promptUser();
  });
}

function computerAttack(initiativeStrike = 1) {
  if (playerHealth <= 0) {
    return stoppage("computer", "TKO");
  }

  console.log();
  displayHealth();
  console.log();
  console.log(`Computer is attacking in ${mode} mode! Choose a block:`);

  const availableMoves = (mode === "grappling") ? grappleMoves : moves;
  const [realMove, computerMoves] = getComputerMove(availableMoves);
  console.log(`1: block ${computerMoves[0]}`);
  console.log(`2: block ${computerMoves[1]}`);
  console.log(`3: block ${computerMoves[2]}`);

  rl.question("> ", (blockChoice) => {
    const userChoice = parseInt(blockChoice);
    if (userChoice < 1 || userChoice > 3) {
      console.log(`Invalid choice! Computer attack '${realMove}' goes unblocked!`);
      damage("player", realMove);
    } else {
      const userMove = computerMoves[userChoice - 1];
      let blockSuccessRate_ = blockSuccessRate(userMove);

      if (userMove === realMove) {
        // User guessed the real move
        blockSuccessRate_ *= 1.5;
      }

      if (Math.random() * 100 < blockSuccessRate_) {
        console.log(`You successfully blocked '${realMove}'!`);
        initiative = "player";
      } else {
        console.log(`You failed to block '${realMove}'!`);

        switch(mode) {
          case "standing":
            if (realMove === "grapple") {
              console.log("Takedown by computer!");
              computerRoundDamage += 5;
              mode = "grappling";
            } else {
              damage("player", realMove);
            }
            break;
          case "grappling":
            if (mode === "grappling" && submissions.includes(realMove)) {
              if (Math.random() * 100 < moveSuccessRate(realMove)) {
                return stoppage("computer", "submission");
              }
            } else {
              damage("player", realMove);
            }
            break;
        }

        if (playerHealth < 6 || (Math.random() * 100) < (37 / initiativeStrike)) {
          console.log("Computer maintains the initiative!");
          return computerAttack(mode, initiativeStrike + 1);
        } else {
          initiative = "player";
        }
      }
    }
    promptUser();
  });
}

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

if (Math.random() > 0.5) {
  initiative = "computer";
}

getFighterName(promptUser);
