//Dependencies
const jwt = require('jsonwebtoken');

//Http Connection
const { http } = require('../start-server');

//Returns the account characters
http.post('/getCharacters', async (req, res) => {
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
http.post('/removeCharacters', async (req, res) => {
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
http.post('/createCharacters', async (req, res) => {
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

console.log("Response Account Character Started");