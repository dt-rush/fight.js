const { fights, fightsHidden, players } = require('./fight-store');

function fightAfterlife(fightData) {
  // TODO: record the fight to the fighter's records
  console.log(JSON.stringify(fightData, undefined, 2));
  // cleanup the fight state from stores
  fightData.names.forEach((name) => {
    players.delete(name);
  });
  fights.delete(fightData.id);
  fightsHidden.delete(fightData.id);
}

module.exports = {
  fightAfterlife,
};
