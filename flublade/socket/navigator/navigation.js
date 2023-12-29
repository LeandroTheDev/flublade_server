//Dependencies
const config = require("../../http/config");
const { accountsTable, serverConfig, navigatorTiles } = require("../../../initialize")
const { calculateTileCollisionForEntity, convertTilesToCollisionPositions } = require("./colllision");

//Socket
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8081 });

//DDOS Protection Declarations
/**Stores the IP to control the timeout*/
var ipTimeout = {};
/**Stores all ips connected*/
var ipConnected = {};

//Navigation Declaration
/**All Players Online, index by account ID, includes:
* 
* coordinateChunk = A string of actual chunk of the character
* 
* coordinate = A string containing the full coordinate of the character position: "10,24"
* 
* selectedCharacterID = Selected character of the account
* 
* socket = Websocket to manage the client
* 
*/
var playersOnline = {};
/**Stores player last chunk coordinate, index by account ID
* coordinateChunk = Last character Chunk
*/
var playersChunkCoordinate = {};
/**Stores player last position to be updated in ticks by account ID, in retrievePlayerPositions
* position = [0,0]
*/
var playerCoordinate = {};
/**Stores loaded chunks in the server by chunk position
* 
* tiles = List
*
* collisionPositions = Map / contains by coordinates all the collision that entity cannot pass throught see tilesCollision in config for details
*
* despawnTimeoutID = int / this is the returned id from setTimeout, 0 means that is someone is reendering
*/
var loadedChunks = {};
/**Stores all loaded entity in the server by entity GUID
* 
* coordinateChunk = A string of actual chunk of the entity
*
* coordinate = A string containing the full coordinate of the entity position: "10,24"
*/
var loadedEntitys = {};


//
//SECURITY
//

/**
* DDOS Protection safely block ips that is trying to connect multiple times in defined time
*
* @param {string} ip - Client IP
*/
function DDOSProtection(ip) {
    //ipTimeout == true => blocked
    //ipTimeout == undefined => unblocked
    //return true => blocked
    //return false => unblocked

    //Add a limiter for ips
    let isBlocked = ipTimeout[ip] != undefined;
    if (ipTimeout[ip] == undefined) {
        ipTimeout[ip] = true
        //Reset Timer
        setTimeout(function () {
            delete ipTimeout[ip];
        }, serverConfig.socketDDOSTimer);
    }

    return isBlocked;
}

/**
* Handle the validation socket, 
* if client is invalid simple disconnect from the socket
*
* @param {WebSocket.Server} ws - Navigator Socket
* @param {string} ip - Address from client
* @param {Map} message - JSON Provided by the client
* @param {boolean} valid - Validation
* @param {string} username - Account Username from client
* @returns {boolean} - Returns a boolean, false for invalid, true for valid
*/
function checkInvalidations(ws, ip, message, valid, username) {
    //Check validation
    if (valid) return true;
    console.log("\x1b[33m[Navigation]\x1b[0m Invalid Player: " + username);
    ws.close();
    return false;
}

/**
* Authenticate the client with the socket and return client username
*
* @param {WebSocket.Server} ws - Navigator Socket
* @param {string} ip - Address from client
* @param {Map} message - JSON Provided by the client
* @returns {string} - Returns a String containing the username, empty username if errors occurs
*/
function authenticate(ws, ip, message) {
    return new Promise(async (resolve) => {
        //Receives from database Username and Token
        const user = await accountsTable.findOne({
            attributes: ['username', 'token'],
            where: {
                id: message["id"],
            }
        });
        //Check if user exists
        if (user == null) {
            ws.close();
            resolve({ "username": "" });
            return;
        }
        //Check if token is valid
        if (user.token != message["token"]) {
            ws.close();
            resolve({ "username": "" });
            return;
        }
        console.log('\x1b[32m[Navigation]\x1b[0m User Connected: ' + user.username);
        ws.send(JSON.stringify({
            "message": "Success",
            "error": false
        }))
        //Success
        resolve({ "username": user.username });
        return;
    });
}

//
//CHUNK SYSTEM / DATA
//

