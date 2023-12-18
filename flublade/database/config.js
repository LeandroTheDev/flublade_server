//Dependencies
const Sequelize = require('sequelize');
const { serverConfig } = require('../../initialize');

//Database informations
const server = new Sequelize('flublade_server', serverConfig.databaseUser, serverConfig.databasePassword, {
    host: serverConfig.databaseIP,
    dialect: "mariadb",
    logging: false,
    connectTimeout: 10000,
});

const world = new Sequelize('flublade_world', serverConfig.databaseUser, serverConfig.databasePassword, {
    host: serverConfig.databaseIP,
    dialect: "mariadb",
    logging: false,
    connectTimeout: 10000,
});

//Exports globally
module.exports.serverDatabase = server;
module.exports.worldDatabase = world;