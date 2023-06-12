//Dependecies
const WebSocket = require("ws");
//Dependecies External
const webSocketIngame = require('./websocketIngame');
const accounts = require("./accounts");

const wss = new WebSocket.Server({ port: 8082 });
//Variables
let mapBattles = {};

//If players is not in battle
function checkIfPlayerIsInBattle(location, id) {
    //Sweep Players
    for (let i = 0; i < Object.keys(mapBattles[location]).length; i++) {
        //Battle ID
        let index = Object.keys(mapBattles[location])[i];
        //All Players in lobby
        let players = mapBattles[location][index]['players'];
        //Check if exist
        if (players[id] != undefined) {
            return true;
        } else {
            return false;
        }
    }
}

//If player is not newer of the selected enemy //Anti cheat
function checkIfPlayerIsNewerTheEnemy(map, location, id, enemyID) {
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
}

wss.on("connection", (ws, connectionInfo) => {
    let validation = false;
    //[0] = battleLocation //[1] == battleID
    let battle = ["", ""];
    let clientID = 0;

    //Receive Message
    ws.on("message", async data => {
        //Requisition
        const req = JSON.parse(data);

        //Lobby Creation
        if (true) {
            //Starting a new battle
            if (req.message == "startBattle" && battle[0] == "") {
                const map = webSocketIngame.map;
                const playersOnline = webSocketIngame.playersOnline;
                //Pickup Host Infos
                const account = await accounts.findOne({
                    attributes: ['characters', 'token'],
                    where: {
                        id: req.id,
                    }
                });
                //Incosistence Check
                if (true) {
                    //Token
                    if (req.token != account['dataValues']['token']) {
                        ws.close();
                        return;
                    }
                    //If player is newer the enemy
                    if (!checkIfPlayerIsNewerTheEnemy(map, req.location, req.id, req.enemyID)) {
                        ws.close();
                        return;
                    }
                    validation = true;
                }
                let character = JSON.parse(account['dataValues']['characters']);
                character = character['character' + playersOnline[req.id]['selectedCharacter']];
                //Create the battle map if not exist
                if (mapBattles[req.location] == undefined) {
                    mapBattles[req.location] = {};
                }
                //Create new battle lobby
                mapBattles[req.location][req.id] = {};
                //Create Enemy Lobby
                mapBattles[req.location][req.id]['enemies'] = {};
                //Add Enemy to the Enemy Lobby
                mapBattles[req.location][req.id]['enemies']['enemy' + req.enemyID] = map[req.location]['enemy']['enemy' + req.enemyID];
                //Add Max Atributes
                mapBattles[req.location][req.id]['enemies']['enemy' + req.enemyID]['maxLife'] = 10
                mapBattles[req.location][req.id]['enemies']['enemy' + req.enemyID]['maxMana'] = 10
                //Create Players Lobby
                mapBattles[req.location][req.id]['players'] = {};
                //Add Host to the Players Lobby
                mapBattles[req.location][req.id]['players'][req.id] = character;

                //Finish
                battle[0] = req.location;
                battle[1] = req.id;
                clientID = req.id
                ws.send(JSON.stringify(mapBattles[req.location][req.id]));
            }
            //Incosistence Check //Player is already in battle
            else if (req.message == "startBattle") {
                ws.close();
            }
        }

        //New enemy to the Lobby
        if (true) {
            if (req.message == "newEnemy" && validation) {
                const map = webSocketIngame.map;
                //Incosistence Check //Multiples
                if (true) {
                    //If players is not in battle
                    if (!checkIfPlayerIsInBattle(battle[0], clientID)) {
                        ws.close();
                        return;
                    }
                    //If player is not newer of the selected enemy //Anti cheat
                    if (!checkIfPlayerIsNewerTheEnemy(map, battle[0], clientID, req.enemyID)) {
                        ws.close();
                        return;
                    }
                    //If already exist the enemy
                    if (mapBattles[battle[0]][battle[1]]['enemies'][req.enemyID] != undefined) {
                        ws.close();
                        return;
                    }
                }
                //Add new enemy
                mapBattles[battle[0]][battle[1]]['enemies']['enemy' + req.enemyID] = map[battle[0]]['enemy']['enemy' + req.enemyID];
                ws.send("OK");
            }
            //Incosistence Check //Invalid Login
            else if (req.message == "newEnemy") {
                ws.close();
            }
        }

        //Joining a battle
        if (req.message == "joinBattle") { }

        //Retrieve battle info
        if (req.message == "updateBattle") {
            ws.send(JSON.stringify(mapBattles[battle[0]][battle[1]]));
        }
    });

    ws.on("close", () => {
        //TO DO delete lobby
    })
})

module.exports = {
    webSocketBattleInitialize: async () => {
        setTimeout(async () => {
            console.log("Server Battle started in ports 8082: ws://localhost:8082");
            return wss;
        }, 300);
    },
}