const { fights, fightsHidden, players } = require('./fight-store');

function fightAfterlife(fightData) {
  // TODO: record the fight to the fighter's records
  console.log(`[${fightData.id}] fight data:`);
  console.log(`[${fightData.id}] ` + JSON.stringify(fightData, undefined, 2));
  console.log(`[${fightData.id}] hidden fight data:`);
  console.log(`[${fightData.id}] ` + JSON.stringify(fightsHidden.get(fightData.id), undefined, 2));
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
