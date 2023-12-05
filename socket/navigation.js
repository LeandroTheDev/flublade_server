//Dependencies
const config = require("../http/config");
const { accountsTable, serverConfig, navigatorTiles } = require("../start-server")

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
* coordinateChunk = Actual chunk of the character
* 
* coordinate = Full coordinate of the character position
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

    return selectedCharacter;
}

/**
* Called every navigator ticks per seconds
* this will retrieve every online player the chunks tiles from the world livings
*/
async function retrievePlayersWorldTiles() {
    //Check if exist players
    if (Object.values(playersOnline).length == 0) return;

    //Swipe all players
    for (const userId in playersOnline) {
        //Process the player
        const player = playersOnline[userId];
        
        //Null check
        if (playersChunkCoordinate[userId] == undefined) playersChunkCoordinate[userId] = {}
        //Check if the player needs update from the chunk
        if (playersChunkCoordinate[userId]["coordinateChunk"] == player["coordinateChunk"]) continue;
        //Add the chunk in playersChunkCoordinate
        playersChunkCoordinate[userId]["coordinateChunk"] = player["coordinateChunk"];

        //Create the chunks variable
        let chunks = [];

        //Dividing the x and y from the coordinate
        const [playerX, playerY] = player["coordinateChunk"].split(",").map(n => parseInt(n));
        //We need to reduce to calculate the view
        x = playerX - serverConfig.chunkRadiusView;
        y = playerY - serverConfig.chunkRadiusView;

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
        player.socket.send(JSON.stringify({
            "message": "AllChunkUpdate",
            "error": false,
            "chunks": chunks
        }));
    }
}

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
        }
    });
    ws.on("close", () => {
        //Check if current ip is listed in ipConnected then remove
        if (ipConnected[ip] != undefined) delete ipConnected[ip];
        //Check if exist in online player and remove from online players
        if (playersOnline[id] != undefined) delete playersOnline[id];
        console.log('\x1b[90m[Navigation]\x1b[0m User Disconnected: ' + username);
    });
});

console.log("Navigator Socket started in ports 8081")
module.exports.navigatorSocket = wss;

//Utils
/**
* Converts the coordinate into coordinateChunk
*
* @param {string} coordinate - Coordinate of the characters
* @returns {string} - Returns the coordinateChunk
*/
function convertCoordinateToCoordinateChunk(characterCoordinate) {
    const coordinate = characterCoordinate.split(',');
    const chunkSize = 15;
    const coordinateY = Math.floor(coordinate[0] / chunkSize);
    const coordinateX = Math.floor(coordinate[1] / chunkSize);

    return `${coordinateY},${coordinateX}`;
}

// Retrieve player world tiles every tick
setInterval(retrievePlayersWorldTiles, serverConfig.navigatorTicks);