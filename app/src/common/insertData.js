const sqlConnect = require('./sql.js');
const errorSend = require('./errorSend.js');

async function insertData(table, id, row, eventId) {
    if (table && id && row) {
        let sqlconnection = await sqlConnect();

        let sql = "SELECT data FROM ?? WHERE data = ?;"
        sqlconnection.query(sql, [ table, row ], function (error, data) {
            if (error) {
                console.error(error);
                let element = "Setup";
                let category = "Insert data";
                let part = "Check";
                errorSend({ element, category, part, error });
            };
            if (!data || !data[0]) {
                let sqlInsert = "";
                let sqlData = [];

                if (table == "messageTypes") {
                    sqlInsert = "INSERT INTO ?? (`id`, eventId, `data`) VALUES (?, ?, ?);";
                    sqlData = [ table, id, eventId, row ]
                } else {
                    sqlInsert = "INSERT INTO ?? (`id`, `data`) VALUES (?, ?);";
                    sqlData = [ table, id, row ]
                }
                sqlconnection.query(sqlInsert, sqlData, function (error, data) {
                    if (error) {
                        console.error(error);
                        let element = "Setup";
                        let category = "Insert data";
                        let part = "Insert";
                        errorSend({ element, category, part, error });
                    };
                    console.log(row + " inserted");
                })
            }
            sqlconnection.end();
        })
    }
}

module.exports = insertData;