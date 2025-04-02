const discordConnect = require('./discord.js');

function getEnv(prefix) {
  const obj = process.env;
  const regex = new RegExp('^' + prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const filteredObj = [];
  Object.keys(obj).forEach(key => {
    if (regex.test(key)) {
      filteredObj.push(obj[key].split(",").map(s => s.trim()));
    };
  });
  return filteredObj;
};

function until(conditionFunction) {

  const poll = resolve => {
    if (conditionFunction()) resolve();
    else setTimeout(_ => poll(resolve), 500);
  }
  return new Promise(poll);
}

function createMsg(data, discord) {
  let msg = "# ERROR " + data.category;

  msg += "\n## " + data.part
  msg += "\n\n" + data.error

  for (let index = 1; index < discord.length; index++) {
    const element = discord[index];
    if (index === 1) {
      msg += "\n\n";
    } else {
      msg += ", ";
    };
    msg += "<@&" + element + ">";
  };

  return msg;
}

async function sendMsg(SplatCalData, discordChannel) {
  await until(_ => discordConnect.readyTimestamp);
  if (discordConnect.channels.cache.get(discordChannel).send(SplatCalData)) {
    console.log("Error message sent", "in:", discordChannel);
  };
};

async function discordSend(error) {
  const env = getEnv("error");
  for (const item of env) {
    msg = createMsg(error, item);
    sendMsg(msg, item[0]);
  };
};

module.exports = discordSend;