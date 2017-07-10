
var character = {};
var playerModel;

var a = 8;
var b = 12;
var c = 4;

var tileUvW = 1 / 64;
var tileUvH = 1 / 32;

makeChar();
function makeChar() {
    playerModel = new THREE.Object3D();
    playerModel.name = "char";

    var material = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('img/char.png'),
//        color: 0xffffff,
//        shading: THREE.SmoothShading
    });


    var headgroup = new THREE.Object3D();
    var upperBody = new THREE.Object3D();

////////////////////////////////////////////////////////////////////////
// Left leg
    var legLgeo = new THREE.CubeGeometry(4, 12, 4);
    for (var i = 0; i < 8; i += 1) {
        legLgeo.vertices[i].y -= 6;
    }
    var legL = new THREE.Mesh(legLgeo, material);
//legL.geometry.rotateY(-Math.PI / 2)
    legL.position.x = 2;
    legL.position.y = -6;
//    uvmap(legLgeo, 0, 8, 20, -4, 12);
//    uvmap(legLgeo, 1, 16, 20, -4, 12);
//    uvmap(legLgeo, 2, 4, 16, 4, 4, 3);
//    uvmap(legLgeo, 3, 8, 20, 4, -4, 1);
//    uvmap(legLgeo, 4, 12, 20, -4, 12);
//    uvmap(legLgeo, 5, 4, 20, -4, 12);
    playerModel.add(legL)

////////////////////////////////////////////////////////////////////////
// Right leg
    var legRgeo = new THREE.CubeGeometry(4, 12, 4);
    for (var i = 0; i < 8; i += 1) {
        legRgeo.vertices[i].y -= 6;
    }
    var legR = new THREE.Mesh(legRgeo, material);
//legR.geometry.rotateY(-Math.PI / 2)
    legR.name = "legR";
    legR.position.x = -2;
    legR.position.y = -6;
    uvmap(legRgeo, 0, 4, 20, 4, 12);
    uvmap(legRgeo, 1, 12, 20, 4, 12);
    uvmap(legRgeo, 2, 8, 16, -4, 4, 3);
    uvmap(legRgeo, 3, 12, 20, -4, -4, 1);
    uvmap(legRgeo, 4, 0, 20, 4, 12);
    uvmap(legRgeo, 5, 8, 20, 4, 12);
    playerModel.add(legR)


////////////////////////////////////////////////////////////////////////
    var upperBody = new THREE.Object3D();
    upperBody.name = "upperBody";
    playerModel.add(upperBody)


////////////////////////////////////////////////////////////////////////
// Body
    var bodygeo = new THREE.CubeGeometry(a, b, c);
    var bodymesh = new THREE.Mesh(bodygeo, material);
    bodymesh.name = "body";
    uvmap(bodygeo, 0, 20, 20, 8, 12);
    uvmap(bodygeo, 1, 32, 20, 8, 12);
    uvmap(bodygeo, 2, 20, 16, 8, 4, 1);
    uvmap(bodygeo, 3, 28, 16, 8, 4, 3);
    uvmap(bodygeo, 4, 16, 20, 4, 12);
    uvmap(bodygeo, 5, 28, 20, 4, 12);
    upperBody.add(bodymesh);


////////////////////////////////////////////////////////////////////////
// Left arm
    var armLgeo = new THREE.CubeGeometry(4, 12, 4);
    for (var i = 0; i < 8; i += 1) {
        armLgeo.vertices[i].y -= 4;
    }
    var armL = new THREE.Mesh(armLgeo, material);
//armL.geometry.rotateY(-Math.PI / 2)
    armL.name = "armL"
    armL.position.x = 6;
    armL.position.y = 4;
    armL.rotation.z = Math.PI / 32;
    uvmap(armLgeo, 0, 48, 20, -4, 12);
    uvmap(armLgeo, 1, 56, 20, -4, 12);
    uvmap(armLgeo, 2, 48, 16, -4, 4, 1);
    uvmap(armLgeo, 3, 52, 16, -4, 4, 3);
    uvmap(armLgeo, 4, 52, 20, -4, 12);
    uvmap(armLgeo, 5, 44, 20, -4, 12);
    upperBody.add(armL);

