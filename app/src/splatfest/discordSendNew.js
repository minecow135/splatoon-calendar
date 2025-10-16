const sqlConnect = require('../common/sql.js');
const errorSend = require('../common/errorSend.js');
const discordConnect = require('../common/discord.js');

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
        msg += team.data;
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
    msg += "[image](" + data.imgUrl + ") ";

    return msg;
}

async function sendMsg(SplatCalData, id, discordChannel) {
    let sqlconnection = await sqlConnect();
    await until(_ => discordConnect.readyTimestamp);
    var sqlGetCalData = "SELECT COUNT(`id`) AS `count` FROM `discordSent` WHERE `channelId` = ? AND `calId` = ? AND `messageType` = 1";
    sqlconnection.query(sqlGetCalData, [ discordChannel, id ], async function (error, DiscordSent ) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Send new";
            let part = "Check if message sent";
            errorSend({ element, category, part, error });
        };
        if (DiscordSent[0].count == 0) {
            discordConnect.channels.cache.get(discordChannel).send( SplatCalData ).then(msg => {                
                var sqlGetCalData = "INSERT INTO `discordSent` (`channelId`, `messageId`, `calId`, `messageType`) VALUES (?, ?, ?, '1')";
                sqlconnection.query(sqlGetCalData, [ discordChannel, msg.id, id ], function (error, events) {
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
    eventType = "splatfest";
    var sqlGetData = 'SELECT `splatfest_splatfest`.`id`, `splatfest_splatfest`.`title`, `splatfest_splatfest`.`name`, `splatfest_splatfest`.`region`, `splatfest_splatfest`.`imgUrl`, `splatfest_splatfest`.`startDate`, `splatfest_splatfest`.`endDate` FROM `splatfest_splatfest` LEFT JOIN `eventTypes` ON `splatfest_splatfest`.`eventId` = `eventTypes`.`id` WHERE `eventTypes`.`data` = ?';
    sqlconnection.query(sqlGetData, [ eventType ], function (error, events) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Send new";
            let part = "Get event";
            errorSend({ element, category, part, error });
        };
        if (events && events.length > 0) {
            for (const event of events) {
                var sqlGetCalDescTeams = 'SELECT id, data FROM splatfest_teams WHERE `calId` = ?';
                sqlconnection.query(sqlGetCalDescTeams, [ event.id ], function (error, teams) {
                    if (error) {
                        console.error(error);
                        let element = "Splatfest";
                        let category = "Send new";
                        let part = "Get event teams";
                        errorSend({ element, category, part, error });
                    };

                    event.teams = teams

                    const env = getEnv("splatfestNew");
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