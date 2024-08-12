const cron = require('node-cron');
const getData = require ("./getData.js");
const createIcs = require('./createIcs.js');
const discordSendNew = require('./discordSendNew.js');
const discordSendWin = require('./discordSendWin.js');

const run = Number(process.env.SPLATFEST_RUN_HOUR)
const runFirst = Number(process.env.SPLATFEST_RUN_HOUR) - 1

async function splatfest() {
    // Run once at the start
    getData();
    createIcs();
    discordSendNew();
    discordSendWin();
    
    if (!run || !runFirst) {
        console.error("run not defined")
    } else {
        console.log('0 45 ' + runFirst + ' * * *')
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