////////////////////////////////////////////////////////////////////////
// Right arm
    var armRgeo = new THREE.CubeGeometry(4, 12, 4);
    for (var i = 0; i < 8; i += 1) {
        armRgeo.vertices[i].y -= 4;
    }
    var armR = new THREE.Mesh(armRgeo, material);
//armR.geometry.rotateY(-Math.PI / 2)
    armR.name = "armR"
    armR.position.x = -6;
    armR.position.y = 4;
    armR.rotation.z = -Math.PI / 32;
    uvmap(armRgeo, 0, 44, 20, 4, 12);
    uvmap(armRgeo, 1, 52, 20, 4, 12);
    uvmap(armRgeo, 2, 44, 16, 4, 4);
    uvmap(armRgeo, 3, 48, 16, 4, 4);
    uvmap(armRgeo, 4, 40, 20, 4, 12);
    uvmap(armRgeo, 5, 48, 20, 4, 12);
    upperBody.add(armR);

////////////////////////////////////////////////////////////////////////
// head group
    var headgroup = new THREE.Object3D();
    upperBody.add(headgroup)
    headgroup.position.y = 6;

// Head
    var headgeo = new THREE.Geometry();

//    headgeo.vertices.push(new THREE.Vector3(0, 0, 0)); //0
//    headgeo.vertices.push(new THREE.Vector3(0, 4, 4)); //1
//    headgeo.vertices.push(new THREE.Vector3(4, 4, 0)); //2
//    headgeo.vertices.push(new THREE.Vector3(0, 4, -4)); //3
//    headgeo.vertices.push(new THREE.Vector3(0, 8, 0)); //4

    headgeo.vertices.push(new THREE.Vector3(0, 0, -1)); //0
    headgeo.vertices.push(new THREE.Vector3(0, 1, 3)); //1
    headgeo.vertices.push(new THREE.Vector3(3, 4, 0)); //2
    headgeo.vertices.push(new THREE.Vector3(0, 6, 2)); //3


//    headgeo.faces.push(new THREE.Face3(0, 2, 1));
//    headgeo.faces.push(new THREE.Face3(1, 2, 4));
//    headgeo.faces.push(new THREE.Face3(0, 3, 2));
//    headgeo.faces.push(new THREE.Face3(2, 3, 4));

    headgeo.faces.push(new THREE.Face3(0, 2, 1));
    headgeo.faces.push(new THREE.Face3(1, 2, 3));

    headgeo.computeFaceNormals();

//    var v0 = [0.5, 0];
//    var v1 = [0.5, 0.5];
//    var v2 = [0.75, 0.5];
//    var v3 = [1, 0.5];
//    var v4 = [0.5, 1];

    var v0 = [1, 0];
    var v1 = [0.5, 0];
    var v2 = [1, 1];
    var v3 = [0.5, 1];

    uvmap(headgeo, 0, v0, v2, v1);
    uvmap(headgeo, 1, v1, v2, v3);

