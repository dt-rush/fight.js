const { fights, fightsHidden } = require('./fight-store');
const fightResponses = require('./fightResponses');
const { connectRabbitMQ, sendToMQ } = require('./mqHandler');

const processMessage = async (messageContent) => {
  const data = JSON.parse(messageContent.toString());

  if (fightResponses.hasOwnProperty(data.type)) {
    const [fightData, hiddenData] = [fights.get(data.fightId), fightsHidden.get(data.fightId)];
    hiddenData.events.push(data);
    const response = await fightResponses[data.type](fightData, data);

    if (response) {
      const instanceIds = fightData.names.map((name) => hiddenData.socketInstances[name]);
      instanceIds.forEach(async (instanceId) => {
        await sendToMQ(instanceId, response);
      });
    }
  }
};


connectRabbitMQ(processMessage, null);
