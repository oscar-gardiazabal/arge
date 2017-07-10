
function Unit(Player, p, params) {
    var ths = this;

    if (!p) {
        p = {x: 0, y: 0};
    }

    if (!params) {
        params = null;
    }

    ths.type = "unit";
    ths.width = 12;
    ths.angle = 0;
    ths.regAtack = 9;
    ths.path = [];
    ths.groupGoal = null;
    ths.groupPosition = null;
    ths.vel = 1;
    ths.visualField = 5;
    ths.blocked = false;

    makeChar(params, function (obj) {
        ths.id = obj.model.id;
        if (Player) {
            ths.player = Player;
            Player.units[ths.id] = ths;
        }
        ths.model = obj.model;
        ths.parts = obj.parts;
        var x = p.x, y = p.y;
        var tile = Game.map.tileWorld;
        ths.model.position.x = x * tile;
        ths.model.position.y = y * tile;
        ths.oldRotation;

        ths.avoidUnitCollision();
        Game.addToScene(ths.model);
    });
}
Unit.prototype.avoidUnitCollision = function () {
    //EMPTY DEFAULT
};

function makeChar(params, callback) {
    loadUnitImages(function () {

        if (!params) {
            console.log("!params");
            params = {
                chest: {
                    position: {
                        z: 6
                    }
                }
            }
            ;
        }

        var unit = {
            parts: {
                body: null,
                headGroup: null,
                legR: null,
                legL: null,
                armR: null,
                botArmR: null,
                armL: null,
                weapon: null,
                chest: null,
                helper: null
            }
        };
        var parts = unit.parts;

        var model = Game.model.unit.geometries.low;

        var playerGroup = new THREE.Object3D();
        playerGroup.name = "playerGroup";

        parts.body = new THREE.Object3D();
        parts.body.name = "unit";
        playerGroup.add(parts.body);

        //UPER BODY
        parts.chest = new THREE.Object3D();
//        parts.chest.position.z = 6;
        parts.chest.name = "chest";
        parts.body.add(parts.chest);

        //BODY
        var bodymesh = model.body();
        bodymesh.castShadow = true;
        parts.chest.add(bodymesh);

        // ARMS
        var armsmesh = model.arms();

        // RIGHT arm
        parts.armR = new THREE.Object3D();
        parts.armR.position.z = 7.2;
        parts.armR.position.x = 3;
        var armRmesh = armsmesh[0];

        parts.armR.add(armRmesh[0]); // top arm left mesh

        parts.botArmR = new THREE.Object3D();
        parts.botArmR.position.z = -3;
        parts.botArmR.add(armRmesh[1]); // down arm left mesh
        parts.armR.add(parts.botArmR);

        // LEFT arm
        parts.armL = new THREE.Object3D();
        parts.armL.position.z = 7.2;
        parts.armL.position.x = -3;
        var armLmesh = armsmesh[1];

        parts.armL.add(armLmesh[0]); // top arm right mesh

        parts.botArmL = new THREE.Object3D();
        parts.botArmL.position.z = -3.5;
        parts.botArmL.add(armLmesh[1]); // down arm right mesh
        parts.armL.add(parts.botArmL);

        //shield
        var shieldmesh = model.shield();
        shieldmesh.rotation.z = 1.3;
        shieldmesh.position.y = 3;
        shieldmesh.position.z = -1;
        shieldmesh.position.x = -1.4;
        parts.botArmL.add(shieldmesh);

        //weapon
        parts.weapon = model.weapon();
        parts.weapon.position.y = 4;
        parts.weapon.position.x = 0.5;
        parts.weapon.position.z = 0.5;
        parts.weapon.rotation.x = 0.5;
        parts.weapon.rotation.z = 0.5;
        parts.botArmR.add(parts.weapon);

        parts.chest.add(parts.armL);
        parts.chest.add(parts.armR);

        //HEAD
        parts.headGroup = model.head();
        parts.chest.add(parts.headGroup);

        //DOWN BODY
        var downBody = new THREE.Object3D();
        downBody.position.z = 6;
        //LEGS
        var legsmesh = model.legs();
        parts.legL = legsmesh[0];
        parts.legL.castShadow = true;
        downBody.add(parts.legL);
        parts.legR = legsmesh[1];
        parts.legR.castShadow = true;
        downBody.add(parts.legR);
        parts.body.add(downBody);

        //HELPER
        parts.helper = new THREE.Object3D();
//    var cube = new THREE.Mesh(new THREE.CubeGeometry(2, 2, 2), new THREE.MeshNormalMaterial());
//    helper.add(cube);
        playerGroup.add(parts.helper);

        unit.model = playerGroup;
        unit.mesh = {
            body: bodymesh,
            arms: armsmesh
        };

//        parts.chest.position.z = 6;
        $.extend({}, parts, params);
        console.log(parts);
        console.log(params);

        if (callback) {
            callback(unit);
        } else {
            console.log("!callback");
        }
    });
}

