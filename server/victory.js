const { players } = require('./fight-store');

const { fightAfterlife } = require('./fight-afterlife');

const stoppage = (fightData, victor, method) => {
  let victorName = victor;
  victorName = victorName.toUpperCase();
  const messages = [
    { content: "-----", className: "breakline" },
    {
      content: `The referee has called a stop to the contest due to ${method} in round ${fightData.round}`,
      className: "buffer",
    },
    {
      content: `... declaring the winner... ${victorName}`,
      className: "buffer",
    },
  ];
  fightData.result = `${victor} by ${method} in round ${fightData.round}`;
  fightData.status = 'finished';

  const dataPayload = {
    type: "fight/stoppage",
    messages: messages,
    fightData: fightData,
  };

  // Send the stoppage data to both users
  for (const name of fightData.names) {
    const playerWebSocket = players.get(name);
    playerWebSocket.send(JSON.stringify(dataPayload));
  }

  fightAfterlife(fightData);
};

function assignRoundScores(fightData) {
  const scores = [];
  const roundPoints = fightData.roundPoints;

  for (let i = 0; i < 3; i++) {
    let firstScore, secondScore;

    if (roundPoints[0] >= roundPoints[1]) {
      firstScore = 10;
      secondScore = 9;
    } else {
      secondScore = 10;
      firstScore = 9;
    }

    // random judge error
    let firstError = 0;
    let secondError = 0;
    // 10% chance of error (3 judges, 3 rounds means there will probably be one error)
    if (Math.random() < 0.1) {
      firstError = Math.floor(Math.random() * 2 - 1); // Random error between -1 and 0
      secondError = Math.floor(Math.random() * 2 - 1); // Random error between -1 and 0
    }

    const adjustedFirstScore = Math.max(Math.min(firstScore + firstError, 10), 0); // Clamp scores between 0 and 10
    const adjustedSecondScore = Math.max(Math.min(secondScore + secondError, 10), 0); // Clamp scores between 0 and 10

    scores.push([adjustedFirstScore, adjustedSecondScore]);
  }

  // Update the fightData with the new scores
  for (let i = 0; i < 3; i++) {
    fightData.judgeScores[i][0] += scores[i][0];
    fightData.judgeScores[i][1] += scores[i][1];
  }
  // Reset point counters for the next round
  fightData.roundPoints[0] = 0;
  fightData.roundPoints[1] = 0;

  return fightData;
}

const judgeDecision = (fightData) => {
  const names = fightData.names;
  let playerTotal = 0;
  let opponentTotal = 0;

  // figure out victor
  for (let i = 0; i < 3; i++) {
    playerTotal += fightData.judgeScores[i][0];
    opponentTotal += fightData.judgeScores[i][1];
  }
  let victorIx = (playerTotal > opponentTotal) ? 0 : 1;

  // Prepare messages
  const messages = [
    { content: "-----", className: "breakline" },
    { content: `After ${fightData.nRounds} rounds, we go to the judge's scorecards...`, className: "buffer" },
  ];

  // write scores out (victor number goes first)
  for (let i = 0; i < 3; i++) {
    const displayScores = [
      fightData.judgeScores[i][victorIx],
      fightData.judgeScores[i][(victorIx + 1) % 2],
    ];
    messages.push({
      content: `Judge ${i + 1} scores the contest ${displayScores[0]}, ${displayScores[1]}...`,
      className: "buffer",
    });
  }

  // Determine the result
  let result;
  if (playerTotal > opponentTotal) {
    result = "player";
  } else if (playerTotal < opponentTotal) {
    result = "opponent";
  } else {
    result = "draw";
  }

  const victor = names[victorIx];
  let victorName = victor;
  victorName = victorName.toUpperCase();

  messages.push({
    content: result === "draw" ? "This contest is declared a drawww!" : `... declaring the winner... ${victorName.toUpperCase()}!!!`,
    className: "buffer",
  });

  const dataPayload = {
    type: "fight/judgeDecision",
    messages: messages,
    result: result,
  };
  fightData.result = `${victor} by judge's decision`;
  fightData.status = 'finished';

  // Send the judgeDecision data to both users
  for (const name of fightData.names) {
    const playerWebSocket = players.get(name);
    playerWebSocket.send(JSON.stringify(dataPayload));
  }

  fightAfterlife(fightData);
};

module.exports = {
  stoppage,
  assignRoundScores,
  judgeDecision,
};
