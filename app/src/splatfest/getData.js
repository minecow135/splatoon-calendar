const axios = require('axios');
const { JSDOM } = require('jsdom');
const { nanoid } = require('nanoid');
const Jimp = require("jimp");

const sqlConnect = require('../common/sql.js');
const errorSend = require('../common/errorSend.js');

async function pullData() {
    webValue = await axios.get("https://splatoonwiki.org/wiki/Main_Page/Splatfest").then(function (response) {
        // handle success
        let html = (new JSDOM(response.data));
        let teamsLinkAll = html.window.document.querySelectorAll(".splatfest div div > div.bubbleboxbg-darker > div > span > a");

        return { teamsLinkAll };
    });
    return webValue;
};

async function getTeamData(teamsLinkAll, count) {
    return await axios.get("https://splatoonwiki.org" + teamsLinkAll[count].getAttribute('href')).then(function (regionResponse) {
        let regionHtml = (new JSDOM(regionResponse.data));
        let regionAll = regionHtml.window.document.querySelectorAll("div.tagInfobox table tr td");
        let teamsAll = regionHtml.window.document.querySelectorAll("div.tagInfobox table tr td");
        let imgAll = regionHtml.window.document.querySelectorAll("div.tagInfobox img");
        let nameAllSmall = regionHtml.window.document.querySelectorAll("div > b > small");
        let nameAllSpan = regionHtml.window.document.querySelectorAll("div > b > span");
        let nameAllFull = regionHtml.window.document.querySelectorAll("div > b");
        let startEndDate = regionHtml.window.document.querySelectorAll("td .mw-formatted-date");
        let winnerAll = regionHtml.window.document.querySelectorAll(".tagInfobox tr:nth-child(6) > td:nth-child(2)");

        try {
            let region = regionAll[3].textContent.trim();
            let teamsStr = teamsAll[1].textContent.trim();
            let img = imgAll[0].getAttribute("src");
            let nameSmall = nameAllSmall[0]?.textContent;
            let nameSpan = nameAllSpan[0]?.textContent;
            let nameFull = nameAllFull[0]?.textContent;
            let startDate = startEndDate[0].textContent;
            let endDate = startEndDate[1].textContent;
            let winner = winnerAll[0]?.textContent.trim();
            
            let name
            if (nameSmall) {
                console.log("Name small")
                name = nameSmall
            } else if (nameSpan) {
                console.log("Name span")
                name = nameSpan
            } else if (nameFull) {
                console.log("Name backup")
                name = nameFull
            } else {
                let nameError = "Splatfest name not found"
                console.error(nameError)
                let category = "Splatfest"
                let part = "Get name"
                errorSend({ category, part, nameError })
            }
            return { region, teamsStr, img, name, startDate, endDate, winner };
        } catch (error) {
            console.error(error)
            let category = "Splatfest"
            let part = "Get data"
            errorSend({ category, part, error })
        };
    });
};

async function getInfo() {
    let { teamsLinkAll } = await pullData();

    let descData = [];
    let count = 0;

    for (let team of teamsLinkAll) {
        let teamdata = await getTeamData(teamsLinkAll, count)

        if (teamdata) {
            let { region, teamsStr, img, name, startDate, endDate, winner } = teamdata

            let splatfestName = name.replace(/[^A-Z0-9]+/ig, "_");
            imgName = "splatfest-" + splatfestName;

            Jimp.read("https:" + img, function (err, image) {
                if (err) throw err;

                image.write(process.env.BASE_DIR_WEB + "/img/src/splatfest/" + splatfestName + "/" + imgName + ".jpg");
            });

            let teams = teamsStr.split(/\s{2,}/).map(s => s.trim());

            descData.push([
                name,
                region,
                "https://splatoonwiki.org" + teamsLinkAll[count].getAttribute('href'),
                teams,
                process.env.WEB_URL + "img/src/splatfest/" + splatfestName + "/" + imgName + ".jpg",
                startDate,
                endDate,
                winner,
            ]);
            count ++;
        };
    };
    return { descData };
};

