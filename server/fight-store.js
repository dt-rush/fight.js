// stores fight data like health, acuity, round, etc.
const fights = new Map();
// fight data not sent to players
const fightsHidden = new Map();
// stores the websockets for players
const players = new Map();
module.exports = {
  fights,
  fightsHidden,
  players
};
