const mysql = require('mysql2');

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