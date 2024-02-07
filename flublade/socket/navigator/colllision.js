const { tilesCollision, entityCollision } = require("./config");
/**
*Calculate the colision position by the entity position and collisionPositions
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
    //Based in entity size and tiles directions calculates the directions of the entity can go
    function checkCollisionsAndReturnTheDirectionsPossibilities(xSize, ySize, entityTilesDirections) {
        //left,right,up,down
        let possibleDirections = [false, false, false, false];
        //Variables that will say if can pass or not
        let movingLeft = "yes";
        let movingRight = "yes";
        let movingUp = "yes";
        let movingDown = "yes";
        //Calculate entity direciton moviment possibility by the tiles and using the size to
        //calculate possibilities
        function checkSizeAndTilesAndReturnDirectionPossibility(tileX, tileY) {
            if (xSize == 1 && ySize == 2) {
                //X: 1 and Y:2 means that
                //from Y only touch 2 tiles at same time
                //fom X only touch 3 tiles at same time
                //lets make the formula
                // console.log("tileX: " + tileX + " tileY" + tileY);
                //Up formula
                if (tileY == -1 && tileX == -1) { if (movingUp == "maybe" || movingUp == "no") movingUp = "no"; else movingUp = "maybe"; }
                if (tileY == -1 && tileX == 0) movingUp = "no";
                if (tileY == -1 && tileX == 1) { if (movingUp == "maybe" || movingUp == "no") movingUp = "no"; else movingUp = "maybe"; }

                //Left formula
                if (tileX == -1 && tileY == -1) { if (movingLeft == "maybe" || movingLeft == "no") movingLeft = "no"; else movingLeft = "maybe"; }
                if (tileX == -1 && tileY == 0) movingLeft = "no";
                if (tileX == -1 && tileY == 1) { if (movingLeft == "maybe" || movingLeft == "no") movingLeft = "no"; else movingLeft = "maybe"; }

                //Right formula
                if (tileX == 1 && tileY == -1) { if (movingRight == "maybe" || movingRight == "no") movingRight = "no"; else movingRight = "maybe"; }
                if (tileX == 1 && tileY == 0) movingRight = "no";
                if (tileX == 1 && tileY == 1) { if (movingRight == "maybe" || movingRight == "no") movingRight = "no"; else movingRight = "maybe"; }

                //Down formula
                if (tileY == 1 && tileX == -1) { if (movingDown == "maybe" || movingDown == "no") movingDown = "no"; else movingDown = "maybe"; }
                if (tileY == 1 && tileX == 0) movingDown = "no"
                if (tileY == 1 && tileX == 1) { if (movingDown == "maybe" || movingDown == "no") movingDown = "no"; else movingDown = "maybe"; }
            }
        }
        for (let direction in entityTilesDirections) {
            // Divide a string em coordenadas x e y
            let [x, y] = direction.split(',').map(Number);
            checkSizeAndTilesAndReturnDirectionPossibility(x, y);
        }
        possibleDirections[0] = movingLeft == "maybe" || movingLeft == "yes";
        possibleDirections[1] = movingRight == "maybe" || movingRight == "yes";
        possibleDirections[2] = movingUp == "maybe" || movingUp == "yes";
        possibleDirections[3] = movingDown == "maybe" || movingDown == "yes";
        // console.log("left: " + movingLeft + " right: " + movingRight + " up: " + movingUp + " down: " + movingDown);
        return possibleDirections;
    }
    //With all collided tiles calculate the next entity position
    function calculateEntityPositionByCollidedTiles(collidedTiles) {
        console.log(collidedTiles); //Debuging
        const [playerX, playerY] = findTilePositionByCoordinate(entityPositionOld[0], entityPositionOld[1]).split(",").map(n => parseInt(n));
        //Entity actual position
        let entityPosition = entityPositionNew;
        //Entity Tiles Directions Collided, used for directions possibilities
        let entityTilesDirections = {};
        //Moviment variables for entity, if null means no moviment
        let entityMovimentToLeft = null;
        let entityMovimentToRight = null;
        let entityMovimentToUp = null;
        let entityMovimentToDown = null;
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
            //Translate direction
            let direction = "none";
            if (entityPositionOld[0] < entityPositionNew[0]) direction = "right";
            else direction = "left"
            if (entityPositionOld[1] < entityPositionNew[1]) direction += "down";
            else direction += "up";
            let tileSize = collisionPositions[tile]["collisionSize"];
            //In the code above i will make a x,y correction based in entity collision corner to pickup
            //the real coordenates of the entity without collision
            let xCorrectionLeft = entityPositionOld[0] - entityCollisionCorner[0] / 2
            let xCorrectionRight = entityPositionOld[0] + entityCollisionCorner[0] / 2
            let yCorrectionUp = entityPositionOld[1] - entityCollisionCorner[1] / 2
            let yCorrectionDown = entityPositionOld[1] + entityCollisionCorner[1] / 2

            //The collision works like real life atoms that never touch each others and cannot occupy the same pixel
            //if a entity is occuping the same pixel they will freeze and cause a collapse in time space

            //Differences calculates the exact position of tile collision
            let xDifference = tileX - playerX;
            let yDifference = tileY - playerY;
            entityTilesDirections[xDifference + "," + yDifference] = true;
            //Check if direction is right
            if (direction == "right" || direction == "rightup" || direction == "rightdown") {
                //The max that the entity can go
                let xMax = Math.round(xCorrectionRight / tileSize) * tileSize;
                //Add a limiar to not stay in the pure tile
                xMax -= 1.00;
                entityMovimentToRight = xMax - entityCollisionCorner[0] / 2;
            }
            //Check if direction is left
            if (direction == "left" || direction == "leftup" || direction == "leftdown") {
                //The max that the entity can go
                let xMax = Math.round(xCorrectionLeft / tileSize) * tileSize;
                //Add a limiar to not stay in the pure tile
                xMax += 1.00;
                entityMovimentToLeft = xMax + entityCollisionCorner[0] / 2;
            }
            //Check if direction is up
            if (direction == "up" || direction == "rightup" || direction == "leftup") {
                //The max that the entity can go
                let yMax = Math.round(yCorrectionUp / tileSize) * tileSize;
                //Add a limiar to not stay in the pure tile
                yMax += 1.00;
                entityMovimentToUp = yMax + entityCollisionCorner[1] / 2;
            }
            //Check if direction is up
            if (direction == "down" || direction == "rightdown" || direction == "leftdown") {
                //The max that the entity can go
                let yMax = Math.round(yCorrectionDown / tileSize) * tileSize;
                //Add a limiar to not stay in the pure tile
                yMax -= 1.00;
                entityMovimentToDown = yMax - entityCollisionCorner[1] / 2;
            }
        }
        //This is for calculation of directions possibilities
        //if a entity is size of 1 means that he can only collide with
        //2 Y tiles at same time, if the size is 2 y tiles he can collide 3 Y tiles at same time
        let entityXSizeTile = Math.ceil(entityCollisionCorner[0] / 32);
        let entityYSizeTile = Math.ceil(entityCollisionCorner[1] / 32);
        let directionsPossibilites = checkCollisionsAndReturnTheDirectionsPossibilities(entityXSizeTile, entityYSizeTile, entityTilesDirections);
        //Change entity positions
        if (entityMovimentToLeft != null && !directionsPossibilites[0]) entityPosition[0] = entityMovimentToLeft;
        if (entityMovimentToRight != null && !directionsPossibilites[1]) entityPosition[0] = entityMovimentToRight;
        if (entityMovimentToUp != null && !directionsPossibilites[2]) entityPosition[1] = entityMovimentToUp;
        if (entityMovimentToDown != null && !directionsPossibilites[3]) entityPosition[1] = entityMovimentToDown;
        return entityPosition;
    }

    ///Stores already loaded tiles without collision
    let nonCollisionTiles = {}; //Performance variable
    let newX = parseInt(entityPositionNew[0]); //Entity actual X position
    let newY = parseInt(entityPositionNew[1]); //Entity actual Y position
    let collidedTiles = {};

    //In this for xCollision and yCollision is based in entity position,
    //so will need to check if the entity position has a collision, with the entityCollisionCorner variable,
    //we will check all sides pixel by pixel, and check if that pixel the tile has a collision
    for (let yCollision = newY - entityCollisionCorner[1] / 2; yCollision < newY + entityCollisionCorner[1] / 2; yCollision++) {
        for (let xCollision = newX - entityCollisionCorner[0] / 2; xCollision < newX + entityCollisionCorner[0] / 2; xCollision++) {
            let tilePosition = findTilePositionByCoordinate(xCollision, yCollision);
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

    // console.log(entityPositionOld);
    return calculateEntityPositionByCollidedTiles(collidedTiles);
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
            //Square Type collision
            if (tilesCollision[rowTiles[j]]["collisionType"] != undefined) {
                // Collision positions debug
                // debug += "|" + j + "," + i + "|";
                //Adding the tile collision
                collisionPositions[j + "," + i] = tilesCollision[rowTiles[j]]
            }
        }
    }
    // console.log(collisionPositions);
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
    let xTilePosition = 0;
    let yTilePosition = 0;
    while (true) {
        if (x > 32) {
            x -= 32;
            xTilePosition += 1;
        } else break;
    }
    while (true) {
        if (y > 32) {
            y -= 32;
            yTilePosition += 1;
        } else break;
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