/**
* This function is called when the client whants to receive worlds data, 
* this handle a tick timer to send the client world data for the chunk he is
*
* @param {WebSocket.Server} ws - Navigator Socket
* @param {string} ip - Address from client
* @param {Map} message - JSON Provided by the client
* @param {number} id - Account ID
* @returns {Map} - Returns a Map containing the username, empty username if errors occurs
*/
async function receiveDatas(ws, ip, message, id) {
    // This is a int number providing the selected character index
    let selectedCharacter = message["selectedCharacter"];
    // Communicate the database to receive the character
    let account = await accountsTable.findOne({
        attributes: ['characters'],
        where: { "id": id }
    });
    // Parsing the message
    character = JSON.parse(account.dataValues.characters);
    character = character["character" + selectedCharacter];

    // Adding the player in the player online variable
    playersOnline[id] = {
        coordinateChunk: convertCoordinateToCoordinateChunk(character["location"]),
        coordinate: character["location"],
        selectedCharacterID: id,
        socket: ws
    }

    //We send the first chunk update for the player
    retrievePlayersWorldTiles(true);

    return selectedCharacter;
}

/**
* Send the player all chunks in radius
* this is generally called when the client ask for update, because
* a problem occurs, this will not update the chunk just send the data
*/
async function sendPlayerLocalChunks(ws, ip, message, id) {
    console.log("ID: " + id + " asked for chunk update")
    //Process the player
    const player = playersOnline[id];
    //Null check
    if (playersChunkCoordinate[id] == undefined)
        playersChunkCoordinate[id] = {
            coordinateChunk: convertCoordinateToCoordinateChunk(playersOnline[id]["coordinate"]),
        }
    //Add the chunk in playersChunkCoordinate
    playersChunkCoordinate[id]["coordinateChunk"] = player["coordinateChunk"];

    //Create the chunks variable
    let chunks = [];

    //Dividing the x and y from the coordinate
    const [playerX, playerY] = player["coordinateChunk"].split(",").map(n => parseInt(n));
    //We need to reduce to calculate the view
    let x = playerX - serverConfig.chunkRadiusView;
    let y = playerY - serverConfig.chunkRadiusView;

    //Swipe the chunks
    //Explaining the swipe calculation,
    //We receive the chunk radius and multiplies to 2 because we want the negative and positive
    //We also add 1 because we need to consider the actual position of the player
    for (let i = 0; i < serverConfig.chunkRadiusView * 2 + 1; i++) { //This is the Y
        for (let j = 0; j < serverConfig.chunkRadiusView * 2 + 1; j++) { // This is the X
            //Find the the chunk in database
            let chunk = await navigatorTiles.findOne({
                attributes: ['tiles', 'attributes'],
                where: {
                    coordinate: x + "," + y,
                }
            });
            //Check if chunk exist
            if (chunk == null) chunks.push(null);
            //Add the chunk in chunks variable
            else chunks.push(chunk.dataValues);
            x++;
        }
        y++;
        //Reset the X
        x = playerX - serverConfig.chunkRadiusView;
    }
    //Send the player
    ws.send(JSON.stringify({
        message: "All Chunks Update",
        error: false,
        chunks: chunks
    }));
}

