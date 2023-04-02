//Dependencies
const Sequelize = require('sequelize');

const sequelize = new Sequelize('flublade', 'flubladeGuest', 'i@Dhs4e5E%fGz&ngbY2m&AGRCVlskBUrrCnsYFUze&fhxehb#j', {
    host: "192.168.0.13",
    dialect: "mariadb",
    logging: false
});

//Connection Sucess
sequelize.authenticate().then(() => {
    console.log('Successfully connected to the database')
}).catch((error) => {
    console.log('Error connecting to the database \nERROR: ' + error);
});

//Exports globally
module.exports = sequelize;