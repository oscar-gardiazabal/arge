
function mouseLeftDown(x, y) {
    var world = Game.map.world, tileWorld = Game.map.tileWorld;
    var mapElements = Game.model.mapElements;
    var mapMouseAction;

    Game.projector = new THREE.Projector();

    var p = getFloorPoint(x, y);
    if (p) {
        var point = {x: Math.round(p.x / tileWorld), y: Math.round(p.y / tileWorld)};
        if (world[point.x][point.y] == 1) { //0 - add
            mapMouseAction = 0; //add
            removeMapGeom(point);

        } else { //1 - remove
            mapMouseAction = 1; //add
            addMapGeom(point, "wall");
        }
    } 
//    else {
//        var p = getSceneElement(x, y);
//        if (p) {
//            mapMouseAction = 0; //remove
//            removeSceneElement(p);
//        } else {
//            return;
//        }
//    }

    document.addEventListener('mousemove', onMouseLeftMove, false);
    document.addEventListener('mouseup', onMouseLeftUp, false);

    function onMouseLeftMove(e) {        
        Game.canvas.removeEventListener('mousemove', mouseMove, false);
        Game.temp.shadedWall.material = Game.model.materials.wall();
        Game.scene.remove(Game.temp.outline);
        Game.scene.remove(Game.temp.movedWall);

        var floorPoint = getFloorPoint(e.clientX, e.clientY);
        if (floorPoint) {
            Game.scene.remove(Game.temp.editorSquare);
            var point = {x: Math.round(floorPoint.x / tileWorld), y: Math.round(floorPoint.y / tileWorld)};
            var num = world[point.x][point.y];

            if (mapMouseAction == 1) {
                Game.temp.editorSquare = drawEditorSquare(point, Game.model.materials.colors.green);
                if (!num) { //0 or null
                    addMapGeom(point, "wall");
                }

            } else { //mapMouseAction == 0
                Game.temp.editorSquare = drawEditorSquare(point, Game.model.materials.colors.red);
                if (num == 1) {
                    removeMapGeom(point);
                }
            }
            Game.scene.add(Game.temp.editorSquare);

        } 
//        else {
//            if (!mapMouseAction) {
//                var geom = getSceneElement(e.clientX, e.clientY);
//                if (geom) {
//                    removeSceneElement(geom);
//                }
//            }
//        }
    }

    function onMouseLeftUp() {
        Game.scene.remove(Game.temp.editorSquare);
        document.removeEventListener('mousemove', onMouseLeftMove, false);
        document.removeEventListener('mouseup', onMouseLeftUp, false);
        Game.canvas.addEventListener('mousemove', mouseMove, false);
    }

    function removeSceneElement(p) {
        Game.scene.remove(p);
        world[Math.round(p.position.x / tileWorld)][Math.round(p.position.y / tileWorld)] = 1;
        var index = mapElements.indexOf(p);
        if (index > -1) {
            mapElements.splice(index, 1);
        }
    }
}

function mapReady() {
    Game.canvas.addEventListener('mousemove', mouseMove, false);
}

function mouseMove(e) {
    var materials = Game.model.materials;
    var temp = Game.temp;

    Game.scene.remove(Game.temp.outline);
    if (temp.shadedWall) {
        temp.shadedWall.material = materials.wall();
    }
    if (temp.movedWall) {
        Game.scene.remove(temp.movedWall);
    }
    var x = e.x, y = e.y;
    Game.projector = new THREE.Projector();

    var p = getFloorPoint(x, y);
    if (p) {

        var tile = Game.map.tileWorld;
        var point = {x: Math.round(p.x / tile), y: Math.round(p.y / tile)};
        if (Game.map.world[point.x][point.y] == 1) {
            var geom = Game.map.geoMatrix[point.x][point.y];
            temp.shadedWall = geom;
            geom.material = materials.shaded("wall");
            temp.outline = materials.outline(temp.shadedWall, "red");
            Game.scene.add(temp.outline);

        } else { //1
            temp.movedWall = Game.model.geometries.wall(point.x, point.y);
            temp.movedWall.material = materials.shaded("wall");
            Game.scene.add(temp.movedWall);

            temp.outline = materials.outline(temp.movedWall, "green");
            Game.scene.add(temp.outline);

        }

    } 
//    else {
//        p = getSceneElement(x, y);
//
//        if (p) { //WALL
//            temp.shadedWall = p;
//            p.material = materials.shaded("wall");
//            temp.outline = materials.outline(temp.shadedWall, "red");
//            Game.scene.add(temp.outline);
//
//        } else { //FLOOR
//            return;
//        }
//    }
}

function drawEditorSquare(point, color) { //red and green grid mouse event squares
    var tile = Game.map.tileWorld;
    var x = point.x * tile - tile / 2, y = point.y * tile - tile / 2;
    var g = new THREE.Geometry();
    g = drawRectangle(g,
            new THREE.Vector3(x, y),
            new THREE.Vector3(x, y + 10),
            new THREE.Vector3(x + 10, y + 10),
            new THREE.Vector3(x + 10, y));
    var mat = new THREE.LineBasicMaterial({color: color});
    return new THREE.Line(g, mat);
}

function mouseRightDown(x, y) {
//EMPTY
}
