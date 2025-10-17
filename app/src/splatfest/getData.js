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

async function getTeamData(teamLink) {
    return await axios.get("https://splatoonwiki.org" + teamLink.getAttribute('href')).then(function (regionResponse) {
        let regionHtml = (new JSDOM(regionResponse.data));
        let headNameAll = regionHtml.window.document.querySelectorAll(".firstHeading > .mw-page-title-main");
        let regionAll = regionHtml.window.document.querySelectorAll("div.tagInfobox table tr td");
        let teamsAll = regionHtml.window.document.querySelectorAll("div.tagInfobox table tr td");
        let imgAll = regionHtml.window.document.querySelectorAll("div.tagInfobox img");
        let nameAllSmall = regionHtml.window.document.querySelectorAll("div > b > small");
        let nameAllSpan = regionHtml.window.document.querySelectorAll("div > b > span");
        let nameAllFull = regionHtml.window.document.querySelectorAll("div > b");
        let startEndDate = regionHtml.window.document.querySelectorAll("td .mw-formatted-date");
        let winnerAll = regionHtml.window.document.querySelectorAll(".tagInfobox tr:nth-child(6) > td:nth-child(2)");

        try {
            let headName = headNameAll[0].textContent;
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
                let error = "Splatfest name not found";
                console.error(error);
                let element = "Splatfest";
                let category = "Get data";
                let part = "Get name";
                errorSend({ element, category, part, error });
            }
            return { headName, region, teamsStr, img, name, startDate, endDate, winner };
        } catch (error) {
            console.error(error)
            let element = "Splatfest";
            let category = "Get data";
            let part = "Get text";
            errorSend({ element, category, part, error });
        };
    });
};

async function getInfo() {
    let { teamsLinkAll } = await pullData();

    let descData = [];

    for (let teamLink of teamsLinkAll) {
        let teamdata = await getTeamData(teamLink)

        if (teamdata) {
            let { headName, region, teamsStr, img, name, startDate, endDate, winner } = teamdata

            let slug = headName.replace(/[^A-Z0-9]+/ig, "_").replace(/^_*/, "").replace(/_*$/, "");
            let splatfestImgDir = process.env.BASE_DIR_WEB + "/event/splatfest/src/" + slug + "/img"
            try {
                if (!fs.existsSync(splatfestImgDir)){
                    fs.mkdirSync(splatfestImgDir, { recursive: true });
                    console.log("create dir splatfestImgDir " + slug);
                }
            } catch (error) {
                console.error(error)
                let element = "Splatfest";
                let category = "Create ICS";
                let part = "create folder";
                errorSend({ element, category, part, error });
            };
            
            let imgLocation = imgDir + "/splatfest.jpg"

            Jimp.read("https:" + img, function (error, image) {
                if (error) {
                    console.error(error);
                    let element = "Splatfest";
                    let category = "Get data";
                    let part = "Read image";
                    errorSend({ element, category, part, error });
                }

                try {
                    image.write(process.env.BASE_DIR_WEB + imgLocation);
                } catch (error) {
                    console.error(error)
                    let element = "Splatfest";
                    let category = "Get data";
                    let part = "Save image";
                    errorSend({ element, category, part, error });
                };
            });

            let wikiUrl = "https://splatoonwiki.org" + teamLink.getAttribute('href');
            let teams = teamsStr.split(/\s{2,}/).map(s => s.trim());

            descData.push({
                name,
                region,
                wikiUrl,
                teams,
                imgLocation,
                startDate,
                endDate,
                winner,
                slug,
            });
        };
    };
    return { descData };
};

