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
    msg += "\n<t:" + Math.floor(new Date(data.start).getTime() / 1000) + ":f> - <t:" + Math.floor(new Date(data.end).getTime() / 1000) + ":f>";
    let img = [];
    for (const dataRegion of data.description) {
        msg += "\n\n## " + dataRegion.locationData + ":";
        msg += "\n    **" + dataRegion.nameData + "**";
        msg += "\n    Winner: " + dataRegion.winner;
        img.push(dataRegion.imgData);
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

    if (img) {
        msg += "\n-# ";
        for (const image of img) {
            msg += "[image](" + image + ") ";
        };
    };

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
    var sqlGetData = 'SELECT `splatCal`.`id`, `splatCal`.`title`, `splatCal`.`startDate`, `splatCal`.`endDate`, `win`.`descId`, `descData`.`data` FROM `splatCal` LEFT JOIN `eventTypes` ON `splatCal`.`eventId` = `eventTypes`.`id` LEFT JOIN `win` ON `splatCal`.`id` = `win`.`calId` LEFT JOIN `descData` ON `win`.`descId` = `descData`.`id` WHERE `eventTypes`.`data` = ? AND `win`.`descId` IS NOT NULL';
    sqlconnection.query(sqlGetData, [ eventType ], function (error, events) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Send win";
            let part = "Get event";
            errorSend({ element, category, part, error });
        };
        if (events && events.length > 0) {
            var sqlGetCalDescData = 'SELECT descName.calId, descName.id AS nameId, descName.data AS nameData, descLocation.id AS locationId, descLocation.data AS locationData, descLink.id AS linkId, descLink.data AS linkData, descImg.id AS imgId, descImg.data AS imgData FROM descData AS descName LEFT JOIN descData AS descLocation ON descLocation.calId = descName.calId AND descLocation.dataTypeId = 2 LEFT JOIN descData AS descLink ON descLink.calId = descName.calId AND descLink.dataTypeId = 3 LEFT JOIN descData AS descImg ON descImg.calId = descName.calId AND descImg.dataTypeId = 5 WHERE descName.dataTypeId = 1';
            sqlconnection.query(sqlGetCalDescData, function (error, desc) {
                if (error) {
                    console.error(error);
                    let element = "Splatfest";
                    let category = "Send win";
                    let part = "Get event data";
                    errorSend({ element, category, part, error });
                };
                if (!desc || desc.length === 0) {
                    console.log("description not found in database")
                } else {
                    var sqlGetCalDescTeams = 'SELECT id, calId, dataCalId, data FROM descData WHERE dataTypeId = 4;';
                    sqlconnection.query(sqlGetCalDescTeams, function (error, teams) {
                        if (error) {
                            console.error(error);
                            let element = "Splatfest";
                            let category = "Send win";
                            let part = "Get event teams";
                            errorSend({ element, category, part, error });
                        };
                        if (teams && teams.length > 0) {
                            let eventArr = [];
                            for (const event of events) {
                                let description = [];
                                for (const descItem of desc) {
                                    if (descItem.calId === event.id) {
                                        let teamsArr = [];
                                        for (const team of teams) {
                                            if (team.calId === event.id) {
                                                teamsArr.push(team);
                                            };
                                        };
                                        descItem.teams = teamsArr;
                                        descItem.winner = event.data;
                                        description.push(descItem);
                                    };
                                };

                                let id = event.id;
                                let title = event.title + " winner";
                                let start = event.startDate;
                                let end = event.endDate;

                                eventArr.push({ id, title, description, start, end, });
                            };
                            for (const event of eventArr) {
                                const env = getEnv("splatfestWin");
                                for (const item of env) {
                                    msg = createMsg(event, item);
                                    sendMsg(msg, event.id, item[0]);
                                };
                            };
                        };
                    });
                };
                sqlconnection.end();
            });
        } else {
            console.log("no new splatfests");
            sqlconnection.end();
        };
    });
};

module.exports = discordSend;