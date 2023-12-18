//Dependencies
const Sequelize = require('sequelize');
const { serverDatabase } = require('../../initialize');

//Database tables
const accounts = serverDatabase.define('accounts', {
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
    characters: {
        type: "longtext",
        allowNull: false,
        defaultValue: "{}"
    },
    token: {
        type: "longtext",
        allowNull: false,
        defaultValue: "null"
    }
}, {
    //Disable defaults from sequelize
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

//Create table if not exists
accounts.sync();

console.log('\x1b[32mSuccessfully Connected to Accounts Table\x1b[0m');

//Exports globally
module.exports = accounts;