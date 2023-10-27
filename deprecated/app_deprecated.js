//Dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
//Dependecies External
const classes = require("./models/gameplay");
const accounts = require('./models/accounts');
const worlds = require('./models/worlds');
const webSocketBattle = require('./models/websocketBattle');
const webSocketBattleInitialize = webSocketBattle.webSocketBattleInitialize;
const webSocketIngame = require('./models/websocketIngame');
const websocketIngameInitialize = webSocketIngame.webSocketIngameInitialize;

//Enable json post
app.use(express.json());

//------
//System
//------

//Create account
app.post('/createAcc', async (req, res) => {
    try {
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
            console.log(
                "Exception casued by " + req.body.username + "\n" +
                error.toString()
            );
            return res.status(400).json({
                error: true,
                message: 'Server Crashed'
            });
        });
    } catch (error) {
        console.log(
            "Exception casued by " + req.body.username + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

//Login
app.post('/login', async (req, res) => {
    try {
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
        console.log('User Logged: ' + user.id);
        return res.json({
            error: false,
            message: 'Success',
            id: user.id,
            username: user.username,
            language: user.language,
            characters: user.characters,
            token: user.token
        });
    } catch (error) {
        console.log(
            "Exception casued by " + req.body.username + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

//Login Remember
app.post('/loginRemember', async (req, res) => {
    try {
        //Pickup from database  profile info
        const user = await accounts.findOne({
            attributes: ['id', 'username', 'password', 'language', 'characters', 'token'],
            where: {
                id: req.body.id,
            }
        });

        //Token check
        if (req.body.token != user.token) {
            user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
            await user.save();
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
    } catch (error) {
        console.log(
            "Exception casued by ID " + req.body.id + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

//Update Language

//------
//Menu
//------

//Returns the account characters
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
            user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
            await user.save();
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
            message: 'Server Crashed'
        });
    }
});

//Remove account character
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
            user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
            await user.save();
            return res.status(400).json({
                error: true,
                message: 'Invalid Login'
            });
        }

        //Removing character
        const characters = JSON.parse(user.characters);
        var i = req.body.index;
        while (true) {
            //Remove character
            if (i == req.body.index) {
                console.log('Character Deleted: ' + characters['character' + i]['name'] + ', Level: ' + characters['character' + i]['level'] + ', Username: ' + user.username);
                delete characters['character' + i];
            }
            //Subsequent index
            var a = i + 1;
            //Subsequent break verification
            if (characters['character' + a] == null) {
                a = a - 1;
                delete characters['character' + a];
                break;
            }
            //Lowering the character index of subsequent characters
            characters['character' + i] = characters['character' + a];
            i++;
        }

        //Save on database
        user.characters = JSON.stringify(characters);
        await user.save();

        //Success
        return res.json({
            error: false,
            message: 'Success',
            characters: user.characters
        });
        //Error Treatment
    } catch (error) {
        console.log(
            "Exception casued by ID" + req.body.id + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

//Create account character
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
            user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
            await user.save();
            return res.status(400).json({
                error: true,
                message: 'Invalid Login'
            });
        }
        //Adding character
        if (true) {
            const playerClass = req.body.class;
            const playerBody = req.body.body;
            let characters = JSON.parse(user.characters);
            characters['character' + Object.keys(characters).length] = {
                'name': req.body.name,
                'class': playerClass,
                'level': 1,
                'experience': 0,
                'skillpoint': 0,
                'equipmentStatus': {
                    //Stats
                    'life': 0,
                    'lifeRegen': 0,
                    'mana': 0,
                    'manaRegen': 0,
                    'strength': 0,
                    'agility': 0,
                    'intelligence': 0,
                    //Damage
                    'physical': 0,
                    'ranged': 0,
                    'magic': 0,
                    'physicalAmplification': 0,
                    'rangedAmplification': 0,
                    'magicalAmplification': 0,
                    'fireAmplification': 0,
                    'waterAmplification': 0,
                    'natureAmplification': 0,
                    'lightAmplification': 0,
                    'darkAmplification': 0,
                    //Defence
                    'physicalResistence': 0,
                    'magicalResistence': 0,
                    'fireResistence': 0,
                    'waterResistence': 0,
                    'natureResistence': 0,
                    'lightResistence': 0,
                    'darkResistence': 0,
                    'physicalResistenceAmplification': 0,
                    'magicalResistenceAmplification': 0,
                    'fireResistenceAmplification': 0,
                    'waterResistenceAmplification': 0,
                    'natureResistenceAmplification': 0,
                    'lightResistenceAmplification': 0,
                    'darkResistenceAmplification': 0,
                },
                'classStatus': {
                    //Stats
                    'life': classes.SystemFunctions.playerMaxLife(req.body.class, baseAtributes[req.body.class]['strength']),
                    'lifeRegen': baseAtributes[req.body.class].lifeRegen,
                    'mana': baseAtributes[req.body.class].mana,
                    'manaRegen': baseAtributes[req.body.class].manaRegen,
                    'strength': baseAtributes[req.body.class].strength,
                    'agility': baseAtributes[req.body.class].agility,
                    'intelligence': baseAtributes[req.body.class].intelligence,
                    //Damage
                    'physical': baseAtributes[req.body.class].physical,
                    'ranged': baseAtributes[req.body.class].ranged,
                    'physicalAmplification': baseAtributes[req.body.class].physicalAmplification,
                    'rangedAmplification': baseAtributes[req.body.class].rangedAmplification,
                    'magicalAmplification': baseAtributes[req.body.class].magicalAmplification,
                    'fireAmplification': baseAtributes[req.body.class].fireAmplification,
                    'waterAmplification': baseAtributes[req.body.class].waterAmplification,
                    'natureAmplification': baseAtributes[req.body.class].natureAmplification,
                    'lightAmplification': baseAtributes[req.body.class].lightAmplification,
                    'darkAmplification': baseAtributes[req.body.class].darkAmplification,
                    //Defence
                    'physicalResistence': baseAtributes[req.body.class].physicalResistence,
                    'magicalResistence': baseAtributes[req.body.class].magicalResistence,
                    'fireResistence': baseAtributes[req.body.class].fireResistence,
                    'waterResistence': baseAtributes[req.body.class].waterResistence,
                    'natureResistence': baseAtributes[req.body.class].natureResistence,
                    'lightResistence': baseAtributes[req.body.class].lightResistence,
                    'darkResistence': baseAtributes[req.body.class].darkResistence,
                    'physicalResistenceAmplification': baseAtributes[req.body.class].physicalResistenceAmplification,
                    'magicalResistenceAmplification': baseAtributes[req.body.class].magicalResistenceAmplification,
                    'fireResistenceAmplification': baseAtributes[req.body.class].fireResistenceAmplification,
                    'waterResistenceAmplification': baseAtributes[req.body.class].waterResistenceAmplification,
                    'natureResistenceAmplification': baseAtributes[req.body.class].natureResistenceAmplification,
                    'lightResistenceAmplification': baseAtributes[req.body.class].lightResistenceAmplification,
                    'darkResistenceAmplification': baseAtributes[req.body.class].darkResistenceAmplification,
                },
                'characterStatus': {
                    //Stats
                    'life': classes.SystemFunctions.playerMaxLife(req.body.class, baseAtributes[req.body.class]['strength']),
                    'lifeRegen': baseAtributes[req.body.class].lifeRegen,
                    'mana': baseAtributes[req.body.class].mana,
                    'manaRegen': baseAtributes[req.body.class].manaRegen,
                    'strength': baseAtributes[req.body.class].strength,
                    'agility': baseAtributes[req.body.class].agility,
                    'intelligence': baseAtributes[req.body.class].intelligence,
                    //Damage
                    'physical': baseAtributes[req.body.class].physical,
                    'ranged': baseAtributes[req.body.class].ranged,
                    'physicalAmplification': baseAtributes[req.body.class].physicalAmplification,
                    'rangedAmplification': baseAtributes[req.body.class].rangedAmplification,
                    'magicalAmplification': baseAtributes[req.body.class].magicalAmplification,
                    'fireAmplification': baseAtributes[req.body.class].fireAmplification,
                    'waterAmplification': baseAtributes[req.body.class].waterAmplification,
                    'natureAmplification': baseAtributes[req.body.class].natureAmplification,
                    'lightAmplification': baseAtributes[req.body.class].lightAmplification,
                    'darkAmplification': baseAtributes[req.body.class].darkAmplification,
                    //Defence
                    'physicalResistence': baseAtributes[req.body.class].physicalResistence,
                    'magicalResistence': baseAtributes[req.body.class].magicalResistence,
                    'fireResistence': baseAtributes[req.body.class].fireResistence,
                    'waterResistence': baseAtributes[req.body.class].waterResistence,
                    'natureResistence': baseAtributes[req.body.class].natureResistence,
                    'lightResistence': baseAtributes[req.body.class].lightResistence,
                    'darkResistence': baseAtributes[req.body.class].darkResistence,
                    'physicalResistenceAmplification': baseAtributes[req.body.class].physicalResistenceAmplification,
                    'magicalResistenceAmplification': baseAtributes[req.body.class].magicalResistenceAmplification,
                    'fireResistenceAmplification': baseAtributes[req.body.class].fireResistenceAmplification,
                    'waterResistenceAmplification': baseAtributes[req.body.class].waterResistenceAmplification,
                    'natureResistenceAmplification': baseAtributes[req.body.class].natureResistenceAmplification,
                    'lightResistenceAmplification': baseAtributes[req.body.class].lightResistenceAmplification,
                    'darkResistenceAmplification': baseAtributes[req.body.class].darkResistenceAmplification,
                },
                'inventory': {},
                'equips': {},
                'race': playerBody.race,
                'stats': baseAtributes[req.body.class].buffs,
                'skills': baseAtributes[req.body.class].skills,
                'body' : {
                    'hair': playerBody.hair,
                    'hairColor': playerBody.hairColor,
                    'eyes': playerBody.eyes,
                    'eyesColor': playerBody.eyesColor,
                    'mouth': playerBody.mouth,
                    'mouthColor': playerBody.mouthColor,
                    'skin': playerBody.skin,
                    'skinColor': playerBody.skinColor,
                    'gender': playerBody.gender,
                },
                'location': 'prologue_spawn',
            };
            console.log('Character Created: ' + req.body.name + ', Class: ' + req.body.class + ', Username: ' + user.username);
        }

        //Save on database
        user.characters = JSON.stringify(characters);
        await user.save();

        //Success
        return res.json({
            error: false,
            message: 'Success',
            characters: user.characters
        });
        //Error Treatment
    } catch (error) {
        console.log(
            "Exception casued by ID" + req.body.id + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }
});



//------
//Gameplay
//------

//When attacking enemy DEPRECATED
app.post('/attackEnemy', async (req, res) => {
    try {
        //Variables Declaration
        var enemyLife = req.body.enemyLife;
        var enemyMana = req.body.enemyMana;
        var enemyMaxLife = req.body.enemyMaxLife;
        var enemyMaxMana = req.body.enemyMaxMana;
        var enemyArmor = req.body.enemyArmor;
        var enemyBuffs = req.body.enemyBuffs;
        var enemySkills = req.body.enemySkills;
        var enemyDamage = req.body.enemyDamage;
        const enemyName = req.body.enemyName;
        const enemyXP = req.body.enemyXP;
        const enemyLevel = req.body.enemyLevel;
        const playerSkill = req.body.playerSkill;
        var isLevelUp = false;
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
            user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
            await user.save();
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
            //Converting stats
            const baseStatsSkill = [parseFloat(character['damage']), parseFloat(character['life']), parseFloat(character['mana']), parseFloat(character['strength']), parseFloat(character['agility']), parseFloat(character['intelligence']), classes.SystemFunctions.playerMaxLife(character['class'], character['strength'])];
            var playerStatsSkill = baseStatsSkill;
            var lateBuffs = [];
            var enemyLateBuffs = [];

            //Player Turn
            if (true) {
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
                if (true) {
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

                //Enemy Late Passives
                if (true) {
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
                characters['character' + req.body.selectedCharacter] = character;
                user.characters = characters;
            }

            //Loot
            if (enemyLife <= 0) {
                var xp = 0;
                var gold = 0;
                var loots = [];
                //Xp
                if (true) {
                    //XP Calculation
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
                        classes.SystemFunctions.calculatesPlayerEquipmentsStats(null, character, false, true)
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
                                            loots[loots.length] = classes.SystemFunctions.calculatesItemTier(lootDropRate[enemyName][i]);
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
                                                loots[loots.length] = classes.SystemFunctions.calculatesItemTier(lootDropRate[enemyName][i]);
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
                    levelUpDialog: isLevelUp,
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
            levelUpDialog: isLevelUp,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: true,
            message: 'Invalid Login',
        });
    }
});

//Change equipment DEPRECATED
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
        user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
        await user.save();
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
                //Add into inventory
                selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']] = selectedCharacter['equips'][req.body.index];
                selectedCharacter = classes.SystemFunctions.calculatesPlayerEquipmentsStats(selectedCharacter['equips'][req.body.index], selectedCharacter, true);
            } else {
                //Add a quantity
                selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] = selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] + 1;
                selectedCharacter = classes.SystemFunctions.calculatesPlayerEquipmentsStats(selectedCharacter['equips'][req.body.index], selectedCharacter, true);
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

    //Equip
    if (true) {
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
                try {
                    if (selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] >= 1) {
                        //Add quantity
                        selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] = selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']]['quantity'] + 1;
                        selectedCharacter = classes.SystemFunctions.calculatesPlayerEquipmentsStats(selectedCharacter['equips'][req.body.index], selectedCharacter, true);
                    }
                } catch (error) {
                    //Add in inventory
                    selectedCharacter['inventory'][selectedCharacter['equips'][req.body.index]['name']] = selectedCharacter['equips'][req.body.index]
                    selectedCharacter = classes.SystemFunctions.calculatesPlayerEquipmentsStats(selectedCharacter['equips'][req.body.index], selectedCharacter, true);
                }
            }
            //Adding in equipment
            selectedCharacter['equips'][req.body.index] = equipped;
            //Removing from inventory
            if (true) {
                if (selectedCharacter['inventory'][equipped['name']]['quantity'] > 1) {
                    //Remove 1 quantity
                    selectedCharacter['inventory'][equipped['name']]['quantity'] = selectedCharacter['inventory'][equipped['name']]['quantity'] - 1;
                    selectedCharacter = classes.SystemFunctions.calculatesPlayerEquipmentsStats(equipped, selectedCharacter, false);
                } else {
                    //Removes from inventory
                    delete selectedCharacter['inventory'][equipped['name']];
                    selectedCharacter = classes.SystemFunctions.calculatesPlayerEquipmentsStats(equipped, selectedCharacter, false);
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
    }

});

