
Game.model.materials = {
    saved: {},
    colors: {
        red: 0xff0000,
        green: 0x00ff00
    },
    outline: function(mesh, color) {
        var outlineMaterial = new THREE.MeshBasicMaterial({color: this.colors[color], side: THREE.BackSide});
        var outlineMesh = Game.model.geometries.wall(mesh.position.x, mesh.position.y);
//        var outlineMesh = Game.model.geometries.wall(0, 0);
        outlineMesh.material = outlineMaterial;
        outlineMesh.position = mesh.position;
        outlineMesh.scale.multiplyScalar(1.05);
        return outlineMesh;
    }
};
