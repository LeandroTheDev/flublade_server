//Dependencies
const Sequelize = require('sequelize');

//Database informations
const sequelize = new Sequelize('flublade', 'flubladeAdmin', 'WVxDC*DCuBE8h!87af6Oxn^a9K&hdo5OUQUSfksRo@meIvFHlO', {
    host: "192.168.0.23",
    dialect: "mariadb",
    logging: false,
    connectTimeout: 10000,
});

//Connection Sucess
sequelize.authenticate().then(() => {
    console.log('Successfully connected to the database')
}).catch((error) => {
    console.log('Error connecting to the database \nERROR: ' + error);
});

//Exports globally
module.exports = sequelize;