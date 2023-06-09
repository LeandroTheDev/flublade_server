const WebSocket = require("ws");
const worlds = require("./worlds");
const accounts = require("./accounts");
const app = require("../app");

const wss = new WebSocket.Server({ port: 8081 });
let playersOnline = {};
let map = {};
let mapEvents = {};

function verifyReconnection(id) {
    if (playersOnline[id] != undefined) {
        return true;
    } else {
        return false;
    }
}

function enemyMoving(positionX, positionY, epositionX, epositionY) {
    if (positionX < epositionX) {
        epositionX -= 0.18;
    } else if (positionX > epositionX) {
        epositionX += 0.18;
    }
    if (positionY < epositionY) {
        epositionY -= 0.18
    } else if (positionY > epositionY) {
        epositionY += 0.18
    }
    return [epositionX, epositionY];
}

wss.on("connection", (ws, connectionInfo) => {
    const clientIp = connectionInfo.socket.remoteAddress;

    //Player Connection Continuous
    ws.on("message", async data => {
        //Requisition
        const req = JSON.parse(data);

        //Return to client world positions
        if (req.message == "playersPosition") {
            //Update Player Infos
            map[req.location][req.id] = { 'id': req.id, 'positionX': req.positionX, 'positionY': req.positionY, 'direction': req.direction, 'class': req.class, 'ip': clientIp };
            playersOnline[req.id]['offTicks'] = 0;

            //Send to Client
            ws.send(JSON.stringify(map[req.location]));
        }
        //Enemy See the Player
        if (req.message == "enemyMoving") {

            //Stop Follow
            if (!req.isSee) {
                map[req.location]['enemy']['enemy' + req.enemyID]['isMove'] = 0;
            }
            //Verify if the enemy is stopped
            if (map[req.location]['enemy']['enemy' + req.enemyID]['isMove'] == 0) {
                //If see
                if (req.isSee) {
                    //Enemy start follow
                    map[req.location]['enemy']['enemy' + req.enemyID]['isMove'] = req.id;
                }
            }
            //If is moving then
            if (map[req.location]['enemy']['enemy' + req.enemyID]['isMove'] == req.id) {
                //Pickup positions
                let positionX = map[req.location][req.id]['positionX'];
                let positionY = map[req.location][req.id]['positionY'];
                let epositionX = map[req.location]['enemy']['enemy' + req.enemyID]['positionX'];
                let epositionY = map[req.location]['enemy']['enemy' + req.enemyID]['positionY'];
                //Moving Calculation
                const positions = enemyMoving(positionX, positionY, epositionX, epositionY);
                //Add in map the new position
                map[req.location]['enemy']['enemy' + req.enemyID]['positionX'] = positions[0];
                map[req.location]['enemy']['enemy' + req.enemyID]['positionY'] = positions[1];
            }
        }
        //Login in world
        if (req.message == "login") {
            //Pickup token from database
            let token = await accounts.findOne({
                attributes: ['token'],
                where: {
                    id: req.id,
                }
            });
            //Token Check
            token = token.dataValues.token;
            if (token != req.token) {
                console.log("ID: " + req.id + " Blocked Connection: have a wrong token");
                //Close connection
                ws.close();
                return;
            }
            //Reconnection Check
            if (verifyReconnection(req.id)) {
                console.log("ID: " + req.id + " Reconnected to the World")
            } else {
                console.log("ID: " + req.id + " Connected to the World")
            }
            //Create the map if not created
            if (map[req.location] == undefined) {
                map[req.location] = {};
                //Add enemies into map
                map[req.location]['enemy'] = mapEvents[req.location];
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

    //Player Connection Closed
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
                                let location = playersOnline[Object.keys(playersOnline)[i]]['location'];
                                let playerID = Object.keys(map[playersOnline[Object.keys(playersOnline)[i]]['location']])[j];
                                console.log("ID: " + playerID + " Disconnected");
                                //Remove player from the world
                                delete map[location][playerID];
                                //Remove player from online section
                                delete playersOnline[playerID];
                                //Delete world if no players in
                                if (Object.keys(map[location]).length == 1) {
                                    delete map[location];
                                }
                            }
                        } catch (_) { }
                    }
                }
            }
        }, 3000);
    });

});

module.exports = async () => {
    setTimeout(async () => {
        console.log("Reading worlds...");
        //Pickup world informations
        const world = await worlds.findAll({
            attributes: ['id_world', 'name', 'event', 'npc', 'enemy'],
        });
        let i = 0;
        //Save in map Events
        while (true) {
            try {
                let id = '';
                //Find map id
                switch (world[i].dataValues.id_world.toString().length) {
                    case 1: id = '00' + world[i].dataValues.id_world; break;
                    case 2: id = '0' + world[i].dataValues.id_world; break;
                    case 3: id = world[i].dataValues.id_world.toString(); break;
                }
                //Add events to mapEvents
                mapEvents[world[i].dataValues.name + id] = JSON.parse(world[i].dataValues.enemy)
                i++;
            } catch (_) {
                break;
            }
        }
        console.log("Successfully reading the worlds");
        console.log("Server WebSocket started in ports 8081: http://localhost:8081");
        return wss;
    }, 200);
}