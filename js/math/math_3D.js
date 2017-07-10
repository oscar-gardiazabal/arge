
function getFloorPoint(x, y) {
    var camera = Game.camera;
    var mouse2D = new THREE.Vector3(
            (x / $(Game.canvas).width()) * 2 - 1,
            -(y / $(Game.canvas).height()) * 2 + 1,
            1
            );
    Game.projector.unprojectVector(mouse2D, camera);

    var dir = mouse2D.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));

}

function getSceneElement(x, y) {
    var camera = Game.camera;
    var mouse2D = new THREE.Vector3(
            (x / $(Game.canvas).width()) * 2 - 1,
            -(y / $(Game.canvas).height()) * 2 + 1,
            1
            );
    Game.projector.unprojectVector(mouse2D, camera);
    var raycaster = new THREE.Raycaster(camera.position, mouse2D.sub(camera.position).normalize());
    var p = raycaster.intersectObjects(Game.model.mapElements);
    if (p[0]) {
        return p[0].object;
    } else {
        return false;
    }
}

function getSceneBuilding(x, y) {
    var camera = Game.camera;
    var mouse2D = new THREE.Vector3(
            (x / $(Game.canvas).width()) * 2 - 1,
            -(y / $(Game.canvas).height()) * 2 + 1,
            1
            );
    Game.projector.unprojectVector(mouse2D, camera);
    var raycaster = new THREE.Raycaster(camera.position, mouse2D.sub(camera.position).normalize());
    
    var p = raycaster.intersectObjects(Game.model.building.array);
    
    if (p[0]) {
        return p[0].object;
    } else {
        return false;
    }
}

function debug(p, tile) {
    var cube = new THREE.Mesh(new THREE.CubeGeometry(2, 2, 2), new THREE.MeshNormalMaterial());
    cube.position.x = p.x * tile;
    cube.position.y = p.y * tile;
    Game.scene.add(cube);
}
