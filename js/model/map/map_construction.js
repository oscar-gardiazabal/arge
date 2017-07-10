//map_construction

Game.map.updateMaps = function () { // for building construction
    Game.map.updateGridWorld();
    Game.map.updateInverseWorld();
};

Game.map.updateCell = function (position, code) {
    var x = position[0];
    var y = position[1];
    Game.map.world[x][y] = code;
    Game.map.updateGrid(x, y);
    Game.map.updateInverse(x, y);
};

Game.map.updateGridWorld = function () {
    console.log("createGridWorld");
    var map = Game.map;

    var worldSizeX = map.world.length;
    var worldSizeY = map.world[0].length;

    var tile = map.smallTile;
    if (!map.gridWorld) {
        map.gridWorld = [];
        for (var x = 0; x <= (worldSizeX - 1) * tile; x++) {
            map.gridWorld[x] = [];
            for (var y = 0; y <= (worldSizeY - 1) * tile; y++) {
                map.gridWorld[x][y] = [];
            }
        }
    }

    for (var x = 0; x <= (worldSizeX - 1); x++) {
        for (var y = 0; y <= (worldSizeY - 1); y++) {
            map.updateGrid(x, y);
        }
    }
    console.log(map.gridWorld);
};

Game.map.updateGrid = function (x, y) {
    var map = Game.map;
    var code = map.world[x][y];
    var tile = map.smallTile;

    for (var p = 0; p < tile +1; p++) {
        for (var q = 0; q < tile +1; q++) {
            var i = x * tile + p -1;
            var j = y * tile + q -1;
            if (coordExists(map.gridWorld, i, j))
                map.gridWorld[i][j].code = code;
        }
    }
};

Game.map.updateInverseWorld = function () {
    var map = Game.map;
    map.inverseWorld = [];
    for (var i = 0; i < map.world.length - 1; i++) {
        map.inverseWorld[i] = [];
        for (var j = 0; j < map.world[0].length - 1; j++) {
            map.updateInverse(i, j);
        }
    }
};

Game.map.updateInverse = function (i, j) {
    var map = Game.map;
    if (isWalkable(map.world[i][j])
            && isWalkable(map.world[i + 1][j])
            && isWalkable(map.world[i][j + 1])
            && isWalkable(map.world[i + 1][j + 1])
            ) {
        map.inverseWorld[i][j] = map.code.walkable;
    } else {
        map.inverseWorld[i][j] = map.code.cliff;
//                DEBUG WALKABLE GRID
        Game.model.geometries.debug(i, j);
    }
};

//function setUnitsWorld() { // add units on gridMap
//    if (!Game.map.unitsWorld) {
//        Game.map.unitsWorld = Game.map.gridWorld.clone();
//
//        var units, unit;
//        for (var i = 0; i < Game.players.length; i++) {
//            units = Game.players[i].units;
//
//            for (var n = 0; n < units.length; n++) {
//                unit = units[n];
////                if (Game.players[i].select.indexOf(unit.id) == -1) { TODO
//                var p = gridWorldPosition(unit.model.position);
//                Game.map.unitsWorld[p.x][p.y] = unit;
////                }
//            }
//        }
//    }
//}

function worldPosition(p) {
    return {x: Math.round(p.x / Game.map.tileWorld), y: Math.round(p.y / Game.map.tileWorld)};
}
function gridWorldPosition(p) {
    var tile = Game.map.tileWorld / Game.map.smallTile;
    return {x: Math.round(p.x / tile), y: Math.round(p.y / tile)};
}

function coordExists(map, x, y) {
    if (x >= 0 && x < map.length && y >= 0 && y < map[0].length) {
        return true;
    } else {
        return false;
    }
}

function isSolid(x, y, p, q) {
    var world = Game.map.world;
    var i = world[x + p];
    var j = world[x][y + q];
    var k = true;
    if (typeof i != "undefined") {
        k = i[y + q];
    }

    var a = typeof i != "undefined" ? i[y] == 0 : true;
    var b = typeof j != "undefined" ? j == 0 : true;
    var c = typeof k != "undefined" ? k == 0 : true;

    return a && b && c;
}
