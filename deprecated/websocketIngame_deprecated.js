//Dependecies
const WebSocket = require("ws");
//Dependecies External
const worlds = require("./worlds");
const accounts = require("./accounts");

const wss = new WebSocket.Server({ port: 8081 });

//Variables
const serverTickDelay = 10;
let playersOnline = {};
let map = {};

//Read world
async function readWorld(location) {
    //Pickup world id
    let actualLocation = location.slice(-3);
    let actualLocationID = parseInt(actualLocation);

    //Pickup world informations
    const world = await worlds.findOne({
        attributes: ['name', 'event', 'npc', 'enemy'],
        where: {
            id_world: actualLocationID,
        },
    });
    return world['dataValues'];
}

//Enemy moving function
function enemyMoving(positionX, positionY, epositionX, epositionY) {
    try {
        const moveSpeed = 0.5;
        let directionX = "Direction.idle";
        let directionY = "Direction.idle";
        let moviment = [false, false, false, false];
        //X direction
        if (positionX < epositionX) {
            //Deadzone move
            if (epositionX - positionX >= 1) {
                directionX = "Direction.left";
                moviment[0] = true;
            }
            epositionX -= moveSpeed;
        } else if (positionX > epositionX) {
            //Deadzone move
            if (positionX - epositionX >= 1) {
                directionX = "Direction.right";
                moviment[1] = true;
            }
            epositionX += moveSpeed;
        }
        //Y direction
        if (positionY < epositionY) {
            //Deadzone move
            if (epositionY - positionY >= 1) {
                directionY = "Direction.up";
                moviment[2] = true;
            }
            epositionY -= moveSpeed;
        } else if (positionY > epositionY) {
            //Deadzone move
            if (positionY - epositionY >= 1) {
                directionY = "Direction.down";
                moviment[3] = true;
            }
            epositionY += moveSpeed;
        }
        //Movement Reducer
        if (true) {
            //Left moviment
            if (moviment[0] && (moviment[2] || moviment[3])) {
                if (positionX < epositionX) {
                    epositionX += moveSpeed / 2;
                } else {
                    epositionX -= moveSpeed / 2;
                }
            }
            //Right moviment
            if (moviment[1] && (moviment[2] || moviment[3])) {
                if (positionX < epositionX) {
                    epositionX += moveSpeed / 2;
                } else {
                    epositionX -= moveSpeed / 2;
                }
            }

        }
        //Parse to client Direction
        let direction;
        if (directionX != "Direction.idle" || directionY != "Direction.idle") {
            //X & Y Directions
            if (directionX != "Direction.idle") {
                //Right
                if (directionX == "Direction.right") {
                    if (directionY == "Direction.up") {
                        direction = "Direction.upRight";
                    } else if (directionY == "Direction.down") {
                        direction = "Direction.downRight";
                    } else {
                        direction = "Direction.right";
                    }
                }
                //Left
                else if (directionX == "Direction.left") {
                    if (directionY == "Direction.up") {
                        direction = "Direction.upLeft";
                    } else if (directionY == "Direction.down") {
                        direction = "Direction.downLeft";
                    } else {
                        direction = "Direction.left";
                    }
                }
            }
            //Y Only Directions
            else if (directionY != "Direction.idle") {
                //Up
                if (directionY == "Direction.up") {
                    direction = "Direction.up";
                }
                //Down
                if (directionY == "Direction.down") {
                    direction = "Direction.down";
                }
            }
        }
        return [epositionX, epositionY, direction];
    } catch (error) {
        return undefined;
    }
}

