//Dependencies
const { accountsTable, serverConfig } = require("../start-server") //Accounts

//Socket
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8081 });
//Used for DDOS Protection
var ipTimeout = {};
var ipConnected = {};

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
* @returns {Map} - Returns a Map containing the username, empty username if errors occurs
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
        //Success
        ws.send(JSON.stringify({
            "message": "Success",
            "error": false
        }));
        resolve({ "username": user.username });
        return;
    });
}

/**
* This function is called when te client whants to receive worlds data, 
* this handle a tick timer to send the client world data for the chunk he is
*
* @param {WebSocket.Server} ws - Navigator Socket
* @param {string} ip - Address from client
* @param {Map} message - JSON Provided by the client
* @returns {Map} - Returns a Map containing the username, empty username if errors occurs
*/
function receiveDatas(ws, ip, message) { }

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

    ws.on("message", async (data) => {
        //Check if connection is closed
        if (connectionClosed) return;
        //Receive message from Client
        const message = JSON.parse(data.toString());

        //Job Selector
        switch (message["job"]) {
            case "authenticate": authenticate(ws, ip, message).then(function (data) { username = data.username; id = message["id"]; valid = data.username != ""; });
            case "receiveDatas": checkInvalidations(ws, ip, message, valid, username); receiveDatas(ws, ip, message);
        }
    });
    ws.on("close", () => {
        //Check if current ip is listed in ipConnected then remove
        if (ipConnected[ip] != undefined) delete ipConnected[ip];
        console.log('\x1b[90m[Navigation]\x1b[0m User Disconnected: ' + username);
    });
});
console.log("Navigator Socket started in ports 8081")
module.exports.navigatorSocket = wss;