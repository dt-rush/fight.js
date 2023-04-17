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

let playerHealth = 20;
let computerHealth = 20;

function getRandomMove() {
  return moves[Math.floor(Math.random() * moves.length)];
}

function getComputerMove() {
  const move = getRandomMove();
  const block = `block-${move}`;
  const fake1 = getRandomMove();
  const fake2 = getRandomMove();
  return [block, `block-${fake1}`, `block-${fake2}`];
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function promptUser() {
  if (playerHealth <= 0 || computerHealth <= 0) {
    console.log("Game Over!");
    console.log(`Player Health: ${playerHealth}`);
    console.log(`Computer Health: ${computerHealth}`);
    rl.close();
    return;
  }

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
        console.log("Choose your move:");
        moves.forEach((move, index) => console.log(`${index + 1}: ${move}`));
        rl.question("> ", (attackChoice) => {
          const playerAttack = parseInt(attackChoice);
          if (playerAttack < 1 || playerAttack > moves.length) {
            console.log("Invalid choice! Your attack fails!");
          } else {
            console.log(`You attacked with ${moves[playerAttack - 1]}!`);
            computerHealth -= rollD6();
          }
          promptUser();
        });
      } else {
        console.log("You failed to block the attack!");
        playerHealth -= rollD6();
        promptUser();
      }
    }
  });
}

promptUser();
