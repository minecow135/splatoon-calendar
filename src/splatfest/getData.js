const axios = require('axios');
const fs = require('fs');
const path = require('path')
const { JSDOM } = require('jsdom');
const { nanoid } = require('nanoid');

const sqlConnect = require('../common/sql.js');

async function downloadImage(url, filepath, imgName) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filepath)){
            fs.mkdirSync(filepath, { recursive: true });
        }
        response.data.pipe(fs.createWriteStream(filepath + imgName))
            .on('error', reject)
            .once('close', () => resolve(filepath));
    });
};

async function pullData() {
    webValue = await axios.get("https://splatoonwiki.org/w/index.php?title=Main_Page/Splatfest").then(function (response) {
        // handle success
        let html = (new JSDOM(response.data));
        let dateAll = html.window.document.querySelectorAll(".splatfestTimer");
        let placeAll = html.window.document.querySelectorAll(".splatfest div > div > div.bubbleboxbg-lighter");
        let teamsAll = html.window.document.querySelectorAll(".splatfest div div > div.bubbleboxbg-darker > div > span > a");
        let teamsLinkAll = html.window.document.querySelectorAll(".splatfest div div > div.bubbleboxbg-darker > div > span > a");
        let imgAll = html.window.document.querySelectorAll(".splatfest div div > div.bubbleboxbg-darker > div > div img");

        return { dateAll, teamsAll, teamsLinkAll, imgAll, placeAll };
    });
    return webValue;
};

async function getInfo() {
    let { dateAll, teamsAll, teamsLinkAll, imgAll, placeAll } = await pullData();

    let announced = false;
    if (dateAll.length != 0) {
        announced = true;
    };

    let descData = [];
    let count = 0;

    for (let team of teamsAll) {
        let { name, startDate, endDate, winner } = await axios.get("https://splatoonwiki.org" + teamsLinkAll[count].getAttribute('href')).then(function (regionResponse) {
            let regionHtml = (new JSDOM(regionResponse.data));
            let nameAll = regionHtml.window.document.querySelectorAll("div > b > small");
            let startEndDate = regionHtml.window.document.querySelectorAll("td .mw-formatted-date");
            let winner = regionHtml.window.document.querySelectorAll(".tagInfobox tr:nth-child(6) > td:nth-child(2)");

            let name = nameAll[0].textContent;
            let startDate = startEndDate[0].textContent;
            let endDate = startEndDate[1].textContent;

            return { name, startDate, endDate, winner };
        });

        let imgUrl = imgAll[count].getAttribute("src");
        let ext = path.extname(imgUrl);
        let splatfestName = name.replace(/[^A-Z0-9]+/ig, "_");
        imgName = "splatfest-" + splatfestName + ext;
        downloadImage(imgUrl, __dirname + "../../../web/img/src/" + splatfestName + "/", imgName);

        let teams = team.textContent.split("vs.").map(s => s.trim());

        descData.push([
            name,
            placeAll[count].textContent,
            "https://splatoonwiki.org" + teamsLinkAll[count].getAttribute('href'),
            teams,
            "https://splatcal.awdawd.eu/img/src/" + splatfestName + "/" + imgName,
            startDate,
            endDate,
            winner,
        ]);
        count ++;
    };
    let err = { announced };
    return { descData, err };
};

