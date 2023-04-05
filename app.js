//Dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
//Dependecies External
const { eAdmin } = require('./middlewares/auth');
const users = require('./models/user');

//Enable json post
app.use(express.json());

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
    await users.create(data).then(() => {
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
    const user = await users.findOne({
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
    const user = await users.findOne({
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
    const user = await users.findOne({
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

//Get characters
app.post('/getCharacters', async (req, res) => {
    //Pickup from database  profile info
    const user = await users.findOne({
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

    //Success
    return res.json({
        error: false,
        message: 'Success',
        characters: user.characters
    });
});

//Remove characters
app.post('/removeCharacters', async (req, res) => {
    //Pickup from database  profile info
    const user = await users.findOne({
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
            console.log('Character Deleted: ' + json['character' + i]['name'] + ', Level: ' + json['character' + i]['level'] + ', Account: ' + user.username);
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
    user.save();

    //Success
    return res.json({
        error: false,
        message: 'Success',
        characters: user.characters
    });
});

//Create characters
app.post('/createCharacters', async (req, res) => {
    //Pickup from database  profile info
    const user = await users.findOne({
        attributes: ['id', 'username', 'characters', 'token'],
        where: {
            id: req.body.id,
        }
    });
    //Success
    return res.json({
        error: false,
        message: 'Success'
    });
});

//Ports for the server
app.listen(8080, () => {
    console.log('Server started in ports 8080: http://localhost:8080');
});