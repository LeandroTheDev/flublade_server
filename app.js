//Dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
//Dependecies External
const { eAdmin } = require('./middlewares/auth');
const accounts = require('./models/accounts');
const world = require('./models/world');

//Enable json post
app.use(express.json());

//------
//System
//------

//Create account
app.post('/createAcc', async (req, res) => {
    var data = req.body;
    //Account rules check
    if (true) {
        //Too small username
        if (req.body.username.length < 3 || req.body.username.length > 20) {
            return res.status(400).json({
                error: true,
                message: 'Too small or too big username'
            });
        }
        //Too small password
        if (req.body.password.length < 3 || req.body.password.length > 100) {
            return res.status(400).json({
                error: true,
                message: 'Too small password or too big password'
            });
        }
    }
    //Encrypte password
    data.password = await bcrypt.hash(req.body.password, 8);
    //Add in database
    await accounts.create(data).then(() => {
        //Account creation log
        console.log('Account created: ' + data.username);
        //Return to frontend
        return res.json({
            error: false,
            message: 'Success',
        });
    }).catch((error) => {
        //Username already taken
        if (error['errors'][0]['message'].includes('username must be unique')) {
            return res.status(400).json({
                error: true,
                message: 'Username already exists'
            });
        }
        //Connection problems
        return res.status(400).json({
            error: true,
            message: 'Unkown error'
        });
    });
});

//Login
app.post('/login', async (req, res) => {

    //Pickup from database  profile info
    const user = await accounts.findOne({
        attributes: ['id', 'username', 'password', 'language', 'characters', 'token'],
        where: {
            username: req.body.username,
        }
    });

    //Credentials check
    if (true) {
        //Incorrect username check
        if (user === null) {
            return res.status(400).json({
                error: true,
                message: 'Wrong Credentials'
            });
        }
        //Incorrect password check
        if (!(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).json({
                error: true,
                message: 'Wrong Credentials'
            });
        }
    }

    //Token creation
    user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});

    //Save in database
    await user.save();

    //Success Login
    console.log('Player Logged: ' + user.username);
    return res.json({
        error: false,
        message: 'Success',
        id: user.id,
        username: user.username,
        language: user.language,
        characters: user.characters,
        token: user.token
    });
});

//Login Remember
app.post('/loginRemember', async (req, res) => {

    //Pickup from database  profile info
    const user = await accounts.findOne({
        attributes: ['id', 'username', 'password', 'language', 'characters', 'token'],
        where: {
            id: req.body.id,
        }
    });

    //Token check
    if (req.body.token != user.token) {
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }
    //Token recreation
    user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
    await user.save();

    //Success Login
    console.log('Player Logged: ' + user.username);
    return res.json({
        error: false,
        message: 'Success',
        id: user.id,
        username: user.username,
        language: user.language,
        characters: user.characters,
        token: user.token
    });
});

//Update Language
app.post('/updateLanguage', async (req, res) => {
    //Pickup from database  profile info
    const user = await accounts.findOne({
        attributes: ['id', 'language', 'token'],
        where: {
            id: req.body.id,
        }
    });

    //Token check
    if (req.body.token != user.token) {
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }

    //Save on database
    user.language = req.body.language;
    await user.save();

    //Success
    return res.json({
        error: false,
        message: 'Success',
    });
});



//------
//Menu
//------

//Get characters
app.post('/getCharacters', async (req, res) => {
    try {
        //Pickup from database  profile info
        const user = await accounts.findOne({
            attributes: ['id', 'characters', 'token'],
            where: {
                id: req.body.id,
            }
        });

        //Token check
        if (req.body.token != user.token) {
            return res.status(400).json({
                error: true,
                message: 'Invalid Login'
            });
        }

        //Return only inventory
        if (req.body.onlyInventory) {
            var json = JSON.parse(user.characters);
            //Success
            return res.json({
                error: false,
                message: 'Success',
                inventory: json['character' + req.body.selectedCharacter]['inventory']
            });
        }

        //Success
        return res.json({
            error: false,
            message: 'Success',
            characters: user.characters
        });
        //Error Treatment
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }
});

//Remove characters
app.post('/removeCharacters', async (req, res) => {
    try {
        //Pickup from database  profile info
        const user = await accounts.findOne({
            attributes: ['id', 'username', 'characters', 'token'],
            where: {
                id: req.body.id,
            }
        });

        //Token check
        if (req.body.token != user.token) {
            return res.status(400).json({
                error: true,
                message: 'Invalid Login'
            });
        }

        //Removing character
        const json = JSON.parse(user.characters);
        var i = req.body.index;
        while (true) {
            //Remove character
            if (i == req.body.index) {
                console.log('Character Deleted: ' + json['character' + i]['name'] + ', Level: ' + json['character' + i]['level'] + ', Username: ' + user.username);
                delete json['character' + i];
            }
            //Subsequent index
            var a = i + 1;
            //Subsequent break verification
            if (json['character' + a] == null) {
                a = a - 1;
                delete json['character' + a];
                break;
            }
            //Lowering the character index of subsequent characters
            json['character' + i] = json['character' + a];
            i++;
        }

        //Save on database
        user.characters = JSON.stringify(json);
        await user.save();

        //Success
        return res.json({
            error: false,
            message: 'Success',
            characters: user.characters
        });
        //Error Treatment
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }
});

