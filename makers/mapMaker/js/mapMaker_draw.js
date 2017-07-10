
//makers/map_Maker/js/mapMaker_draw

function drawMap(size) {
    
    // RESIZE
    if (Game.floor) {
        Game.scene.remove(Game.floor);
    }
    var mapSize = size;
    var floorSize = size * Game.map.tileWorld;

    //floor
    var floorTexture = new THREE.ImageUtils.loadTexture('img/map/grid.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(mapSize, mapSize);
    var floorMaterial = new THREE.MeshBasicMaterial({map: floorTexture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.1});
    var floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, 1, 1);
    Game.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    var tile = Game.map.tileWorld;
    Game.floor.position.x = floorSize / 2 - tile / 2;
    Game.floor.position.y = floorSize / 2 - tile / 2;
    Game.floor.position.z = 0.1;
    Game.scene.add(Game.floor);

    var world = Game.map.world, geoMatrix = Game.map.geoMatrix;
    Game.map.world.length = Game.map.geoMatrix.length = size;
    for (var i = 0; i < size; i++) {
        if (!world[i]) {
            world[i] = [];
        }
        if (!geoMatrix[i]) {
            geoMatrix[i] = [];
        }
        Game.map.world[i].length = Game.map.geoMatrix[i].length = size;
    }
    
    // DRAW MAP
    var geoMatrix = Game.map.geoMatrix;
    var world = Game.map.world, mapElements = Game.model.map.mapElements;

    for (var i = 0; i < mapElements.length; i++) {
        Game.scene.remove(mapElements[i]);
    }
    Game.model.mapElements = mapElements = [];

    var worldWidth = world.length;
    var worldHeight = world[0].length;

    for (var x = 0; x < worldWidth; x++) {
        geoMatrix[x] = [];
        for (var y = 0; y < worldHeight; y++) {
            geoMatrix[x][y] = null;
            if (world[x][y] == 1) {
                addMapGeom({x: x, y: y}, "wall");
            }
        }
    }
    mapReady();
}

function addMapGeom(point, geometry) {
    Game.map.world[point.x][point.y] = 1;
    var geom = Game.model.geometries[geometry](point.x, point.y);
    Game.model.map.mapElements.push(geom);
    Game.scene.add(geom);
    Game.map.geoMatrix[point.x][point.y] = geom;
}

function removeMapGeom(point) {
    Game.map.world[point.x][point.y] = 0;
    var geom = Game.map.geoMatrix[point.x][point.y];
    Game.scene.remove(geom);
    Game.map.world[point.x][point.y] = 0;
}