//    uvmap(headgeo, 0, v0, v2, v1);
//    uvmap(headgeo, 1, v1, v2, v4);
//    uvmap(headgeo, 2, v0, v3, v2);
//    uvmap(headgeo, 3, v2, v3, v4);

    var loadImg = new Image();
    $(loadImg).load(function() {

        var canvas = $("<canvas width='" + this.width * 2 + "' height='" + this.height + "'>")[0];
        $(".stats").append(canvas);
        var ctx = canvas.getContext("2d");
        ctx.translate(this.width, 0);
        ctx.drawImage(loadImg, 0, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(loadImg, 0, 0);
        var texture = new THREE.Texture(canvas);

        var mat = new THREE.MeshLambertMaterial({
            map: texture
        });

        var headmesh = new THREE.Mesh(headgeo, mat);
        headmesh.name = "head";
//        headmesh.position.y = 2;

        symmetry(headgeo);
        headmesh.material.map.needsUpdate = true;
        headgroup.add(headmesh);
    });
    loadImg.src = 'img/face.jpg';


// earL and earR	
    var ears = new THREE.Object3D();
    var eargeo = new THREE.CubeGeometry(1, (9 / 8) * 6, (9 / 8) * 6);
    var earL = new THREE.Mesh(eargeo, material);
//earL.geometry.rotateY(-Math.PI / 2)
    earL.name = "earL";
    var earR = new THREE.Mesh(eargeo, material);
//earR.geometry.rotateY(-Math.PI / 2)
    earR.name = "earR";
    earL.position.x = -2 - (9 / 8) * 5;
    earR.position.x = -2 - (9 / 8) * 5;
    earL.position.z = -(9 / 8) * 5;
    earR.position.z = (9 / 8) * 5;
    uvmap(eargeo, 0, 25, 1, 6, 6);	// Front side
    uvmap(eargeo, 1, 32, 1, 6, 6);	// Back side
    uvmap(eargeo, 2, 25, 0, 6, 1, 1);	// Top edge
    uvmap(eargeo, 3, 31, 0, 6, 1, 1);	// Bottom edge
    uvmap(eargeo, 4, 24, 1, 1, 6);	// Left edge
    uvmap(eargeo, 5, 31, 1, 1, 6);	// Right edge
    ears.add(earL);
    ears.add(earR);
    earL.visible = earR.visible = false;
    headgroup.add(ears);

// export public variable
    character.model = playerModel;
    character.parts = {
        headGroup: headgroup,
        bodygeo: bodygeo,
        legL: legL,
        legR: legR,
        armR: armR,
        armL: armL
    };

    $("#body").val(a);
}

function cubeFromPlanes(size, material) {
    var cube = new THREE.Object3D();
    var meshes = [];
    for (var i = 0; i < 6; i++) {
        var geometry = new THREE.PlaneGeometry(size, size);
        var mesh = new THREE.Mesh(geometry, material);
        cube.add(mesh);
        meshes.push(mesh);
    }
    // Front
    meshes[0].rotation.x = Math.PI / 2;
    meshes[0].position.z = size / 2;

    // Back
    meshes[1].rotation.x = Math.PI / 2;
    meshes[1].rotation.z = Math.PI;
    meshes[1].position.z = -size / 2;

    // Top
    meshes[1].rotation.y = Math.PI / 2;
    meshes[2].position.y = size / 2;

    // Bottom
    meshes[3].rotation.y = -Math.PI / 2;
    meshes[3].rotation.z = Math.PI;
    meshes[3].position.y = -size / 2;

    // Left
    meshes[4].rotation.x = Math.PI / 2;
    meshes[4].rotation.z = Math.PI / 2;
    meshes[4].position.x = -size / 2;

    // Right
    meshes[5].rotation.x = -Math.PI / 2;
    meshes[5].rotation.y = Math.PI;
    meshes[5].rotation.z = Math.PI / 2;
    meshes[5].position.x = size / 2;

    return cube;
}

function getMaterial(image, transparent) {
    var texture = new THREE.Texture(image);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.format = transparent ? THREE.RGBAFormat : THREE.RGBFormat;
    texture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: transparent ? true : false
    });
    return material;
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

function symmetry(g) {

    var vertices = g.vertices.length;

    for (var i = 0; i < vertices; i++) {
        var vector = new THREE.Vector3();
        vector.x = -g.vertices[i].x;
        vector.y = g.vertices[i].y;
        vector.z = g.vertices[i].z;
        g.vertices.push(vector);
    }

    var faces = g.faces.length;

    for (var i = 0; i < faces; i++) {
        var face = new THREE.Face3();
        face.a = g.faces[i].a + vertices;
        face.b = g.faces[i].c + vertices;
        face.c = g.faces[i].b + vertices;



//        face.scale.x = - 1;
//        face.applyMatrix(new THREE.Matrix4().makeScale( -1, 1, 1 ) );

        g.faces.push(face);
    }

    var uvs = g.faceVertexUvs[0];
    var uvsL = uvs.length;
    var v2;

    for (var i = 0; i < uvsL; i++) {
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

        uvs.push(uv);
    }

}