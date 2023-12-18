//Dependencies
const Sequelize = require('sequelize');
const { worldDatabase } = require('../../../initialize');

//Database tables
const navigatorTiles = worldDatabase.define('navigator_tiles', {
    coordinate: {
        //This indicates the maximum chunk: 99999,99999
        type: "varchar(11)",
        allowNull: false,
        primaryKey: true
    },
    tiles: {
        type: "longtext",
        allowNull: false,
        defaultValue: "[]"
    },
    attributes: {
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
module.exports = navigatorTiles;