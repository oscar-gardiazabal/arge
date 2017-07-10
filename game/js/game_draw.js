//game/js/game_draw

//function drawMap(size) {
//    // RESIZE
//    var world = Game.map.world;
//    Game.map.world.length = size;
//    for (var i = 0; i < size; i++) {
//        if (!world[i]) {
//            world[i] = [];
//        }
//        Game.map.world[i].length = size;
//    }
//    // DRAW MAP
//    for (var x = 0; x < size; x++) {
//        for (var y = 0; y < size; y++) {
//            if (world[x][y] == 1) {
//                var wall = Game.model.geometries.wall(x, y);
//                Game.scene.add(wall);
//            }
//        }
//    }
//    Game.map.inverseWorld = createInverseWorld(Game.map.world);
//}

function drawMap(size) {
    var mapModel = Game.model.map;
    
    // RESIZE
    var world = Game.map.world;
    Game.map.world.length = size;
    for (var i = 0; i < size; i++) {
        if (!world[i]) {
            world[i] = [];
        }
        Game.map.world[i].length = size;
    }

    // DRAW MAP
    drawFloor();
    drawCliffs();

//    Game.map.updateMaps();

    function drawFloor() {
        var canvas = document.createElement('canvas');

        var img = new Image();
        $(img).load(function() {
            imageLoaded();
        });
        img.src = mapModel.materials.images.floor;

        function imageLoaded() {
            canvas.width = img.width * size;
            canvas.height = img.height * size;
            var ctx = canvas.getContext("2d");

            ctx.translate(canvas.width / 2, canvas.width / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.translate(-canvas.width / 2, -canvas.width / 2);

            for (var x = 0; x < size; x++) {
                for (var y = 0; y < size; y++) {
                    if (isWalkable(world[x][y])) {
                        ctx.drawImage(img, img.width * x, img.height * y);
                    }
                }
            }
            var tile = Game.map.tileWorld;
            var totalSize = Game.map.tileWorld * size;

            var floor = mapModel.geometries.floor(totalSize, canvas);
            floor.position.x += totalSize / 2 - 0.5 * tile;
            floor.position.y += totalSize / 2 - 0.5 * tile;
            Game.addToScene(floor);
        }
    }

    function drawCliffs() {
        var angle = Math.PI / 2;
        var img = new Image();
        $(img).load(function() {
            imageLoaded();
        });
        img.src = mapModel.materials.images.wall;

        function imageLoaded() {

            for (var x = 0; x < size; x++) {
                for (var y = 0; y < size; y++) {
                    if (isWalkable(world[x][y])) {

                        if (!isWalkable(world[x - 1][y])) {
                            Game.addToScene(mapModel.geometries.cliff(x - 0.5, y, angle * 3, img));
                        }
                        if (!isWalkable(world[x + 1][y])) {
                            Game.addToScene(mapModel.geometries.cliff(x + 0.5, y, angle, img));
                        }
                        if (!isWalkable(world[x][y - 1])) {
                            Game.addToScene(mapModel.geometries.cliff(x, y - 0.5, 0, img));
                        }
                        if (!isWalkable(world[x][y + 1])) {
                            Game.addToScene(mapModel.geometries.cliff(x, y + 0.5, angle * 2, img));
                        }
                    }
                }
            }
        }
    }
}
