
Building.prototype.userSelect = function () {
    var ths = this;
//    var actions = this.actions;

    var actions = {
        unitCreate: function () {
            console.log(ths.Player.id);
            new Unit(Game.players[ths.Player.id], {x: ths.x, y: ths.y});
        },
        unitCreate2: function () {
            new Unit(Game.players[ths.Player.id], {x: ths.x, y: ths.y});
        },
        unitCreate3: function () {
            new Unit(Game.players[ths.Player.id], {x: ths.x, y: ths.y});
        }
    };

    for (var action in actions) {
        var div = $("<div>");
        div.addClass("icon");
        $("#icons").append(div);
        div.on("click", function () {
            actions[action]();
        });
        div.append(drawUnit(div, ths));
    }
};

function drawUnit(div, element) {

    makeChar(function (obj) {
        var scene = new THREE.Scene();
//    element.model.position.x = 0;
//    element.model.position.y = 0;
        scene.add(obj.model);
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(50, 50);
        var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
        camera.up.set(0, 0, 1);
        camera.position.set(8, 8, 8);
        scene.add(camera);
        scene.add(new THREE.PointLight(0xffffff));
        div.append(renderer.domElement);

        setTimeout(function () {
            renderer.render(scene, camera);
        }, 1000);

        var bounding = new THREE.BoundingBoxHelper(obj.model, null);
        bounding.update();

        var height = bounding.box.max.z;
//        45 = 2 * Math.atan( height / ( 2 * dist ) ) * ( 180 / Math.PI );        
//        Math.atan( height / ( 2 * dist ) ) = 45 / ( 180 / Math.PI ) / 2;        
//        height / ( 2 * dist ) = tan(45 / ( 180 / Math.PI ) / 2);        
        var dist = (height / Math.tan(45 / (180 / Math.PI) / 2)) / 2;

        camera.position.set(dist * 0.4, dist * 0.7, dist * 0.8);
        camera.lookAt(new THREE.Vector3(0, 0, dist / 2));
        renderer.render(scene, camera);    
    });
}
