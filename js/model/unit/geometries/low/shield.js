
Game.model.unit.geometries.low.shield = function(){

    var shieldgeo = new THREE.Geometry();

    shieldgeo.vertices.push(new THREE.Vector3(0, 0.3, -4)); //0. base
    shieldgeo.vertices.push(new THREE.Vector3(3, 0, 0)); //1. latral
    shieldgeo.vertices.push(new THREE.Vector3(3, 0, 3)); //2. equina
    shieldgeo.vertices.push(new THREE.Vector3(0, 0.5, 3.5)); //3. arriba

    var vM = {//MAP VERTICES
        0: [0.5, 1],
        1: [0.7, 0.9],
        2: [0.9, 1],
        3: [1, 1]
    };

    var faces = [// GEOMETRY FACES
        [0, 2, 1], // bajo
        [0, 3, 2] // alto

    ];

    facesManager(shieldgeo, vM, faces);
    symmetry(shieldgeo);

    var shieldmesh = new THREE.Mesh(shieldgeo);    
    shieldmesh.name = "shield";

    var img = new Image();
    $(img).load(function() {
        imageLoaded(shieldmesh);
    });
    img.src = Game.model.unit.materials.images.debug;

    function imageLoaded(mesh) {
        mesh.material = new THREE.MeshBasicMaterial();
        mesh.material.map = getTexture(img);
        mesh.material.side = THREE.DoubleSide;

        mesh.material.map.needsUpdate = true;
        mesh.geometry.buffersNeedUpdate = true;
        mesh.geometry.uvsNeedUpdate = true;
    }

    return shieldmesh;
}