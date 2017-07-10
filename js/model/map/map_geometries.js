
Game.model.map.geometries = {
    wallHeight: 25,
    wall: function(x, y) {

        var tile = Game.map.tileWorld;
        var height = this.wallHeight;
        var cube = new THREE.Mesh(new THREE.CubeGeometry(tile, height, tile), Game.model.materials.wall());
        cube.rotation.x = Math.PI / 2;
        cube.position.x = x * tile;
        cube.position.y = y * tile;
        cube.position.z = -height / 2;
        return cube;

//        var wall = new THREE.Geometry();
//
//        //vertices
//        wall.vertices.push(new THREE.Vector3(0, 0, 0)); //0. 
//        wall.vertices.push(new THREE.Vector3(0, 1, 0)); //1. 
//        wall.vertices.push(new THREE.Vector3(1, 0, 0)); //2. 
//        wall.vertices.push(new THREE.Vector3(1, 1, 0)); //3.
//        wall.vertices.push(new THREE.Vector3(0, 0, -3)); //4. 
//        wall.vertices.push(new THREE.Vector3(0, 1, -3)); //5. 
//        wall.vertices.push(new THREE.Vector3(1, 0, -3)); //6. 
//        wall.vertices.push(new THREE.Vector3(1, 1, -3)); //7.
//
//        //faces
//        wall.faces.push(new THREE.Face3(0, 1, 2)); //faces
//        wall.faces.push(new THREE.Face3(1, 2, 3)); //faces
//        wall.faces.push(new THREE.Face3(0, 1, 2)); //faces
    },
    floor: function(size, canvas) {
        var context = canvas.getContext('2d');

        if (Game.debug) {
            context.font = "8px Arial";
//            var mapSize = Game.map.unitsWorld.length;
            var mapSize = Game.map.gridWorld.length;
            var tileSize = canvas.width / (mapSize + 1);

            for (var i = 0; i < mapSize; i++) {
                for (var j = 0; j < mapSize; j++) {
                    var x = (i + 0.5) * tileSize, y = (j + 0.5) * tileSize;
                    context.fillText((j - 1) + '/' + i, x, y);
                    context.rect(x, y, tileSize, tileSize);
                }
            }
            context.strokeStyle = "red";
            context.lineWidth = 0.5;

            context.stroke();
        }

//        $("body").append(canvas) //DEBUG
        var geometry = new THREE.PlaneGeometry(size, size, 1, 1);
        var texture = new THREE.Texture(canvas);
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        texture.needsUpdate = true;
        return new THREE.Mesh(geometry, material);
    },
    cliff: function(x, y, rotation, img) {
        var tile = Game.map.tileWorld;
        var height = tile * 3;

        var geometry = new THREE.PlaneGeometry(tile, height, 1, 1);
        var material = new THREE.MeshPhongMaterial({
            map: new THREE.Texture(img)
        });
        material.map.needsUpdate = true;

        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.y = rotation;
        mesh.position.x = x * tile;
        mesh.position.y = y * tile;
        mesh.position.z = -height / 2;
        return mesh;
    }
};

