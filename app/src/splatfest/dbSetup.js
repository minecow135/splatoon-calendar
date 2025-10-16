const createTables = require('../common/createTables.js');
const insertData = require('../common/insertData.js');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function checkTables() {
    let createTable_splatfest_splatfest = "CREATE TABLE `splatfest_splatfest` (`id` int(11) NOT NULL AUTO_INCREMENT, `title` varchar(20) NOT NULL, `name` varchar(50) NOT NULL, `region` varchar(20) NOT NULL, `wikiUrl` varchar(120) NOT NULL, `imgLocation` varchar(150) NOT NULL, `slug` varchar(50) NOT NULL, `startDate` datetime NOT NULL, `endDate` datetime NOT NULL, `created` datetime NOT NULL, `uid` varchar(50) NOT NULL, PRIMARY KEY (`id`));";
    createTables("splatfest_splatfest", createTable_splatfest_splatfest);

    await sleep(20);

    let createTable_splatfest_teams = "CREATE TABLE `splatfest_teams` (`id` int(11) NOT NULL AUTO_INCREMENT, `splatfestId` int(11) NOT NULL, `team` varchar(25) NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`splatfestId`) REFERENCES `splatfest_splatfest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);";
    createTables("splatfest_teams", createTable_splatfest_teams);

    await sleep(20);
    
    let createTable_splatfest_win = "CREATE TABLE `splatfest_win` ( `id` int(11) NOT NULL AUTO_INCREMENT, `splatfestId` int(11) NOT NULL, `teamId` int(11) NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`splatfestId`) REFERENCES `splatfest_splatfest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`teamId`) REFERENCES `splatfest_teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);";
    createTables("splatfest_win", createTable_splatfest_win);

    let createTable_splatfest_discordSent = "CREATE TABLE `splatfest_discordSent` (`id` int(11) NOT NULL AUTO_INCREMENT, `channelId` decimal(25,0) NOT NULL, `messageId` decimal(25,0) NOT NULL, `splatfestId` int(11) NOT NULL, `messageType` varchar(10) NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`splatfestId`) REFERENCES `splatfest_splatfest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);";
    createTables("splatfest_discordSent", createTable_splatfest_discordSent);

    await sleep(20);
    insertRows();
}

async function insertRows() {
    
}

module.exports = checkTables;