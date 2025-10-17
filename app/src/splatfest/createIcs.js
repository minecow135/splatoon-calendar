const ics = require('ics');
const fs = require('fs');

const sqlConnect = require('../common/sql.js');
const errorSend = require('../common/errorSend.js');

async function createIcs() {
    let sqlconnection = await sqlConnect();
    var sqlGetCalData = 'SELECT `splatfest_splatfest`.`id`, `splatfest_splatfest`.`title`, `splatfest_splatfest`.`name`, `splatfest_splatfest`.`region`, `splatfest_splatfest`.`wikiUrl`, `splatfest_splatfest`.`startDate`, `splatfest_splatfest`.`endDate`, `splatfest_splatfest`.`created`, `splatfest_splatfest`.`uid`, `splatfest_teams`.`team` AS winner FROM `splatfest_splatfest` LEFT JOIN `splatfest_win` ON `splatfest_splatfest`.`id` = `splatfest_win`.`splatfestId` LEFT JOIN `splatfest_teams` ON `splatfest_win`.`teamId` = `splatfest_teams`.`id`';
    sqlconnection.query(sqlGetCalData, function (error, events) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Create ICS";
            let part = "Get Event";
            errorSend({ element, category, part, error });
        };
        if (events) {
            var sqlGetCalDescTeams = 'SELECT id, team FROM splatfest_teams;';
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
                        teamsStr += team.team;
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
                    let uid = event.uid + "@splatfest." + process.env.WEB_URL;
                    let created = [ event.created.getFullYear(), event.created.getMonth()+1, event.created.getDate(), event.created.getHours(), event.created.getMinutes() ];

                    eventArr.push({ title, description, busyStatus, start, end, uid, created });
                };

                const { icsError, value } = ics.createEvents(eventArr);
                if (icsError) {
                    console.error(error);
                    let element = "Splatfest";
                    let category = "Create ICS";
                    let part = "Create ics";
                    errorSend({ element, category, part, icsError });
                };

                console.log("Calendar updated");

                try {
                    fs.writeFileSync(process.env.BASE_DIR_WEB + `/event/splatfest/splatfest.ics`, value);
                } catch (error) {
                    console.error(error)
                    let element = "Splatfest";
                    let category = "Create ICS";
                    let part = "Save ics";
                    errorSend({ element, category, part, error });
                };

                sqlconnection.end();
            });
        } else {
            console.log("no splatfests saved");
            sqlconnection.end();
        };
    });
};

module.exports = createIcs;