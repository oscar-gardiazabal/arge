
function weapon() {

    var weapgeo = new THREE.Geometry();

    weapgeo.vertices.push(new THREE.Vector3(0, 0, -2)); //0. base
    weapgeo.vertices.push(new THREE.Vector3(0.2, 0, 0)); //1. empun
    weapgeo.vertices.push(new THREE.Vector3(0, 0.2, -0.2)); //2. apoyo frontal
    weapgeo.vertices.push(new THREE.Vector3(0, -0.2, -0.2)); //3. apoyo posterior
    weapgeo.vertices.push(new THREE.Vector3(0, 1.5, 0)); //4. empun frontal
    weapgeo.vertices.push(new THREE.Vector3(0, -1.5, 0)); //5. empun posterior
    weapgeo.vertices.push(new THREE.Vector3(0, 0.3, 0.2)); //6. hoja frontal
    weapgeo.vertices.push(new THREE.Vector3(0, -0.3, 0.2)); //7. hoja posterior
    weapgeo.vertices.push(new THREE.Vector3(0, 0.4, 5)); //8. punta frontal
    weapgeo.vertices.push(new THREE.Vector3(0, -0.4, 5)); //9. punta posterior
    weapgeo.vertices.push(new THREE.Vector3(0, 0, 5.5)); //10. punta

    var vM = {//MAP VERTICES
        0: [0.5, 1],
        1: [0.7, 0.9],
        2: [0.9, 1],
        3: [1, 1],
        4: [0.5, 0.5],
        5: [0.65, 0.5],
        6: [0.8, 0.5],
        7: [1, 0.5],
        8: [0, 0],
        9: [0.7, 0.2],
        10: [0.85, 0]
    };

    var faces = [// GEOMETRY FACES
        [0, 2, 1], // mango frontal
        [0, 3, 1], // mango posterior        
        [1, 2, 4], // apoyo frontal
        [1, 3, 5], // apoyo posterior
        [1, 4, 6], // empun frontal
        [1, 5, 7], // empun posterior        
        [1, 6, 8], // hoja frontal
        [1, 7, 9], // hoja posterior        
        [1, 8, 10], // punta frontal
        [1, 9, 10] // punta posterior

    ];

    facesManager(weapgeo, vM, faces);
    symmetry(weapgeo);

    var weapmesh = new THREE.Mesh(weapgeo);    
    weapmesh.name = "weapon";

    var img = new Image();
    $(img).load(function() {
        imageLoaded(weapmesh);
    });
    img.src = images.debug;

    function imageLoaded(mesh) {
        mesh.material = new THREE.MeshBasicMaterial();
        mesh.material.map = getTexture(img);
        mesh.material.side = THREE.DoubleSide;

        mesh.material.map.needsUpdate = true;
        mesh.geometry.buffersNeedUpdate = true;
        mesh.geometry.uvsNeedUpdate = true;
    }

    return weapmesh;
}