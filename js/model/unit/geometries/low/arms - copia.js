
function arms() {

    var armLgeo = new THREE.Geometry();

    armLgeo.vertices.push(new THREE.Vector3(0, 1, 1)); //0. clavicula
    armLgeo.vertices.push(new THREE.Vector3(2, 0, 0)); //1. hombro
    armLgeo.vertices.push(new THREE.Vector3(0, 0.5, -1.5)); //2. homoplato
    armLgeo.vertices.push(new THREE.Vector3(0, 1, 1)); //3. clavicula p2

    armLgeo.vertices.push(new THREE.Vector3(0.5, -3, 1)); //4. codo interior
    armLgeo.vertices.push(new THREE.Vector3(1.5, -2.5, 1.5)); //5. fosa codo
    armLgeo.vertices.push(new THREE.Vector3(1.5, -4, 0.5)); //6. codo exterior
    armLgeo.vertices.push(new THREE.Vector3(0.5, -3, 1)); //7. codo interior p2

    armLgeo.vertices.push(new THREE.Vector3(0, -3, 4.5)); //8. muñeca interior
    armLgeo.vertices.push(new THREE.Vector3(1, -4, 5)); //9. muñeca exterior
    armLgeo.vertices.push(new THREE.Vector3(-0.5, -4.5, 4)); //10. muñeca inferior
    armLgeo.vertices.push(new THREE.Vector3(0, -3, 4.5)); //11. muñeca interior p2

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
        10: [0.85, 0],
        11: [1, 0]
    };

    var faces = [// GEOMETRY FACES
        [0, 2, 1], // hombro

        [0, 1, 5], // antebrazo anterior
        [1, 2, 6], // antebrazo exterior
        [2, 3, 7], // antebrazo posterior
        [0, 4, 5], // codo interior
        [1, 5, 6], // codo exterior
        [2, 6, 7], // codo posterior

        [4, 5, 8], // brazo interior
        [5, 6, 9], // brazo exterior
        [6, 7, 10], // brazo inferior
        [5, 8, 9], // muñeca superior
        [6, 9, 10], // muñeca exterior
        [7, 10, 11], // muñeca interior

        [8, 9, 10] // mano

    ];

    facesManager(armLgeo, vM, faces);    
    var armRgeo = symmetry(armLgeo, true);

    var armLmesh = new THREE.Mesh(armLgeo);    
    armLmesh.name = "armR";

    var armRmesh = new THREE.Mesh(armRgeo);
    armRmesh.name = "armL";

    var img = new Image();
    $(img).load(function() {
        imageLoaded(armLmesh);
        imageLoaded(armRmesh);
    });
    img.src = images.arms;

    function imageLoaded(mesh) {
        mesh.material = new THREE.MeshBasicMaterial();
        mesh.material.map = getTexture(img);
        mesh.material.side = THREE.DoubleSide;

        mesh.material.map.needsUpdate = true;
        mesh.geometry.buffersNeedUpdate = true;
        mesh.geometry.uvsNeedUpdate = true;
    }

    return [armLmesh, armRmesh];
}