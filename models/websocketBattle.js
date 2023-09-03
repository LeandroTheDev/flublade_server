//Dependecies
const WebSocket = require("ws");
//Dependecies External
const webSocketIngame = require('./websocketIngame');
const accounts = require("./accounts");
const classes = require("./gameplay");

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

//Verify if all enemies is dead
function verifyIfAllEnemiesIsDead(enemies) {
    for (let i = 0; i < Object.keys(enemies).length; i++) {
        let enemyID = Object.keys(enemies)[i];
        if (enemies[enemyID]['life'] > 0) {
            return false
        }
    }
    return true;
}

wss.on("connection", (ws, connectionInfo) => {
    try {
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
                    ws.send(JSON.stringify(mapBattles[battle[0]][battle[1]]));
                }
                //Incosistence Check //Invalid Login
                else if (req.message == "newEnemy") {
                    ws.close();
                }
            }

            //Joining a battle
            if (req.message == "joinBattle") { }

            //Attack
            if (true) {
                if (req.message['requisition'] == "attack" && validation) {
                    try {
                        //Variables Declaration
                        const playersOnline = webSocketIngame.playersOnline;
                        const levelCaps = classes.levelCaps;
                        const skillsId = classes.skillsId;
                        const lootDropRate = classes.lootDropRate;
                        const itemsId = classes.itemsId;
                        let battleLog = [];
                        let xp = 0;
                        let gold = 0;
                        let loots = [];
                        let lobbyFinish = false;
                        let isLevelUp = false;

                        //Attack System
                        for (let enemyIndex = 0; enemyIndex < Object.keys(mapBattles[battle[0]][battle[1]]['enemies']).length; enemyIndex++) {
                            let playerAttack = false;
                            let actualEnemy = Object.keys(mapBattles[battle[0]][battle[1]]['enemies'])[enemyIndex];
                            let noDeadLog = false;
                            //Check if enemy selected then player will attack
                            if (actualEnemy == ('enemy' + req.message['selectedEnemy'])) {
                                playerAttack = true;
                            }
                            actualEnemy = mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy];
                            //Check if enemy is already dead
                            if (actualEnemy['life'] == "dead") {
                                actualEnemy['life'] = 0;
                                noDeadLog = true;
                            }

                            //Enemy Variables Declaration
                            let enemyLife = actualEnemy['life'];
                            let enemyMana = actualEnemy['mana'];
                            let enemyMaxLife = actualEnemy['maxLife'];
                            let enemyMaxMana = actualEnemy['maxMana'];
                            let enemyArmor = actualEnemy['armor'];
                            let enemyBuffs = actualEnemy['buffs'];
                            let enemySkills = actualEnemy['skills'];
                            let enemyDamage = actualEnemy['damage'];
                            const enemyName = actualEnemy['name'];
                            const playerSkill = req.message['playerSkill'];

                            //Pickup Characters Infos
                            const user = await accounts.findOne({
                                attributes: ['id', 'characters'],
                                where: {
                                    id: clientID,
                                }
                            });

                            //Battle
                            if (true) {
                                //Converting Character
                                var characters = JSON.parse(user.characters);
                                var character = characters['character' + playersOnline[clientID]['selectedCharacter']];
                                //Converting stats
                                const baseStatsSkill = [parseFloat(character['damage']), parseFloat(character['life']), parseFloat(character['mana']), parseFloat(character['strength']), parseFloat(character['agility']), parseFloat(character['intelligence']), classes.SystemFunctions.playerMaxLife(character['class'], character['strength'])];
                                var playerStatsSkill = baseStatsSkill;
                                var lateBuffs = [];
                                var enemyLateBuffs = [];

                                //Player Turn
                                if (playerAttack) {
                                    //Passive
                                    if (true) {
                                        //Passives
                                        var buffs = Object.values(character['buffs']);
                                        for (var i = 0; i < buffs.length; i++) {
                                            //Verify if passive is late
                                            if (!skillsId[buffs[i]['name']]['isLate']) {
                                                var stats = classes.PassivesFunctions.passiveTranslate(playerStatsSkill, buffs[i]['name']);
                                                //Damage Passive
                                                if (stats['damage'] != null) {
                                                    character['damage'] = stats['damage'];
                                                }
                                                //Life Passive
                                                if (stats['=life'] != null) {
                                                    character['life'] = stats['=life'];
                                                    if (stats['+life'] != null) {
                                                        //Add batlelog
                                                        battleLog[battleLog.length] = {
                                                            'log1': 'battle_log_playerHealed1',
                                                            'log2': stats['+life'],
                                                            'log3': 'battle_log_playerHealed2',
                                                        };
                                                    }
                                                }
                                            } else {
                                                //Add late buff to late buffs variable
                                                lateBuffs[lateBuffs.length] = buffs[i];
                                            }
                                        }
                                    }
                                    //Refresh Stats
                                    playerStatsSkill = [character['damage'], parseFloat(character['life']), parseFloat(character['mana']), character['strength'], character['agility'], character['intelligence'], classes.SystemFunctions.playerMaxLife(character['class'], character['strength'])];
                                    //Skill
                                    if (true) {
                                        var stats = classes.SkillsFunctions.skillTranslate(playerStatsSkill, playerSkill);
                                        //Damage Skill
                                        if (stats['damage'] != null) {
                                            //Reduce Enemy Life
                                            enemyArmor = classes.SystemFunctions.armorPorcentageCalculator(enemyArmor);
                                            enemyLife = enemyLife - parseFloat((stats['damage'] * ((100 - enemyArmor) / 100))).toFixed(2);
                                            //Add batlelog
                                            battleLog[battleLog.length] = {
                                                'log1': 'battle_log_playerAttack1',
                                                'log2': parseFloat((stats['damage'] * ((100 - enemyArmor) / 100))).toFixed(2),
                                                'log3': 'battle_log_playerAttack2',
                                                'log4': 'enemy_' + enemyName,
                                            };
                                        }
                                        //Life Skill
                                        if (stats['=life'] != null) {
                                            //Lose Life
                                            if (stats['-life'] != null) {
                                                //Reduce Player Life
                                                character['life'] = stats['=life'];
                                                //Log
                                                battleLog[battleLog.length] = {
                                                    'log1': 'battle_log_loseHealthByPlayerSkill',
                                                    'log2': stats['-life'],
                                                    'log3': 'battle_log_loseHealthByPlayerSkill2',
                                                    'log4': 'magics_' + playerSkill,
                                                };
                                            }
                                        }
                                    }
                                    //Refresh Stats
                                    playerStatsSkill = [character['damage'], parseFloat(character['life']), parseFloat(character['mana']), character['strength'], character['agility'], character['intelligence'], classes.SystemFunctions.playerMaxLife(character['class'], character['strength'])];
                                }
                                //Enemy Turn
                                if (true) {
                                    //Converting stats
                                    var enemyStatsSkills = [enemyDamage, parseFloat(enemyLife), parseFloat(enemyMana), null, null, null, parseFloat(enemyMaxLife), parseFloat(enemyMaxMana), 1];
                                    //Check if enemy is already dead, else attack
                                    if (enemyLife > 0) {
                                        //Add batlelog
                                        battleLog[battleLog.length] = {
                                            'log1': 'enemy_' + enemyName,
                                            'log2': 'battle_log_turn',
                                        };
                                        //Enemy Passive
                                        if (true) {
                                            //Passives
                                            var buffs = Object.values(enemyBuffs);
                                            for (var i = 0; i < buffs.length; i++) {
                                                //Verify if passive is late
                                                if (!skillsId[buffs[i]]['isLate']) {
                                                    var stats = classes.PassivesFunctions.passiveTranslate(enemyStatsSkills, buffs[i]);
                                                    //Damage Passive
                                                    if (stats['damage'] != null) {
                                                        enemyDamage = stats['damage'];
                                                    }
                                                    //Life Passive
                                                    if (stats['=life'] != null) {
                                                        enemyLife = stats['=life'];
                                                        if (stats['+life'] != null) {
                                                            //Add batlelog
                                                            battleLog[battleLog.length] = {
                                                                'log1': 'battle_log_playerHealed1',
                                                                'log2': stats['+life'],
                                                                'log3': 'battle_log_playerHealed2',
                                                            };
                                                        }
                                                    }
                                                } else {
                                                    //Add late buff to late buffs variable
                                                    enemyLateBuffs[enemyLateBuffs.length] = buffs[i];
                                                }
                                            }
                                        }
                                        //Enemy Attack
                                        if (true) {
                                            var skills = Object.values(enemySkills);
                                            var ignoreAttack = false;
                                            //Skill
                                            for (var i = 0; i < skills.length; i++) {
                                                if (2 < Math.floor(Math.random() * 10)) {
                                                    var selected = Math.floor(Math.random() * skills.length);
                                                    enemyStatsSkills[8] = skills[selected]['tier'];
                                                    var stats = classes.SkillsFunctions.skillTranslate(enemyStatsSkills, skills[selected]['name']);

                                                    //Rules
                                                    if (true) {
                                                        if (enemyMana < stats['-mana']) {
                                                            break;
                                                        }
                                                    }

                                                    //Debuffs Skill
                                                    if (stats['enemyDebuffs'] != null) {
                                                        for (var a = 0; a < stats['enemyDebuffs'].length; a++) {
                                                            var alreadyAdded = false;
                                                            //Verify if is stackable
                                                            if (skillsId[stats['enemyDebuffs'][a]['name']]['isStackable']) {
                                                                //Scan if already added
                                                                for (var b = 0; b < character['debuffs'].length; b++) {
                                                                    //If already exist add stack
                                                                    if (stats['enemyDebuffs'][a]['name'] == character['debuffs'][b]['name']) {
                                                                        character['debuffs'][b]['stack'] = character['debuffs'][b]['stack'] + 1;
                                                                        character['debuffs'][b]['rounds'] = stats['enemyDebuffs'][a]['rounds'];
                                                                        //Add batlelog
                                                                        battleLog[battleLog.length] = {
                                                                            'log1': 'enemy_' + enemyName,
                                                                            'log2': 'battle_log_enemyDebuffed1',
                                                                            'log3': 'magics_' + skills[selected]['name'],
                                                                            'log4': 'battle_log_enemyDebuffed2',
                                                                        };
                                                                        alreadyAdded = true;
                                                                        break;
                                                                    }
                                                                }
                                                                //If not added
                                                                if (!alreadyAdded) {
                                                                    character['debuffs'].push(stats['enemyDebuffs'][a]);
                                                                    character['debuffs'][b]['stack'] = 1;
                                                                    //Add batlelog
                                                                    battleLog[battleLog.length] = {
                                                                        'log1': 'enemy_' + enemyName,
                                                                        'log2': 'battle_log_enemyDebuffed1',
                                                                        'log3': 'magics_' + skills[selected]['name'],
                                                                        'log4': 'battle_log_enemyDebuffed2',
                                                                    };
                                                                }
                                                            } else {
                                                                //Scan if already added
                                                                for (var b = 0; b < character['debuffs'].length; b++) {
                                                                    //If already exist reset rounds
                                                                    if (stats['enemyDebuffs'][a]['name'] == character['debuffs'][b]['name']) {
                                                                        character['debuffs'][b]['rounds'] = stats['enemyDebuffs'][a]['rounds'];
                                                                        alreadyAdded = true;
                                                                        //Add batlelog
                                                                        battleLog[battleLog.length] = {
                                                                            'log1': 'enemy_' + enemyName,
                                                                            'log2': 'battle_log_enemyDebuffed1',
                                                                            'log3': 'magics_' + skills[selected]['name'],
                                                                            'log4': 'battle_log_enemyDebuffed2',
                                                                        };
                                                                        break;
                                                                    }
                                                                }
                                                                //If not add
                                                                if (!alreadyAdded) {
                                                                    //Added in debuffs
                                                                    stats['enemyDebuffs'][a]['stack'] = 1;
                                                                    character['debuffs'].push(stats['enemyDebuffs'][a]);
                                                                    //Add batlelog
                                                                    battleLog[battleLog.length] = {
                                                                        'log1': 'enemy_' + enemyName,
                                                                        'log2': 'battle_log_enemyDebuffed1',
                                                                        'log3': 'magics_' + skills[selected]['name'],
                                                                        'log4': 'battle_log_enemyDebuffed2',
                                                                    };
                                                                }
                                                            }
                                                        }
                                                    }
                                                    //Damage Skill
                                                    if (stats['damage'] != null) {
                                                        character['life'] = character['life'] - stats['damage'];
                                                        //Add batlelog
                                                        battleLog[battleLog.length] = {
                                                            'log1': 'battle_log_enemyAttack1',
                                                            'log2': stats['damage'],
                                                            'log3': 'battle_log_enemyAttack2',
                                                            'log4': 'enemy_' + enemyName,
                                                        };
                                                    }
                                                    //Reduce Mana Skill
                                                    if (stats['-mana'] != null) {
                                                        enemyMana = enemyMana - stats['-mana'];
                                                    }
                                                    ignoreAttack = true;
                                                }
                                            }
                                            //Basic Attack
                                            if (!ignoreAttack) {
                                                //Damage Calculation
                                                const playerArmor = classes.SystemFunctions.armorPorcentageCalculator(character['armor']);
                                                character['life'] = character['life'] - (enemyDamage * ((100 - playerArmor) / 100));
                                                //Add batlelog
                                                battleLog[battleLog.length] = {
                                                    'log1': 'battle_log_enemyAttack1',
                                                    'log2': (enemyDamage * ((100 - playerArmor) / 100)),
                                                    'log3': 'battle_log_enemyAttack2',
                                                    'log4': 'enemy_' + enemyName,
                                                };
                                            }
                                        }

                                        //Enemy Debuffs Application
                                        if (true) {

                                        }
                                    }

                                    //Player Debuffs Application
                                    if (playerAttack) {
                                        for (var i = 0; i < character['debuffs'].length; i++) {
                                            playerStatsSkill[8] = character['debuffs'][i]['tier'];
                                            playerStatsSkill[9] = character['debuffs'][i]['stack'];
                                            var stats = classes.PassivesFunctions.passiveTranslate(playerStatsSkill, character['debuffs'][i]['name']);
                                            //Life reduction debuff
                                            if (stats['-life'] != null) {
                                                character['life'] = character['life'] - stats['-life'];
                                                character['debuffs'][i]['rounds'] = character['debuffs'][i]['rounds'] - 1;
                                                //Add batlelog
                                                battleLog[battleLog.length] = {
                                                    'log1': 'battle_log_playerDebuffReceived1',
                                                    'log2': stats['-life'],
                                                    'log3': 'battle_log_playerDebuffReceived2',
                                                    'log4': 'magics_' + character['debuffs'][i]['name'],
                                                };
                                                //If rounds is 0 then delete from debuffs
                                                if (character['debuffs'][i]['rounds'] < 1) {
                                                    for (var a = i; a < character['debuffs'].length; a++) {
                                                        character['debuffs'][i] = character['debuffs'][a + 1];
                                                    }
                                                    character['debuffs'].pop();
                                                }
                                            }
                                        }
                                    }

                                    //Refresh Stats
                                    playerStatsSkill = [character['damage'], parseFloat(character['life']), parseFloat(character['mana']), character['strength'], character['agility'], character['intelligence'], classes.SystemFunctions.playerMaxLife(character['class'], character['strength'])];
                                    //Check if player Dead
                                    if (parseFloat(character['life']) <= 0) {
                                        battleLog[battleLog.length] = {
                                            'log1': 'battle_log_playerDead',
                                        };
                                        //Reset Player Stats
                                        character['life'] = classes.SystemFunctions.playerMaxLife(character['class'], character['strength']);
                                        character['debuffs'] = [];
                                        character['damage'] = baseStatsSkill[0];
                                        character['strength'] = baseStatsSkill[3];
                                        character['agility'] = baseStatsSkill[4];
                                        character['intelligence'] = baseStatsSkill[5];
                                        characters['character' + playersOnline[clientID]['selectedCharacter']] = character;
                                        user.characters = characters;
                                        await user.save();
                                        //Player Dead
                                        ws.send(JSON.stringify({
                                            "updatePlayer": true,
                                            "gameover": true,
                                            "battleLog": battleLog,
                                        }));
                                        return;
                                    }

                                    //Enemy Late Passives
                                    if (enemyLife > 0) {
                                        for (var i = 0; i < enemyLateBuffs.length; i++) {
                                            var stats = classes.PassivesFunctions.passiveTranslate(enemyStatsSkills, enemyLateBuffs[i]);
                                            //Damage Passive
                                            if (stats['damage'] != null) {
                                                enemyDamage = stats['damage'];
                                            }
                                            //Life Passive
                                            if (stats['=life'] != null) {
                                                enemyLife = stats['=life'];
                                                if (stats['+life'] != null) {
                                                    //Add batlelog
                                                    battleLog[battleLog.length] = {
                                                        'log1': 'enemy_' + enemyName,
                                                        'log2': 'battle_log_enemyHealed1',
                                                        'log3': stats['+life'],
                                                        'log4': 'battle_log_enemyHealed2',
                                                        'log5': 'magics_' + enemyLateBuffs[i],
                                                    };
                                                }
                                            }
                                        }
                                    }
                                    //Player Late Passives
                                    if (true) {
                                        for (var i = 0; i < lateBuffs.length; i++) {
                                            var stats = classes.PassivesFunctions.passiveTranslate(playerStatsSkill, lateBuffs[i]['name']);
                                            //Damage Passive
                                            if (stats['damage'] != null) {
                                                character['damage'] = stats['damage'];
                                            }
                                            //Life Passive
                                            if (stats['=life'] != null) {
                                                character['life'] = stats['=life'];
                                                if (stats['+life'] != null) {
                                                    //Add batlelog
                                                    battleLog[battleLog.length] = {
                                                        'log1': 'battle_log_playerHealed1',
                                                        'log2': stats['+life'],
                                                        'log3': 'battle_log_playerHealed2',
                                                    };
                                                }
                                            }
                                        }
                                    }
                                }
                                //Save Stats
                                if (true) {
                                    character['damage'] = baseStatsSkill[0];
                                    character['strength'] = baseStatsSkill[3];
                                    character['agility'] = baseStatsSkill[4];
                                    character['intelligence'] = baseStatsSkill[5];
                                    characters['character' + playersOnline[clientID]['selectedCharacter']] = character;
                                    user.characters = characters;
                                }
                                //Save on database
                                await user.save();
                            }
                            //Enemy killed
                            if (enemyLife <= 0) {
                                enemyLife = "dead";
                                //Add batlelog
                                if (!noDeadLog) {
                                    battleLog[battleLog.length] = {
                                        'log1': 'battle_log_enemyDead',
                                        'log2': 'enemy_' + enemyName,
                                    };
                                }
                            }

                            //Update Enemy
                            if (true) {
                                actualEnemy = Object.keys(mapBattles[battle[0]][battle[1]]['enemies'])[enemyIndex];
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['damage'] = enemyDamage;
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['life'] = enemyLife;
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['mana'] = enemyMana;
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['maxLife'] = enemyMaxLife;
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['maxMana'] = enemyMaxMana;
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['armor'] = enemyArmor;
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['magicArmor']; //To do
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['strength']; //To do
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['agility']; // To do
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['intelligence']; //To do
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['buffs']; // To do
                                mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy]['skills']; // To do
                            }

                            //Lobby Finish
                            lobbyFinish = verifyIfAllEnemiesIsDead(mapBattles[battle[0]][battle[1]]['enemies']);
                            if (lobbyFinish) {
                                let enemyQuantity = Object.keys(mapBattles[battle[0]][battle[1]]['enemies']).length;
                                //Swepp all enemies
                                for (let enemyIndex = 0; enemyIndex < enemyQuantity; enemyIndex++) {
                                    let actualEnemy = Object.keys(mapBattles[battle[0]][battle[1]]['enemies'])[enemyIndex];
                                    actualEnemy = mapBattles[battle[0]][battle[1]]['enemies'][actualEnemy];
                                    //Xp
                                    if (true) {
                                        //XP Calculation
                                        if (actualEnemy['level'] <= 10) {
                                            // 2 additional xp chance
                                            xp += actualEnemy['xp'] + parseFloat((Math.random() * 3).toFixed(2));
                                        } else if (actualEnemy['level'] >= 11 &&
                                            actualEnemy['xp'] <= 20) {
                                            // 10 additional xp chance
                                            xp += actualEnemy['xp'] + parseFloat((Math.random() * 11).toFixed(2));
                                        } else if (actualEnemy['level'] >= 21 &&
                                            actualEnemy['xp'] <= 30) {
                                            // 30 additional xp chance
                                            xp += actualEnemy['xp'] + parseFloat((Math.random() * 31).toFixed(2));
                                        } else {
                                            // 60 additional xp chance
                                            xp += actualEnemy['xp'] + parseFloat((Math.random() * 61).toFixed(2));
                                        }
                                    }
                                    //Items
                                    if (true) {
                                        //Gold
                                        if (true) {
                                            if (actualEnemy['level'] >= 0 && actualEnemy['level'] <= 4) {
                                                gold += 1 + Math.floor(Math.random() * 4);
                                            } else if (actualEnemy['level'] >= 5 && actualEnemy['level'] <= 10) {
                                                gold += 3 + Math.floor(Math.random() * 9);
                                            } else if (actualEnemy['level'] >= 11 && actualEnemy['level'] <= 20) {
                                                gold += 6 + Math.floor(Math.random() * 16);
                                            } else if (actualEnemy['level'] >= 21 && actualEnemy['level'] <= 30) {
                                                gold += 12 + Math.floor(Math.random() * 21);
                                            } else if (actualEnemy['level'] >= 31 && actualEnemy['level'] <= 45) {
                                                gold += 20 + Math.floor(Math.random() * 31);
                                            } else if (actualEnemy['level'] >= 46 && actualEnemy['level'] <= 60) {
                                                gold += 30 + Math.floor(Math.random() * 41);
                                            } else {
                                                gold += 50 + Math.floor(Math.random() * 46);
                                            }
                                            //Add Gold to Loots
                                            if (loots[0] == undefined) {
                                                loots[0] = itemsId['gold'];
                                                loots[0]['quantity'] = gold;
                                            } else {
                                                loots[0]['quantity'] += gold;
                                            }
                                        }
                                        //Loot Quantity
                                        if (true) {
                                            var alreadyUnique = false;
                                            for (var i = 0; i < Object.keys(lootDropRate[actualEnemy['name']]).length / 3; i++) {
                                                //Calculates the chance
                                                var chance = Math.floor(Math.random() * 100);
                                                //Add item
                                                if (lootDropRate[actualEnemy['name']][i + 'Chance'] >= chance) {
                                                    var breaker = false;

                                                    //Verify if item already exists, else dont do nothing
                                                    for (var a = 0; a < loots.length; a++) {
                                                        if (loots[a]['name'] == lootDropRate[actualEnemy['name']][i]) {
                                                            loots[a]['quantity'] = loots[a]['quantity'] + 1;
                                                            breaker = true;
                                                            break;
                                                        }
                                                    }
                                                    //Verify if item is already added, else add item
                                                    if (!breaker) {
                                                        //Verify if is unique
                                                        if (lootDropRate[actualEnemy['name']][i + 'Unique'] != true) {
                                                            //If has a tier
                                                            if (lootDropRate[actualEnemy['name']][i].includes('%')) {
                                                                loots[loots.length] = classes.SystemFunctions.calculatesItemTier(lootDropRate[actualEnemy['name']][i]);
                                                                loots[loots.length - 1]['quantity'] = 1;
                                                            } else {
                                                                loots[loots.length] = itemsId[lootDropRate[actualEnemy['name']][i]];
                                                                loots[loots.length - 1]['quantity'] = 1;
                                                            }
                                                        } else {
                                                            if (!alreadyUnique) {
                                                                alreadyUnique = true;
                                                                //If has a tier
                                                                if (lootDropRate[actualEnemy['name']][i].includes('%')) {
                                                                    loots[loots.length] = classes.SystemFunctions.calculatesItemTier(lootDropRate[actualEnemy['name']][i]);
                                                                    loots[loots.length - 1]['quantity'] = 1;
                                                                } else {
                                                                    loots[loots.length] = itemsId[lootDropRate[actualEnemy['name']][i]];
                                                                    loots[loots.length - 1]['quantity'] = 1;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                //Adding xp to character
                                character['xp'] = character['xp'] + xp;
                                while (true) {
                                    if (levelCaps[character['level']] <= character['xp']) {
                                        character['xp'] = character['xp'] - levelCaps[character['level']];
                                        character['level'] = character['level'] + 1;
                                        isLevelUp = true;
                                    } else {
                                        break;
                                    }
                                }
                                if (isLevelUp) {
                                    character = classes.SystemFunctions.calculatesPlayerEquipmentsStats(null, character, false, true)
                                }
                                //Lobby Finish
                                ws.send(JSON.stringify({
                                    "updatePlayer": true,
                                    "enemies": mapBattles[battle[0]][battle[1]]['enemies'],
                                    "win": true,
                                    "battleLog": battleLog,
                                    "loots": loots,
                                    "earnedXP": xp,
                                    "levelUpDialog": isLevelUp,
                                }));
                                return;
                            }
                        }

                        //Return
                        ws.send(JSON.stringify({
                            "updatePlayer": true,
                            "enemies": mapBattles[battle[0]][battle[1]]['enemies'],
                            "battleLog": battleLog,
                        }));

                        return;
                    } catch (error) {
                        console.log(error);
                    }
                } else if (req.message['requisition'] == "attack") {
                    ws.close();
                }
            }

            //Retrieve battle info
            if (req.message == "updateBattle") { ws.send(JSON.stringify(mapBattles[battle[0]][battle[1]])) }

            if (req.message == "close") {
                console.log("exited battle");
            }
        });

        ws.on("close", () => {
            //TO DO delete lobby
        })
    } catch (error) {
        console.log("%cBattle Server Exception:", "color: red");
        console.log(error);
    }
})

module.exports = {
    webSocketBattleInitialize: async () => {
        setTimeout(async () => {
            console.log("Server Battle started in ports 8082: ws://localhost:8082");
            return wss;
        }, 300);
    },
}