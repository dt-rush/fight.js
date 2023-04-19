//
// basic utility functions
//
function displayHealth() {
  const vitalsDiv = document.getElementById('vitals');
  vitalsDiv.innerHTML = '';

  const createRow = (classes) => {
    const row = document.createElement('div');
    row.classList.add('row', ...classes);
    return row;
  };

  const createVital = (classes, content) => {
    const vital = document.createElement('div');
    vital.classList.add('vital', ...classes);
    vital.textContent = content;
    return vital;
  };

  const row1 = createRow(["name"]);
  row1.appendChild(createVital(['playerName'], fighterName));
  row1.appendChild(createVital(['computerName'], 'Computer'));

  const row2 = createRow(["health"]);
  row2.appendChild(createVital(['playerHealth'], `${health[0]}`));
  row2.appendChild(createVital(['symbol'], '❤️'));
  row2.appendChild(createVital(['computerHealth'], `${health[1]}`));

  const row3 = createRow(["acuity"]);
  row3.appendChild(createVital(['playerAcuity'], `${Math.round(acuity[0])}`));
  row3.appendChild(createVital(['symbol'], '💡'));
  row3.appendChild(createVital(['computerAcuity'], `${Math.round(acuity[1])}`));

  const row4 = createRow(["submission"]);
  row4.appendChild(createVital(['playerSubmission'], `${Math.round(submissionProgress[0])}`));
  row4.appendChild(createVital(['symbol'], '🤼'));
  row4.appendChild(createVital(['computerSubmission'], `${Math.round(submissionProgress[1])}`));

  vitalsDiv.appendChild(row1);
  vitalsDiv.appendChild(row2);
  vitalsDiv.appendChild(row3);
  vitalsDiv.appendChild(row4);
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