function facesManager(geometry, vM, faces) {
    var f;
    for (var i = 0; i < faces.length; i++) {
        f = faces[i];
        geometry.faces.push(new THREE.Face3(f[0], f[1], f[2])); //faces
        if (vM) {
            uvmap(geometry, i, vM[f[0]], vM[f[1]], vM[f[2]]); //material maps
        }
    }
    geometry.computeFaceNormals();
}

function uvmap(geometry, face, a, b, c) {

    var uvs = geometry.faceVertexUvs[0][face] = [];

    uvs[0] = new THREE.Vector2();
    uvs[0].x = a[0];
    uvs[0].y = a[1];

    uvs[1] = new THREE.Vector2();
    uvs[1].x = b[0];
    uvs[1].y = b[1];

    uvs[2] = new THREE.Vector2();
    uvs[2].x = c[0];
    uvs[2].y = c[1];
}

function symmetry(g, separado) {

    var obj;
    if (separado) {
        obj = new THREE.Geometry();
    } else {
        obj = g;
    }

    var vertices = g.vertices.length;
    var verticesObj = obj.vertices.length;

    for (var i = 0; i < vertices; i++) {
        var vector = new THREE.Vector3();
        vector.x = -g.vertices[i].x;
        vector.y = g.vertices[i].y;
        vector.z = g.vertices[i].z;

        obj.vertices.push(vector);
    }

    var faces = g.faces.length;

    for (var i = 0; i < faces; i++) {
        var face = new THREE.Face3();
        face.a = g.faces[i].a + verticesObj;
        face.b = g.faces[i].c + verticesObj;
        face.c = g.faces[i].b + verticesObj;

        obj.faces.push(face);
    }
    obj.computeFaceNormals();

    var uvs = g.faceVertexUvs[0];
    var uvsL = uvs.length; //out of bucle
    var v2;

    for (var i = 0; i < uvsL; i++) { // 0, 2, 1
        var uv = [];

        v2 = new THREE.Vector2();
        v2.x = -(uvs[i][0].x - 0.5) + 0.5; //sym
        v2.y = uvs[i][0].y;
        uv.push(v2);

        v2 = new THREE.Vector2();
        v2.x = -(uvs[i][2].x - 0.5) + 0.5; //sym
        v2.y = uvs[i][2].y;
        uv.push(v2);

        v2 = new THREE.Vector2();
        v2.x = -(uvs[i][1].x - 0.5) + 0.5; //sym
        v2.y = uvs[i][1].y;
        uv.push(v2);

        obj.faceVertexUvs[0].push(uv);
    }

    return obj;
}

function getTexture(img) {
    var canvas = $("<canvas width='" + img.width * 2 + "' height='" + img.height + "'>")[0];
    //$(".stats").append(canvas);
    var ctx = canvas.getContext("2d");
    ctx.translate(img.width, 0);
    ctx.drawImage(img, 0, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    return new THREE.Texture(canvas);
}

function preloadimages(arr) {
    var newimages = [], loadedimages = 0;
    var postaction = function () {
    };
    var arr = (typeof arr != "object") ? [arr] : arr;
    function imageloadpost() {
        loadedimages++;
        if (loadedimages == arr.length) {
            postaction(newimages) //call postaction and pass in newimages array as parameter
        }
    }
    for (var i = 0; i < arr.length; i++) {
        newimages[i] = new Image();
        newimages[i].src = arr[i];
        newimages[i].onload = function () {
            imageloadpost();
        };
        newimages[i].onerror = function () {
            imageloadpost();
        };
    }
    return {//return blank object with done() method
        done: function (f) {
            postaction = f || postaction //remember user defined callback functions to be called when images load
        }
    };
}

Unit.prototype.removeGroup = function () {
    var group = Game.map.unitGroups[this.group];
    if (group) {
        var index = group.indexOf(this.id);
        if (index > -1) {
            group.splice(index, 1);
        }
        if (group.length == []) {
            delete Game.map.unitGroups[this.group];
        }
    }
}