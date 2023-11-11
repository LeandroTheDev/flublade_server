//Dependencies
const Sequelize = require('sequelize');
const { worldDatabase } = require('../../start-server');

//Database tables
const navigatorTiles = worldDatabase.define('navigator_players', {
    coordinateChunk: {
        //This indicates the maximum chunk: 99999,99999
        type: "varchar(11)",
        allowNull: false,
        primaryKey: true
    },
    coordinate: {
        type: "varchar(99)",
        allowNull: false,
        primaryKey: true
    },
    accountId: {
        type: "varchar(12)",
        allowNull: false,
        defaultValue: "[]"
    },
    character: {
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