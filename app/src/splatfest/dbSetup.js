const createTables = require('../common/createTables.js');
const insertData = require('../common/insertData.js');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function checkTables() {
    let createTable_eventTypes = "CREATE TABLE `eventTypes` (`id` int(11) NOT NULL AUTO_INCREMENT, `data` varchar(15) NOT NULL, PRIMARY KEY (`id`));";
    createTables("eventTypes", createTable_eventTypes);
    
    let createTable_dataTypes = "CREATE TABLE `dataTypes` (`id` int(11) NOT NULL AUTO_INCREMENT, `data` varchar(15) NOT NULL, PRIMARY KEY (`id`));";
    createTables("dataTypes", createTable_dataTypes);

    await sleep(20);

    let createTable_messageTypes = "CREATE TABLE `messageTypes` (`id` int(11) NOT NULL AUTO_INCREMENT, `eventId` int(11) NOT NULL, `data` varchar(15) NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`eventId`) REFERENCES `eventTypes` (`id`));";
    createTables("messageTypes", createTable_messageTypes);

    let createTable_splatCal = "CREATE TABLE `splatCal` (`id` int(11) NOT NULL AUTO_INCREMENT, `eventId` int(11) NOT NULL, `title` varchar(20) NOT NULL, `name` varchar(50) NOT NULL, `region` varchar(20) NOT NULL, `wikiUrl` varchar(120) NOT NULL, `imgUrl` varchar(175) NOT NULL, `slug` varchar(50) NOT NULL, `startDate` datetime NOT NULL, `endDate` datetime NOT NULL, `created` datetime NOT NULL, `uid` varchar(50) NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`eventId`) REFERENCES `eventTypes` (`id`));";
    createTables("splatCal", createTable_splatCal);

    await sleep(20);

    let createTable_descData = "CREATE TABLE `descData` (`id` int(11) NOT NULL AUTO_INCREMENT, `calId` int(11) NOT NULL, `dataCalId` int(11) NOT NULL, `dataTypeId` int(11) NOT NULL, `data` varchar(250) NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`calId`) REFERENCES `splatCal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`dataTypeId`) REFERENCES `dataTypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);";
    createTables("descData", createTable_descData);

    await sleep(20);
    
    let createTable_win = "CREATE TABLE `win` ( `id` int(11) NOT NULL AUTO_INCREMENT, `calId` int(11) NOT NULL, `descId` int(11) NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`calId`) REFERENCES `splatCal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`descId`) REFERENCES `descData` (`id`) ON DELETE CASCADE ON UPDATE CASCADE);";
    createTables("win", createTable_win);

    let createTable_discordSent = "CREATE TABLE `discordSent` (`id` int(11) NOT NULL AUTO_INCREMENT, `channelId` decimal(25,0) NOT NULL, `messageId` decimal(25,0) NOT NULL, `calId` int(11) NOT NULL, `messageType` int(11) NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`calId`) REFERENCES `splatCal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`messageType`) REFERENCES `messageTypes` (`id`));";
    createTables("discordSent", createTable_discordSent);

    await sleep(20);
    insertRows();
}

async function insertRows() {
    insertData("eventTypes", 1, "splatfest");

    await sleep(20);

    insertData("dataTypes", 1, "Name");
    insertData("dataTypes", 2, "Location");
    insertData("dataTypes", 3, "Link");
    insertData("dataTypes", 4, "Team");

    await sleep(20);

    insertData("dataTypes", 5, "imgUrl");

    await sleep(20);

    insertData("messageTypes", 1, "newSplatfest", 1);
    insertData("messageTypes", 2, "splatfestWin", 1);
}

module.exports = checkTables;