
function cubeBuilding() {
    var tile = Game.map.tileWorld;
    var height = tile * 1.3;
    var width = tile * 2;
    var geometry = new THREE.CubeGeometry(width, height, width, 1, 1, 1);

    var mesh = new THREE.Mesh(geometry, Game.model.building.materials.castle());
    mesh.rotation.x = Math.PI / 2;
    mesh.position.z = height / 2;

    return mesh;
}
