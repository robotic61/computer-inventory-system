require("dotenv").config();
// load the .env file and put values into process.env
// we don't need the dotenv object afterward.
/*
.env file
    ↓
dotenv reads it
    ↓
stores into process.env
    ↓
your code accesses process.env.VALUE
*/
const cors = require("cors");
const express = require("express");
// const db = require("./config/db");
const computerRoutes = require("./routes/computer.route");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(computerRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3070;
app.listen(PORT, function() { //need to use port 3070? (custom port)
    console.log(`Server is running at http://localhost:${PORT}`);
});

// async function testDB() {
//     try { // if connection passed
//         const [rows] = await db.query("SELECT 1");
//             // mysql2 returns ARRAY, instead of recordset in microsoft sql server.

//         console.log("Database connection successful");
//         console.log(rows);
//     } catch (error) {
//         console.log("Database connection failed");
//         console.log(error); // displays error 
//     }

// }

// testDB();

