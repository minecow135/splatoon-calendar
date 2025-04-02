const sqlConnect = require('./sql.js');

async function createTables(table, createTable) {
    if (table && createTable) {
        let sqlconnection = await sqlConnect();

        let sql = "SHOW TABLE STATUS FROM ?? WHERE Name = ?;"
        sqlconnection.query(sql, [ process.env.DB_NAME, table ], function (error, data) {
            if (error) throw error;
            if (!data || !data[0]) {
                sqlconnection.query(createTable, [ table ], function (error, data) {
                    if (error) throw error;
                    console.log("table created");
                })
            }
            sqlconnection.end();
        })
    }
}

module.exports = createTables;