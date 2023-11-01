//Dependencies
const Sequelize = require('sequelize');

const adminName = "flublade";
const adminPassword = "i@Dhs4e5E%fGz&ngbY2m&AGRCVlskBUrrCnsYFUze&fhxehb#j";
const databaseIP = "189.27.187.145";

//Database informations
const server = new Sequelize('flublade_server', adminName, adminPassword, {
    host: databaseIP,
    dialect: "mariadb",
    logging: false,
    connectTimeout: 10000,
});

const world = new Sequelize('flublade_world', adminName, adminPassword, {
    host: databaseIP,
    dialect: "mariadb",
    logging: false,
    connectTimeout: 10000,
});

//Exports globally
module.exports.serverDatabase = server;
module.exports.worldDatabase = world;