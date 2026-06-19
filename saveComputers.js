// const [rows] = await db.query(`
//     SELECT id FROM Computers
//     WHERE computer_name = ?
//     `, [req.body.computerName]);

// const row = rows[0]; /* gets the first array from the result
// , which is the array of rows object */

// const computer_id = row.id;

const db = require("./config/db");

const body = 
{
  "computerName": "IT001",
  "tables": [
    {
      "tableName": "Computers",
      "rows": [
        {
          "fields": [
            { "name": "computer_name", "value": "IT001" },
            { "name": "serial_number", "value": "SN00001" },
            { "name": "department", "value": "IT" },
            { "name": "status", "value": "In Use" }
          ]
        }
      ]
    },
    {
      "tableName": "Programs",
      "rows": [
        {
          "fields": [
            { "name": "program_name", "value": "Google Chrome" }
          ]
        },
        {
          "fields": [
            { "name": "program_name", "value": "Microsoft Office" }
          ]
        }
      ]
    },
    {
      "tableName": "Batteries",
      "rows": [
        {
          "fields": [
            { "name": "battery_name", "value": "Primary Battery" },
            { "name": "manufacturer", "value": "Panasonic" },
            { "name": "chemistry", "value": "Lithium" }
          ]
        }
      ]
    }
  ]
}


/*
INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);

UPDATE Customers
SET ContactName = 'Alfred Schmidt', City= 'Frankfurt'
WHERE CustomerID = 1;
*/
    let comSqlInsert;
    // let comSqlUpdate = 'UPDATE Computers SET ';
    let tableName;
    // let deleteComSql = '';
    let insertSqls = [];
    let insertSqlsValues = [];
    let comSqlInsertValues = [];
    // let deleteSqls = [];
    // In standard nested loops, 
    // the inner loop runs completely from start to finish for each single iteration of the outer loop.
    for (const table of body.tables) { // iterate through each tables (for each table do this)
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
                    // if (tableName === 'Computers') {
                    //     comSqlUpdate += `${field.name} = '${field.value}' WHERE id = ?`
                    // }
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
                // deleteSql += `FROM ${tableName} `
                names += `${field.name}, `;
                values += '?, '
                // MySQL is flexible and often auto-converts strings,
                // comSqlUpdate += `${field.name} = ${field.value}, `;  if put this here it runs for every table
                index++;
            }
            // add name THEN values to the INSERT query
            insertSql += names;
            insertSql += values;

            // Here is after completing first MOST OUTER LOOP iteration.
            // only include the sql thats not Computers table into sqls array list.
            if(tableName === 'Computers') { // prepares comSql INSERT sql
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



    // 🔴 run insert computers table row if row is undefined(no computer id) 

    // no computer id found
    if (row === undefined) {
        // insert Computers table
        const [result] = await db.query(comSqlInsert, comSqlInsertValues);

        const computer_id = result.insertId;

        let insertSqlsIndex = 0; // current index in the insertSqlsValues

        // for each row's insert sql replace with the proper things then run the INSERT queries

        // add if statement for pushing com_id infront of the array
        for (let sql of insertSqls) {
            sql = sql.replace('computer-id-field', 'computer_id');
            sql = sql.replace('computer-id-value', '?');
            let insertSqlsValuesPerRow = []; // resets values per row array
            insertSqlsValuesPerRow.push(computer_id);
            // for every child tables have computer_id for the first field


            // use while? since for of starts from the beginning of
            for (const _ of insertSqlsValues) { // just loop to max to the end of the array
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


    // if computer_id found => delete all tables using => insert all tables using input data
    // deleting Computers deleting ON Cascade
    else {
        const computer_name_id = row.id;

        /* if your child tables use proper foreign keys with:
        ON DELETE CASCADE
        then deleting from Computers automatically deletes related rows(foreign keys).
        */
        await db.query(`DELETE FROM Computers
                        WHERE id = ?`, [computer_name_id]);

        const [result] = await db.query(comSqlInsert, comSqlInsertValues);

        const computer_id = result.insertId;

        let insertSqlsIndex = 0; // current index in the insertSqlsValues

        // for each row's insert sql replace with the proper things then run the INSERT queries

        // add if statement for pushing com_id infront of the array
        for (let sql of insertSqls) {
            sql = sql.replace('computer-id-field', 'computer_id');
            sql = sql.replace('computer-id-value', '?');
            let insertSqlsValuesPerRow = []; // resets values per row array
            insertSqlsValuesPerRow.push(computer_id);
            // for every child tables have computer_id for the first field


            // use while? since for of starts from the beginning of
            for (const _ of insertSqlsValues) { // just loop to max to the end of the array
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
        


for (const sqls of comSqlInsertValues) {
    console.log(sqls);
}

for (const sql of insertSqls) {
    console.log(sql);
}

console.log(comSqlInsert);

console.log(insertSqlsValues);

// for (const sql of deleteSqls) {
//     console.log(sql);
// }

// check insert output for every table using print
// contructed Update and Insert operations
// if have id then execute update => delete the rest => insert with all input data
// if no id insert all from input

/*


    // updates Computers row if the data alr exists
    // since we cannot delete Computers first, 
    // It's PK so sql causes error if delete computers first
    // maybe can delete all tables related to it first then delete computers last.

    // await db.query(comSqlUpdate);

    // delete all tables(except for Computers table)
    // so need to construct delete for all tables
    // construct by setting the sqlDelete variables outside the for loop
    // and construct it inside the for loop
*/