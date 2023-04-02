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

//Menu
app.get('/', eAdmin, async (req, res) => {
    return res.json({
        error: false,
        message: 'Users',
        id: req.userId
    })
})

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

    //Credentials username check
    if (req.body.username != 'test') {
        return res.status(400).json({
            error: true,
            message: 'Wrong Credentials'
        });
    }
    // Encrypte
    // console.log(await bcrypt.hash('', 8));
    //Credentials password check 123456
    if (!(await bcrypt.compare(req.body.password, '$2a$08$UB4ERuSHliaOU1cRkLAziOlF9KVMdNoQobwg3fUim.iaPgXn1lK7i'))) {
        return res.status(400).json({
            error: true,
            message: 'Wrong Credentials'
        });
    }

    //Token creation
    var token = jwt.sign({ id: 1 }, '2!@MDKIOSLAMCM@K!OM#K<LZXA!@#$)S(&*A!11234MkI', {});

    //Success Login
    return res.json({
        error: false,
        message: 'Success',
        token: token,
    });
});

//Ports for the server
app.listen(8080, () => {
    console.log('Server started in ports 8080: http://localhost:8080');
}); 