/**
* Called to send all chunks update for the player
* this will retrieve every online player the chunks tiles from the world livings
* @param {boolean} forceReload - Force the chunk loading, used if the player is already in the current chunk
*/
async function retrievePlayersWorldTiles(forceReload = false) {
    //Check if exist players
    if (Object.values(playersOnline).length == 0) return;

    //Swipe all players
    for (const userId in playersOnline) {
        //Process the player
        const player = playersOnline[userId];
        //Null check
        if (playersChunkCoordinate[userId] == undefined)
            playersChunkCoordinate[userId] = {
                coordinateChunk: convertCoordinateToCoordinateChunk(playersOnline[userId]["coordinate"]),
            }
        //Check if the player needs update from the chunk
        if (playersChunkCoordinate[userId]["coordinateChunk"] == player["coordinateChunk"] && !forceReload) continue;
        //Add the chunk in playersChunkCoordinate
        playersChunkCoordinate[userId]["coordinateChunk"] = player["coordinateChunk"];

        //Create the chunks variable
        let chunks = [];

        //Dividing the x and y from the coordinate
        const [playerX, playerY] = player["coordinateChunk"].split(",").map(n => parseInt(n));
        //We need to reduce to calculate the view
        let x = playerX - serverConfig.chunkRadiusView;
        let y = playerY - serverConfig.chunkRadiusView;

        //Swipe the chunks
        //Explaining the swipe calculation,
        //We receive the chunk radius and multiplies to 2 because we want the negative and positive
        //We also add 1 because we need to consider the actual position of the player
        for (let i = 0; i < serverConfig.chunkRadiusView * 2 + 1; i++) { //This is the Y
            for (let j = 0; j < serverConfig.chunkRadiusView * 2 + 1; j++) { // This is the X
                //Find the the chunk in database
                let chunk = await navigatorTiles.findOne({
                    attributes: ['tiles', 'attributes'],
                    where: {
                        coordinate: x + "," + y,
                    }
                });
                //Check if chunk exist
                if (chunk == null) chunks.push(null);
                //Add the chunk in chunks variable
                else { chunks.push(chunk.dataValues); loadChunkInLoadedChunks(chunk.dataValues, x, y); }
                x++;
            }
            y++;
            //Reset the X
            x = playerX - serverConfig.chunkRadiusView;
        }
        //Send the player
        setTimeout(function () { //We need to delay to prevent desyncronization
            player.socket.send(JSON.stringify({
                message: "All Chunks Update",
                error: false,
                chunks: chunks
            }));
        }, 100);
    }
}

/**
* Called every navigator ticks per seconds
* this will retrieve all entitys in location for the player
*/
async function retrievePlayersEntitys() {
    //Swipe all players
    for (const userId in playersOnline) {
        const player = playersOnline[userId];
        player.socket.send(JSON.stringify({
            message: "Entity Update",
            error: false,
            playerPosition: player["coordinate"],
            entitys: []
        }));
    }
}

/**
* Called every navigator ticks per seconds
* this will definitively update the position in the playerUpdate
*/
async function retrievePlayerPositions() {
    for (const userId in playerCoordinate) {
        //Null Check
        if (playersOnline[userId] == undefined) continue;
        //Convert the cordinate into array
        let coordinate = playersOnline[userId]["coordinate"].split(',');
        //Plus the coordinates with the position
        coordinate[0] = parseFloat(coordinate[0]);
        coordinate[1] = parseFloat(coordinate[1]);
        coordinate[0] += playerCoordinate[userId][0];
        coordinate[1] += playerCoordinate[userId][1];
        //Receive the chunk coordinate
        let chunkCoordinate = convertCoordinateToCoordinateChunk(coordinate[0] + "," + coordinate[1]);
        //Receives the loaded chunk that the player is in
        let loadedChunk = loadedChunks[chunkCoordinate];
        //Check if the chunk is loaded
        if (loadedChunk == undefined) continue;
        //Receives all collision position by the chunk
        let chunkCollisions = loadedChunks[chunkCoordinate]["collisionPositions"]
        //Receive the player position after collision calculation
        let positionCalculation = calculateTileCollisionForEntity(
            //Old Position
            [coordinate[0] - playerCoordinate[userId][0], coordinate[1] - playerCoordinate[userId][1]],
            //New Position
            coordinate,
            //Player Collision
            [22,44],
            //Chunk Collisions
            chunkCollisions,
        );
        //Update in cache
        playersOnline[userId]["coordinate"] = positionCalculation[0] + "," + positionCalculation[1];
        //Update the chunk
        playersOnline[userId]["coordinateChunk"] = convertCoordinateToCoordinateChunk(playersOnline[userId]["coordinate"]);
        delete playerCoordinate[userId];
    }
}

/**
* The client send the direction for the player
* we need to handle this and add to playerCoordinate
*/
function updatePlayerDirection(ws, ip, message, id) {
    x = message["direction"][0];
    y = message["direction"][1];
    //Check if player is stopped
    if (x == 0 && y == 0) return;
    //Update the player for the next tick
    playerCoordinate[id] = [x * 10, y * 10];
}