async function insertOneSplatfest({ item, descData, ignoreWin }) {
    let sqlconnection = await sqlConnect();

    let event = 1;
    let title = "Splatfest";
    let startDateFirst = new Date(item[5]);
    let endDateFirst = new Date(item[6]);
    let created = new Date(Date.now());
    let uid = nanoid() + "@splatfest.awdawd.eu";

    var sqlGetDate = 'SELECT COUNT(id) AS `count`, `id` FROM `splatCal` WHERE `startDate` = ?';
    sqlconnection.query(sqlGetDate, [startDateFirst], function (error, GetCount) {
        if (error) {
            console.error(error);
            let category = "Splatfest";
            let part = "Splatfest Insert 1";
            errorSend({ category, part, error });
        }
        if (GetCount[0].count === 0) {
            var sqlInsert = 'INSERT INTO `splatCal` (`eventId`, `title`, `startDate`, `endDate`, `created`, `uid`) VALUES (?, ?, ?, ?, ?, ?)';
            sqlconnection.query(sqlInsert, [event, title, startDateFirst, endDateFirst, created, uid], function (error, insertResult) {
                console.log("Splatfest Inserted");
                if (error) {
                    console.error(error);
                    let category = "Splatfest";
                    let part = "Splatfest Insert 2";
                    errorSend({ category, part, error });
                }
                let locationNum = 1;
                for (const desc of descData) {
                    if ((!desc[7] || ignoreWin.includes(item[7])) && desc[5] === item[5]) {
                        let descCount = 1;
                        var sqlInsertDesc = 'INSERT INTO `descData` (`CalId`, `locationNum`, `dataCalId`, `DataTypeId`, `data`) VALUES (?, ?, ?, ?, ?)';

                        sqlconnection.query(sqlInsertDesc, [insertResult.insertId, locationNum, descCount, 1, desc[0]], function (error, insertResult) {
                            if (error) {
                                console.error(error);
                                let category = "Splatfest";
                                let part = "Name insert";
                                errorSend({ category, part, error });
                            }
                            console.log("Name inserted");
                        });
                        descCount++;

                        sqlconnection.query(sqlInsertDesc, [insertResult.insertId, locationNum, descCount, 2, desc[1]], function (error, insertResult) {
                            if (error) {
                                console.error(error);
                                let category = "Splatfest";
                                let part = "location insert";
                                errorSend({ category, part, error });
                            }
                            console.log("location inserted");
                        });
                        descCount++;

                        sqlconnection.query(sqlInsertDesc, [insertResult.insertId, locationNum, descCount, 3, desc[2]], function (error, insertResult) {
                            if (error) {
                                console.error(error);
                                let category = "Splatfest";
                                let part = "link insert";
                                errorSend({ category, part, error });
                            }
                            console.log("link inserted");
                        });
                        descCount++;

                        teamNum = 1;
                        for (const team of desc[3]) {
                            sqlconnection.query(sqlInsertDesc, [insertResult.insertId, locationNum, descCount, 4, team], function (error, insertResult) {
                                if (error) {
                                    console.error(error);
                                    let category = "Splatfest";
                                    let part = "Team insert";
                                    errorSend({ category, part, error });
                                }
                                console.log("Team inserted");
                                });
                            teamNum++;
                            descCount++;
                        }

                        sqlconnection.query(sqlInsertDesc, [insertResult.insertId, locationNum, descCount, 5, desc[4]], function (error, insertResult) {
                            if (error) {
                                console.error(error);
                                let category = "Splatfest";
                                let part = "image link insert";
                                errorSend({ category, part, error });
                            }
                            console.log("image link inserted");
                        });
                        descCount++;

                        locationNum++;
                    };
                };
                sqlconnection.end();
            });
        } else {
            console.log("already inserted with id " + GetCount[0].id);
        };
    });
};

async function insertWinner({ item }) {
    let sqlconnection = await sqlConnect();

    let eventType = "splatfest";
    var getWinTeam = 'SELECT `descData`.`id`, `descData`.`calId`, `descData`.`dataTypeId`, `descData`.`data`, `winTeam`.`id` AS winId, `winTeam`.`data`, `win`.`id` AS winnerId FROM `descData` LEFT JOIN `splatCal` ON `descData`.`calId` = `splatCal`.`id` LEFT JOIN `descData` AS `winTeam` ON `descData`.`calId` = `winTeam`.`calId` AND `winTeam`.`dataTypeId` = 4 AND `winTeam`.`data` = ? LEFT JOIN `win` ON `descData`.`calId` = `win`.`calId` LEFT JOIN `eventTypes` ON `splatCal`.`eventId` = `eventTypes`.`id` WHERE `descData`.`dataTypeId` = 1 AND `descData`.`data` = ? AND `eventTypes`.`data` = ?';
    sqlconnection.query(getWinTeam, [item[7], item[0], eventType], function (error, events) {
        if (error) {
            console.error(error);
            let category = "Splatfest";
            let part = "Insert winner 1";
            errorSend({ category, part, error });
        }
        if (events[0].winnerId) {
            console.log("winner already inserted (" + item[7] + ")");
        } else {
            if (!events[0]) {
                let error = "winner for " + item[0] + " not found in teams (" + item[7] + ")";
                console.error(error);
                let category = "Splatfest";
                let part = "Insert winner 2";
                errorSend({ category, part, error });
            } else {
                var sqlGetCalData = "INSERT INTO `win` (`calId`, `descId`) VALUES (?, ?)";
                sqlconnection.query(sqlGetCalData, [events[0].calId, events[0].winId], function (error, events) {
                    if (error) {
                        console.error(error);
                        let category = "Splatfest";
                        let part = "Insert winner 3";
                        errorSend({ category, part, error });
                    }
                    console.log("winner saved for " + item[0] + ": " + item[7]);
                    sqlconnection.end();
                });
            };
        }
    });
}

async function getData() {
    try {
        let data = await getInfo();

        ignoreWin = [
            "TBD",
            "tbd",
            "Tbd",
            "TBA",
            "tba",
            "Tba",
        ]

        if (data) {
            for (let item of data.descData) {
                insertOneSplatfest({ item, descData, ignoreWin });
            };
        };
    } catch (error) {
        console.error(error);
        let category = "Splatfest";
        let part = "Other";
        errorSend({ category, part, error });
    }
};

module.exports = getData;