//If player is not newer of the selected enemy //Anti cheat
function checkIfPlayerIsNewerTheEnemy(map, location, id, enemyID) {
    try {
        let playerPositionX = map[location][id]['positionX'];
        let playerPositionY = map[location][id]['positionY'];
        let enemyPositionX = map[location]['enemy']['enemy' + enemyID]['positionX'];
        let enemyPositionY = map[location]['enemy']['enemy' + enemyID]['positionY'];
        //X check
        if (playerPositionX < enemyPositionX) {
            if ((enemyPositionX - playerPositionX) > 50) {
                return false;
            }
        } else {
            if ((playerPositionX - enemyPositionX) > 50) {
                return false;
            }
        }
        //Y check
        if (playerPositionY < enemyPositionY) {
            if ((enemyPositionY - playerPositionY) > 50) {
                return false;
            }
        } else {
            if ((playerPositionY - enemyPositionY) > 50) {
                return false;
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}

wss.on("connection", async (ws, connectionInfo) => {
    try {
        const clientIp = connectionInfo.socket.remoteAddress;
        let validation = false;
        //Client Informations
        let clientID = 0;
        let clientLocation = '';

        //Client Tick Await
        let tickWaitEnemyMoving = false;
        let tickWaitPlayersPosition = false;

        //Player Connection Continuous
        ws.on("message", async data => {
            //Requisition;
            const req = JSON.parse(data);

            //Return to client world positions
            if (req.message == "playersPosition" && validation && !tickWaitPlayersPosition) {
                tickWaitPlayersPosition = true;
                let positionX = req.positionX.toFixed(15);
                let positionY = req.positionY.toFixed(15);
                //Update Player Infos on the Map
                map[clientLocation][clientID] = {
                    'id': clientID,
                    'positionX': positionX,
                    'positionY': positionY,
                    'direction': req.direction,
                    'class': req.class,
                    'battleID': playersOnline[clientID]['battleID'],
                };
                //Send to Client
                setTimeout(function () { tickWaitPlayersPosition = false; ws.send(JSON.stringify(map[req.location])); }, serverTickDelay);
            }
            //Enemy See the Player
            if (req.message == "enemyMoving" && validation && !tickWaitEnemyMoving) {
                try {
                    tickWaitEnemyMoving = true;
                    // Stop Follow
                    if (!req.isSee) {
                        map[req.location]['enemy']['enemy' + req.enemyID]['isMove'] = 0;
                    }
                    const enemyArray = JSON.parse(req.enemyID);
                    //Sweep All Enemies
                    for (let i = 0; i < enemyArray.length; i++) {
                        const enemyID = enemyArray[i];
                        //Verify if the enemy is stopped
                        if (map[req.location]['enemy']['enemy' + enemyID]['isMove'] == 0) {
                            //If see
                            if (req.isSee) {
                                //Enemy start follow
                                map[req.location]['enemy']['enemy' + enemyID]['isMove'] = req.id;
                            }
                        }
                        //If is moving then
                        if (map[req.location]['enemy']['enemy' + enemyID]['isMove'] == req.id) {
                            //Pickup positions
                            let positionX = map[req.location][req.id]['positionX'];
                            let positionY = map[req.location][req.id]['positionY'];
                            let epositionX = map[req.location]['enemy']['enemy' + enemyID]['positionX'];
                            let epositionY = map[req.location]['enemy']['enemy' + enemyID]['positionY'];
                            //Moving Calculation
                            const positions = enemyMoving(positionX, positionY, epositionX, epositionY);
                            //Add in map the new position and direction
                            map[req.location]['enemy']['enemy' + enemyID]['positionX'] = positions[0];
                            map[req.location]['enemy']['enemy' + enemyID]['positionY'] = positions[1];
                            map[req.location]['enemy']['enemy' + enemyID]['direction'] = positions[2];
                        }
                    }
                    setTimeout(function () { tickWaitEnemyMoving = false; }, serverTickDelay);
                } catch (error) {
                    console.log("Error: " + error.toString() + "\nby ID: " + req.id);
                    //Close connection
                    ws.close();
                }
            }
            //Enemy Collide with Player
            if (req.message == "playerCollide" && validation) {
                const actualLocation = clientLocation;
                const enemyID = req.enemyID;
                //Check if player is not newer the enemy
                if (!checkIfPlayerIsNewerTheEnemy(map, actualLocation, req.id, enemyID)) {
                    ws.close();
                    return;
                }
                //Kill the enemy
                map[actualLocation]['enemy']['enemy' + enemyID]['isDead'] = true;
                //Active timer to respawn
                setTimeout(async () => {
                    if (map[actualLocation] != undefined) {
                        let loadedWorld = await readWorld(req.location);
                        loadedWorld = JSON.parse(loadedWorld['enemy']);
                        map[actualLocation]['enemy']['enemy' + enemyID] = loadedWorld['enemy' + enemyID];
                        map[actualLocation]['enemy']['enemy' + enemyID]['isDead'] = false;
                    }
                }, 3000);
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
                } else {
                    validation = true;
                }
                console.log("ID: " + req.id + " Connected to " + req.location);
                //Create the map if not created
                if (map[req.location] == undefined) {
                    map[req.location] = {};
                    //Add enemies into map
                    let loadedWorld = await readWorld(req.location);
                    map[req.location]['enemy'] = JSON.parse(loadedWorld['enemy']);
                }
                //Add player in online section
                playersOnline[req.id] = {
                    "id": req.id,
                    "location": req.location,
                    "class": req.class,
                    "selectedCharacter": req.selectedCharacter,
                    "battleID": -1,
                };
                //Update client info
                clientID = req.id;
                clientLocation = req.location;
                ws.send("OK");
            }
        });

        //Player Connection Closed
        ws.on("close", () => {
            try {
                let location = clientLocation;
                console.log("ID: " + clientID + " Disconnected from " + clientLocation);
                //Remove player from the world
                delete map[location][clientID];
                //Remove player from online section
                delete playersOnline[clientID];
                //Delete world if no players in
                if (Object.keys(map[location]).length == 1) {
                    delete map[location];
                }
            } catch (error) {
                console.log("ERROR: " + error.toString() + "\nfunction: ws.on(\"close\") in websocketIngame " + "by ID: " + clientID);
            }

        });
    } catch (error) {
        console.log("%cIngame Server Exception:", "color: red");
        console.log(error);
    }
});

//Function to websocketInBattle update the battleID from playersOnline
function changePlayerInBattle(clientID, battleID) {
    playersOnline[clientID]['battleID'] = battleID;
}

module.exports = {
    webSocketIngameInitialize: async () => {
        setTimeout(async () => {
            console.log("Server Ingame started in ports 8081");
            return wss;
        }, 200);
    },
    map: map,
    playersOnline: playersOnline,
    changePlayerInBattle: changePlayerInBattle,
}