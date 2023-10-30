console.log('\x1b[32mStarting Server\x1b[0m');
const http = require("./http");
const database = require("./database/config");
var ipTimeout = {};

initializeServer();

//Initialize Server
function initializeServer() {
    //Initialize Database
    database.authenticate().then(() => {
        module.exports.database = database;
        console.log('Successfully connected to the Database');
        const accountsDatabase = require("./database/accounts");
        module.exports.accountsDatabase = accountsDatabase;
        //Initialize Responses
        startResponses();
    }).catch((error) => {
        console.log('Fatal error connecting to the database \nERROR: ' + error);
        process.exit();
    });
}

function startResponses() {
    //Initialize the http Server
    http().then(connection => {
        //DDOS Protection
        connection.use((req, res, next) => {
            //Ip blocked
            if (ipTimeout[req.ip] == 99) {
                res.status(413).send({ error: true, message: 'Too Many Attempts' });
                return;
            }

            //Add a limiter for ips
            if (ipTimeout[req.ip] == undefined) {
                ipTimeout[req.ip] = 0 
                //Reset Timer
                setTimeout(function () {
                    delete ipTimeout[req.ip];
                }, 5000);
            }
            else ipTimeout[req.ip] += 1;

            //If the ip try to communicate 3 times then
            if (ipTimeout[req.ip] > 3) ipTimeout[req.ip] = 99;

            next();
        });
        //DDOS Test
        connection.post('/ddostest', async (req, res) => {
            console.log(`\x1b[31mWe are been attacked\x1b[0m`);
        });
        module.exports.http = connection;
        const administration = require("./account/administration");
        const character = require("./account/character");
        const serverconfig = require("./server-config");
        const commands = require("./commands");
    });
}