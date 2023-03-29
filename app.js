//Dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

//Enable json post
app.use(express.json());

//http request
app.get('/', async (req, res) => {
    return res.json({
        error: false,
        message: "Users"
    })
})

//Create account
app.post('/createAcc', async (req, res) => {
    const password = await bcrypt.hash('123456', 8);
    console.log(password);
    return res.json({
        error: false,
        message: "Create user"
    });
});

//Login
app.post('/login', async (req, res) => {
    console.log(req.body);
    return res.json({
        error: false,
        message: "Login"
    });
});

//Ports for the server
app.listen(8080, () => {
    console.log("Server started in ports 8080: http://localhost:8080");
}); 