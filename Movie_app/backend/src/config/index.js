require("dotenv").config();

if (process.env.DB_HOST) 
    module.exports = require("./mysql");
else 
    module.exports = require("./sqlite");
