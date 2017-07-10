
Game.model.unit.geometries.low.arms = function(){
    
    ///////////////////////////////////////////////////////////////////////////
    // TOP ARMS
    var topArmLgeo = new THREE.Geometry();

    topArmLgeo.vertices.push(new THREE.Vector3(0, 1, 1)); //0. clavicula
    topArmLgeo.vertices.push(new THREE.Vector3(2, 0, 0)); //1. hombro
    topArmLgeo.vertices.push(new THREE.Vector3(0, -1.5, 0.5)); //2. homoplato
    topArmLgeo.vertices.push(new THREE.Vector3(0, 1, 1)); //3. clavicula p2

    topArmLgeo.vertices.push(new THREE.Vector3(0.5, 1, -3)); //4. codo interior
    topArmLgeo.vertices.push(new THREE.Vector3(1.5, 1.5, -3)); //5. fosa codo
    topArmLgeo.vertices.push(new THREE.Vector3(1.5, 0.5, -4)); //6. codo exterior
    topArmLgeo.vertices.push(new THREE.Vector3(0.5, 1, -3)); //7. codo interior p2

    var vM_top = {//MAP VERTICES
        0: [0.5, 1],
        1: [0.7, 0.9],
        2: [0.9, 1],
        3: [1, 1],
        4: [0.5, 0.5],
        5: [0.65, 0.5],
        6: [0.8, 0.5],
        7: [1, 0.5]
    };

    var faces_top = [// GEOMETRY FACES
        [0, 2, 1], // hombro

        [0, 1, 5], // antebrazo anterior
        [1, 2, 6], // antebrazo exterior
        [2, 3, 7], // antebrazo posterior
        [0, 4, 5], // codo interior
        [1, 5, 6], // codo exterior
        [2, 6, 7] // codo posterior
    ];

    facesManager(topArmLgeo, vM_top, faces_top);
    var topArmRgeo = symmetry(topArmLgeo, true);

    var topArmLmesh = new THREE.Mesh(topArmLgeo);
    topArmLmesh.name = "topArmR";

    var topArmRmesh = new THREE.Mesh(topArmRgeo);
    topArmRmesh.name = "topArmL";
    
    ///////////////////////////////////////////////////////////////////////////
    // BOTTOM ARMS
    var botArmLgeo = new THREE.Geometry();

    botArmLgeo.vertices.push(new THREE.Vector3(0.5, 1, 0.5)); //4. codo interior
    botArmLgeo.vertices.push(new THREE.Vector3(1.5, 0.5, 1)); //5. fosa codo
    botArmLgeo.vertices.push(new THREE.Vector3(1.5, 0.5, -0.5)); //6. codo exterior
    botArmLgeo.vertices.push(new THREE.Vector3(0.5, 1, 0.5)); //7. codo interior p2

    botArmLgeo.vertices.push(new THREE.Vector3(0, 4.5, 0.5)); //8. muñeca interior
    botArmLgeo.vertices.push(new THREE.Vector3(1, 5, -0.5)); //9. muñeca exterior
    botArmLgeo.vertices.push(new THREE.Vector3(-0.5, 4, -1)); //10. muñeca inferior
    botArmLgeo.vertices.push(new THREE.Vector3(0, 4.5, 0.5)); //11. muñeca interior p2

    var vM_bot = {//MAP VERTICES
        0: [0.5, 0.5],
        1: [0.65, 0.5],
        2: [0.8, 0.5],
        3: [1, 0.5],
        4: [0, 0],
        5: [0.7, 0.2],
        6: [0.85, 0],
        7: [1, 0]
    };

    var faces_bot = [// GEOMETRY FACES
        [0, 1, 4], // brazo interior
        [1, 2, 5], // brazo exterior
        [2, 3, 6], // brazo inferior
        [1, 4, 5], // muñeca superior
        [2, 5, 6], // muñeca exterior
        [3, 6, 7], // muñeca interior

        [4, 5, 6] // mano

    ];

    facesManager(botArmLgeo, vM_bot, faces_bot);
    var botArmRgeo = symmetry(botArmLgeo, true);

    var botArmLmesh = new THREE.Mesh(botArmLgeo);    
    botArmLmesh.name = "armR";

    var botArmRmesh = new THREE.Mesh(botArmRgeo);
    botArmRmesh.name = "armL";


    var img = new Image();
    $(img).load(function() {
        imageLoaded(topArmLmesh);
        imageLoaded(topArmRmesh);
        imageLoaded(botArmLmesh);
        imageLoaded(botArmRmesh);
    });
    img.src = Game.model.unit.materials.images.arms;

    function imageLoaded(mesh) {
        mesh.material = new THREE.MeshBasicMaterial();
        mesh.material.map = getTexture(img);
        mesh.material.side = THREE.DoubleSide;

        mesh.material.map.needsUpdate = true;
        mesh.geometry.buffersNeedUpdate = true;
        mesh.geometry.uvsNeedUpdate = true;
    }


    return [[topArmLmesh, botArmLmesh], [topArmRmesh, botArmRmesh]];
};