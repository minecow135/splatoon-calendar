const sqlConnect = require('./sql.js');
const errorSend = require('./errorSend.js');

async function insertData(table, id, row) {
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
                let sqlInsert = "INSERT INTO ?? (`id`, `data`) VALUES (?, ?);";
                
                sqlconnection.query(sqlInsert, [ table, id, row ], function (error, data) {
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