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
  writeToOutput(`... declaring the winner... ${victorName}`, "buffer");
}

function assignRoundScores() {
  const scores = [];
  for (let i = 0; i < 3; i++) {
    let playerScore, computerScore;

    if (roundPoints[0] >= roundPoints[1]) {
      playerScore = 10;
      computerScore = Math.round((roundPoints[1] / roundPoints[0]) * 10);
    } else {
      computerScore = 10;
      playerScore = Math.round((roundPoints[0] / roundPoints[1]) * 10);
    }

    // random judge error
    let playerError = 0;
    let computerError = 0;
    // 10% chance of error (3 judges, 3 rounds means there will probably be one error)
    if (Math.random() < 0.1) {
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
  // Reset point counters for the next round
  roundPoints[0] = 0;
  roundPoints[1] = 0;
}

function judgeDecision() {
  writeToOutput(`<div class="breakline">-----</div>`);
  writeToOutput(`After ${nRounds} rounds, we go to the judge's scorecards...`, "buffer");
  let playerTotal = 0;
  let computerTotal = 0;

  // figure out victor
  for (let i = 0; i < 3; i++) {
    playerTotal += judgeScores[i][0];
    computerTotal += judgeScores[i][1];
  }
  let victorIx = (playerTotal > computerTotal) ? 0 : 1;
  // write scores out (victor number goes first)
  let displayScores = [];
  for (let i = 0; i < 3; i++) {
    displayScores[i] = [
      judgeScores[i][victorIx],
      judgeScores[i][(victorIx + 1) % 2],
    ];
    writeToOutput(`Judge ${i + 1} scores the contest ${displayScores[i][0]}, ${displayScores[i][1]}...`, "buffer");
  }

  if (playerTotal > computerTotal) {
    victory("player");
  } else if (playerTotal < computerTotal) {
    victory("computer");
  } else {
    writeToOutput("This contest is declared a drawww!", "buffer");
  }
}

function stoppage(victor, method) {
  writeToOutput(`<div class="breakline">-----</div>`);
  writeToOutput(`The referee has called a stop to the contest due to ${method} in round ${round}`, "buffer");
  displayHealth();
  victory(victor);
}

function firstName() {
  return fighterName.split(" ")[0];
}

function fancyName() {
  // Split the fighter name into first and last name
  var nameParts = fighterName.split(" ");
  var firstName = nameParts.shift(); // Removes and returns the first element
  var lastName = nameParts.join(" "); // Joins the remaining elements with spaces

  // Construct the fancy name
  var fancy = firstName + "... '" + nickName;
  if (lastName) {
    fancy += "'... " + lastName + "!!!";
  } else {
    fancy += "!!!";
  }
  return fancy;
}
