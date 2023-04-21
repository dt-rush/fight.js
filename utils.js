//
// basic utility functions
//

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
      // a TKO move cannot cause health 0
      if (health[0] == 0 && !tkoMoves.includes(move)) {
        health[0] = 1
      }
      acuity[0] = Math.max(0, acuity[0] - Math.floor(damage * Math.random() * 3));
      roundPoints[1] += damage;
      // default min 1 point except for headbutt-stomach
      if (move != "headbutt-stomach") {
        roundPoints[1]++;
      }
      break;
    case "computer":
      health[1] -= damage;
      // a TKO move cannot cause health 0
      if (health[1] == 0 && !tkoMoves.includes(move)) {
        health[1] = 1
      }
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
