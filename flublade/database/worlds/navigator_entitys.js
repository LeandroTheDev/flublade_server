//Dependencies
const Sequelize = require('sequelize');
const { worldDatabase } = require('../../../initialize');

//Database tables
const navigatorEntitys = worldDatabase.define('navigator_entitys', {
    //Entity ID
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    coordinate: {
        //This indicates the entity spawn position
        type: "varchar(99)",
        allowNull: false,
    },
    name: {
        type: "varchar(99)",
        allowNull: false,
    },
    type: {
        type: "varchar(20)",
        allowNull: false,
    },
    drop: {
        type: "longtext",
        allowNull: false,
        defaultValue: "{}"
    },
    talk: {
        type: "longtext",
        allowNull: false,
        defaultValue: "{}"
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
module.exports = navigatorEntitys;