//Returns the level
app.post('/pushLevel', async (req, res) => {
    //Pickup Characters Infos
    const user = await accounts.findOne({
        attributes: ['id', 'username', 'characters', 'token'],
        where: {
            id: req.body.id,
        }
    });

    //Token check
    if (req.body.token != user.token) {
        user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
        await user.save();
        return res.status(400).json({
            error: true,
            message: 'Invalid Login'
        });
    }

    //Location pickup
    var character = JSON.parse(user.characters);
    character = character['character' + req.body.selectedCharacter];
    const location = character['location'].substring(0, character['location'].length - 3);
    const locationID = parseInt(character['location'].slice(-3));

    //Location from database
    const world = await worlds.findOne({
        where: {
            name: 'prologue',
            id_world: 1,
        }
    });


    //Push Level Tiles
    if (true) {
        var i = 1;
        var levelTiles = [];
        while (true) {
            //Breaker
            if (world['list' + i] == '[]') {
                break;
            }
            //Add tile section
            levelTiles.push(world['list' + i]);
            i++
        }
    }

    return res.json({
        error: false,
        message: 'Success',
        level: levelTiles,
        event: world['event'],
        npc: world['npc'],
        enemy: world['enemy'],
    });
});

//------
//Gameplay Configuration
//------

//XP to level up
const levelCaps = classes.levelCaps;
//Skills, safe to change: type, image, isLate
const skillsId = classes.skillsId;
//Base attributes for classes, safe to change: all
const baseAtributes = classes.baseAtributes;
//All enemys loots, safe to change: all
const lootDropRate = classes.lootDropRate;
//Items, safe to change: image, equip, 'bases', scalling, passive, sell
const itemsId = classes.itemsId;

//Ports for the server
app.listen(8080, () => {
    console.log('Server Responses started in ports 8080: http://localhost:8080');
});


//------
//WebSocket
//------

//Start Ingame Websocket
const wssIngame = websocketIngameInitialize();

//Start Battle Websocket
const wssBattle = webSocketBattleInitialize();