function legs() {

    var legLgeo = new THREE.Geometry();

    //vertices
    legLgeo.vertices.push(new THREE.Vector3(0, 1, 0)); //0. pelvis    
    legLgeo.vertices.push(new THREE.Vector3(2, 1, 0)); //1. cadera  
    legLgeo.vertices.push(new THREE.Vector3(1, -1.5, 0)); //2. culo
    legLgeo.vertices.push(new THREE.Vector3(0, 1, 0)); //3. pelvis p2  

    legLgeo.vertices.push(new THREE.Vector3(1.5, 1, -6)); //4. empeine 
    legLgeo.vertices.push(new THREE.Vector3(2.5, -1.5, -7)); //5. talon exterior       
    legLgeo.vertices.push(new THREE.Vector3(0.5, -1.5, -7)); //6. talon interior
    legLgeo.vertices.push(new THREE.Vector3(1.5, 1, -6)); //7. empeine p2

    legLgeo.vertices.push(new THREE.Vector3(1.5, 3, -7)); //8. pie
    legLgeo.vertices.push(new THREE.Vector3(1.5, 3, -7)); //9. pie p2

    var vM = {//MAP VERTICES
        0: [0.5, 1],
        1: [0.65, 1],
        2: [0.85, 1],
        3: [1, 1],
        
        4: [0.5, 0.2],
        5: [0.65, 0],        
        6: [0.85, 0],
        7: [1, 0.2],
        
        8: [0.5, 0],
        9: [1, 0]
    };

    var faces = [// GEOMETRY FACES
        [0, 1, 4], // espinilla
        [1, 5, 4], // pierna exterior
        [1, 2, 5], // culo
        [2, 5, 6], // gemelo
        [2, 3, 6], // muslo
        [3, 6, 7], // pierna interior  
        [4, 5, 8], // pie exterior
        [6, 7, 9] // pie interior

    ];

    facesManager(legLgeo, vM, faces);
    var legRgeo = symmetry(legLgeo, true);

    var legLmesh = new THREE.Mesh(legLgeo);
    legLmesh.position.z = 1;
    legLmesh.name = "legR";

    var legRmesh = new THREE.Mesh(legRgeo);
    legRmesh.position.z = 1;
    legRmesh.name = "legL";

    var headImg = new Image();
    $(headImg).load(function() {
        imageLoaded(legLmesh);
        imageLoaded(legRmesh);
    });
    headImg.src = images.legs;

    function imageLoaded(mesh) {
        mesh.material = new THREE.MeshBasicMaterial();
        mesh.material.map = getTexture(headImg);
        mesh.material.side = THREE.DoubleSide;

        mesh.material.map.needsUpdate = true;
        mesh.geometry.buffersNeedUpdate = true;
        mesh.geometry.uvsNeedUpdate = true;
    }

    return [legLmesh, legRmesh];
}