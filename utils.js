//
// basic utility functions
//

function displayHealth() {
  const vitalsDiv = document.getElementById('vitals');
  vitalsDiv.innerHTML = '';

  // player
  const playerNameDiv = document.createElement('div');
  playerNameDiv.classList.add('vital', 'playerName');
  playerNameDiv.textContent = fighterName;
  vitalsDiv.appendChild(playerNameDiv);

  const playerHealthDiv = document.createElement('div');
  playerHealthDiv.classList.add('vital', 'health', 'playerHealth');
  playerHealthDiv.textContent = `❤️ ${health[0]}`;
  vitalsDiv.appendChild(playerHealthDiv);

  const playerAcuityDiv = document.createElement('div');
  playerAcuityDiv.classList.add('vital', 'acuity', 'playerAcuity');
  playerAcuityDiv.textContent = `💡${Math.round(acuity[0])}`;
  vitalsDiv.appendChild(playerAcuityDiv);

  const playerSubmissionDiv = document.createElement('div');
  playerSubmissionDiv.classList.add('vital', 'submission', 'playerSubmission');
  playerSubmissionDiv.textContent = `🤼${Math.round(submissionProgress[0])}`;
  vitalsDiv.appendChild(playerSubmissionDiv);


  // computer
  const computerNameDiv = document.createElement('div');
  computerNameDiv.classList.add('vital', 'computerName');
  computerNameDiv.textContent = "Computer";
  vitalsDiv.appendChild(computerNameDiv);

  const computerHealthDiv = document.createElement('div');
  computerHealthDiv.classList.add('vital', 'health', 'computerHealth');
  computerHealthDiv.textContent = `❤️ ${health[1]}`;
  vitalsDiv.appendChild(computerHealthDiv);

  const computerAcuityDiv = document.createElement('div');
  computerAcuityDiv.classList.add('vital', 'acuity', 'computerAcuity');
  computerAcuityDiv.textContent = `💡${Math.round(acuity[1])}`;
  vitalsDiv.appendChild(computerAcuityDiv);

  const computerSubmissionDiv = document.createElement('div');
  computerSubmissionDiv.classList.add('vital', 'submission', 'computerSubmission');
  computerSubmissionDiv.textContent = `🤼${Math.round(submissionProgress[1])}`;
  vitalsDiv.appendChild(computerSubmissionDiv);
}

function displayRound() {
  const roundDiv = document.getElementById('round');
  roundDiv.innerHTML = `Round: ${round}`;
}

function hideRound() {
  const roundDiv = document.getElementById('round');
  roundDiv.innerHTML = '';
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
      acuity[0] = Math.max(0, acuity[0] - Math.floor(damage * Math.random() * 3));
      roundPoints[1] += damage;
      // default min 1 point except for headbutt-stomach
      if (move != "headbutt-stomach") {
        roundPoints[1]++;
      }
      break;
    case "computer":
      health[1] -= damage;
      acuity[1] = Math.max(0, acuity[1] - Math.floor(damage * Math.random() * 3));
      roundPoints[0] += damage;
      // default min 1 point except for headbutt-stomach
      if (move != "headbutt-stomach") {
        roundPoints[0]++;
      }
      break;
  }
}

async function getFighterName(query) {
  const name = await askQuestion(query);
  if (!name) {
    writeToOutput("Please enter a valid name.");
    return getFighterName(query);
  }
  return name;
}
