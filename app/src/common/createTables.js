const sqlConnect = require('./sql.js');
const errorSend = require('./errorSend.js');

async function createTables(table, createTable) {
    if (table && createTable) {
        let sqlconnection = await sqlConnect();

        let sql = "SHOW TABLE STATUS FROM ?? WHERE Name = ?;"
        sqlconnection.query(sql, [ process.env.DB_NAME, table ], function (error, data) {
        if (error) {
            console.error(error);
            let element = "Setup";
            let category = "Create tables";
            let part = "Check";
            errorSend({ element, category, part, error });
        };
            if (!data || !data[0]) {
                sqlconnection.query(createTable, [ table ], function (error, data) {
                    if (error) {
                        console.error(error);
                        let element = "Setup";
                        let category = "Create tables";
                        let part = "Insert";
                        errorSend({ element, category, part, error });
                    };
                    console.log("table created");
                })
            }
            sqlconnection.end();
        })
    }
}

module.exports = createTables;