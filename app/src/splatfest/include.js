const cron = require('node-cron');

const dbSetup = require("./dbSetup.js")

const getData = require ("./getData.js");
const createIcs = require('./createIcs.js');
const discordSendNew = require('./discordSendNew.js');
const discordSendWin = require('./discordSendWin.js');

const run = Number(process.env.SPLATFEST_RUN_HOUR)
const runFirst = Number(process.env.SPLATFEST_RUN_HOUR) - 1

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function splatfest() {
    dbSetup();
    await sleep(1000);

    // Run once at the start
    getData();
    createIcs();
    discordSendNew();
    discordSendWin();
    
    if (!run || !runFirst) {
        console.error("run not defined")
    } else {
        cron.schedule('0 45 ' + runFirst + ' * * *', () => {
            getData();
        });

        cron.schedule('0 0 ' + run + ' * * *', () => {
            discordSendNew();
            discordSendWin();
            createIcs();
        });
    }
};

module.exports = splatfest;