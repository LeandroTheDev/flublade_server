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
* @param {Dynamic} entityCollisionCorner - [22,44]
* @param {Map} collisionPositions - ["0,0"]: {config}
* @returns {Array} - Returns a array contains 2 positions [0]: X [1]: Y
*/
function calculateTileCollisionForEntity(entityPositionOld, entityPositionNew, entityCollisionCorner, collisionPositions) {
    //With all collided tiles calculate the next entity position
    function calculateCollision(collidedTiles) {
        const [playerX, playerY] = findTilePositionByCoordinate(entityPositionOld[0], entityPositionOld[1]).split(",").map(n => parseInt(n));
        let entityPosition = entityPositionNew;
        //Positions declarations
        for (const tile in collidedTiles) {
            const [tileX, tileY] = tile.split(",").map(n => parseInt(n));
            //We check the entity navigatorStatus for collision bypass
            for (let i = 0; i < collisionPositions[tile]["collisionBypass"].length; i++) {
                //Checking if the player has bypass status equals the tile
                if ("" == collisionPositions[tile]["collisionBypass"][i]) {
                    return entityPositionNew;
                }
            }
            // console.log("Old: " + entityPositionOld + " New: " + entityPositionNew)
            let direction = "none";
            if (entityPositionOld[0] < entityPositionNew[0]) direction = "left";
            else direction = "right"
            if (entityPositionOld[1] < entityPositionNew[1]) direction += "down";
            else direction += "up";
            let tileSize = collisionPositions[tile]["collisionSize"];
            //In the code above i will make a x,y correction based in entity collision corner to pickup
            //the real coordenates of the character without collision
            //then i will find the multiples of tile size to find the exact position for the
            //entity to stay
            //
            //Correction variables for calculation
            let xCorrectionLeft = entityPositionOld[0] - entityCollisionCorner[0] / 2
            let xCorrectionRight = entityPositionOld[0] + entityCollisionCorner[0] / 2
            let yCorrectionUp = entityPositionOld[1] - entityCollisionCorner[1] / 2
            let yCorrectionDown = entityPositionOld[1] + entityCollisionCorner[1] / 2
            //Check if direction is right
            if (direction == "right" || direction == "rightup" || direction == "rightdown") {
                //Check new Chunk collision             Check if the collision is on the right
                if (!(playerX === 15 && tileX === 0) && tileX < playerX)
                    entityPosition[0] = Math.floor(xCorrectionLeft / tileSize) * tileSize + (entityCollisionCorner[0] / 2) + 1;
                //Stop if collision is in new chunk
                else if (tileX == 15)
                    entityPosition[0] = Math.ceil(xCorrectionLeft / tileSize) * tileSize + (entityCollisionCorner[0] / 2) + 1;
            }
            //Check if direction is left
            if (direction == "left" || direction == "leftup" || direction == "leftdown") {
                //Check new Chunk collision             Check if the collision is on the left
                if (!(playerX === 0 && tileX === 15) && tileX > playerX)
                    entityPosition[0] = (Math.floor((xCorrectionRight + tileSize - 1) / tileSize) * tileSize) - (entityCollisionCorner[0] / 2) - 1;
                //Stop if collision is in new chunk
                else if (tileX == 0)
                    entityPosition[0] = (Math.ceil(xCorrectionRight / tileSize) * tileSize) - (entityCollisionCorner[0] / 2) - 1;
            }
            //Check if direction is up
            if (direction == "up" || direction == "rightup" || direction == "leftup") {
                if (tileY < playerY)
                    entityPosition[1] = (Math.floor((yCorrectionUp + tileSize - 1) / tileSize) * tileSize) + (entityCollisionCorner[1] / 2) - 1;
            }
            // console.log("TileX: " + tileX + " TileY: " + tileY + " PlayerX: " + playerX + " PlayerY: " + playerY);
        }
        return entityPosition;
    }
    ///Stores already loaded tiles without collision
    let nonCollisionTiles = {}; //Performance variable
    let newX = parseInt(entityPositionNew[0]); //Calculation
    let newY = parseInt(entityPositionNew[1]); //Calculation
    let collidedTiles = {};
    //Swiping the Y collision coordinates
    //We are dividing by 2 to center the calculation on the target
    for (let entityCollisionY = 0 - entityCollisionCorner[1] / 2; entityCollisionY < entityCollisionCorner[1] / 2; entityCollisionY++) {
        for (let entityCollisionX = 0 - entityCollisionCorner[0] / 2; entityCollisionX < entityCollisionCorner[0] - entityCollisionCorner[0] / 2; entityCollisionX++) {
            let positionCollidedX = newX + entityCollisionX
            let positionCollidedY = newY + entityCollisionY
            //Pickup the tile position of current collision
            let tilePosition = findTilePositionByCoordinate(positionCollidedX, positionCollidedY);

            //Performance check
            if (nonCollisionTiles[tilePosition] == undefined)
                //Check if exist a collision if not then add to performance variable
                if (collisionPositions[tilePosition] == undefined)
                    nonCollisionTiles[tilePosition];
                //Calculate
                else collidedTiles[tilePosition] = collisionPositions[tilePosition];
            //Calculate
            else collidedTiles[tilePosition] = collisionPositions[tilePosition];
        }
    }
    return calculateCollision(collidedTiles);
}

/**
*Receives the tiles as parameters and check all the tiles in the config
*to view what collisions and types and returne a Map containing all coordinates
*of the collision, this calculate every pixel in the collision chunk,
*use with caution
*
* @param {Array} tiles - Tiles of the chunk
* @returns {Map} - Returns a map containing all tiles that have collisions
*/
function convertTilesToCollisionPositions(tiles) {
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

module.exports.calculateTileCollisionForEntity = calculateTileCollisionForEntity;
module.exports.convertTilesToCollisionPositions = convertTilesToCollisionPositions;

//
//UTILS
//
/**
* Converts the coordinate to tile position of the chunk
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
    while (true) {
        if (xChunk > 31) {
            xChunk -= 31;
            xTilePosition++;
        }
        else break;
    }
    let yTilePosition = 0;
    while (true) {
        if (yChunk > 31) {
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