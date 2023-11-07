const fs = require('fs');

const archive = "#Server Configuration\n" +
    "serverName=\"My Custom Server\"\n" +
    "gameVersion=\"1.0.0\"";

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
        module.exports.serverName = configs.serverName;
        module.exports.gameVersion = configs.gameVersion;
        console.log('\x1b[32mSuccessfully Loaded Configurations\x1b[0m');
        resolve();
    });
}