//Dependencies
const jwt = require('jsonwebtoken');

//Http Connection
const { http } = require('../start-server');
const { classesAttributes, raceAttributes } = require('../gameplay/config');
const { accountsDatabase } = require('../start-server');
const { status } = require('../gameplay/status');

//Returns the account characters
http.get('/getCharacters', async (req, res) => {
    try {
        //Pickup from database  profile info
        const user = await accountsDatabase.findOne({
            attributes: ['id', 'characters', 'token'],
            where: {
                id: req.query.id,
            }
        });

        //Token check
        if (req.query.token != user.token) {
            user.token = jwt.sign({ id: user.id }, 'GenericTokenPassword(1wWeRtyK243Mmnkjxz23zs)', {});
            await user.save();
            return res.status(400).json({
                error: true,
                message: 'Invalid Login'
            });
        }

        //Success
        return res.json({
            error: false,
            message: 'success',
            characters: user.characters
        });
    } catch (error) {
        console.log(
            "\x1b[31mException\x1b[0m casued by ID " + req.query.id + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

//Remove account character
http.post('/removeCharacters', async (req, res) => {
    try {
        //Pickup from database  profile info
        const user = await accountsDatabase.findOne({
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
    } catch (error) {
        console.log(
            "\x1b[31mException\x1b[0m casued by ID" + req.body.id + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

//Create account character
http.post('/createCharacters', async (req, res) => {
    try {
        var selectedClass = classesAttributes[req.body.class];
        var selectedRace = raceAttributes[req.body.body.race];
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
        const user = await accountsDatabase.findOne({
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
        let characters = JSON.parse(user.characters);
        if (true) {
            const playerBody = req.body.body;
            const playerClass = req.body.class;
            const playerRace = playerBody.race
            characters['character' + Object.keys(characters).length] = {
                'name': req.body.name,
                'class': playerClass,
                'race': playerRace,
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
                    'life': selectedClass.life,
                    'lifeRegen': selectedClass.lifeRegen,
                    'mana': selectedClass.mana,
                    'manaRegen': selectedClass.manaRegen,
                    'strength': selectedClass.strength,
                    'agility': selectedClass.agility,
                    'intelligence': selectedClass.intelligence,
                    //Damage
                    'physical': selectedClass.physical,
                    'ranged': selectedClass.ranged,
                    'physicalAmplification': selectedClass.physicalAmplification,
                    'rangedAmplification': selectedClass.rangedAmplification,
                    'magicalAmplification': selectedClass.magicalAmplification,
                    'fireAmplification': selectedClass.fireAmplification,
                    'waterAmplification': selectedClass.waterAmplification,
                    'natureAmplification': selectedClass.natureAmplification,
                    'lightAmplification': selectedClass.lightAmplification,
                    'darkAmplification': selectedClass.darkAmplification,
                    //Defence
                    'physicalResistence': selectedClass.physicalResistence,
                    'magicalResistence': selectedClass.magicalResistence,
                    'fireResistence': selectedClass.fireResistence,
                    'waterResistence': selectedClass.waterResistence,
                    'natureResistence': selectedClass.natureResistence,
                    'lightResistence': selectedClass.lightResistence,
                    'darkResistence': selectedClass.darkResistence,
                    'physicalResistenceAmplification': selectedClass.physicalResistenceAmplification,
                    'magicalResistenceAmplification': selectedClass.magicalResistenceAmplification,
                    'fireResistenceAmplification': selectedClass.fireResistenceAmplification,
                    'waterResistenceAmplification': selectedClass.waterResistenceAmplification,
                    'natureResistenceAmplification': selectedClass.natureResistenceAmplification,
                    'lightResistenceAmplification': selectedClass.lightResistenceAmplification,
                    'darkResistenceAmplification': selectedClass.darkResistenceAmplification,
                },
                'raceStatus': {
                    //Stats
                    'life': selectedRace.life,
                    'lifeRegen': selectedRace.lifeRegen,
                    'mana': selectedRace.mana,
                    'manaRegen': selectedRace.manaRegen,
                    'strength': selectedRace.strength,
                    'agility': selectedRace.agility,
                    'intelligence': selectedRace.intelligence,
                    //Damage
                    'physical': selectedRace.physical,
                    'ranged': selectedRace.ranged,
                    'physicalAmplification': selectedRace.physicalAmplification,
                    'rangedAmplification': selectedRace.rangedAmplification,
                    'magicalAmplification': selectedRace.magicalAmplification,
                    'fireAmplification': selectedRace.fireAmplification,
                    'waterAmplification': selectedRace.waterAmplification,
                    'natureAmplification': selectedRace.natureAmplification,
                    'lightAmplification': selectedRace.lightAmplification,
                    'darkAmplification': selectedRace.darkAmplification,
                    //Defence
                    'physicalResistence': selectedRace.physicalResistence,
                    'magicalResistence': selectedRace.magicalResistence,
                    'fireResistence': selectedRace.fireResistence,
                    'waterResistence': selectedRace.waterResistence,
                    'natureResistence': selectedRace.natureResistence,
                    'lightResistence': selectedRace.lightResistence,
                    'darkResistence': selectedRace.darkResistence,
                    'physicalResistenceAmplification': selectedRace.physicalResistenceAmplification,
                    'magicalResistenceAmplification': selectedRace.magicalResistenceAmplification,
                    'fireResistenceAmplification': selectedRace.fireResistenceAmplification,
                    'waterResistenceAmplification': selectedRace.waterResistenceAmplification,
                    'natureResistenceAmplification': selectedRace.natureResistenceAmplification,
                    'lightResistenceAmplification': selectedRace.lightResistenceAmplification,
                    'darkResistenceAmplification': selectedRace.darkResistenceAmplification,
                },
                'characterStatus': {
                    //Character Max Life
                    'life': status.getCharacterMaxLife(
                        //Max Strength in Level 1
                        (0 + selectedClass.strength + selectedRace.strength),
                        //Max Life in Level 1
                        (0 + selectedClass.life + selectedRace.life)
                    ),
                    //Character Max Mana
                    'mana': status.getCharacterMaxMana(
                        //Max Intelligence in Level 1
                        (0 + selectedClass.intelligence + selectedRace.intelligence),
                        //Max Mana in Level 1
                        (0 + selectedClass.mana + selectedRace.mana)
                    ),
                    //Character Base Skills from Class and Race
                    'skills': Object.assign({}, selectedClass.skills, selectedRace.skills),
                    'buffs': Object.assign({}, selectedClass.buffs, selectedRace.buffs),
                    'debuffs': Object.assign({}, selectedClass.debuffs, selectedRace.debuffs),
                },
                'inventory': {},
                'equips': {},
                'body': {
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
            console.log('Character Created, Name: ' + req.body.name + ', Class: ' + req.body.class + ' Race: ' + playerRace + ', Username: ' + user.username);
        }

        //Save on database
        user.characters = JSON.stringify(characters);
        await user.save();

        //Success
        return res.json({
            error: false,
            message: 'success',
            characters: user.characters
        });
    } catch (error) {
        console.log(
            "\x1b[31mException\x1b[0m casued by ID " + req.body.id + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

console.log("Response Account Character Started");