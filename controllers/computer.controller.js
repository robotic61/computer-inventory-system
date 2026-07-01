const db = require("../config/db");

async function getAllComputers(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT * FROM Computers
        `);

        const cleanRows = rows.map(row => {
            const {id, ...cleanRow} = row;
            return cleanRow;
        });

        res.status(200).json(cleanRows);
        // usually auto set to status 200, but should specific so it is more clear.

    } catch (error) {

        res.status(500).json({
            message: "Failed to get computer list",
            error: error.message
        });
    }
}

async function findByComputerName(req, res) {
    try {

        const computerName = req.params.computerName;

        if (!computerName || computerName.trim() === "") {
            return res.status(400).json({ // sends 400 response, and stops function execution
                // Status 400 (Bad Request) means: The client sent invalid input.
                message: "computerName is required"
            });

            /*

            In JavaScript:

            if (value)

            means:

            if value is truthy

            Most values with actual content are considered true.
            Catches Falsy values:
            undefined
            ""
            null

            .trim() removes spaces from beginning and end.

            Example:

            "     ".trim()

            becomes:

            ""

            (empty string)

            So this catches users sending:

            " "

            only spaces.

            Without trim:

            if (!computerName)

            would FAIL to catch:

            "     "

            because a string containing spaces is still considered TRUE in JavaScript.

            */
        }
        

        const [rows] = await db.query(`
            SELECT * FROM Computers WHERE 
            computer_name = ?
            `, [computerName]);
        

        const row = rows[0];

        // if no computer found
        if (!row) {
            return res.status(404).json({
                message: "Computer not found"
            });
        }

        const {id, ...computer} = row;

        /*
        If no rows exist:

        rows = []

        Then:

        rows[0]

        becomes:

        undefined
        */

        res.status(200).json(computer);
        // add message to all json and status 200.

    } catch (error) {
        res.status(500).json({
            message: "Failed to get computer",
            error: error.message
        });
    }
}

// find computer details and all related child table data
async function findComputerDetailsByComputerName(req, res) {
    try {
        const computerName = req.params.computerName;


        if (!computerName || computerName.trim() === "") {
            return res.status(400).json({ // sends 400 response, and stops function execution
                // Status 400 (Bad Request) means: The client sent invalid input.
                message: "computerName is required"
            });
        }

        const [computerRows] = await db.query(`
            SELECT *
            FROM Computers
            WHERE computer_name = ?
            `, [computerName]);
        
        // if computer not found
        if (computerRows.length === 0) {
            return res.status(404).json({
                message: "Computer not found"
            });
        }

        /*
        query can return many rows(one row in this query):

        computerRows = [
            {
                id: 9,
                computer_name: "DEV006",
                brand: "ASUS",
                model: "TUF A15"
            }
        ]
        */

        // get json from the query rows
        const computer = computerRows[0];

        // object destructuring with rest syntax
        const {id, ...computerData} = computer;

        /*

        suppose:

        const computer = {
            id: 5,
            computer_name: "DEV006",
            brand: "ASUS",
            os: "Windows 11"
        };

        Take id out of computer.
        Put everything else into computerData.
        get:

        id = 5

        and:

        computerData = {
            computer_name: "DEV006",
            brand: "ASUS",
            os: "Windows 11"
        }
        */



        // list all childTables
        const childTables = [
            "Programs",
            "network_adapters",
            "Rams",
            "Batteries",
            "Storages",
            "external_displays",
            "Gpus",
            "Cpus",
            "Printers"
        ];

        const results = {
            computer: computerData
        };

        // For each child table, get all rows that belong to this computer, clean the rows, then store them in results.
        for (const tableName of childTables) {
            const [rows] = await db.query(`
                SELECT *
                FROM ${tableName}
                WHERE computer_id = ?
                `, [id]);
            
            // The map method returns a brand new transformed array
            results[tableName] = rows.map(row => {
                const {id, computer_id, ...cleanRow} = row;
                return cleanRow; // transforms each row into cleanRow without id and computer_id
                // for multiple map statements use return
            });

        }
            /*
            This:
            results["Rams"]

            is EXACTLY SAME as:

            results.Rams

            saves the result of the transformed row into the results field as the tableName
            */


        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get computer details",
            error: error.message
        });
    }
}

// async function searchComputers(req, res) {
//     try {
//         const keyword = req.query.keyword;
//         //?keyword=
//         const computers = await computerService.searchComputers(keyword);

//         res.status(200).json(computers);
//     } catch(error) {
//         res.status(500).json({
//             message: "Failed to search computers",
//             error: error.message
//         });
//     }
//     // A search API, not just “get one exact computer name.” 
//     // We’ll make it support partial typing, like typing Intern returns all matching computers.
// }

async function saveComputer(req, res) {
    try {
        /*
        INSERT INTO table_name (column1, column2, column3, ...)
        VALUES (value1, value2, value3, ...);

        DELETE FROM table_name WHERE condition;
        */

        // checks if input is valid
        if (!req.body || !Array.isArray(req.body.tables)) {
            return res.status(400).json({
                message: "tables array is required"
            });
        }

        if (!req.body.computerName || req.body.computerName.trim() === "") {
            return res.status(400).json({
                message: "computerName is required"
            });
        }

        const hasComputerTable = req.body.tables.some(table => table.tableName === "Computers");
        // For each table, check if table.tableName is exactly "Computers".
        /*
        .some(...) means:

        Check if at least one item in the array matches this condition. (if one true then it returns true)
        if all returns false then hasComputerTable = false
        */

        if (!hasComputerTable) { // !false = true
            return res.status(400).json({message: "Computers table is required"});
        }

        let comSqlInsert;
        let tableName;
        let insertSqls = [];
        let insertSqlsValues = [];
        let comSqlInsertValues = [];
        // In standard nested loops, 
        // the inner loop runs completely from start to finish for each single iteration of the outer loop.
        for (const table of req.body.tables) { // iterate through each tables (for each table do this)
            tableName = table.tableName;

            if (!Array.isArray(table.rows)) {
                return res.status(400).json({
                    message: `${table.tableName} rows must be an array`
                });
            }
            
            for (const row of table.rows) { // iterate through each rows (for each row do this)
                // need to do one INSERT operation for each row
                // RESETS index for each row(after finishing constructing for each operation)

                if (!Array.isArray(row.fields) || row.fields.length === 0) {
                    return res.status(400).json({
                        message: `${tableName} fields must be a non-empty array`
                    });
                }

                /*
                Valid

                {
                "tableName": "external_displays",
                "rows": []
                }

                Invalid

                {
                "tableName": "external_displays",
                "rows": [
                    {
                    "fields": []
                    }
                ]
                }
                */

                let index = 0; // where we are at in the fields array
                let insertSql = `INSERT INTO ${tableName} (`
                
                // resets name and values after each row
                let names = '';
                let values = ' VALUES (';
                names += 'computer-id-field, ';
                values += 'computer-id-value, ';

                for (const field of row.fields) { // iterate through each fields

                    if (!field.name || field.name.trim() === "") {
                        return res.status(400).json({
                            message: `${tableName} field name is required`
                        });
                    }
                    if (index === row.fields.length-1) { // for last item add ')' and no space and WHERE condition for UPDATE
                        if (tableName !== 'Computers') {
                            insertSqlsValues.push(field.value);
                            names += `${field.name})`;
                            values += '?)';
                            insertSqlsValues.push(NaN);
                            break;
                        }
                        names += `${field.name})`;
                        values += '?)';
                        comSqlInsertValues.push(field.value);
                        break; // exits immediately if its the last item in the fields
                    }

                    if (tableName !== 'Computers') {
                        insertSqlsValues.push(field.value);
                    }
                    else {
                        comSqlInsertValues.push(field.value);
                    }
                    names += `${field.name}, `;
                    values += '?, '
                    // MySQL is flexible and often auto-converts strings,
                    index++;
                }
                // add name THEN values to the INSERT query
                insertSql += names;
                insertSql += values;

                // Here is after finish constructing the sql
                // only include the sql thats not Computers table into sqls array list.
                if(tableName === 'Computers') { // seperate out the comSql INSERT sql
                    comSqlInsert = insertSql;
                }
                else {
                    insertSqls.push(insertSql); 
                }
            }
        }

        // comSql does not need to input id field and value so we remove them.
        comSqlInsert = comSqlInsert.replace('computer-id-field, ', '');
        comSqlInsert = comSqlInsert.replace('computer-id-value, ', '');


        const [rows] = await db.query(`
                SELECT id FROM Computers
                WHERE computer_name = ?
                `, [req.body.computerName]);

        const row = rows[0]; /* gets the first array from the result
        // , which is the array of rows object */

        // if no computer is found rows will be: []
        // if no id(no computer exists) we will insert all from input from Agent
        // since there will be no data for that computer at all.

        async function insertChildTables(computer_id) {
            let insertSqlsIndex = 0; // current index in the insertSqlsValues

            for (let sql of insertSqls) {
            sql = sql.replace('computer-id-field', 'computer_id');
            sql = sql.replace('computer-id-value', '?');
            let insertSqlsValuesPerRow = []; // resets values per row array
            insertSqlsValuesPerRow.push(computer_id);
            // for every child tables have computer_id for the first field

            for (const _ of insertSqlsValues) { // just loop to the end of the array
                let currentValue = insertSqlsValues[insertSqlsIndex];
                if (Number.isNaN(currentValue)) {
                    // if current index = NaN then move to next index and break.
                    insertSqlsIndex++;
                    break;
                }
                insertSqlsValuesPerRow.push(insertSqlsValues[insertSqlsIndex]);
                insertSqlsIndex++;
            }


            await db.query(sql, insertSqlsValuesPerRow);

            // await db.query(sql, insertSqlsValuesPerRow);
            // await db.query(sql);
        }
        }

        // if computer exists, delete old computer row first
        if (row !== undefined) { // if there is existing computer

            await db.query(`DELETE FROM Computers
                            WHERE id = ?`, [row.id]); // get id from existing computer row
            // insert Computers table
        }

        const [result] = await db.query(comSqlInsert, comSqlInsertValues); // must insert new computers for both cases

        const computer_id = result.insertId;

        await insertChildTables(computer_id);


        // if computer_id found => delete all tables using => insert all tables using input data
        // deleting Computers deleting ON Cascade
        // else {

        //     /* if your child tables use proper foreign keys with:
        //     ON DELETE CASCADE
        //     then deleting from Computers automatically deletes related rows(foreign keys).
        //     */
        //     await db.query(`DELETE FROM Computers
        //                     WHERE computer_name = ?`, [req.body.computerName]);

        //     const [result] = await db.query(comSqlInsert, comSqlInsertValues);

        //     const computer_id = result.insertId;

        //     await insertChildTables(computer_id);

        // }
        res.status(201).json({
            message: "Computer saved successfully"
        });

    } catch(error) {

       return res.status(500).json({
            message: "Error",
            error: error.message
        });
    }

}

