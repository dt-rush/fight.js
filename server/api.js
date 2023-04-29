const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { fightResponses } = require('./fight-responses.js');
const { fights, fightsHidden } = require('./fight-store');

const router = express.Router();

router.get('/challenge', (req, res) => {
  const fightId = uuidv4();
  const fightUrl = `/fight/${fightId}`;
  const fightData = {
    id: fightId,
    url: fightUrl,
    names: [],
    round: 1,
    roundTime: 12,
    nRounds: 3,
    t: 0,
    states: {},
    initiative: -1,
    mode: 'standing',
    status: 'waiting',
    roundPoints: [0, 0],
    judgeScores: [[0, 0], [0, 0], [0, 0]],
  };
  fights.set(fightId, fightData);
  fightsHidden.set(fightId, {
    initiativeStrike: 0,
    events: [],
  });
  res.json({ fightId, fightUrl });
});

// TODO: fighter creation/naming (/fighter/...)
// TODO: fight record lookup (/fighter/record)

module.exports = router;
