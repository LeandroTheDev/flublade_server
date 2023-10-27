//Server Name
const serverName = "FLUBLADE MODDED";
//This need to match to the version in flublade
const gameVersion = "1.0.0";


//Http Connection
const { http } = require('./start-server');

//Retrieve server informations
http.get('/getServerData', (_, res) => {
    const serverData = {
        serverName: serverName,
        gameVersion: gameVersion,
        message: "success"
    };
    res.json(serverData);
});