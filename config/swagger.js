const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Computer Inventory API",
            version: "1.0.0",
            description: "API documentation for Computer Inventory System"
        },
        servers: [
            {
                url: "http://localhost:3070"
            }
        ]
    },
    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;