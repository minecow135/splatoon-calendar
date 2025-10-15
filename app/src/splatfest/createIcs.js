const ics = require('ics');
const { writeFileSync } = require('fs');

const sqlConnect = require('../common/sql.js');
const errorSend = require('../common/errorSend.js');

async function createIcs() {
    let sqlconnection = await sqlConnect();
    eventType = "splatfest";
    var sqlGetCalData = 'SELECT `splatCal`.`id`, `splatCal`.`title`, `splatCal`.`name`, `splatCal`.`region`, `splatCal`.`wikiUrl`, `splatCal`.`startDate`, `splatCal`.`endDate`, `splatCal`.`created`, `splatCal`.`uid`, `descData`.`data` AS winner FROM `splatCal` LEFT JOIN `eventTypes` ON `splatCal`.`eventId` = `eventTypes`.`id` LEFT JOIN `win` ON `splatCal`.`id` = `win`.`calId` LEFT JOIN `descData` ON `win`.`descId` = `descData`.`id` WHERE `eventTypes`.`data` = ?';
    sqlconnection.query(sqlGetCalData, [ eventType ], function (error, events) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Create ICS";
            let part = "Get Event";
            errorSend({ element, category, part, error });
        };
        if (events) {
            var sqlGetCalDescTeams = 'SELECT id, data FROM descData WHERE dataTypeId = 4;';
            sqlconnection.query(sqlGetCalDescTeams, function (error, teams) {
                if (error) {
                    console.error(error);
                    let element = "Splatfest";
                    let category = "Create ICS";
                    let part = "Get event teams";
                    errorSend({ element, category, part, error });
                };

                let eventArr = [];
                for (const event of events) {
                    let description = "";
                    let teamsStr = "";
                    for (const team of teams) {
                        if (teamsStr != "") {
                            teamsStr += " vs. ";
                        }
                        teamsStr += team.data;
                    }

                    description += event.region + ":";
                    description += "\n" + event.name;
                    description += "\n" + teamsStr;
                    description += "\n" + event.wikiUrl;
                    if (event.winner) {
                        description += "\n" + "Winner: " + event.winner;
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

                writeFileSync(process.env.BASE_DIR_WEB + `splatfest.ics`, value);

                sqlconnection.end();
            });
        } else {
            console.log("no splatfests saved");
            sqlconnection.end();
        };
    });
};

module.exports = createIcs;