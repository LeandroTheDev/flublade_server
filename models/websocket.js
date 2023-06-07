const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8081 });
let playersOnline = {};
let map = {};
wss.on("connection", ws => {
    //If receive message
    ws.on("message", data => {
        //Requisition
        let req = JSON.parse(data);

        //Return Player in World Positions
        if (req.message == "playersPosition") {
            //Update player
            map[req.location][req.id] = { 'id': req.id, 'positionX': req.positionX, 'positionY': req.positionY, 'direction': req.direction, 'class': req.class };
            playersOnline[req.id]['offTicks'] = 0;
            ws.send(JSON.stringify(map[req.location]));
        }
        //Login in world
        if (req.message == "login") {
            console.log("ID: " + req.id + " Connected to the World")
            //Create the map if not listed
            if (map[req.location] == undefined) {
                map[req.location] = {};
            }
            //Add player in online section
            playersOnline[req.id] = {
                "id": req.id,
                "offTicks": 0,
                "location": req.location,
                "class": req.class,
            };
            ws.send("OK");
        }
    });

    //If conection closed
    ws.on("close", () => {
        //Off tick all players
        for (let i = 0; i < Object.keys(playersOnline).length; i++) {
            playersOnline[Object.keys(playersOnline)[i]]['offTicks'] = 1;
        }
        //If player continuous with off tick then remove from the world
        setTimeout(() => {
            //Find players that the tick is 1
            for (let i = 0; i < Object.keys(playersOnline).length; i++) {
                //Tick condition
                if (playersOnline[Object.keys(playersOnline)[i]]['offTicks'] == 1) {
                    let mapLength = Object.keys(map[playersOnline[Object.keys(playersOnline)[i]]['location']]).length;
                    //Find the player in the world
                    for (let j = 0; j < mapLength; j++) {
                        try {
                            let world = map[playersOnline[Object.keys(playersOnline)[i]]['location']];
                            let worldID = world[Object.keys(world)[j]]['id'];
                            let userID = playersOnline[Object.keys(playersOnline)[i]]['id'];
                            //If player tick 1 is equals to the player in the world then
                            if (userID == worldID) {
                                console.log("Player Disconnected ID: " + playersOnline[Object.keys(playersOnline)[i]]['id']);
                                //Remove player from the world
                                delete map[playersOnline[Object.keys(playersOnline)[i]]['location']][Object.keys(map[playersOnline[Object.keys(playersOnline)[i]]['location']])[j]];
                                //Remove player from online section
                                delete playersOnline[Object.keys(playersOnline)[i]];
                            }
                        } catch (_){}
                    }
                }
            }
        }, 2500);
    })
});

module.exports = wss;