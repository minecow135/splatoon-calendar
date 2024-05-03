const { Client, Events, GatewayIntentBits, AttachmentBuilder } = require('discord.js');

const sqlConnect = require('../common/sql.js');

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
    let content = "**" + data.title + "**";
    content += "\n<t:" + Math.floor(new Date(data.start).getTime() / 1000) + ":f> - <t:" + Math.floor(new Date(data.end).getTime() / 1000) + ":f>";
    let img = [];
    for (const dataRegion of data.description) {
        content += "\n\n" + dataRegion.locationData + ":";
        content += "\n    " + dataRegion.nameData;
        count = 0;
        for (const team of dataRegion.teams) {
            if (count === 0) {
                content += "\n    ";
            } else {
                content += ",  ";
            };
            content += team.data;
            count ++;
        };
        img.push(new AttachmentBuilder(dataRegion.imgData));
    };

    for (let index = 1; index < discord.length; index++) {
        const element = discord[index];
        if (index === 1) {
            content += "\n\n";
        } else {
            content += ", ";
        };
        content += "<@&" + element + ">";
    };

    let msg = {};
    msg.content = content;
    if (img) {
        msg.files = img;
    }

    return msg;
}

async function sendMsg(SplatCalData, id, discordChannel) {
    let sqlconnection = await sqlConnect();
    await until(_ => client.readyTimestamp);
    var sqlGetCalData = "SELECT COUNT(`id`) AS `count` FROM `discordSent` WHERE `channelId` = ? AND `calId` = ? AND `messageType` = 1";
    sqlconnection.query(sqlGetCalData, [ discordChannel, id ], function (error, DiscordSent ) {
        if (DiscordSent[0].count == 0) {
            if (client.channels.cache.get(discordChannel).send( SplatCalData )) {
                var sqlGetCalData = "INSERT INTO `discordSent` (`channelId`, `calId`, `messageType`) VALUES (?, ?, '1')";
                sqlconnection.query(sqlGetCalData, [ discordChannel, id ], function (error, events) {
                    if (error) throw error;
                    console.log("Message sent!", id, "in:", discordChannel);
                    sqlconnection.end();
                });
            };
        };
    });
};

async function discordSend() {
    let sqlconnection = await sqlConnect();
    eventType = "splatfest";
    var sqlGetData = 'SELECT `splatCal`.`id`, `splatCal`.`title`, `splatCal`.`startDate`, `splatCal`.`endDate` FROM `splatCal` LEFT JOIN `eventTypes` ON `splatCal`.`eventId` = `eventTypes`.`id` WHERE `eventTypes`.`event` =  ?';
    sqlconnection.query(sqlGetData, [ eventType ], function (error, events) {
        if (error) throw error;
        if (events && events.length > 0) {
            var sqlGetCalDescData = 'SELECT descName.calId, descName.locationNum, descName.id AS nameId, descName.data AS nameData, descLocation.id AS locationId, descLocation.data AS locationData, descLink.id AS linkId, descLink.data AS linkData, descImg.id AS imgId, descImg.data AS imgData FROM descData AS descName LEFT JOIN descData AS descLocation ON descLocation.calId = descName.calId AND descLocation.dataTypeId = 2 AND descName.locationNum = descLocation.locationNum LEFT JOIN descData AS descLink ON descLink.calId = descName.calId AND descLink.dataTypeId = 3 AND descLink.locationNum = descLocation.locationNum LEFT JOIN descData AS descImg ON descImg.calId = descName.calId AND descImg.dataTypeId = 5 AND descImg.locationNum = descLocation.locationNum WHERE descName.dataTypeId = 1 ORDER BY descName.locationNum';
            sqlconnection.query(sqlGetCalDescData, function (error, desc) {
                if (error) throw error;
                if (desc && desc.length > 0) {
                    var sqlGetCalDescTeams = 'SELECT id, calId, locationNum, dataCalId, data FROM descData WHERE dataTypeId = 4;';
                    sqlconnection.query(sqlGetCalDescTeams, function (error, teams) {
                        if (error) throw error;
                        if (teams && teams.length > 0) {
                            let eventArr = [];
                            for (const event of events) {
                                let description = [];
                                for (const descItem of desc) {
                                    if (descItem.calId === event.id) {
                                        let teamsArr = [];
                                        for (const team of teams) {
                                            if (team.calId === event.id && team.locationNum === descItem.locationNum) {
                                                teamsArr.push(team);
                                            };
                                        };
                                        descItem.teams = teamsArr;
                                        description.push(descItem);
                                    };
                                };

                                let id = event.id;
                                let title = event.title;
                                let start = event.startDate;
                                let end = event.endDate;

                                eventArr.push({ id, title, description, start, end, });
                            };
                            for (const event of eventArr) {
                                const env = getEnv("splatfestNew");
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