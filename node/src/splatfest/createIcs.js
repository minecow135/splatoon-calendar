const ics = require('ics');
const { writeFileSync } = require('fs');

const sqlConnect = require('../common/sql.js');

async function createIcs() {
    let sqlconnection = await sqlConnect();
    eventType = "splatfest";
    var sqlGetCalData = 'SELECT `splatCal`.`id`, `splatCal`.`title`, `splatCal`.`startDate`, `splatCal`.`endDate`, `splatCal`.`created`, `splatCal`.`uid` FROM `splatCal` LEFT JOIN `eventTypes` ON `splatCal`.`eventId` = `eventTypes`.`id` WHERE `eventTypes`.`event` = ?';
    sqlconnection.query(sqlGetCalData, [ eventType ], function (error, events) {
        if (error) throw error;
        if (events){
            var sqlGetCalDescData = 'SELECT descName.calId, descName.locationNum, descName.id AS nameId, descName.data AS nameData, descLocation.id AS locationId, descLocation.data AS locationData, descLink.id AS linkId, descLink.data AS linkData FROM descData AS descName LEFT JOIN descData AS descLocation ON descLocation.calId = descName.calId AND descLocation.dataTypeId = 2 AND descName.locationNum = descLocation.locationNum LEFT JOIN descData AS descLink ON descLink.calId = descName.calId AND descLink.dataTypeId = 3 AND descLink.locationNum = descLocation.locationNum WHERE descName.dataTypeId = 1 ORDER BY descName.locationNum';
            sqlconnection.query(sqlGetCalDescData, function (error, desc) {
                if (error) throw error;
                var sqlGetCalDescTeams = 'SELECT id, calId, locationNum, dataCalId, data FROM descData WHERE dataTypeId = 4;';
                sqlconnection.query(sqlGetCalDescTeams, function (error, teams) {
                    if (error) throw error;

                    let eventArr = [];
                    for (const event of events) {
                        let description = "";
                        for (const descItem of desc) {
                            if (descItem.calId === event.id) {
                                let teamsStr = "";
                                for (const team of teams) {
                                    if (team.calId === event.id && team.locationNum === descItem.locationNum) {
                                        if (teamsStr != "") {
                                            teamsStr += " vs. ";
                                        }
                                        teamsStr += team.data;
                                    }
                                }
                                if (description != "") {
                                    description += "\n\n";
                                }
                                description += descItem.locationData;
                                description += "\n" + teamsStr;
                                description += "\n" + descItem.linkData;
                            }
                        }
                        let title = event.title;
                        let busyStatus = 'FREE';
                        let start = [ event.startDate.getFullYear(), event.startDate.getMonth()+1, event.startDate.getDate(), event.startDate.getHours(), event.startDate.getMinutes() ];
                        let end = [ event.endDate.getFullYear(), event.endDate.getMonth()+1, event.endDate.getDate(), event.endDate.getHours(), event.endDate.getMinutes() ];
                        let uid = event.uid;
                        let created = [ event.created.getFullYear(), event.created.getMonth()+1, event.created.getDate(), event.created.getHours(), event.created.getMinutes() ];

                        eventArr.push({ title, description, busyStatus, start, end, uid, created });
                    };

                    const { icsError, value } = ics.createEvents(eventArr);
                    if (icsError) throw icsError;

                    console.log("Calendar updated");

                    writeFileSync(`${__dirname}/../../web/splatfest.ics`, value);

                    sqlconnection.end();
                });
            });
        } else {
            console.log("no splatfests saved");
        };
    });
};

module.exports = createIcs;