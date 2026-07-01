const express = require("express");
const router = express.Router();

const computerController = require("../controllers/computer.controller");

/**
 * @swagger
 * /computers:
 *   get:
 *     summary: Get all computers
 *     description: Returns a list of all computers in the database. Internal database id is not included in the response.
 *     tags:
 *       - Computers
 *     responses:
 *       200:
 *         description: Successfully retrieved computer list. Returns an empty array if no computers exist.
 *       500:
 *         description: Internal server error.
 */
router.get("/computers", computerController.getAllComputers);

/**
 * @swagger
 * /computers:
 *   post:
 *     summary: Save full computer inventory data
 *     description: Inserts a new computer if it does not exist. If the computer already exists, deletes the old computer row and related child rows using ON DELETE CASCADE, then inserts the latest full inventory data from the request.
 *     tags:
 *       - Computers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - computerName
 *               - tables
 *             properties:
 *               computerName:
 *                 type: string
 *                 example: DEV006
 *               tables:
 *                 type: array
 *                 description: Dynamic list of tables and rows to insert. Must include the Computers table.
 *                 items:
 *                   type: object
 *                   required:
 *                     - tableName
 *                     - rows
 *                   properties:
 *                     tableName:
 *                       type: string
 *                       example: Computers
 *                     rows:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - fields
 *                         properties:
 *                           fields:
 *                             type: array
 *                             items:
 *                               type: object
 *                               required:
 *                                 - name
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: computer_name
 *                                 value:
 *                                   example: DEV006
 *           example:
 *             computerName: DEV006
 *             tables:
 *               - tableName: Computers
 *                 rows:
 *                   - fields:
 *                       - name: computer_name
 *                         value: DEV006
 *                       - name: dept
 *                         value: Software Development
 *                       - name: com_type
 *                         value: PC
 *                       - name: brand
 *                         value: Custom Build
 *                       - name: product_name
 *                         value: Developer Workstation
 *                       - name: model
 *                         value: Developer Workstation V2
 *                       - name: main_board
 *                         value: ASUS ROG STRIX Z790-E
 *                       - name: spec_remark
 *                         value: Backend development machine
 *                       - name: os
 *                         value: Windows 11 Pro
 *                       - name: os_type
 *                         value: Retail
 *                       - name: os_remark
 *                         value: Activated
 *                       - name: office_software
 *                         value: Microsoft 365 Apps
 *                       - name: office_email
 *                         value: dev006@company.com
 *                       - name: sw_type
 *                         value: Subscription
 *                       - name: sw_remark
 *                         value: Dev tools installed
 *                       - name: location
 *                         value: Development Room
 *                       - name: asset
 *                         value: 10600006
 *                       - name: serial_no
 *                         value: DEVPC0006
 *                       - name: purchase_date
 *                         value: 2025-04-15
 *                       - name: warranty_date
 *                         value: 2028-04-15
 *                       - name: status
 *                         value: In Use
 *                       - name: status_remark
 *                         value: Assigned to backend developer
 *                       - name: remark
 *                         value: Docker and VS Code installed
 *                       - name: remark2
 *                         value: High performance workstation
 *                       - name: updated_time
 *                         value: 2026-06-19 13:30:00
 *                       - name: total_ram_slots
 *                         value: 4
 *               - tableName: Programs
 *                 rows:
 *                   - fields:
 *                       - name: program_name
 *                         value: Docker Desktop
 *                   - fields:
 *                       - name: program_name
 *                         value: Visual Studio Code
 *               - tableName: Rams
 *                 rows:
 *                   - fields:
 *                       - name: brand
 *                         value: Corsair
 *                       - name: part_number
 *                         value: CMK32GX5M2B5600C36
 *                       - name: ram
 *                         value: 32
 *                       - name: ram_unit
 *                         value: GB
 *                       - name: speed
 *                         value: 5600
 *                       - name: type
 *                         value: DDR5
 *                       - name: form_factor
 *                         value: DIMM
 *               - tableName: Storages
 *                 rows:
 *                   - fields:
 *                       - name: storage_name
 *                         value: Samsung 990 PRO
 *                       - name: serial_no
 *                         value: DEV006SSD01
 *                       - name: storage_type
 *                         value: NVMe SSD
 *                       - name: hdd
 *                         value: 2000
 *                       - name: hdd_unit
 *                         value: GB
 *                       - name: health_status
 *                         value: 90
 *                       - name: interface_type
 *                         value: PCIe Gen4
 *               - tableName: Gpus
 *                 rows:
 *                   - fields:
 *                       - name: vga
 *                         value: NVIDIA RTX 4070 SUPER
 *                       - name: brand
 *                         value: NVIDIA
 *                       - name: gpu_type
 *                         value: Dedicated
 *                       - name: vram
 *                         value: 12
 *                       - name: shared_memory
 *                         value: 10
 *                       - name: total_memory
 *                         value: 12
 *                       - name: driver
 *                         value: 556.12
 *               - tableName: Cpus
 *                 rows:
 *                   - fields:
 *                       - name: cpu
 *                         value: Intel Core i7-14700K
 *                       - name: cores
 *                         value: 20
 *                       - name: threads
 *                         value: 28
 *                       - name: base_speed
 *                         value: 3.40
 *               - tableName: Batteries
 *                 rows:
 *                   - fields:
 *                       - name: battery_name
 *                         value: Primary Battery
 *                       - name: design_capacity
 *                         value: 56000
 *                       - name: full_charge_capacity
 *                         value: 52000
 *                       - name: health_percent
 *                         value: 92
 *                       - name: status
 *                         value: Healthy
 *               - tableName: network_adapters
 *                 rows:
 *                   - fields:
 *                       - name: name
 *                         value: Intel Ethernet I226-V
 *                       - name: mac_address
 *                         value: 00:AA:BB:CC:DD:66
 *                       - name: ipv4
 *                         value: 192.168.1.106
 *                       - name: status
 *                         value: Enabled
 *               - tableName: external_displays
 *                 rows:
 *                   - fields:
 *                       - name: display_name
 *                         value: Dell P2723QE
 *                       - name: display_type
 *                         value: External
 *                       - name: connection_type
 *                         value: DisplayPort
 *               - tableName: Printers
 *                 rows:
 *                   - fields:
 *                       - name: printer_name
 *                         value: HP LaserJet Pro M404dn
 *                       - name: ip_port
 *                         value: 192.168.1.90
 *                       - name: departments
 *                         value: Software Development
 *                       - name: is_default
 *                         value: false
 *     responses:
 *       201:
 *         description: Computer saved successfully.
 *       400:
 *         description: Invalid request body, missing computerName, missing tables array, missing Computers table, invalid rows, invalid fields, or missing field name.
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
 *     description: Inserts a program into the Programs table by using the computer name to find the related computer ID.
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
 *               - program
 *             properties:
 *               computer_name:
 *                 type: string
 *                 example: DEV006
 *               program:
 *                 type: string
 *                 example: Docker Desktop
 *           example:
 *             computer_name: DEV006
 *             program: Docker Desktop
 *     responses:
 *       201:
 *         description: Program inserted successfully.
 *       400:
 *         description: Missing or invalid computer_name or program.
 *       404:
 *         description: Computer not found.
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
 *             required:
 *               - computer_name
 *               - program
 *             properties:
 *               computer_name:
 *                 type: string
 *                 example: DEV006
 *               program:
 *                 type: string
 *                 example: Docker Desktop
 *           example:
 *             computer_name: DEV006
 *             program: Docker Desktop
 *     responses:
 *       200:
 *         description: Program deleted successfully.
 *       400:
 *         description: Missing or invalid computer_name or program.
 *       404:
 *         description: No matching program found for this computer.
 *       500:
 *         description: Internal server error.
 */