//
//UTILS
//
/**
* Converts the coordinate into coordinateChunk, needs to be a string with comma ex: "100,100"
*
* @param {string} coordinate - Coordinate of the characters
* @returns {string} - Returns a string of the coordinateChunk
*/
function convertCoordinateToCoordinateChunk(characterCoordinate) {
    const coordinate = characterCoordinate.split(',');
    const chunkSize = 480; //Every tile has 32 size, every chunk has 15 tiles, so  32 * 12 = 480
    const coordinateY = Math.floor(coordinate[0] / chunkSize);
    const coordinateX = Math.floor(coordinate[1] / chunkSize);

    return `${coordinateY},${coordinateX}`;
}
/**
* Load the chunk to loadedChunks
*
* @param {Array} tiles - Tiles of the chunk
* @param {number} x - X position of the chunk
* @param {number} y - Y position of the chunk
*/
function loadChunkInLoadedChunks(chunk, x, y) {
    //We check if chunk is already loaded
    if (loadedChunks[x + "," + y] != undefined) return;

    //Parse the tiles
    let tiles = JSON.parse(chunk["tiles"])
    loadedChunks[x + "," + y] = {
        tiles: tiles,
        collisionPositions: convertTilesToCollisionPositions(tiles),
        despawnTimeoutID: 0 //0 means that the chunk is been rendering by someone
    }
    // setTimeout(() => delete loadedChunks[x + "," + y], serverConfig.chunkUnloadTicks)
}

//
//TICKRATE
//
// Retrieve player world tiles every tick
setInterval(retrievePlayersWorldTiles, serverConfig.navigatorTicks);
// Retrieve player entitys every tick
setInterval(retrievePlayersEntitys, serverConfig.navigatorTicks);
// Update per tick the players position
setInterval(retrievePlayerPositions, serverConfig.navigatorTicks);


//Socket Conenction
wss.on("connection", async (ws, connectionInfo) => {
    const ip = connectionInfo.socket.remoteAddress
    //Check DDOSProtection and if the Client is already connected
    var connectionClosed = false;
    if (DDOSProtection(ip) || ipConnected[ip] != undefined) {
        console.log("\x1b[33m[Navigation]\x1b[0m Connection Blocked: " + ip);
        connectionClosed = true;
        ws.close();
    }
    //Add Client to the ipConnected
    ipConnected[ip] = true;

    //Client Declaration
    var valid = false;
    var username = "";
    var id = 0;
    var selectedCharacter = 0;

    ws.on("message", async (data) => {
        //Check if connection is closed
        if (connectionClosed) return;
        //Receive message from Client
        const message = JSON.parse(data.toString());
        //Job Selector
        switch (message["job"]) {
            case "authenticate": authenticate(ws, ip, message).then(function (data) { username = data.username; id = message["id"]; valid = data.username != ""; }); break;
            case "receiveDatas": checkInvalidations(ws, ip, message, valid, username); receiveDatas(ws, ip, message, id).then(function (data) { selectedCharacter = data.selectedCharacter }); break;
            case "updatePlayerPosition": checkInvalidations(ws, ip, message, valid, username); updatePlayerDirection(ws, ip, message, id); break;
            case "updatePlayerChunk": checkInvalidations(ws, ip, message, valid, username); sendPlayerLocalChunks(ws, ip, message, id); break;
        }
    });
    ws.on("close", () => {
        ///Cleaning cache from the player
        //Check if current ip is listed in ipConnected then remove
        if (ipConnected[ip] != undefined) delete ipConnected[ip];
        //Check if exist in online player and remove from online players
        if (playersOnline[id] != undefined) delete playersOnline[id];
        //Check if exist in loaded chunks and remove from loaded chunks
        if (playersChunkCoordinate[id] != undefined) delete playersChunkCoordinate[id];
        //Check if exist in playerCoordinates and remove from old player coordinate
        if (playerCoordinate[id] != undefined) delete playerCoordinate[id];
        console.log('\x1b[90m[Navigation]\x1b[0m User Disconnected: ' + username);
    });
});

console.log("Navigator Socket started in ports 8081")
module.exports.navigatorSocket = wss;