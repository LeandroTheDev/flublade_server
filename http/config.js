const express = require('express');
const http = express();
const { serverConfig } = require('../start-server');
//Used for DDOS Protection
var ipTimeout = {};


function init(resolve) {
    //Enable json suport
    http.use(express.json());

    //Ports for the server
    http.listen(8080, () => {
        console.log('Server Responses started in ports 8080');
        resolve(http);
    });

    //DDOS Protection
    http.use((req, res, next) => {
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
    http.post('/ddostest', async (req, res) => {
        console.log(`\x1b[31mWe are been attacked\x1b[0m`);
    });

    //Retrieve server informations
    http.get('/getServerData', (_, res) => {
        const serverData = {
            serverName: serverConfig.serverName,
            gameVersion: serverConfig.gameVersion,
            message: "Success"
        };
        res.json(serverData);
    });
}

module.exports = function () {
    return new Promise((resolve, reject) => {
        init(resolve);
    });
}