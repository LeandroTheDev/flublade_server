const { tilesCollision, entityCollision } = require("./config");
/**
*Calculate the colision position by the player position and collisionPositions
*this checks if the new player position is a valid position without a collision,
*ignored if the player has a navigatorStatus that bypass the collision, if everthing
*is ok then return the new playerPosition, if not returns the best position without
*been collided
*
* @param {Array} entityPositionOld - [0]: X [1]: Y
* @param {Array} entityPositionNew - [0]: X [1]: Y
* @param {Dynamic} entityCollisionCorner - Based in collision type
* @param {Map} collisionPositions - ["0,0"]: {config}
* @returns {Array} - Returns a array contains 2 positions [0]: X [1]: Y
*/
function calculateCollision(entityPositionOld, entityPositionNew, entityCollisionCorner, collisionPositions) {
    let newX = parseInt(entityPositionNew[0]);
    let newY = parseInt(entityPositionNew[1]);
    let tilePosition = findTilePositionByCoordinate(newX, newY);
    console.log(tilePosition);
    //We check if exist a collision]
    if (collisionPositions[tilePosition] != undefined) {
        //We check the player navigatorStatus
        for (let i = 0; i < collisionPositions[tilePosition]["collisionBypass"].length; i++) {
            //Checking if the player has bypass status equals the tile
            if ("" == collisionPositions[tilePosition]["collisionBypass"][i]) {
                return entityPositionNew;
            }
        }
        //Going here means that are not bypass we need limit the player position
        //The player body will have 22x44 collision
        return entityPositionOld; //Simple block the pass we need to make a better collision in future
    }
    //No collision
    else return entityPositionNew;
}

/**
*Receives the tiles as parameters and check all the tiles in the config
*to view what collisions and types and returne a Map containing all coordinates
*of the collision, this calculate every pixel in the collision chunk,
*use with caution
*
* @param {Array} tiles - Tiles of the chunk
* @param {number} x - X position of the chunk
* @param {number} y - Y position of the chunk
* @returns {Map} - Returns a giant map containing all coordinates with collision
*/
function convertTilesToCollisionPositions(tiles, x, y) {
    let collisionPositions = {};
    //Swipe all tiles in the chunk
    for (let i = 0; i < tiles.length; i++) { //Y Position
        //Pickup the selected tiles of the row
        let rowTiles = tiles[i];
        //Swipe all tiles of the row
        for (let j = 0; j < rowTiles.length; j++) { //X Position
            //Checking if exist a collision in that tile
            if (tilesCollision[rowTiles[j]]["collisionType"] == undefined) continue;
            //Square Type collision
            if (tilesCollision[rowTiles[j]]["collisionType"] == "Square") {
                //Adding the tile collision
                collisionPositions[j + "," + i] = tilesCollision[rowTiles[j]]
            }
        }
    }
    return collisionPositions;
}

module.exports.calculateCollision = calculateCollision;
module.exports.convertTilesToCollisionPositions = convertTilesToCollisionPositions;

//
//UTILS
//
/**
* Converts the coordinateChunk into startCoordinateChunk the first position of the chunk
*
* @param {number} x - X position of the chunk
* @param {number} y - Y position of the chunk
* @returns {string} - Example return: "8,15"
*/
function findTilePositionByCoordinate(x, y) {
    //Converting coordinate to chunk position
    let xChunk = x % 480;
    let yChunk = y % 480;
    //Converting chunk position to tile
    let xTilePosition = 0;
    while(true) {
        if(xChunk > 31) {
            xChunk -= 31;
            xTilePosition++;
        }
        else break;
    }
    let yTilePosition = 0;
    while(true) {
        if(yChunk > 31) {
            yChunk -= 31;
            yTilePosition++;
        }
        else break;
    }
    return xTilePosition + "," + yTilePosition;
}
/**
* Converts the coordinateChunk into startCoordinateChunk the first position of the chunk
*
* @param {number} x - X position of the chunk
* @param {number} y - Y position of the chunk
* @returns {Array} - Returns [0]: X, [1]: Y
*/
function convertCoordinateChunkToStartCoordinateChunk(x, y) {
    let calculatedX = 0;
    if (x > 0) { //Positive coordinates
        // Every chunk position add X + 480
        for (let i = 0; i < x; i++) {
            calculatedX += 480;
        }
    }
    else if (x < 0) { //Negative coordinates
        x = -(-x); //Transforming negative to positive
        // Every chunk position add X - 480
        for (let i = 0; i < x; i++) {
            calculatedX -= 480;
        }
    }

    let calculatedY = 0;
    if (y > 0) { //Positive coordinates
        // Every chunk position add Y + 480
        for (let i = 0; i < y; i++) {
            calculatedY += 480;
        }
    }
    else if (y < 0) { //Negative coordinates
        y = -(-y); //Transforming negative to positive
        // Every chunk position add Y - 480
        for (let i = 0; i < y; i++) {
            calculatedY -= 480;
        }
    }

    return [calculatedX, calculatedY];
}