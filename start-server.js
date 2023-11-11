console.log('\x1b[32mStarting Server\x1b[0m');
initializeServer();

//Initialize Server
function initializeServer() {
    const serverConfig = require("./load-config");
    //Load Configurations
    serverConfig().then(function () {
        //Exports Globally
        module.exports.serverConfig = serverConfig;
        console.log("Connecting to World Database");
        //Connect to the Worlds Database
        const { serverDatabase, worldDatabase } = require("./database/config");
        worldDatabase.authenticate().then(() => {
            module.exports.worldDatabase = worldDatabase;
            console.log('\x1b[32mSuccessfully Connected to World Database\x1b[0m');

            //Read World and Save in Navigators Table
            const { worlds, navigatorTiles, navigatorEntitys } = require("./database/worlds/worlds");
            readAndWriteWorld(worlds, navigatorTiles, navigatorEntitys).then((result) => {
                console.log("Connecting to Server Database");
                //Connect to the Server Database
                serverDatabase.authenticate().then(() => {
                    module.exports.serverDatabase = serverDatabase;
                    console.log('\x1b[32mSuccessfully Connected to Server Database\x1b[0m');

                    console.log("Connecting Accounts Table")
                    //Connect to the Accounts Table
                    const accountsTable = require("./database/accountsTable");
                    module.exports.accountsTable = accountsTable;

                    //Initialize Responses
                    startResponses();
                }).catch((error) => {
                    console.log("\x1b[31mFatal error connecting to the database \nERROR: \x1b[0m" + error)
                    process.exit();
                });
            });
        }).catch((error) => {
            console.log("\x1b[31mFatal error connecting to the database \nERROR: \x1b[0m" + error)
            process.exit();
        });
    });
}

//Starts the responses server for receiving incoming http requests
function startResponses() {
    const http = require("./http/config");
    //Initialize the http Server
    http().then(connection => {
        module.exports.http = connection;
        const serverconfig = require("./load-config");
        const administration = require("./http/account/administration");
        const character = require("./http/account/character");
        startSockets();
    });
}

//Starts the sockets to receive and give players real time informations
function startSockets() {
    const { navigatorSocket } = require("./socket/navigation");
    const commands = require("./commands");
}

//Read all world data and save in database
function readAndWriteWorld(worlds, navigatorTiles, navigatorEntitys) {
    async function attributeReader(data) {
        async function setTiles(attributes) {
            //Error Treatment
            if (attributes["tiles"] == null) { console.log("\x1b[31mFatal error, null in required attribute: tiles \x1b[0m"); process.exit(); }
            if (attributes["chunkCoordinate"] == null) { console.log("\x1b[31mFatal error, null in required attribute: chunkCoordinate\x1b[0m"); process.exit(); }

            //Try to find a chunk in database
            let chunk = await navigatorTiles.findOne({
                attributes: ['tiles', 'attributes'],
                where: {
                    coordinate: attributes["chunkCoordinate"],
                }
            });

            //If doesnt exist a chunk, then simple add it to the database
            if (chunk == null) {
                let createData = {
                    coordinate: attributes["chunkCoordinate"],
                    tiles: JSON.stringify(attributes["tiles"]),
                    attributes: JSON.stringify({
                        title: attributes["title"],
                    })
                }
                await navigatorTiles.create(createData);
            }
            //If exist a chunk we need to update the attributes, and tiles
            else {
                function overwriteTiles() {
                    let chunkSize = 15;
                    let chunkTiles = JSON.parse(chunk["tiles"]);
                    let attributeTiles = attributes["tiles"];
                    for (let i = 0; i < chunkSize; i++) {
                        for (let j = 0; j < chunkSize; j++) {
                            //Check if tile is different from 0
                            if (attributeTiles[i][j] != 0) {
                                //Overwrite chunk tile to new tile
                                chunkTiles[i][j] = attributeTiles[i][j];
                            }
                        }
                    }
                    return chunkTiles;
                }
                let updateData = {
                    tiles: JSON.stringify(overwriteTiles()),
                    attributes: JSON.stringify({
                        title: attributes["title"] ?? JSON.parse(chunk["attributes"])["title"], //Add the Chunk title if is null
                    })
                }
                await navigatorTiles.update(updateData, { where: { coordinate: attributes["chunkCoordinate"] } });
            };
        }
        async function setEntity(attributes) {
            //Error Treatment
            if (attributes["name"] == null) { console.log("\x1b[31mFatal error, null in required attribute: name \x1b[0m"); process.exit(); }
            if (attributes["coordinate"] == null) { console.log("\x1b[31mFatal error, null in required attribute: coordinate\x1b[0m"); process.exit(); }

            //Creating data to send to database
            let createData = {
                coordinate: attributes["coordinate"],
                name: attributes["name"],
                type: attributes["type"] ?? "friendly",
                drop: attributes["drop"] ?? {},
                talk: attributes["talk"] ?? {},
                attributes: {
                    trainerType: attributes["spawnTimetrainerType"] ?? "none",
                    spawnTimer: attributes["spawnTimer"] ?? 1000
                }
            }
            //Creating
            await navigatorEntitys.create(createData);
        }
        async function setInteraction(attributes) {
            console.log("SET INTERACTION IS NOT IMPLEMENTED");
        }
        //Swipe Attributes
        for (let i = 0; i < Object.keys(data).length; i++) {
            let attribute = Object.keys(data)[i];
            let value = Object.values(data)[i];
            //Set Tiles
            if (attribute.substring(0, 8) == 'setTiles') await setTiles(value);
            //Set Entity
            if (attribute.substring(0, 9) == 'setEntity') await setEntity(value);
            //Set Interaction
            if (attribute.substring(0, 14) == 'setInteraction') await setInteraction(value);
        }
    }
    return new Promise(async (resolve, reject) => {
        console.log("Removing Old World Data...");
        //Destroy Datas
        await navigatorTiles.destroy({ where: {} });
        await navigatorEntitys.destroy({ where: {} });
        console.log("Saving World Data in Database");
        //Swipe Worlds
        for (let i = 0; i < worlds.length; i++) {
            //Load the World Datas
            let worldData = await worlds[i].findAll({ attributes: ['attribute'] })
            //Swipe the Datas
            for (let j = 0; j < worldData.length; j++) {
                let data = {}
                try {
                    data = JSON.parse(worldData[j]["dataValues"]["attribute"]);
                } catch (error) {
                    console.log("\x1b[31mFatal error while parsing Database: \x1b[0m" + error)
                    process.exit();
                }
                await attributeReader(data);
            }
        }
        console.log('\x1b[32mSuccessfully Saved World Data\x1b[0m');
        resolve();
    });
}