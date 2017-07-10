
Game.model.geometries = {
    selectLine: function (p) {
        this.g = new THREE.Geometry();
        this.g = drawRectangle(this.g, p, p, p, p);
        this.g.computeLineDistances();

        var greenColor = 0x99FF00;
        var dashedLineMaterial = new THREE.LineDashedMaterial({color: greenColor, dashSize: 20, gapSize: 10, linewidth: 10});

        this.element = new THREE.Line(this.g, dashedLineMaterial);
        this.element.position.z = 0.1;
        Game.scene.add(this.element);
    }
    ,
    circle: function (radius, color) {
        var circle = new THREE.Shape();
        for (var i = 0; i < 16; i++) { //16 segment circle
            var pct = (i + 1) / 16;
            var theta = pct * Math.PI * 2.0;
            var x = radius * Math.cos(theta);
            var y = radius * Math.sin(theta);
            if (i == 0) {
                circle.moveTo(x, y);
            } else {
                circle.lineTo(x, y);
            }
        }
        var geometry = circle.makeGeometry();        
        var material = new THREE.MeshBasicMaterial({color: Game.model.materials.colors[color]});
        return new THREE.Mesh(geometry, material);
    }
    ,
    bigDebug: function (x, y) {
        var tile = Game.map.tileWorld;
        return this.debug(x, y, tile);
    }
    ,
    smallDebug: function (x, y) {
        var tile = Game.map.tileWorld / Game.map.smallTile;
        return this.debug(x, y, tile);
    }
    ,
    debug: function (x, y, tile) {
        var cube = new THREE.Mesh(new THREE.CubeGeometry(tile, tile, 1), new THREE.MeshNormalMaterial());
        cube.position.x = x * tile;
        cube.position.y = y * tile;
        Game.addToScene(cube);
        return cube;
    }
    ,
    cubeDebug: function (x, y) {
        var tile = Game.map.tileWorld / Game.map.smallTile;
        var cube = new THREE.Mesh(new THREE.CubeGeometry(3, 3, 6), new THREE.MeshNormalMaterial());
        cube.position.x = x * tile;
        cube.position.y = y * tile;
        Game.addToScene(cube);
    }
    ,
    lineDebug: function (x, y) {
        var tile = Game.map.tileWorld;
        var cube = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 200), new THREE.MeshNormalMaterial());
        cube.position.x = x * tile;
        cube.position.y = y * tile;
        Game.addToScene(cube);
    }
    ,
    remove: function (n) {
        Game.scene.remove(n.element);
        delete n;
    }
};

