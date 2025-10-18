const mysql = require('mysql2');

if (!process.env.DB_HOST) {
  throw "env variable DB_HOST not set"
}
if (!process.env.DB_USER) {
  throw "env variable DB_USER not set"
}
if (!process.env.DB_PASSWORD) {
  throw "env variable DB_PASSWORD not set"
}
if (!process.env.DB_NAME) {
  throw "env variable DB_NAME not set"
}

async function sqlConnect() {
    sql = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

    let sqlcon = mysql.createConnection(sql);

    let sqlconnection = await new Promise((resolve, reject) => {
        sqlcon.connect((error) => {
            if (error) throw error;
            resolve(sqlcon);
        });
    });
    return sqlconnection;
};

module.exports = sqlConnect;