async function insertOneSplatfest({ item, ignoreWin }) {
    let sqlconnection = await sqlConnect();

    let title = "Splatfest";
    let slug = item.slug;
    let startDateFirst = new Date(item.startDate);
    let endDateFirst = new Date(item.endDate);
    let created = new Date(Date.now());
    let uid = nanoid();

    var sqlGetDate = 'SELECT COUNT(id) AS `count`, `id` FROM `splatfest_splatfest` WHERE `slug` = ?';
    sqlconnection.query(sqlGetDate, [slug], function (error, GetCount) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Get data";
            let part = "Splatfest Insert 1";
            errorSend({ element, category, part, error });
        }
        if (GetCount[0].count === 0) {
            var sqlInsert = 'INSERT INTO `splatfest_splatfest` (`title`, `name`, `region`, `wikiUrl`, `imgLocation`,  `slug`, `startDate`, `endDate`, `created`, `uid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            sqlconnection.query(sqlInsert, [title, item.name, item.region, item.wikiUrl, item.imgLocation, slug, startDateFirst, endDateFirst, created, uid], function (error, insertResult) {
                console.log("Splatfest Inserted");
                if (error) {
                    console.error(error);
                    let element = "Splatfest";
                    let category = "Get data";
                    let part = "Splatfest Insert 2";
                    errorSend({ element, category, part, error });
                }

                var sqlInsertDesc = 'INSERT INTO `splatfest_teams` (`splatfestId`, `team`) VALUES (?, ?)';

                for (const team of item.teams) {
                    sqlconnection.query(sqlInsertDesc, [insertResult.insertId, team], function (error, insertResult) {
                        if (error) {
                            console.error(error);
                            let element = "Splatfest";
                            let category = "Get data";
                            let part = "Team insert";
                            errorSend({ element, category, part, error });
                        }
                        console.log("Team inserted");
                    });
                }

                sqlconnection.end();
            });
        } else {
            console.log("already inserted with id " + GetCount[0].id);
        };
        if (item.winner && !ignoreWin.includes(item.winner.toLowerCase())) {
            insertWinner({ item });
        }
    });
};

async function insertWinner({ item }) {
    let sqlconnection = await sqlConnect();

    var getWinTeam = 'SELECT `splatfest_splatfest`.`id`, `winTeam`.`id` AS winId, `winTeam`.`team` AS winName, `splatfest_win`.`id` AS winnerId FROM `splatfest_splatfest` LEFT JOIN `splatfest_teams` AS `winTeam` ON `splatfest_splatfest`.`id` = `winTeam`.`splatfestId` AND `winTeam`.`team` = ? LEFT JOIN `splatfest_win` ON `splatfest_splatfest`.`id` = `splatfest_win`.`splatfestId` WHERE `splatfest_splatfest`.`slug` = ?';
    sqlconnection.query(getWinTeam, [item.winner, item.slug], function (error, events) {
        if (error) {
            console.error(error);
            let element = "Splatfest";
            let category = "Get data";
            let part = "Insert winner 1";
            errorSend({ element, category, part, error });
        }
        if (events[0].winnerId) {
            console.log("winner already inserted for " + item.name + " (" + item.winner + ")");
        } else if (!events[0].winId) {
            let error = "winner for " + item.name + " not found in teams (" + item.winner + ")";
            console.error(error);
            let element = "Splatfest";
            let category = "Get data";
            let part = "Insert winner 2";
            errorSend({ element, category, part, error });
        } else {
            var sqlGetCalData = "INSERT INTO `splatfest_win` (`splatfestId`, `teamId`) VALUES (?, ?)";
            sqlconnection.query(sqlGetCalData, [events[0].id, events[0].winId], function (error, events) {
                if (error) {
                    console.error(error);
                    let element = "Splatfest";
                    let category = "Get data";
                    let part = "Insert winner 3";
                    errorSend({ element, category, part, error });
                }
                console.log("winner saved for " + item.name + ": " + item.winner);
                sqlconnection.end();
            });
        }
    });
}

async function getData() {
    try {
        let data = await getInfo();

        ignoreWin = [
            "tbd",
            "tba",
        ]

        if (data) {
            for (let item of data.descData) {
                insertOneSplatfest({ item, ignoreWin });
            };
        };
    } catch (error) {
        console.error(error);
        let element = "Splatfest";
        let category = "Get data";
        let part = "Other";
        errorSend({ element, category, part, error });
    }
};

module.exports = getData;