function body() {

    var bodygeo = new THREE.Geometry();

    //vertices
    bodygeo.vertices.push(new THREE.Vector3(0, 2, 0));        //0. hombligo
    bodygeo.vertices.push(new THREE.Vector3(0, 2.5, 6.5));        //1. pecho
    bodygeo.vertices.push(new THREE.Vector3(4, 1.5, 8));         //2. brazo
    bodygeo.vertices.push(new THREE.Vector3(3, -2, 7.5));    //3. homoplato
    bodygeo.vertices.push(new THREE.Vector3(2.5, 0, 0.5));      //4. costado
    bodygeo.vertices.push(new THREE.Vector3(0, -1.5, 9));        //5. columna
    bodygeo.vertices.push(new THREE.Vector3(0, -1.5, 0));         //6. culo

    var vM = {      //MAP VERTICES
        0: [0.5, 0],
        1: [0.5, 1],
        2: [0.7, 0.8],
        3: [0.85, 0.7],
        4: [0.75, 0],
        5: [1, 1],
        6: [1, 0]
    };

    var faces = [   // GEOMETRY FACES
        [0, 1, 2],  // pecho  
        [1, 5, 2],  // clavicula
        [0, 2, 4],  // barriga
        [2, 3, 4],  // costado
        [3, 5, 6],  // columna
        [3, 6, 4],  // espalda
        [2, 5, 3]   // hombro
    ];

    facesManager(bodygeo, vM, faces);
    symmetry(bodygeo);

    var bodymesh = new THREE.Mesh(bodygeo);
//    bodymesh.position.z = -3;
    bodymesh.name = "body";

    //material apply
    var img = new Image();
    $(img).load(function() {
        bodymesh.material = new THREE.MeshBasicMaterial();
        bodymesh.material.map = getTexture(img);

        bodymesh.material.map.needsUpdate = true;
        bodymesh.geometry.buffersNeedUpdate = true;
        bodymesh.geometry.uvsNeedUpdate = true;
    });
    img.src = images.armor;

    return bodymesh;
}