//Create characters
app.post('/createCharacters', async (req, res) => {
    try {
        var selectedClass = baseAtributes[req.body.class];
        //Rules check
        if (true) {
            //Empty
            if (req.body.name.length <= 0) {
                return res.status(400).json({
                    error: true,
                    message: 'Empty'
                });
            }
            if (req.body.name.length > 10) {
                return res.status(400).json({
                    error: true,
                    message: 'Too big'
                });
            }
            //Verification if class exist
            if (selectedClass == null) {
                return res.status(400).json({
                    error: true,
                    message: 'Invalid Class'
                });
            }
        }

        //Pickup from database  profile info
        const user = await accounts.findOne({
            attributes: ['id', 'username', 'characters', 'token'],
            where: {
                id: req.body.id,
            }
        });

        //Token check
        if (req.body.token != user.token) {
            return res.status(400).json({
                error: true,
                message: 'Invalid Login'
            });
        }
        //Adding character
        var json = {};
        if (true) {
            json = JSON.parse(user.characters);
            json['character' + Object.keys(json).length] = {
                'name': req.body.name,
                'class': req.body.class,
                'life': SystemFunctions.playerMaxLife(req.body.class, baseAtributes[req.body.class]['strength']),
                'mana': baseAtributes[req.body.class].mana,
                'armor': baseAtributes[req.body.class].armor,
                'level': 1,
                'xp': 0,
                'skillpoint': 0,
                'damage': 1,
                'strength': baseAtributes[req.body.class].strength,
                'agility': baseAtributes[req.body.class].agility,
                'intelligence': baseAtributes[req.body.class].intelligence,
                'inventory': {},
                'buffs': baseAtributes[req.body.class].buffs,
                'skills': baseAtributes[req.body.class].skills,
                'equips': [
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none',
                    'none'
                ],
                'location': 'prologue001',
            };
            console.log('Character Created: ' + req.body.name + ', Class: ' + req.body.class + ', Username: ' + user.username);
        }

        //Save on database
        user.characters = JSON.stringify(json);
        await user.save();

        //Success
        return res.json({
            error: false,
            message: 'Success',
            characters: user.characters
        });
        //Error Treatment
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }
});

//Update characters
app.post('/updateCharacters', async (req, res) => {
    try {
        //Pickup from database  profile info
        const user = await accounts.findOne({
            attributes: ['id', 'username', 'characters', 'token'],
            where: {
                id: req.body.id,
            }
        });

        //Token check
        if (req.body.token != user.token) {
            return res.status(400).json({
                error: true,
                message: 'Invalid Login'
            });
        }

        //Updating
        var json = {};
        if (true) {
            //Is levelup?
            if (req.body.isLevelUp) {
                json = JSON.parse(user.characters)
                json['character' + req.body.selectedCharacter]['strength'] = json['character' + req.body.selectedCharacter]['strength'] + baseAtributes[json['character' + req.body.selectedCharacter]['class']]['strengthLevel'];
                json['character' + req.body.selectedCharacter]['agility'] = json['character' + req.body.selectedCharacter]['agility'] + baseAtributes[json['character' + req.body.selectedCharacter]['class']]['agilityLevel'];
                json['character' + req.body.selectedCharacter]['intelligence'] = json['character' + req.body.selectedCharacter]['intelligence'] + baseAtributes[json['character' + req.body.selectedCharacter]['class']]['intelligenceLevel'];
                json['character' + req.body.selectedCharacter]['armor'] = json['character' + req.body.selectedCharacter]['armor'] + baseAtributes[json['character' + req.body.selectedCharacter]['class']]['armorLevel'];
                json['character' + req.body.selectedCharacter]['skillpoint'] = json['character' + req.body.selectedCharacter]['skillpoint'] + 1;
                user.characters = JSON.stringify(json);
            }
            else {
                json = JSON.parse(user.characters);
                json['character' + req.body.selectedCharacter]['name'] = req.body.name;
                json['character' + req.body.selectedCharacter]['life'] = req.body.life;
                json['character' + req.body.selectedCharacter]['mana'] = req.body.mana;
                json['character' + req.body.selectedCharacter]['armor'] = req.body.armor;
                json['character' + req.body.selectedCharacter]['level'] = req.body.level;
                json['character' + req.body.selectedCharacter]['xp'] = req.body.xp;
                json['character' + req.body.selectedCharacter]['skillpoint'] = req.body.skillpoint;
                json['character' + req.body.selectedCharacter]['strength'] = req.body.strength;
                json['character' + req.body.selectedCharacter]['agility'] = req.body.agility;
                json['character' + req.body.selectedCharacter]['intelligence'] = req.body.intelligence;
                json['character' + req.body.selectedCharacter]['inventory'] = req.body.inventory;
                json['character' + req.body.selectedCharacter]['buffs'] = req.body.buffs;
                json['character' + req.body.selectedCharacter]['equips'] = req.body.equips;
                json['character' + req.body.selectedCharacter]['location'] = req.body.location;
                user.characters = JSON.stringify(json);
            }
        }

        //Save on database
        await user.save();

        //Success
        return res.json({
            error: false,
            message: 'Success',
            characters: user.characters
        });
        //Error Treatment
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }
});



