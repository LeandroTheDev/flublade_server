console.log('\x1b[32mStarting Server\x1b[0m');
const http = require("./http");
const { serverDatabase, worldDatabase } = require("./database/config");
var ipTimeout = {};

initializeServer();

//Initialize Server
function initializeServer() {
    console.log("Connecting to World Database");
    //Initialize World Database
    worldDatabase.authenticate().then(() => {
        module.exports.worldDatabase = worldDatabase;
        console.log('\x1b[32mSuccessfully Connected to World Database\x1b[0m');

        const { worlds, navigatorTiles } = require("./database/worlds/worlds");
        readAndWriteWorld(worlds, navigatorTiles).then((result) => {
            console.log("Connecting to Server Database");
            //Initialize Server Database
            serverDatabase.authenticate().then(() => {
                module.exports.serverDatabase = serverDatabase;
                console.log('\x1b[32mSuccessfully Connected to Server Database\x1b[0m');

                //Load Accounts
                console.log("Connecting Accounts Table")
                const accountsTable = require("./database/accountsTable");
                module.exports.accountsTable = accountsTable;
                //Initialize Responses
                startResponses();
            }).catch((error) => {
                console.log('Fatal error connecting to the database \nERROR: ' + error);
                process.exit();
            });
        });
    }).catch((error) => {
        console.log('Fatal error connecting to the database \nERROR: ' + error);
        process.exit();
    });
}

//Starts the responses server for receiving incoming http requests
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
        const serverconfig = require("./server-config");
        const administration = require("./account/administration");
        const character = require("./account/character");
        const commands = require("./commands");
    });
}

function readAndWriteWorld(worlds, navigatorTiles) {
    console.log("Saving World Data in Database");
    async function attributeReader(data) {
        async function setTiles(attributes) {
            let chunk = await navigatorTiles.findOne({
                attributes: ['tiles', 'attributes'],
                where: {
                    coordinate: "0,0",
                }
            });
            if (chunk == null) {
                let createData = {
                    coordinate: attributes["chunkCoordinate"],
                    tiles: JSON.stringify(attributes["tiles"]),
                    attributes: JSON.stringify({
                        title: attributes["title"],
                    })
                }
                await navigatorTiles.create(createData);
            };
            // console.log(chunk["dataValues"]);
        }
        function setEntity(attributes) {
            console.log("SET ENTITY IS NOT IMPLEMENTED");
        }
        function setInteraction(attributes) {
            console.log("SET INTERACTION IS NOT IMPLEMENTED");
        }
        //Swipe Attributes
        for (let i = 0; i < Object.keys(data).length; i++) {
            let attribute = Object.keys(data)[i];
            let value = Object.values(data)[i];
            //Set Tiles
            if (attribute.substring(0, 8) == 'setTiles') await setTiles(value);
            //Set Entity
            if (attribute.substring(0, 9) == 'setEntity') setEntity(value);
            //Set Interaction
            if (attribute.substring(0, 14) == 'setInteraction') setInteraction(value);
        }
    }
    return new Promise(async (resolve, reject) => {
        //Swipe Worlds
        for (let i = 0; i < worlds.length; i++) {
            //Load the World Datas
            let worldData = await worlds[i].findAll({ attributes: ['attribute'] })
            //Swipe the Datas
            for (let j = 0; j < worldData.length; j++) {
                let data = JSON.parse(worldData[j]["dataValues"]["attribute"]);
                await attributeReader(data);
            }
        }
        console.log('\x1b[32mSuccessfully Saved World Data\x1b[0m');
        resolve();
    });
}