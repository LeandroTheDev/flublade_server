//Dependencies
const { accountsTable } = require("../start-server") //Accounts

//Socket
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8081 });
//Used for DDOS Protection
var ipTimeout = {};
var ipConnected = {};

//DDOS Protection
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
        }, 5000);
    }

    return isBlocked;
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

wss.on("connection", async (ws, connectionInfo) => {
    const ip = connectionInfo.socket.remoteAddress
    //Check DDOSProtection and if the Client is already connected
    var connectionClosed = false;
    if (DDOSProtection(ip) || ipConnected[ip] != undefined) {
        console.log("\x1b[33m[Navigation] Connection Blocked: \x1b[0m" + ip);
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
        }
    });
    ws.on("close", () => {
        //Check if current ip is listed in ipConnected then remove
        if (ipConnected[ip] != undefined) delete ipConnected[ip];
    });
});
console.log("Navigator Socket started in ports 8081")
module.exports.navigatorSocket = wss;