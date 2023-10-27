//Dependencies
const Sequelize = require('sequelize');

//Database informations
const database = new Sequelize('flublade', 'flublade', 'DATABASE PASSWORD', {
    host: "YOUR IP",
    dialect: "mariadb",
    logging: false,
    connectTimeout: 10000,
});

//Exports globally
module.exports = database;