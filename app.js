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
                'life': req.body.maxLife,
                'mana': baseAtributes[req.body.class].mana,
                'armor': baseAtributes[req.body.class].armor,
                'level': 1,
                'xp': 0,
                'skillpoint': 0,
                'strength': baseAtributes[req.body.class].strength,
                'agility': baseAtributes[req.body.class].agility,
                'intelligence':
                    baseAtributes[req.body.class].intelligence,
                'luck': 0,
                'inventory': '{}',
                'buffs':
                    JSON.stringify(baseAtributes[req.body.class].buffs),
                'skills': JSON.stringify(baseAtributes[req.body.class].skills),
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
                json['character' + req.body.selectedCharacter]['luck'] = req.body.luck;
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

app.post('/enemyKilled', async (req, res) => {
    const user = await world.findOne({
        attributes: ['enemy'],
        where: {
            id_world: req.body.id,
        }
    });
});

app.post('/gameplayStats', async (req, res) => {
    try {
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
};
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
        'costType': 'life',
        'costQuantity': '5%',
    },
    //Passives
    'healthTurbo': {
        'image': 'assets/skills/passives/healthTurbo',
        'name': 'healthTurbo',
        'isLate': false,
        'type': 'life',
        'image': 'assets/skills/furiousAttack.png',
        'costType': '+life',
        'costQuantity': '0.5',
    },
    'damageTurbo': {
        'image': 'assets/skills/passives/damageTurbo',
        'name': 'damageTurbo',
        'isLate': false,
        'type': 'damage',
        'image': 'assets/skills/furiousAttack.png',
        'costType': '+damage',
        'costQuantity': '3%',
    },
    'magicalBlock': {
        'name': 'magicalBlock',
        'rounds': 'racial',
        'isLate': false,
        'type': 'block',
        'image': 'assets/skills/magicalBlock.png',
        'costType': 'none',
        'costQuantity': 'none',
    },
    'petsBlock': {
        'name': 'petsBlock',
        'rounds': 'racial',
        'isLate': false,
        'type': 'block',
        'image': 'assets/skills/petsBlock.png',
        'costType': 'none',
        'costQuantity': 'none',
    },
    'noisy': {
        'name': 'noisy',
        'rounds': 'racial',
        'isLate': false,
        'type': 'block',
        'image': 'assets/skills/noisy.png',
        'costType': 'none',
        'costQuantity': 'none',
    },
};
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
};

//Ports for the server
app.listen(8080, () => {
    console.log('Server started in ports 8080: http://localhost:8080');
});