async function getData() {
    let sqlconnection = await sqlConnect();
    let { descData, err } = await getInfo();

    if (err.announced) {
        let event = 1;
        let title = "Splatfest";
        let startDate = new Date(descData[0][5]);
        let endDate = new Date(descData[0][6]);
        let created = new Date(Date.now());
        let uid = nanoid() + "@splatfest.awdawd.eu";

        var sqlGetDate = 'SELECT COUNT(id) AS `count`, `id` FROM `splatCal` WHERE `startDate` = ?';
        sqlconnection.query(sqlGetDate, [ startDate ], function (error, GetCount) {
            if (error) throw error;
            if (GetCount[0].count === 0) {
                var sqlInsert = 'INSERT INTO `splatCal` (`eventId`, `title`, `startDate`, `endDate`, `created`, `uid`) VALUES (?, ?, ?, ?, ?, ?)';
                sqlconnection.query(sqlInsert, [ event, title, startDate, endDate, created, uid ], function (error, insertResult) {
                    if (error) throw error;
                    console.log("Splatfest Inserted");
                    let locationNum = 1;
                    for (const desc of descData) {
                        let descCount = 1;
                        var sqlInsertDesc = 'INSERT INTO `descData` (`CalId`, `locationNum`, `dataCalId`, `DataTypeId`, `data`) VALUES (?, ?, ?, ?, ?)';

                        sqlconnection.query(sqlInsertDesc, [ insertResult.insertId, locationNum, descCount, 1, desc[0] ], function (error, insertResult) {
                            if (error) throw error;
                            console.log("Name inserted");
                        });
                        descCount ++;

                        sqlconnection.query(sqlInsertDesc, [ insertResult.insertId, locationNum, descCount, 2, desc[1] ], function (error, insertResult) {
                            if (error) throw error;
                            console.log("location inserted");
                        });
                        descCount ++;

                        sqlconnection.query(sqlInsertDesc, [ insertResult.insertId, locationNum, descCount, 3, desc[2] ], function (error, insertResult) {
                            if (error) throw error;
                            console.log("link inserted");
                        });
                        descCount ++;

                        teamNum = 1;
                        for (const team of desc[3]) {
                            sqlconnection.query(sqlInsertDesc, [ insertResult.insertId, locationNum, descCount, 4, team ], function (error, insertResult) {
                                if (error) throw error;
                                console.log("Team inserted");
                            });
                            teamNum ++;
                            descCount ++;
                        }

                        sqlconnection.query(sqlInsertDesc, [ insertResult.insertId, locationNum, descCount, 5, desc[4] ], function (error, insertResult) {
                            if (error) throw error;
                            console.log("image link inserted");
                        });
                        descCount ++;

                        locationNum ++;
                    };
                    sqlconnection.end();
                });
            } else {
                console.log("already inserted with id " + GetCount[0].id);
            };
        });
    } else {
        console.log("No splatfest announced");
        for (const location of descData) {
            if (location[7].length > 0) {
                winTeam = location[7][0].textContent.trim();
                let eventType = "splatfest";
                var getWinTeam = 'SELECT `descData`.`id`, `descData`.`calId`, `descData`.`dataTypeId`, `descData`.`data`, `winTeam`.`id` AS winId, `winTeam`.`data` FROM `descData` LEFT JOIN `splatCal` ON `descData`.`calId` = `splatCal`.`id` LEFT JOIN `descData` AS `winTeam` ON `descData`.`calId` = `winTeam`.`calId` AND `winTeam`.`dataTypeId` = 4 AND `winTeam`.`data` = ? LEFT JOIN `win` ON `descData`.`calId` = `win`.`calId` LEFT JOIN `eventTypes` ON `splatCal`.`eventId` = `eventTypes`.`id` WHERE `descData`.`dataTypeId` = 1 AND `descData`.`data` = ? AND `eventTypes`.`event` = ? AND `win`.`id` IS NULL';
                sqlconnection.query(getWinTeam, [ winTeam, location[0], eventType ], function (error, events) {
                    if (error) throw error;
                    for (const event of events) {
                        var sqlGetCalData = "INSERT INTO `win` (`calId`, `descId`) VALUES (?, ?)";
                        sqlconnection.query(sqlGetCalData, [ event.calId, event.winId ], function (error, events) {
                            if (error) throw error;
                            console.log("winner saved for " + location[0] + ": " + winTeam);

                        });
                    };
                    sqlconnection.end();
                });
            } else {
                console.log("no winner announced");
            };
        };
    };
};

module.exports = getData;