//Dependencies
const Sequelize = require('sequelize');

//Database informations
const database = new Sequelize('flublade', 'flublade', 'i@Dhs4e5E%fGz&ngbY2m&AGRCVlskBUrrCnsYFUze&fhxehb#j', {
    host: "189.27.187.145",
    dialect: "mariadb",
    logging: false,
    connectTimeout: 10000,
});

//Exports globally
module.exports = database;