router.delete("/computers/deleteProgramByComputerName", computerController.deleteProgramByComputerName);


/**
 * @swagger
 * /computers/delete/{computerName}:
 *   delete:
 *     summary: Delete a computer and all related inventory data
 *     description: Deletes a computer and all related child table data using ON DELETE CASCADE, including programs, network adapters, RAM, CPUs, batteries, storage drives, GPUs, printers, and external displays.
 *     tags:
 *       - Computers
 *     parameters:
 *       - in: path
 *         name: computerName
 *         required: true
 *         schema:
 *           type: string
 *         example: DEV006
 *         description: The computer name to delete.
 *     responses:
 *       200:
 *         description: Computer deleted successfully.
 *       400:
 *         description: Missing or invalid computerName.
 *       404:
 *         description: Computer not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/computers/delete/:computerName", computerController.deleteComputer);

/**
 * @swagger
 * /computers/{computerName}/details:
 *   get:
 *     summary: Get full inventory details by computer name
 *     description: Returns the computer information and all related child table inventory data for the specified computer, including programs, network adapters, RAM, batteries, storage drives, external displays, GPUs, CPUs, and printers. Internal database id fields are excluded from the response.
 *     tags:
 *       - Computers
 *     parameters:
 *       - in: path
 *         name: computerName
 *         required: true
 *         schema:
 *           type: string
 *         example: DEV006
 *         description: The computer name.
 *     responses:
 *       200:
 *         description: Successfully retrieved full computer inventory details.
 *       400:
 *         description: Missing or invalid computerName.
 *       404:
 *         description: Computer not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/computers/:computerName/details", computerController.findComputerDetailsByComputerName);


/**
 * @swagger
 * /computers/{computerName}:
 *   get:
 *     summary: Get computer details by computer name
 *     description: Returns a single computer's information from the Computers table. Internal database id is excluded from the response.
 *     tags:
 *       - Computers
 *     parameters:
 *       - in: path
 *         name: computerName
 *         required: true
 *         schema:
 *           type: string
 *         example: DEV006
 *         description: The computer name.
 *     responses:
 *       200:
 *         description: Successfully retrieved computer details.
 *       400:
 *         description: Missing or invalid computerName.
 *       404:
 *         description: Computer not found.
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
 *     description: Returns a list of computer names that have the specified program installed, ordered alphabetically by computer name.
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
 *       400:
 *         description: Missing or invalid programName.
 *       404:
 *         description: No computers found for this program.
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