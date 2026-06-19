const express = require("express");
const router = express.Router();

const computerController = require("../controllers/computer.controller");

/**
 * @swagger
 * /computers:
 *   get:
 *     summary: Get all computers
 *     description: Returns a list of all computers in the database.
 *     tags:
 *       - Computers
 *     responses:
 *       200:
 *         description: Successfully retrieved computer list.
 *       500:
 *         description: Internal server error.
 */
router.get("/computers", computerController.getAllComputers);

/**
 * @swagger
 * /computers:
 *   post:
 *     summary: Save full computer inventory data
 *     description: Inserts a new computer and all related inventory data, including programs, network adapters, RAM, batteries, storage, external displays, GPUs, CPUs, and printers.
 *     tags:
 *       - Computers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - computer_name
 *               - os_version
 *               - serial_number
 *             properties:
 *               computer_name:
 *                 type: string
 *                 example: Intern-user
 *               os_version:
 *                 type: string
 *                 example: Windows 11 Pro
 *               serial_number:
 *                 type: string
 *                 example: ABC123456
 *               total_ram_slots:
 *                 type: integer
 *                 example: 2
 *               programs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Google Chrome
 *                   - Discord
 *                   - Visual Studio Code
 *               network_adapters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Realtek WiFi 6
 *                     mac_address:
 *                       type: string
 *                       example: A8:41:F4:30:CA:E8
 *                     status:
 *                       type: string
 *                       example: Enabled
 *                     ip_address:
 *                       type: string
 *                       example: 10.132.80.191
 *               rams:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     brand:
 *                       type: string
 *                       example: Kingston
 *                     part_number:
 *                       type: string
 *                       example: KF432S20IB/16
 *                     capacity:
 *                       type: string
 *                       example: 16 GB
 *                     speed:
 *                       type: string
 *                       example: 3200 MHz
 *                     type:
 *                       type: string
 *                       example: DDR4
 *                     form_factor:
 *                       type: string
 *                       example: SODIMM
 *               batteries:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     battery_name:
 *                       type: string
 *                       example: Primary Battery
 *                     manufacturer:
 *                       type: string
 *                       example: Dell
 *                     chemistry:
 *                       type: string
 *                       example: Li-ion
 *                     design_capacity:
 *                       type: string
 *                       example: 50000 mWh
 *                     full_charge_capacity:
 *                       type: string
 *                       example: 45000 mWh
 *                     health_percent:
 *                       type: number
 *                       example: 90
 *                     status:
 *                       type: string
 *                       example: OK
 *               storages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     storage_name:
 *                       type: string
 *                       example: Samsung SSD 980
 *                     serial_number:
 *                       type: string
 *                       example: S64ANX0T123456
 *                     storage_type:
 *                       type: string
 *                       example: SSD
 *                     capacity:
 *                       type: string
 *                       example: 1 TB
 *                     health_status:
 *                       type: string
 *                       example: Healthy
 *                     connection_type:
 *                       type: string
 *                       example: NVMe
 *                     temperature:
 *                       type: string
 *                       example: 42 C
 *               external_displays:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     display_name:
 *                       type: string
 *                       example: Dell P2422H
 *               gpus:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     gpu_name:
 *                       type: string
 *                       example: Intel(R) Iris(R) Xe Graphics
 *                     manufacturer:
 *                       type: string
 *                       example: Intel Corporation
 *                     gpu_type:
 *                       type: string
 *                       example: Integrated
 *                     vram:
 *                       type: string
 *                       example: 2 GB
 *                     ram_share:
 *                       type: string
 *                       example: Shared
 *                     driver_version:
 *                       type: string
 *                       example: 32.0.101.7077
 *               cpus:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     cpu_name:
 *                       type: string
 *                       example: Intel Core i7-1260P
 *                     manufacturer:
 *                       type: string
 *                       example: Intel
 *                     cores:
 *                       type: integer
 *                       example: 12
 *                     threads:
 *                       type: integer
 *                       example: 16
 *                     base_speed:
 *                       type: string
 *                       example: 2.10 GHz
 *                     max_speed:
 *                       type: string
 *                       example: 4.70 GHz
 *                     socket_type:
 *                       type: string
 *                       example: U3E1
 *               printers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     printer_name:
 *                       type: string
 *                       example: Canon LBP2900
 *                     ip_address:
 *                       type: string
 *                       example: 192.168.1.50
 *                     department:
 *                       type: string
 *                       example: IT
 *                     is_default:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       201:
 *         description: Computer saved successfully.
 *       409:
 *         description: Duplicate computer name.
 *       500:
 *         description: Internal server error.
 */
router.post("/computers", computerController.saveComputer);

