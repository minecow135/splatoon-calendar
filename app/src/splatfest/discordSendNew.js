const sqlConnect = require('../common/sql.js');
const errorSend = require('../common/errorSend.js');
const discordConnect = require('../common/discord.js');

if (!process.env.WEB_PROTOCOL) {
    throw "env variable WEB_PROTOCOL not set"
}
if (!process.env.WEB_URL) {
    throw "env variable WEB_URL not set"
}

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
        if(conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 500);
    }
    return new Promise(poll);
}

function createMsg(data, discord) {
    let msg = "# " + data.title;
    msg += "\n<t:" + Math.floor(new Date(data.startDate).getTime() / 1000) + ":f> - <t:" + Math.floor(new Date(data.endDate).getTime() / 1000) + ":f>";
    msg += "\n\n## " + data.region + ":";
    msg += "\n    **" + data.name + "**";
    count = 0;
    for (const team of data.teams) {
        if (count === 0) {
            msg += "\n    ";
        } else {
            msg += ",  ";
        };
        msg += team.team;
        count ++;
    };

    for (let index = 1; index < discord.length; index++) {
        const element = discord[index];
        if (index === 1) {
            msg += "\n\n";
        } else {
            msg += ", ";
        };
        msg += "<@&" + element + ">";
    };

    msg += "\n-# ";
    msg += "[image](" + process.env.WEB_PROTOCOL + "://" + process.env.WEB_URL + data.imgLocation + ") ";

    return msg;
}

async function sendMsg(SplatCalData, id, discordChannel) {
    let sqlconnection = await sqlConnect();
    await until(_ => discordConnect.readyTimestamp);
    let messageType = "new";
    var sqlGetCalData = "SELECT COUNT(`id`) AS `count` FROM `splatfest_discordSent` WHERE `channelId` = ? AND `splatfestId` = ? AND `messageType` = ?";
    sqlconnection.query(sqlGetCalData, [ discordChannel, id, messageType ], async function (error, DiscordSent ) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Send new";
            let part = "Check if message sent";
            errorSend({ element, category, part, error });
        };
        if (DiscordSent[0].count == 0) {
            discordConnect.channels.cache.get(discordChannel).send( SplatCalData ).then(msg => {                
                var sqlGetCalData = "INSERT INTO `splatfest_discordSent` (`channelId`, `messageId`, `splatfestId`, `messageType`) VALUES (?, ?, ?, ?)";
                sqlconnection.query(sqlGetCalData, [ discordChannel, msg.id, id, messageType ], function (error, events) {
                    if (error) {
                        console.error(error);
                        let element = "Splatfest";
                        let category = "Send new";
                        let part = "Insert mesage sent";
                        errorSend({ element, category, part, error });
                    };
                    console.log("Message sent! calendar id:", id, "channel id:", discordChannel, "message id:", msg.id, "db send id:", events.insertId);
                    sqlconnection.end();
                });
            });
        };
    });
};

async function discordSend() {
    let sqlconnection = await sqlConnect();
    var sqlGetData = 'SELECT `splatfest_splatfest`.`id`, `splatfest_splatfest`.`title`, `splatfest_splatfest`.`name`, `splatfest_splatfest`.`region`, `splatfest_splatfest`.`imgLocation`, `splatfest_splatfest`.`startDate`, `splatfest_splatfest`.`endDate` FROM `splatfest_splatfest`';
    sqlconnection.query(sqlGetData, function (error, events) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Send new";
            let part = "Get event";
            errorSend({ element, category, part, error });
        };
        if (events && events.length > 0) {
            for (const event of events) {
                var sqlGetCalDescTeams = 'SELECT id, team FROM splatfest_teams WHERE `splatfestId` = ?';
                sqlconnection.query(sqlGetCalDescTeams, [ event.id ], function (error, teams) {
                    if (error) {
                        console.error(error);
                        let element = "Splatfest";
                        let category = "Send new";
                        let part = "Get event teams";
                        errorSend({ element, category, part, error });
                    };

                    event.teams = teams

                    const env = getEnv("SPLATFEST_NEW");
                    for (const item of env) {
                        msg = createMsg(event, item);
                        sendMsg(msg, event.id, item[0]);
                    };
                });
            };
        };
    });
};

module.exports = discordSend;