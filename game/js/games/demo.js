
function createGame() {

    createWorld();//js/map/demos
    drawMap(Game.map.world.length); //game_draw

    //players
    Game.user = new Player(1, "oscar");
    Game.players.push(Game.user);
    // first unit
    new Unit(Game.players[0], {x: 5, y: 5});
    new Unit(Game.players[0], {x: 7, y: 5});
    //building    
    new Building(Game.players[0], {x: 9, y: 9});
//                new Building(Game.players[1], {x: 18, y: 9});
//                new Building(Game.players[2], {x: 9, y: 18});

    if (Game.debug) {
        var axisHelper = new THREE.AxisHelper(10);
        Game.addToScene(axisHelper);
    }

}