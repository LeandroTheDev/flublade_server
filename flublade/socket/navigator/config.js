const tilesCollision = [
    //Documentation
    //collisionType: Square, Circle
    //collisionSize: 5
    //#if collisionType exist then collisionSize/collisionBypass cannot be null
    //collisionBypass ["fly","ghost"]

    //0: Null
    {
        collisionType: "Square",
        collisionSize: 32,
        collisionBypass: []
    },
    //1: Grass
    {

    },
    //2: Stone
    {
        collisionType: "Square",
        collisionSize: 32,
        collisionBypass: ["fly"]
    },
    //3: Stone Down
    {
        collisionType: "Square",
        collisionSize: 32,
        collisionBypass: ["fly"]
    }
];
const entityCollision = {
    player: {
        collisionType: "Rectangle",
        collisionSize: [22, 44],
    }
}

module.exports.tilesCollision = tilesCollision;
module.exports.entityCollision = entityCollision;