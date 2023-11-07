const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8081 });
console.log("Navigator Socket started in ports 8081")
wss.on("connection", async (ws, connectionInfo) => {
});

module.exports.navigatorSocket = wss;