async function deleteComputer(req, res) {
    try {
        const computerName = req.params.computerName;
        
        if (!computerName || computerName.trim() === "") {
            return res.status(400).json({
                message: "computerName is required"
            });
        }

        const [result] = await db.query(`
            DELETE 
            FROM Computers
            WHERE computer_name = ?
            `, [computerName]);
        // Delete child tables rows before parent tables rows
        // But here we have ON DELETE CASCADE for the child tables, so we can delete immediately.

        /*
        result is NOT an array of rows, it is an object like:
        {
            affectedRows: 1,
            warningStatus: 0,
            ...
        }
        */

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Computer not found"
            });
        }

        res.status(200).json({
            message: "Computer deleted successfully"
        });
    } catch(error) {
        res.status(500).json({
            message: "Failed to delete computer",
            error: error.message
        });
    }
}

async function deleteProgramByComputerName(req, res) {
    try {

        const {
            computer_name,
            program
        } = req.body;

        // if there is no computer_name/program in the JSON field it will become undefined
        if (!computer_name || computer_name.trim() === "") {
            return res.status(400).json({
                message: "computer_name is required"
            });
        }

        if (!program || program.trim() === "") {
            return res.status(400).json({
                message: "program is required"
            });
        }

        const [result] = await db.query(`
            DELETE p FROM Programs p
            JOIN Computers c ON c.id = p.computer_id
            WHERE c.computer_name = ? AND p.program_name = ?
            `, [computer_name, program]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "No matching program found for this computer"
            });
        }

        res.status(200).json({
            message: "Program deleted successfully"
        });
    } catch(error) {
        res.status(500).json({
            message: "Failed to delete program",
            error: error.message
        });
    }
}

