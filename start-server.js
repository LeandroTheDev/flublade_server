console.log("Starting Servers")
const http = require("./http");
const database = require("./database/config");
var ipTimeout = {};

//Initialize the http Server
http().then(connection => {
    //DDOS Protection
    connection.use((req, res, next) => {
        //Ip blocked
        if(ipTimeout[req.ip] == 99) {
            res.status(413).send('Too many attempts');
        }

        //Add a limiter for ips
        if (ipTimeout[req.ip] == undefined) ipTimeout[req.ip] = 0;
        else ipTimeout[req.ip] += 1;

        //If the ip try to communicate 3 times then
        if(ipTimeout[req.ip] > 3) ipTimeout[req.ip] = 99;

        //Reset Timer
        setTimeout(function () {
            delete ipTimeout[req.ip];
        }, 5000);

        next();
    });
    module.exports.http = connection;
    const administration = require("./account/administration");
    const character = require("./account/character");
    const serverconfig = require("./server-config");
    //After all http request start the database
    startDatabase();
});

//Initialize database
function startDatabase() {
    //Connection Sucess
    database.authenticate().then(() => {
        module.exports.database = database;
        console.log('Successfully connected to the Database');
        const accountsDatabase = require("./database/accounts");
        const commands = require("./commands");
    }).catch((error) => {
        console.log('Fatal error connecting to the database \nERROR: ' + error);
        process.exit();
    });
}