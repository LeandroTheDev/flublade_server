//Dependencies
const Sequelize = require('sequelize');
const db = require('./db');

//Database tables
const users = db.define('accounts', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: "varchar(50)",
        allowNull: false,
        unique: true
    },
    password: {
        type: "varchar(500)",
        allowNull: false,
    },
    language: {
        type: "tinytext",
        allowNull: false,
        defaultValue: "en_US"
    },
    characters: {
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
users.sync();

//Exports globally
module.exports = users;