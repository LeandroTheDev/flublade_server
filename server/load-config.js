const fs = require('fs');

const archive = "#Server Configuration\n" +
    "#Server Name\n" +
    "serverName=My Custom Server\n" +
    "#Game Version, needs to match with client\n" +
    "gameVersion=1.0.0\n" +
    "\n" +
    "#Connection Configuration" +
    "#In milisseconds, the timer until client need to wait after connecting again\n" +
    "socketDDOSTimer=1000\n" +
    "#Quantity of times the client can request a response from http server until the timer\n" +
    "httpDDOSLimitUntilTimer=5\n" +
    "#In milisseconds, the timer to reset the DDOSLimit for the client\n" +
    "httpDDOSTimer=5000\n" +
    "#Database IP for the server connect\n" +
    "databaseIP=127.0.0.1\n" +
    "#Database User, the account name to server login into database\n" +
    "databaseUser=flublade\n" +
    "#Database Password of the account\n" +
    "databasePassword=i@Dhs4e5E%fGz&ngbY2m&AGRCVlskBUrrCnsYFUze&fhxehb#j\n" +
    "#Navigation Socket Update every millisecond\n" +
    "navigatorTicks=15\n" +
    "#Chunk Radius to server load and send the datas, if 0 only loads the chunk that players is in\n" +
    "chunkRadiusView=3";

//Read Config Files
function readFile() {
    return new Promise((resolve) => {
        fs.readFile('config-server.txt', 'utf8', (error, data) => {
            //Check for Errors
            if (error != null) {
                //Check if config file is missing
                if (error.code == "ENOENT") {
                    console.log("\x1b[33mNo configuration file found creating one...\x1b[0m");
                    //Create new config file
                    fs.writeFile('config-server.txt', archive, (error) => {
                        //Check for Errors
                        if (error) {
                            console.log("\x1b[31mFatal error creating config file\x1b[0m\n" + error)
                            process.exit();
                        } else {
                            //Read Again
                            fs.readFile('config-server.txt', 'utf8', (error, data) => {
                                //Check for Errors
                                if (error) {
                                    console.log("\x1b[31mFatal error creating config file \nERROR: \x1b[0m" + error)
                                    process.exit();
                                } else {
                                    resolve(data);
                                }
                            });
                        }
                    });
                } else {
                    //Other errors
                    console.log("\x1b[31mFatal error creating config file\x1b[0m\n" + error);
                }
            } else {
                resolve(data);
            }
        });
    });
}

//Transform the full string file into a Map
function createMap(configs) {
    //Divide spaces into array
    const configLines = configs.split('\n');
    let configsMap = {};

    configLines.forEach((line) => {
        //Ignore lines staring with #
        if (!line.startsWith('#')) {
            const [key, value] = line.split('=').map((str) => str.trim());
            configsMap[key] = value;
        }
    });
    return configsMap
}

module.exports = function () {
    return new Promise(async (resolve) => {
        console.log("Loading Configurations");
        let configs = await readFile();
        configs = createMap(configs);
        //Exports
        //Int configs need to be placed a parseInt()
        //Booleans configs need to be placed the "variable == "true""
        module.exports.serverName = configs.serverName;
        module.exports.gameVersion = configs.gameVersion;
        module.exports.socketDDOSTimer = parseInt(configs.socketDDOSTimer);
        module.exports.httpDDOSLimitUntilTimer = parseInt(configs.httpDDOSLimitUntilTimer);
        module.exports.httpDDOSTimer = parseInt(configs.httpDDOSTimer);
        module.exports.databaseIP = configs.databaseIP;
        module.exports.databaseUser = configs.databaseUser;
        module.exports.databasePassword = configs.databasePassword;
        module.exports.navigatorTicks = parseInt(configs.navigatorTicks);
        module.exports.chunkRadiusView = parseInt(configs.chunkRadiusView);
        console.log('\x1b[32mSuccessfully Loaded Configurations\x1b[0m');
        resolve();
    });
}