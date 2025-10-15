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
    msg += "\n    Winner: " + data.winner;

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
    var sqlGetCalData = "SELECT COUNT(`id`) AS `count` FROM `discordSent` WHERE `channelId` = ? AND `calId` = ? AND `messageType` = 2";
    sqlconnection.query(sqlGetCalData, [ discordChannel, id ], async function (error, DiscordSent ) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Send win";
            let part = "Check if message sent";
            errorSend({ element, category, part, error });
        };
        if (DiscordSent[0].count == 0) {
            discordConnect.channels.cache.get(discordChannel).send( SplatCalData ).then(msg => {                
                var sqlGetCalData = "INSERT INTO `discordSent` (`channelId`, `messageId`, `calId`, `messageType`) VALUES (?, ?, ?, '2')";
                sqlconnection.query(sqlGetCalData, [ discordChannel, msg.id, id ], function (error, events) {
                    if (error) {
                        console.error(error);
                        let element = "Splatfest";
                        let category = "Send win";
                        let part = "Insert mesage sent";
                        errorSend({ element, category, part, error });
                    };
                    console.log("Win message sent! calendar id:", id, "channel id:", discordChannel, "message id:", msg.id, "db send id:", events.insertId);
                    sqlconnection.end();
                });
            });
        };
    });
};

async function discordSend() {
    let sqlconnection = await sqlConnect();
    eventType = "splatfest";
    var sqlGetData = 'SELECT `splatCal`.`id`, `splatCal`.`title`, `splatCal`.`name`, `splatCal`.`region`, `splatCal`.`imgUrl`, `splatCal`.`startDate`, `splatCal`.`endDate`, `splatfest_teams`.`data` AS winner FROM `splatCal` LEFT JOIN `eventTypes` ON `splatCal`.`eventId` = `eventTypes`.`id` LEFT JOIN `win` ON `splatCal`.`id` = `win`.`calId` LEFT JOIN `splatfest_teams` ON `win`.`descId` = `splatfest_teams`.`id` WHERE `eventTypes`.`data` = ? AND `win`.`descId` IS NOT NULL';
    sqlconnection.query(sqlGetData, [ eventType ], function (error, events) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Send win";
            let part = "Get event";
            errorSend({ element, category, part, error });
        };
        if (events && events.length > 0) {
            for (const event of events) {
                const env = getEnv("splatfestWin");
                for (const item of env) {
                    msg = createMsg(event, item);
                    sendMsg(msg, event.id, item[0]);
                };
            };
            sqlconnection.end();
        } else {
            console.log("no new splatfests");
            sqlconnection.end();
        };
    });
};

module.exports = discordSend;