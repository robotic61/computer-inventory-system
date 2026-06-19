const db = require("../config/db");

async function getAllComputers(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT * FROM Computers
        `);

        res.status(200).json(rows);
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
        
    const result = await db.query(`
        SELECT * FROM Computers WHERE 
        computer_name = ?
        `, [computerName]);
    
    const computer = result[0][0]; // returns a single object

        /*
        If no rows exist:

        result[0] = []

        Then:

        result[0][0]

        becomes:

        undefined
        */

        if (!computer) {
            //
            return res.status(404).json({
                // Status 404 Not Found means: Requested resource does not exist
                // "I understood your request, but the thing you asked for does not exist."
                message: "Computer not found"
            });
        }

        res.status(200).json(computer);
        // add message to all json and status 200.

    } catch (error) {
        res.status(500).json({
            message: "Failed to get computer",
            error: error.message
        });
    }
}

// find all tables, except for computers table.
async function findComputerDetailsByComputerName(req, res) {
    try {
        const computerName = req.params.computerName;

        const [programs] = await db.query(`
            SELECT p.program_name
            FROM Computers c
            JOIN Programs p 
                ON c.id = p.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        const [network_adapters] = await db.query(`
            SELECT n.name, n.mac_address, n.status, n.ip_address
            FROM Computers c
            JOIN network_adapters n
                ON c.id = n.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        const [rams] = await db.query(`
            SELECT r.brand, r.part_number, r.capacity, r.speed, r.type, r.form_factor
            FROM Computers c
            JOIN Rams r
                ON r.computer_id = c.id
            WHERE c.computer_name = ?
            `, [computerName]);
        
        const [batteries] = await db.query(`
            SELECT b.battery_name, b.manufacturer, b.chemistry, b.design_capacity, b.full_charge_capacity, b.health_percent, b.status
            FROM Computers c
            JOIN Batteries b
                ON b.computer_id = c.id
            WHERE c.computer_name = ?
            `, [computerName]);

        const [storages] = await db.query(`
            SELECT s.storage_name, s.serial_number, s.storage_type, s.capacity, s.health_status, s.connection_type, s.temperature
            FROM Computers c
            JOIN Storages s
                ON s.computer_id = c.id
            WHERE c.computer_name = ?
            `, [computerName]);  

        const [gpus] = await db.query(`
            SELECT g.gpu_name, g.manufacturer, g.gpu_type, g.vram, g.ram_share, g.driver_version
            FROM Computers c
            JOIN Gpus g
                ON g.computer_id = c.id
            WHERE c.computer_name = ?
            `, [computerName]);

        const [cpus] = await db.query(`
            SELECT cp.cpu_name, cp.manufacturer, cp.cores, cp.threads, cp.base_speed, cp.max_speed, cp.socket_type
            FROM Computers c
            JOIN Cpus cp
                ON cp.computer_id = c.id
            WHERE c.computer_name = ?
            `, [computerName]);

        const [printers] = await db.query(`
            SELECT p.printer_name, p.ip_address, p.department, p.is_default
            FROM Computers c
            JOIN Printers p
                ON p.computer_id = c.id
            WHERE c.computer_name = ?
            `, [computerName]);

        const [external_displays] = await db.query(`
            SELECT e.display_name
            FROM Computers c
            JOIN external_displays e
                ON e.computer_id = c.id
            WHERE c.computer_name = ?
            `, [computerName]);   

        const results = {
            programs,
            network_adapters,
            rams,
            batteries,
            storages,
            gpus,
            cpus,
            printers,
            external_displays
        };

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
        let comSqlInsert;
        let tableName;
        let insertSqls = [];
        let insertSqlsValues = [];
        let comSqlInsertValues = [];
        // In standard nested loops, 
        // the inner loop runs completely from start to finish for each single iteration of the outer loop.
        for (const table of req.body.tables) { // iterate through each tables (for each table do this)
            tableName = table.tableName;

            for (const row of table.rows) { // iterate through each rows (for each row do this)
                // need to do one INSERT operation for each row
                // RESETS index for each row(after finishing constructing for each operation)
                let index = 0; // where we are at in the fields array
                let insertSql = `INSERT INTO ${tableName} (`
                
                // resets name and values after each row
                let names = '';
                let values = ' VALUES (';
                names += 'computer-id-field, ';
                values += 'computer-id-value, ';

                for (const field of row.fields) { // iterate through each fields

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

        // no computer id found
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

        await db.query(`
            DELETE n 
            FROM network_adapters n
            JOIN Computers c ON c.id = n.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        await db.query(`
            DELETE p 
            FROM Programs p
            JOIN Computers c ON c.id = p.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);
            /* Delete table with FK first before PK because PK relates to FK */

        await db.query(`
            DELETE e
            FROM external_displays e
            JOIN Computers c ON c.id = e.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        await db.query(`
            DELETE cp
            FROM Cpus cp
            JOIN Computers c ON c.id = cp.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        await db.query(`
            DELETE b
            FROM Batteries b
            JOIN Computers c ON c.id = b.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        await db.query(`
            DELETE r
            FROM Rams r
            JOIN Computers c ON c.id = r.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        await db.query(`
            DELETE s
            FROM Storages s
            JOIN Computers c ON c.id = s.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        await db.query(`
            DELETE p
            FROM Printers p
            JOIN Computers c ON c.id = p.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);

        await db.query(`
            DELETE g
            FROM Gpus g
            JOIN Computers c ON c.id = g.computer_id
            WHERE c.computer_name = ?
            `, [computerName]);
        
        await db.query(`
            DELETE 
            FROM Computers
            WHERE computer_name = ?
            `, [computerName]);
        // Delete child tables rows before parent tables rows

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

        await db.query(`
            DELETE p FROM Programs p
            INNER JOIN Computers c ON c.id = p.computer_id
            WHERE c.computer_name = ? AND p.program_name = ?
            `, [computer_name, program]);

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

        const [rows] = await db.query(`
            SELECT id FROM Computers
            WHERE computer_name = ?
            `, [computer_name]);

        const row = rows[0]; /* gets the first array from the result
        , which is the array of rows object */

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

        const [computers] = await db.query(`
            SELECT c.computer_name
            FROM Computers c
            JOIN Programs p
                ON p.computer_id = c.id
            WHERE p.program_name = ?
            ORDER BY c.computer_name ASC
            `, [programName]);

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