// /**
//  * @swagger
//  * /computers/search:
//  *   get:
//  *     summary: Search computers by name
//  *     description: Returns computer names that partially match the keyword.
//  *     tags:
//  *       - Computers
//  *     parameters:
//  *       - in: query
//  *         name: keyword
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: Intern
//  *         description: Computer name keyword to search for.
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved matching computers.
//  *       500:
//  *         description: Internal server error.
//  */
// router.get("/computers/search", computerController.searchComputers);
// get all computer names in frontend and then filter at front end
// put non path variable api before path variable api, to avoid ex:
// /computers/search could accidentally be treated as: /computers/:computerName
// where computerName = "search".





/**
 * @swagger
 * /computers/insertOneProgram:
 *   post:
 *     summary: Insert one program for a computer
 *     description: Inserts one program into the Programs table by using the computer name to find the computer ID.
 *     tags:
 *       - Computers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               computer_name:
 *                 type: string
 *                 example: Intern-user
 *               program:
 *                 type: string
 *                 example: Google Chrome
 *     responses:
 *       201:
 *         description: Program inserted successfully.
 *       500:
 *         description: Internal server error.
 */
router.post("/computers/insertOneProgram", computerController.insertOneProgram);


/**
 * @swagger
 * /computers/deleteProgramByComputerName:
 *   delete:
 *     summary: Delete one program from a computer
 *     description: Deletes a specific program belonging to a specified computer.
 *     tags:
 *       - Computers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               computer_name:
 *                 type: string
 *                 example: Intern-user
 *               program:
 *                 type: string
 *                 example: Google Chrome
 *     responses:
 *       200:
 *         description: Program deleted successfully.
 *       500:
 *         description: Internal server error.
 */
router.delete("/computers/deleteProgramByComputerName", computerController.deleteProgramByComputerName);


/**
 * @swagger
 * /computers/delete/{computerName}:
 *   delete:
 *     summary: Delete a computer and all related inventory data
 *     description: Deletes a computer and all related child data, including programs, network adapters, RAM, CPUs, batteries, storage drives, GPUs, printers, and external displays.
 *     tags:
 *       - Computers
 *     parameters:
 *       - in: path
 *         name: computerName
 *         required: true
 *         schema:
 *           type: string
 *         example: Intern-user
 *         description: The computer name to delete.
 *     responses:
 *       200:
 *         description: Computer and all related inventory data deleted successfully.
 *       500:
 *         description: Internal server error.
 */
router.delete("/computers/delete/:computerName", computerController.deleteComputer);

/**
 * @swagger
 * /computers/{computerName}/details:
 *   get:
 *     summary: Get full inventory details by computer name
 *     description: Returns all related inventory data for the specified computer, including programs, network adapters, RAM, batteries, storage drives, external displays, GPUs, CPUs, and printers.
 *     tags:
 *       - Computers
 *     parameters:
 *       - in: path
 *         name: computerName
 *         required: true
 *         schema:
 *           type: string
 *         example: Intern-user
 *         description: The computer name.
 *     responses:
 *       200:
 *         description: Successfully retrieved full computer inventory details.
 *       500:
 *         description: Internal server error.
 */
router.get("/computers/:computerName/details", computerController.findComputerDetailsByComputerName);


/**
 * @swagger
 * /computers/{computerName}:
 *   get:
 *     summary: Get computer details by computer name
 *     description: Returns a single computer's information.
 *     tags:
 *       - Computers
 *     parameters:
 *       - in: path
 *         name: computerName
 *         required: true
 *         schema:
 *           type: string
 *         example: Intern-user
 *         description: The computer name.
 *     responses:
 *       200:
 *         description: Successfully retrieved computer.
 *       500:
 *         description: Internal server error.
 */
router.get("/computers/:computerName", computerController.findByComputerName);
// use path variable -> req.params



/**
 * @swagger
 * /programs/{programName}/computers:
 *   get:
 *     summary: Get computers by program name
 *     description: Returns a list of computer names that have the specified program installed.
 *     tags:
 *       - Computers
 *     parameters:
 *       - in: path
 *         name: programName
 *         required: true
 *         schema:
 *           type: string
 *         example: Google Chrome
 *         description: The installed program name.
 *     responses:
 *       200:
 *         description: Successfully retrieved computer names.
 *       500:
 *         description: Internal server error.
 */
router.get("/programs/:programName/computers", computerController.findComputersByProgramName);
/*

1. Path Variable → req.params

URL:

/computers/Intern-user

Route:

router.get("/computers/:computerName", ...)

Access value:

req.params.computerName

Result:

"Intern-user"

Very similar to Spring Boot:

@PathVariable


2. Query Parameter (?) → req.query

URL:

/computer?computerName=Intern-user

Access value:

req.query.computerName

Result:

"Intern-user"

Very similar to Spring Boot:

@RequestParam

1. get by compter_name ✅
2. input computer then show all program_name
*/
module.exports = router;