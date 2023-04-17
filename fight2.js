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
  "block-jab": 80,
  "block-hook": 70,
  "block-uppercut": 60,
  "block-body-punch": 75,
  "block-body-kick": 65,
  "block-leg-kick": 85,
  "block-head-kick": 50,
  "block-grapple": 55
};

const grappleSuccessRate = {
  "smesh": 80,
  "headbutt-stomach": 75,
  "knee-to-body": 70,
  "kimura": 15,
  "rear-naked-choke": 20,
  "arm-bar": 10,
  "triangle-choke": 10,
  "guillotine": 10
};

submissions = ["kimura", "rear-naked-choke", "arm-bar", "triangle-choke", "guillotine"];

let fighterName = undefined;
let nickName = undefined;

let round = 1;
let t = 0;
let roundTime = 5;
let nRounds = 3;
let judgeScores = [[0, 0], [0, 0], [0, 0]];

let playerHealth = 20;
let computerHealth = 20;
let initiative = "player"; // "player" or "computer"

function getFighterName(next) {
  rl.question("What is your name? (two words eg. mike tyson): ", (name) => {
    fighterName = name;
    rl.question("What is your nickname?: ", (nickname) => {
      nickName = nickname;
      next();
    });
  });
}

function scoreRound() {
  // TODO: give points based on damage done in this round
}

function victory(victor) {
  let victorName = undefined;
  if (victor == "player") {
    victorName = fancyName();
  } else {
    victorName = "Computer ... 'The Computer' ... Computer!!!";
  }
  console.log(`Aaaaand, your NEW... Light Heavyweight Champion of the Woooooorrrld!!!! ${victorName}`);
  rl.close();
}

function judgeDecision() {
    console.log(`After ${nRounds} rounds, we go to the judge's scorecards...`);
    scores = generateJudgeScores();
  // TODO print out the whole dramatic announcement of the scores
  // and determine scoreVictor ("player" or "computer").
  victory(scoreVictor);
}

function stoppage(victor, method) {
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



function getRandomMove(movesArray) {
  return movesArray[Math.floor(Math.random() * movesArray.length)];
}

function getComputerMove() {
  const move = getRandomMove(moves);
  const block = `block-${move}`;
  const fake1 = getRandomMove(moves);
  const fake2 = getRandomMove(moves);
  return [block, `block-${fake1}`, `block-${fake2}`];
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function promptUser() {
  console.log("--------");
  if (playerHealth <= 0 || computerHealth <= 0) {
    console.log("Game Over!");
    console.log(`Player Health: ${playerHealth}`);
    console.log(`Computer Health: ${computerHealth}`);
    rl.close();
    return;
  }

  t++;
  if (t == 5) {
    t = 0;
    console.log(`===================== END OF ROUND ${round} =====================`);
    scoreRound();
    round++;
    if (round > nRounds) {
      return judgeDecision();
    }
    console.log(`===================== START OF ROUND ${round} ===========================`);
  }

  if (initiative === "player") {
    playerTurn();
  } else {
    computerTurn();
  }
}

function playerTurn(initiativeStrike = 1) {
  if (computerHealth <= 0) {
    stoppage("player", "TKO");
  }

  console.log(`Player Health: ${playerHealth}`);
  console.log(`Computer Health: ${computerHealth}`);
  console.log("Choose your move:");
  moves.forEach((move, index) => console.log(`${index + 1}: ${move}`));

  rl.question("> ", (attackChoice) => {
    const playerAttack = parseInt(attackChoice);
    if (playerAttack < 1 || playerAttack > moves.length) {
      console.log("Invalid choice! Your attack fails!");
      initiative = "computer";
    } else {
      const move = moves[playerAttack - 1];
      console.log(`You attacked with ${move}!`);

      let block = (Math.random()*100) < successRate[`block-${move}`]
      if (block) {
        console.log("They blocked your attack.");
        initiative = "computer";
        return promptUser();
      }

      if (move === "grapple") {
        console.log("Entering grapple mode...");
        return grappleMode();
      }

      console.log(`'${move}' connects!`);
      computerHealth -= rollD6();
      if (computerHealth < 6 || (Math.random() * 100) < 50 / initiativeStrike) {
        console.log("You maintain the initiative!");
        return playerTurn(initiativeStrike + 1);
      }
      initiative = "computer";
    }
    return promptUser();
  });
}

function computerTurn() {
  const computerMoves = getComputerMove();
  console.log(`Player Health: ${playerHealth}`);
  console.log(`Computer Health: ${computerHealth}`);
  console.log("Computer is attacking! Choose a block:");
  console.log(`1: ${computerMoves[0]}`);
  console.log(`2: ${computerMoves[1]}`);
  console.log(`3: ${computerMoves[2]}`);

  rl.question("> ", (answer) => {
    const userChoice = parseInt(answer);
    if (userChoice < 1 || userChoice > 3) {
      console.log("Invalid choice! Computer attack goes unblocked!");
      playerHealth -= rollD6();
    } else {
      const userMove = computerMoves[userChoice - 1];
      if (Math.random() * 100 < successRate[userMove]) {
        console.log("You successfully blocked the attack!");
        initiative = "player";
      } else {
        console.log("You failed to block the attack!");
        playerHealth -= rollD6();
      }
    }
    promptUser();
  });
}

function grappleMode() {
  console.log("Choose your grapple move:");
  grappleMoves.forEach((move, index) => console.log(`${index + 1}: ${move}`));

  rl.question("> ", (grappleChoice) => {
    const playerGrapple = parseInt(grappleChoice);
    if (playerGrapple < 1 || playerGrapple > grappleMoves.length) {
      console.log("Invalid choice! Your grapple move fails!");
      initiative = "computer";
    } else {
      const move = grappleMoves[playerGrapple - 1];
      console.log(`You attempted ${move}!`);

      grappleSuccess = Math.random() * 100 < grappleSuccessRate[move];
      inspiredSubmission = submissions.includes(move) && (Math.random() * 100 < 5);
      if (grappleSuccess || inspiredSubmission) {
        console.log("Your grapple move is successful!");
        if (inspiredSubmission) {
          console.log("A truly inspired submission!");
        }
        if (submissions.includes(move)) {
          stoppage("player", "submission");
        } else {
          computerHealth -= rollD6();
        }
        if (computerHealth < 6) {
          console.log("You maintain the initiative!");
          playerTurn();
          return;
        }
        if (Math.random() < 0.33) {
          grappleMode();
        }
      } else {
        console.log("Your grapple move failed!");
        initiative = "computer";
      }
    }
    promptUser();
  });
}

if (Math.random() > 0.5) {
  initiative = "computer";
}

getFighterName(promptUser);