async function insertOneProgram(req, res) {
    try {

        const {
            computer_name,
            program
        } = req.body;

        if (!computer_name || computer_name.trim() === "") {
            return res.status(400).json({
                message: "computer_name is required"
            });
        }

        if (!program || program.trim() === "") {
            return res.status(400).json({
                message: "program is required"
            });
        }

        const [rows] = await db.query(`
            SELECT id FROM Computers
            WHERE computer_name = ?
            `, [computer_name]);

        const row = rows[0]; // gets the first object in the row array
        
        // if no first object = row = undefined = no computer found
        if (!row) {

            return res.status(404).json({
                message: "Computer not found"
            });
        }

        const computer_id = row.id;


        const [result] = await db.query(`
            INSERT INTO Programs (computer_id,
            program_name)
            VALUES (?, ?)
            `, [computer_id, program]);

        res.status(201).json({
            message: "Program inserted successfully"
        });
    } catch(error) {
        res.status(500).json({
            message: "Failed to insert program",
            error: error.message
        });
    }
}

async function findComputersByProgramName(req, res) {
    try {
        const programName = req.params.programName;

        if (!programName || programName.trim() === "") {
            return res.status(400).json({
                message: "program is required"
            });
        }

        const [computers] = await db.query(`
            SELECT c.computer_name
            FROM Computers c
            JOIN Programs p
                ON p.computer_id = c.id
            WHERE p.program_name = ?
            ORDER BY c.computer_name ASC
            `, [programName]);

        if (computers.length === 0) {
            return res.status(404).json({
                message: "No computers found for this program"
            })
        }

        res.status(200).json(computers);
    } catch(error) {
        res.status(500).json({
            message: "Failed to get computers by program name",
            error: error.message
        });
    }
}

module.exports = {
    getAllComputers,
    findByComputerName,
    findComputerDetailsByComputerName,
    // searchComputers,
    saveComputer,
    deleteComputer,
    deleteProgramByComputerName,
    insertOneProgram,
    findComputersByProgramName
};

/*

Fixes

1. http error handler(do last)
2. mainly error 404 if not found
3. delete computers then also delete all the computers program(input computer name)
4. input JSON, com name and 1 program then delete that program from the db

if (!req.body.computer_name) {
    return res.status(400).json({
        message: "computer_name is required"
    });
}

APIs become:

400 → bad request / missing data
404 → not found
409 → duplicate/conflict
500 → server/database error
*/