//------
//Gameplay
//------

app.post('/attackEnemy', async (req, res) => {
    try {
        //Variables Declaration
        var enemyLife = req.body.enemyLife;
        var enemyArmor = req.body.enemyArmor;
        const enemyMana = req.body.enemyMana;
        const enemyDamage = req.body.enemyDamage;
        const enemyName = req.body.enemyName;
        const enemyXP = req.body.enemyXP;
        const enemyLevel = req.body.enemyLevel;
        const playerSkill = req.body.playerSkill;
        var battleLog = [];

        //Pickup Characters Infos
        const user = await accounts.findOne({
            attributes: ['id', 'username', 'characters', 'token'],
            where: {
                id: req.body.id,
            }
        });

        //Token check
        if (req.body.token != user.token) {
            return res.status(400).json({
                error: true,
                message: 'Invalid Login'
            });
        }

        //Battle
        if (true) {
            //Converting Character
            var characters = JSON.parse(user.characters);
            var character = characters['character' + req.body.selectedCharacter];
            //Converting player stats
            var playerStatsSkill = [character['damage'], parseFloat(character['life']), parseFloat(character['mana']), character['strength'], character['agility'], character['intelligence'], SystemFunctions.playerMaxLife(character['class'], character['strength'])];
            const baseStatsSkill = [character['damage'], character['life'], character['mana'], character['strength'], character['agility'], character['intelligence'], SystemFunctions.playerMaxLife(character['class'], character['strength'])];
            var lateBuffs = [];

            //Player Turn
            if (true) {
                //Passive
                if (true) {
                    //Passives
                    var buffs = Object.values(character['buffs']);
                    for (var i = 0; i < buffs.length; i++) {
                        //Verify if passive is late
                        if (!skillsId[buffs[i]['name']]['isLate']) {
                            var stats = PassivesFunctions.passiveTranslate(playerStatsSkill, buffs[i]['name']);
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
                playerStatsSkill = [character['damage'], parseFloat(character['life']), parseFloat(character['mana']), character['strength'], character['agility'], character['intelligence'], SystemFunctions.playerMaxLife(character['class'], character['strength'])];
                //Skill
                if (true) {
                    var stats = SkillsFunctions.skillTranslate(playerStatsSkill, playerSkill);
                    //Damage Skill
                    if (stats['damage'] != null) {
                        //Reduce Enemy Life
                        enemyArmor = SystemFunctions.armorPorcentageCalculator(enemyArmor);
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
                playerStatsSkill = [character['damage'], parseFloat(character['life']), parseFloat(character['mana']), character['strength'], character['agility'], character['intelligence'], SystemFunctions.playerMaxLife(character['class'], character['strength'])];
            }
            //Enemy Turn
            if (true) {
                //Damage Calculation
                const playerArmor = SystemFunctions.armorPorcentageCalculator(character['armor']);
                character['life'] = character['life'] - (enemyDamage * ((100 - playerArmor) / 100));
                //Add batlelog
                battleLog[battleLog.length] = {
                    'log1': 'battle_log_enemyAttack1',
                    'log2': (enemyDamage * ((100 - playerArmor) / 100)),
                    'log3': 'battle_log_enemyAttack2',
                    'log4': 'enemy_' + enemyName,
                };
                //Refresh Stats
                playerStatsSkill = [character['damage'], parseFloat(character['life']), parseFloat(character['mana']), character['strength'], character['agility'], character['intelligence'], SystemFunctions.playerMaxLife(character['class'], character['strength'])];
                //Check if player Dead
                if (parseFloat(character['life']) <= 0) {
                    battleLog[battleLog.length] = {
                        'log1': 'battle_log_playerDead',
                    };
                    //Reset Player Life
                    character['life'] = SystemFunctions.playerMaxLife(character['class'], character['strength']);
                    characters['character' + req.body.selectedCharacter] = character;
                    user.characters = characters;
                    await user.save();
                    //Player Dead
                    return res.json({
                        error: false,
                        message: 'Player Dead',
                        enemyLife: enemyLife,
                        enemyArmor: enemyArmor,
                        enemyMana: enemyMana,
                        enemyDamage: enemyDamage,
                        enemyName: enemyName,
                        enemyLevel: enemyLevel,
                        enemyXP: enemyXP,
                        battleLog: battleLog,
                    });
                }
                //Late Passive
                if (true) {
                    for (var i = 0; i < lateBuffs.length; i++) {
                        var stats = PassivesFunctions.passiveTranslate(playerStatsSkill, lateBuffs[i]['name']);
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

            //Bonus stats to default
            if (true) {
                character['damage'] = baseStatsSkill[0];
                character['strength'] = baseStatsSkill[3];
                character['agility'] = baseStatsSkill[4];
                character['intelligence'] = baseStatsSkill[5];
            }

            //Loot
            if (enemyLife <= 0) {
                var xp = 0;
                var gold = 0;
                var loots = [];
                //Xp
                if (true) {
                    if (enemyLevel <= 10) {
                        // 2 additional xp chance
                        xp = enemyXP + parseFloat((Math.random() * 3).toFixed(2));
                    } else if (enemyLevel >= 11 &&
                        enemyXP <= 20) {
                        // 10 additional xp chance
                        xp = enemyXP + parseFloat((Math.random() * 11).toFixed(2));
                    } else if (enemyLevel >= 21 &&
                        enemyXP <= 30) {
                        // 30 additional xp chance
                        xp = enemyXP + parseFloat((Math.random() * 31).toFixed(2));
                    } else {
                        // 60 additional xp chance
                        xp = enemyXP + parseFloat((Math.random() * 61).toFixed(2));
                    }
                }
                //Items
                if (true) {
                    //Gold
                    if (true) {
                        if (enemyLevel >= 0 && enemyLevel <= 4) {
                            gold = 1 + Math.floor(Math.random() * 4);
                        } else if (enemyLevel >= 5 && enemyLevel <= 10) {
                            gold = 3 + Math.floor(Math.random() * 9);
                        } else if (enemyLevel >= 11 && enemyLevel <= 20) {
                            gold = 6 + Math.floor(Math.random() * 16);
                        } else if (enemyLevel >= 21 && enemyLevel <= 30) {
                            gold = 12 + Math.floor(Math.random() * 21);
                        } else if (enemyLevel >= 31 && enemyLevel <= 45) {
                            gold = 20 + Math.floor(Math.random() * 31);
                        } else if (enemyLevel >= 46 && enemyLevel <= 60) {
                            gold = 30 + Math.floor(Math.random() * 41);
                        } else {
                            gold = 50 + Math.floor(Math.random() * 46);
                        }
                        //Add Gold to Loots
                        loots[loots.length] = itemsId['gold'];
                        loots[loots.length - 1]['quantity'] = gold;
                    }
                    //Loot Quantity
                    if (true) {
                        var alreadyUnique = false;
                        for (var i = 0; i < Object.keys(lootDropRate[enemyName]).length / 3; i++) {
                            //Calculates the chance
                            var chance = Math.floor(Math.random() * 100);
                            //Add item
                            if (lootDropRate[enemyName][i + 'Chance'] >= chance) {
                                var breaker = false;

                                //Verify if item already exists, else dont do nothing
                                for (var a = 0; a < loots.length; a++) {
                                    if (loots[a]['name'] == lootDropRate[enemyName][i]) {
                                        loots[a]['quantity'] = loots[a]['quantity'] + 1;
                                        breaker = true;
                                        break;
                                    }
                                }
                                //Verify if item is already added, else add item
                                if (!breaker) {
                                    //Verify if is unique
                                    if (lootDropRate[enemyName][i + 'Unique'] != true) {
                                        //If has a tier
                                        if (lootDropRate[enemyName][i].includes('%')) {
                                            loots[loots.length] = SystemFunctions.calculatesItemTier(lootDropRate[enemyName][i]);
                                            loots[loots.length - 1]['quantity'] = 1;
                                        } else {
                                            loots[loots.length] = itemsId[lootDropRate[enemyName][i]];
                                            loots[loots.length - 1]['quantity'] = 1;
                                        }
                                    } else {
                                        if (!alreadyUnique) {
                                            alreadyUnique = true;
                                            //If has a tier
                                            if (lootDropRate[enemyName][i].includes('%')) {
                                                loots[loots.length] = SystemFunctions.calculatesItemTier(lootDropRate[enemyName][i]);
                                                loots[loots.length - 1]['quantity'] = 1;
                                            } else {
                                                loots[loots.length] = itemsId[lootDropRate[enemyName][i]];
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
            //Save Stats
            characters['character' + req.body.selectedCharacter] = character;
            user.characters = characters;
            //Save on database
            await user.save();

            //Enemy Dead
            if (enemyLife <= 0) {
                //Add batlelog
                battleLog[battleLog.length] = {
                    'log1': 'battle_log_enemyDead',
                    'log2': 'enemy_' + enemyName,
                };
                //Enemy Dead
                return res.json({
                    error: false,
                    message: 'Enemy Dead',
                    enemyLife: enemyLife,
                    enemyArmor: enemyArmor,
                    enemyMana: enemyMana,
                    enemyDamage: enemyDamage,
                    enemyName: enemyName,
                    enemyLevel: enemyLevel,
                    enemyXP: enemyXP,
                    battleLog: battleLog,
                    loots: loots,
                    earnedXP: xp,
                });
            }


        }

        //Continue
        return res.json({
            error: false,
            message: 'Continue',
            enemyLife: enemyLife,
            enemyArmor: enemyArmor,
            enemyMana: enemyMana,
            enemyDamage: enemyDamage,
            enemyName: enemyName,
            enemyLevel: enemyLevel,
            enemyXP: enemyXP,
            battleLog: battleLog,
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }
});

app.post('/gameplayStats', async (req, res) => {
    try {

        //Returns All Stats
        if (req.body.all) {
            return res.json({
                error: false,
                message: 'Success',
                baseAtributes: baseAtributes,
                levelCaps: levelCaps,
                skillsId: skillsId,
                itemsId: itemsId,
            });
        }

        //Return Base Atributes
        if (req.body.baseAtributes) {
            return res.json({
                error: false,
                message: 'Success',
                baseAtributes: baseAtributes
            });
        }

        //Return Level Caps
        if (req.body.levelCaps) {
            return res.json({
                error: false,
                message: 'Success',
                levelCaps: levelCaps
            });
        }

        //Return Skills Infos
        if (req.body.skillsId) {
            return res.json({
                error: false,
                message: 'Success',
                skillsId: skillsId
            });
        }

        //Return Items Infos
        if (req.body.itemsId) {
            return res.json({
                error: false,
                message: 'Success',
                itemsId: itemsId
            });
        }

        //Invalid Stats
        return res.json({
            error: false,
            message: 'Invalid Stats',
            characters: levelCaps
        });

        //Error Treatment
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: 'Unkown Error'
        });
    }
});

app.post('/changeEquip', async (req, res) => {
    const equipped = req.body.equipped;

    //Pickup Characters Infos
    const user = await accounts.findOne({
        attributes: ['id', 'username', 'characters', 'token'],
        where: {
            id: req.body.id,
        }
    });

    //Token check
    if (req.body.token != user.token) {
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }

    //Database infos
    var characters = JSON.parse(user.characters);
    var selectedCharacter = characters['character' + req.body.selectedCharacter];

    //Unequip
    if (equipped == 'none') {
        //Adding in inventory
        if (true) {
            //Verifiy if exist in inventory
            if (selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']] == null) {
                selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']] = selectedCharacter['equips'][req.body.index];
                //Add a quantity
            } else {
                selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] = selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] + 1;
            }
        }
        //Remove from equipment
        selectedCharacter['equips'][req.body.index] = equipped;

        //Database Save
        characters['character' + req.body.selectedCharacter] = selectedCharacter;
        user.characters = JSON.stringify(characters);
        await user.save();

        return res.json({
            error: false,
            message: 'Success',
        });
    }

    //Inconsistent Check (Not in Inventory)
    if (selectedCharacter['inventory'][equipped['name']]['name'] != equipped['name']) {
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }

    //Adding on Equipment and Removing from Inventory
    if (true) {
        //Inconsistent Check (Not in correct index)
        if (true) {
            //Verify Tier
            var tier = 0;
            var name = equipped['name'];
            if (equipped['name'].includes('%')) {
                tier = parseInt(equipped['name'].slice(-2));
                name = equipped['name'].substring(0, equipped['name'].length - 3);
            }
            //Index Verification
            const index = itemsId[name]['equip'];
            if (index.length > 1) {
                var isConsistent = false;
                for (var i = 0; i < index.length; i++) {
                    if (index[i] == req.body.index) {
                        isConsistent = true;
                    }
                }
                if (isConsistent == false) {
                    return res.status(400).json({
                        error: true,
                        message: 'Invalid Login'
                    });
                }
            } else {
                if (index != req.body.index) {
                    return res.status(400).json({
                        error: true,
                        message: 'Invalid Login'
                    });
                }
            }
        }
        //If a weapon is already equipped, unequip it
        if (selectedCharacter['equips'][req.body.index] != 'none') {
            if (selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] >= 1) {
                selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] = selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] + 1;
            } else {
                selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']] = selectedCharacter['equips'][req.body.index];
            }
        }
        //Adding in equipment
        selectedCharacter['equips'][req.body.index] = equipped;
        //Removing from inventory
        if (true) {
            if (selectedCharacter['inventory'][equipped['name']]['quantity'] > 1) {
                selectedCharacter['inventory'][equipped['name']]['quantity'] = selectedCharacter['inventory'][equipped['name']]['quantity'] - 1;
            } else {
                delete selectedCharacter['inventory'][equipped['name']];
            }
        }
    }

    //Database Save
    characters['character' + req.body.selectedCharacter] = selectedCharacter;
    user.characters = JSON.stringify(characters);
    await user.save();

    //Sucess
    return res.json({
        error: false,
        message: 'Success',
    });

});

//------
//Gameplay Configuration
//------

const levelCaps = {
    1: 25,
    2: 50,
    3: 100,
    4: 150,
    5: 200,
    6: 250,
    7: 300,
    8: 350,
    9: 400,
    10: 500,
    11: 600,
    12: 700,
    13: 800,
    14: 900,
    15: 1000,
    16: 1100,
    17: 1200,
    18: 1300,
    19: 1400,
    20: 1500,
    21: 2000,
    22: 2500,
    23: 3000,
    24: 3500,
    25: 4000,
    26: 4500,
    27: 5000,
    28: 5500,
    29: 6000,
    30: 8000,
    31: 10000,
    32: 12000,
    33: 14000,
    34: 16000,
    35: 18000,
    36: 20000,
    37: 22000,
    38: 24000,
    39: 26000,
    40: 30000,
}
const skillsId = {
    //Magics
    'basicAttack': {
        'name': 'basicAttack',
        'createBuff': false,
        'buffRounds': 0,
        'isLate': false,
        'type': 'physical',
        'image': 'assets/skills/basicAttack.png',
        'costType': 'none',
        'costQuantity': '0',
    },
    'furiousAttack': {
        'name': 'furiousAttack',
        'createBuff': '',
        'buffRounds': 0,
        'isLate': false,
        'type': 'physical',
        'image': 'assets/skills/furiousAttack.png',
        'costType': '-life',
        'costQuantity': '5%',
    },
    //Passives
    'healthTurbo': {
        'image': 'assets/skills/passives/healthTurbo',
        'name': 'healthTurbo',
        'isLate': true,
        'type': 'life',
        'image': 'assets/skills/furiousAttack.png',
        'costType': '+life',
        'costQuantity': 'none',
        'isStackable': false,
        'isHide': false,
    },
    'damageTurbo': {
        'image': 'assets/skills/passives/damageTurbo',
        'name': 'damageTurbo',
        'isLate': false,
        'type': 'damage',
        'image': 'assets/skills/furiousAttack.png',
        'costType': '+damage',
        'costQuantity': 'none',
        'isStackable': false,
        'isHide': false,
    },
    'magicalBlock': {
        'name': 'magicalBlock',
        'rounds': 'racial',
        'isLate': false,
        'type': 'block',
        'image': 'assets/skills/magicalBlock.png',
        'costType': 'none',
        'costQuantity': 'none',
        'isStackable': false,
        'isHide': false,
    },
    'petsBlock': {
        'name': 'petsBlock',
        'rounds': 'racial',
        'isLate': false,
        'type': 'block',
        'image': 'assets/skills/petsBlock.png',
        'costType': 'none',
        'costQuantity': 'none',
        'isStackable': false,
        'isHide': false,
    },
    'noisy': {
        'name': 'noisy',
        'rounds': 'racial',
        'isLate': false,
        'type': 'block',
        'image': 'assets/skills/noisy.png',
        'costType': 'none',
        'costQuantity': 'none',
        'isStackable': false,
        'isHide': false,
    },
}
const baseAtributes = {
    'archer': {
        'life': 8,
        'mana': 8,
        'armor': 2,
        'strength': 5,
        'agility': 13,
        'intelligence': 5,
        'buffs': {},
    },
    'assassin': {
        'life': 7,
        'mana': 12,
        'armor': 2,
        'strength': 2,
        'agility': 15,
        'intelligence': 8,
        'buffs': {},
    },
    'berserk': {
        'life': 20,
        'mana': 5,
        'armor': 0,
        'armorLevel': 1,
        'strength': 12,
        'strengthLevel': 2,
        'agility': 6,
        'agilityLevel': 1,
        'intelligence': 2,
        'intelligenceLevel': 0.5,
        'buffs': {
            'healthTurbo': skillsId['healthTurbo'],
            'damageTurbo': skillsId['damageTurbo'],
            'magicalBlock': skillsId['magicalBlock'],
            'petsBlock': skillsId['petsBlock'],
            'noisy': skillsId['noisy'],
        },
        'skills': {
            'basicAttack': skillsId['basicAttack'],
            'furiousAttack': skillsId['furiousAttack'],
        },
    }
}
const lootDropRate = {
    
    'smallspider': {
        '0': 'gold',
        '0Chance': 50,
        '0Unique': false,
        '1': 'thread',
        '1Chance': 25,
        '1Unique': false,
        '2': 'cloth',
        '2Chance': 20,
        '2Unique': false,
        '3': 'wooden_sword',
        '3Chance': 10,
        '3Unique': true,
        '4': 'thread',
        '4Chance': 25,
        '4Unique': false,
        '5': 'thread',
        '5Chance': 25,
        '5Unique': false,
        '6': 'thread',
        '6Chance': 25,
        '6Unique': false,
        '7': 'wooden_sword%01',
        '7Chance': 8,
        '7Unique': true,
    }
}
const itemsId = {
    //Crafting
    'cloth': {
        'name': 'cloth',
        'image': 'assets/items/cloth.png',
        'equip': 'none',
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0,
        'passive': 'none',
        'sell': 2,
    },
    'thread': {
        'name': 'thread',
        'image': 'assets/items/thread.png',
        'equip': 'none',
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0,
        'passive': 'none',
        'sell': 3,
    },
    'gold': {
        'name': 'gold',
        'image': 'assets/items/gold.png',
        'equip': 'none',
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0,
        'passive': 'none',
        'sell': 0,
    },
    //Weapons
    'wooden_sword': {
        'name': 'wooden_sword',
        'image': 'assets/items/wooden_sword.png',
        'equip': [9, 10],
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 2,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 1,
        'passive': 'none',
        'sell': 1,
    },
    'sword_of_the_primordial_fire': {
        'name': 'sword_of_the_primordial_fire',
        'image': 'assets/items/sword_of_the_primordial_fire.png',
        'equip': [9, 10],
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 525,
        'baseStrength': 2,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0.1,
        'passive': 'none',
        'sell': 5000,
    },
    //Armors
    'leather_helmet': {
        'name': 'leather_helmet',
        'image': 'assets/items/leather_helmet.png',
        'equip': [0],
        'baseArmor': 2,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 1,
        'passive': 'none',
        'sell': 1,
    },
    'leather_gloves': {
        'name': 'leather_gloves',
        'image': 'assets/items/leather_gloves.png',
        'equip': [4, 5],
        'baseArmor': 1,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 2,
        'passive': 'none',
        'sell': 1,
    },
    'leather_chestplate': {
        'name': 'leather_chestplate',
        'image': 'assets/items/leather_chestplate.png',
        'equip': [6],
        'baseArmor': 5,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0.5,
        'passive': 'none',
        'sell': 1,
    },
    'leather_boots': {
        'name': 'leather_boots',
        'image': 'assets/items/leather_boots.png',
        'equip': [8],
        'baseArmor': 2,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 0,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 1,
        'passive': 'none',
        'sell': 1,
    },
    'bones_amulet': {
        'name': 'bones_amulet',
        'image': 'assets/items/bones_amulet.png',
        'equip': [3],
        'baseArmor': 0,
        'baseMagic': 0,
        'baseDamage': 0,
        'baseStrength': 2,
        'baseAgility': 0,
        'baseIntelligence': 0,
        'scalling': 0.5,
        'passive': 'none',
        'sell': 1,
    },
}
class SkillsFunctions {
    //Skill Translate
    static skillTranslate(playerStats, skillName) {
        switch (skillName) {
            case 'basicAttack': return SkillsFunctions.basicAttack(playerStats[0]);
            case 'furiousAttack': return SkillsFunctions.furiousAttack(playerStats[0], playerStats[1], playerStats[6]);
        }
    }
    //Basic Attack
    static basicAttack(damage) {
        return {
            'damage': damage,
            '=life': null,
            '-life': null,
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
        };
    }
    //Furious Attack
    static furiousAttack(damage, life, maxLife) {
        //Reduces 10% Max life
        life = life - (maxLife * 0.1);
        var losedLife = maxLife * 0.1;
        if (life <= 0.1) {
            life = 0.1;
        }
        //100% Damage Bonus
        damage = damage * 2;
        return {
            'damage': damage.toFixed(2),
            '=life': life.toFixed(2),
            '-life': losedLife.toFixed(2),
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
        };
    }
}
class PassivesFunctions {
    //Passive Translate
    static passiveTranslate(playerStats, passiveName) {
        switch (passiveName) {
            case 'healthTurbo': return PassivesFunctions.healthTurbo(playerStats[6], playerStats[1]);
            case 'damageTurbo': return PassivesFunctions.damageTurbo(playerStats[0], playerStats[6], playerStats[1]);
            case 'magicalBlock': return PassivesFunctions.magicalBlock();
            case 'petsBlock': return PassivesFunctions.magicalBlock();
            case 'noisy': return PassivesFunctions.magicalBlock();
        }
    }
    //Health Turbo
    static healthTurbo(maxLife, life) {
        //Variables Creation
        var porcentage = parseFloat((((maxLife - life) / maxLife) * 100).toFixed(2));

        //Porcentage Calculation
        var totalLifeRecovery = 0.0;
        for (var i = 100.0 - porcentage; i <= 100; i += 2) {
            totalLifeRecovery += maxLife * 0.005;
        }

        //Modification
        totalLifeRecovery = parseFloat(totalLifeRecovery.toFixed(2));
        life = life + totalLifeRecovery;
        life = parseFloat(life.toFixed(2));
        if (life > maxLife) {
            life = maxLife;
        }

        //Returning
        return {
            'damage': null,
            '=life': life,
            '-life': null,
            '+life': totalLifeRecovery,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
        };
    }
    //Damage Turbo
    static damageTurbo(damage, maxLife, life) {
        //Variables Creation
        var porcentage = (((maxLife - life) / maxLife) * 100).toFixed(2);
        var totalDamage = 0.0;

        //Porcentage Calculation
        for (var i = 100.0 - porcentage; i <= 100; i += 5) {
            totalDamage += damage * 0.03;
        }

        totalDamage = totalDamage.toFixed(2);

        //Returning
        return {
            'damage': damage + parseFloat(totalDamage),
            '=life': null,
            '-life': null,
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
        };
    }
    //Magical Block
    static magicalBlock() {
        return {
            'damage': null,
            '=life': null,
            '-life': null,
            '+life': null,
            '=armor': null,
            '-armor': null,
            '+armor': null,
            '=mana': null,
            '-mana': null,
            '+mana': null,
            '=strength': null,
            '-strength': null,
            '+strength': null,
            '=agility': null,
            '-agility': null,
            '+agility': null,
            '=intelligence': null,
            '-intelligence': null,
            '+intelligence': null,
        };
    }
}
class SystemFunctions {

    //Character Total Damage
    static playerTotalDamage(damage, actualStrength) {
        var strengthDamage = actualStrength / 100;
        var totalDamage = damage + (damage * strengthDamage);
        return totalDamage.toFixed(2);
    }

    //Character Max Life
    static playerMaxLife(characterClass, actualStrength) {
        //Pickup base Max life
        var maxLife = baseAtributes[characterClass]['life'];
        //Calculation by strength
        for (var i = 0; i < actualStrength; i++) {
            maxLife = maxLife + (maxLife * 0.05);
        }
        //Rounded Life
        maxLife = maxLife.toFixed(2);
        return maxLife;
    }

    //Armor Porcentage
    static armorPorcentageCalculator(armor) {
        //Limit Armor
        if (armor >= 680) {
            return 90.0;
        }
        if (armor <= 20) {
            armor = armor / 2;
            return armor.toFixed(1);
        } else if (armor <= 50 && armor >= 21) {
            const basePorcentage = 10.0;
            armor = (armor / 3) + basePorcentage;
            return armor.toFixed(1);
        } else if (armor <= 150 && armor >= 51) {
            const basePorcentage = 26.6;
            armor = (armor / 5) + basePorcentage;
            return armor.toFixed(1);
        } else {
            const basePorcentage = 56.6;
            armor = (armor / 20) + basePorcentage;
            return armor.toFixed(1);
        }
    }

    //Calculates the item tier
    static calculatesItemTier(itemName) {
        //Calculation Variables
        const name = itemName.substring(0, itemName.length - 3);
        const scalling = itemsId[name]['scalling'];
        const tier = itemName.slice(itemName.length - 2);
        var itemAtributes = itemsId[name];
        //Calculation
        itemAtributes['name'] = itemName;
        itemAtributes['baseArmor'] = itemAtributes['baseArmor'] + ((itemAtributes['baseArmor'] * scalling) * tier);
        itemAtributes['baseMagic'] = itemAtributes['baseMagic'] + ((itemAtributes['baseMagic'] * scalling) * tier);
        itemAtributes['baseDamage'] = itemAtributes['baseDamage'] + ((itemAtributes['baseDamage'] * scalling) * tier);
        itemAtributes['baseStrength'] = itemAtributes['baseStrength'] + ((itemAtributes['baseStrength'] * scalling) * tier);
        itemAtributes['baseAgility'] = itemAtributes['baseAgility'] + ((itemAtributes['baseAgility'] * scalling) * tier);
        itemAtributes['baseIntelligence'] = itemAtributes['baseIntelligence'] + ((itemAtributes['baseIntelligence'] * scalling) * tier);
        return itemAtributes;
    }

    //Calculates the player equipments stats
    static calculatesPlayerEquipmentsStats(equip) {

    }
}

//Ports for the server
app.listen(8080, () => {
    console.log('Server started in ports 8080: http://localhost:8080');
});