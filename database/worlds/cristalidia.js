//Dependencies
const Sequelize = require('sequelize');
const { worldDatabase } = require('../../start-server');

//Database tables
const world = worldDatabase.define('cristalidia', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    identification: {
        type: "varchar(500)",
        defaultValue: "I am Visual Only"
    },
    attribute: {
        type: "longtext",
        allowNull: false,
        defaultValue: "{}"
    }
}, {
    //Disable defaults from sequelize
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

//Create table if not exists
worldDatabase.sync();

//Exports globally
module.exports = world;