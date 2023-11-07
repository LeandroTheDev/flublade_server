let worlds = [];
console.log('Loading the Worlds Tables');

//-------------------------
//World Load Order
//-------------------------
//Load valoream
const valoream = require('./valoream');
worlds.push(valoream);

//Load Cristalidia
const cristalidia = require('./cristalidia');
worlds.push(cristalidia);
//-------------------------
//World Load Order
//-------------------------




//Load the navigator that also contains all worlds data
const navigatorTiles = require('./navigator_tiles');

//Export all Worlds
console.log('\x1b[32mSuccessfully Loaded World Tables\x1b[0m');
module.exports.worlds = worlds;
module.exports.navigatorTiles = navigatorTiles;