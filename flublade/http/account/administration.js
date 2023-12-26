//Dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Http Connection
const { http, accountsTable } = require('../../../initialize');

//Create account
http.post('/createAcc', async (req, res) => {
    try {
        var data = req.body;
        //Account rules check
        if (true) {
            //Too small username
            if (data.username.length < 3 || data.username.length > 20) {
                return res.status(400).json({
                    error: true,
                    message: 'Too Small or Too Big Username'
                });
            }
            //Too small password
            if (data.password.length < 3 || data.password.length > 100) {
                return res.status(400).json({
                    error: true,
                    message: 'Too Small Password or Too Big Password'
                });
            }
        }
        //Encrypte password
        data.password = await bcrypt.hash(data.password, 8);
        //Add in database
        await accountsTable.create(data).then(() => {
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
                    message: 'Username Already Exists'
                });
            }
            //Connection problems
            console.log("\x1b[31mException\x1b[0m casued by " + data.username + "\n" + error.toString());
            return res.status(400).json({
                error: true,
                message: 'Server Crashed'
            });
        });
    } catch (error) {
        console.log("\x1b[31mException\x1b[0m casued by " + req.ip + "\n" + error.toString());
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

//Login
http.post('/login', async (req, res) => {
    try {
        //Pickup from database  profile info
        const user = await accountsTable.findOne({
            attributes: ['id', 'username', 'password', 'characters', 'token'],
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
        console.log('\x1b[32m[Administration]\x1b[0m User Logged: ' + user.username);
        return res.json({
            error: false,
            message: 'Success',
            id: user.id,
            username: user.username,
            characters: user.characters,
            token: user.token
        });
    } catch (error) {
        console.log(
            "\x1b[31mException\x1b[0m casued by " + req.body.username + "\n" +
            error.toString()
        );
        return res.status(400).json({
            error: true,
            message: 'Server Crashed'
        });
    }
});

//Login Remember
http.post('/loginRemember', async (req, res) => {
    try {
        //Pickup from database  profile info
        const user = await accountsTable.findOne({
            attributes: ['id', 'username', 'password', 'characters', 'token'],
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
        console.log('\x1b[32m[Administration]\x1b[0m User Logged: ' + user.username);
        return res.json({
            error: false,
            message: 'Success',
            id: user.id,
            username: user.username,
            characters: user.characters,
            token: user.token
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

console.log("Response Account Administration Started");