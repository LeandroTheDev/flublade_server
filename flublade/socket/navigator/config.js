const tilesCollision = [
    //Documentation
    //collisionType: Square, Circle
    //collisionSize: 5

    //0: Null
    {
        collisionType: "Square",
        collisionSize: "32",
    },
    //1: Grass
    {

    },
    //2: Stone
    {
        collisionType: "Square",
        collisionSize: "32",
        collisionBypass: ["fly"]
    },
    //3: Stone Down
    {
        collisionType: "Square",
        collisionSize: "32",
        collisionBypass: ["fly"]
    }
];