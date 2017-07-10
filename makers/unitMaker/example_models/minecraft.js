
var images = {
    face: "img/face.jpg",
    hair: "img/hair.png",
    armor: "img/armor.jpg",
    debug: "img/debug.jpg",
    legs: "img/legs.png",
    arms: "img/arms.jpg"
};

var character = {};
var playerModel;

var headgroup = new THREE.Object3D();

function makeChar() {
    playerModel = new THREE.Object3D();    
    playerModel.name = "char";

    //UPER BODY
    var upperBody = new THREE.Object3D();    
    upperBody.name = "upperBody";
    playerModel.add(upperBody);

    //BODY
    var bodymesh = body();
    bodymesh.castShadow = true;  
    upperBody.add(bodymesh);

    // ARMS
    var armsmesh = arms();
    
    // left arm
    var armLgroup = new THREE.Object3D();
    armLgroup.position.y = 4.2;
    armLgroup.position.x = 3;
    var armLmesh = armsmesh[0];
     
    armLgroup.add(armLmesh[0]); // top arm left mesh
    
    var botArmLgroup = new THREE.Object3D();
    botArmLgroup.position.y = -3;
    botArmLgroup.add(armLmesh[1]); // down arm left mesh
    armLgroup.add(botArmLgroup);

    // right arm
    var armRgroup = new THREE.Object3D();
    armRgroup.position.y = 4.2;
    armRgroup.position.x = -3;
    var armRmesh = armsmesh[1];
    
    armRgroup.add(armRmesh[0]); // top arm right mesh
    
    var botArmRgroup = new THREE.Object3D();
    botArmRgroup.position.y = -3.5;
    botArmRgroup.add(armRmesh[1]); // down arm right mesh
    armRgroup.add(botArmRgroup); 
    
    //shield
    var shieldmesh = shield();
    shieldmesh.rotation.y = 1.3;
    shieldmesh.position.z = 3;
    shieldmesh.position.y = -1;
    shieldmesh.position.x = 1.4;
    botArmLgroup.add(shieldmesh);

    //weapon
    var weapmesh = weapon();
    weapmesh.position.z = 4;
    weapmesh.position.x = -0.5;
    weapmesh.position.y = 0.5;
    weapmesh.rotation.x = 0.5;
    weapmesh.rotation.y = 0.5;
    botArmRgroup.add(weapmesh);
    
    //UPPER BODY
    upperBody.add(armLgroup);
    upperBody.add(armRgroup);

    //LEGS
    var legsmesh = legs();
    var legLmesh = legsmesh[0];
    legLmesh.castShadow = true;    
    playerModel.add(legLmesh);
    var legRmesh = legsmesh[1];
    legRmesh.castShadow = true;    
    playerModel.add(legRmesh);

    //HEAD
    head();
    upperBody.add(headgroup);

// export public variable
    character.model = playerModel;
    character.parts = {
        headGroup: headgroup,
        legR: legRmesh,
        legL: legLmesh,
        armR: armRgroup,
        botArmR: botArmRgroup,
        armL: armLgroup,
        weapon: weapmesh,
        body: upperBody
    };
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
//    $(".stats").append(canvas);
    var ctx = canvas.getContext("2d");
    ctx.translate(img.width, 0);
    ctx.drawImage(img, 0, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    return new THREE.Texture(canvas);
}


function preloadimages(arr) {
    var newimages = [], loadedimages = 0;
    var postaction = function() {
    };
    var arr = (typeof arr != "object") ? [arr] : arr;
    function imageloadpost() {
        loadedimages++;
        if (loadedimages == arr.length) {
            postaction(newimages) //call postaction and pass in newimages array as parameter
        }
        ;
    }
    for (var i = 0; i < arr.length; i++) {
        newimages[i] = new Image()
        newimages[i].src = arr[i]
        newimages[i].onload = function() {
            imageloadpost();
        };
        newimages[i].onerror = function() {
            imageloadpost();
        };
    }
    return {//return blank object with done() method
        done: function(f) {
            postaction = f || postaction //remember user defined callback functions to be called when images load
        }
    };
}
