
Game.model.unit.geometries.low.head = function() {

    var headgroup = new THREE.Object3D();
    headgroup.position.z = 8;
    headgroup.add(face());
    headgroup.add(hair());

    return headgroup;

    function face() {

        var headgeo = new THREE.Geometry();

        //vertices
        headgeo.vertices.push(new THREE.Vector3(1.5, 0, 0)); //0. cuellos
        headgeo.vertices.push(new THREE.Vector3(0, 1, 0)); //1. barbilla
        headgeo.vertices.push(new THREE.Vector3(1.5, 0, 3)); //2. sien
        headgeo.vertices.push(new THREE.Vector3(0, 2, 2)); //3. nariz
        headgeo.vertices.push(new THREE.Vector3(0, 1, 4)); //4. frente

        var vM = {//MAP VERTICES
            0: [1, 0],
            1: [0.5, 0],
            2: [1, 1],
            3: [0.5, 0.5],
            4: [0.5, 1]
        };

        var faces = [// GEOMETRY FACES
            [0, 1, 2], // papada  
            [1, 3, 2], // mejilla
            [2, 3, 4]   // frente
        ];

        facesManager(headgeo, vM, faces);
        symmetry(headgeo);

        var headmesh = new THREE.Mesh(headgeo);
        headmesh.name = "face";

        var headImg = new Image();
        $(headImg).load(function() {
            headmesh.material = new THREE.MeshBasicMaterial();
            headmesh.material.map = getTexture(headImg);

            headmesh.material.map.needsUpdate = true;
            headmesh.geometry.buffersNeedUpdate = true;
            headmesh.geometry.uvsNeedUpdate = true;
        });
        headImg.src = Game.model.unit.materials.images.face;

        return headmesh;
    }

    function hair() {

        var hairgeo = new THREE.Geometry();

        //vertices
        hairgeo.vertices.push(new THREE.Vector3(0, 2.5, 4.5));    //0. raya
        hairgeo.vertices.push(new THREE.Vector3(0, -1.5, 3.5));   //1. coronilla
        hairgeo.vertices.push(new THREE.Vector3(2, 1.5, 4));    //2. flequillo
        hairgeo.vertices.push(new THREE.Vector3(2, -1, 0)); //3. pelo
        hairgeo.vertices.push(new THREE.Vector3(0, -2.5, -1.5));  //4. cuello
        hairgeo.vertices.push(new THREE.Vector3(1.5, 1.5, -0.5));      //5. melena

        var vM = {//MAP VERTICES
            0: [0.5, 1],
            1: [1, 1],
            2: [0.5, 0.5],
            3: [0.75, 0],
            4: [1, 0],
            5: [0.5, 0]
        };

        var faces = [// GEOMETRY FACES
            [0, 1, 2], // arriba  
            [1, 3, 2], // coco
            [1, 4, 3], // cuello
            [2, 4, 5]   // melena
        ];

        facesManager(hairgeo, vM, faces);
        symmetry(hairgeo);

        var hairmesh = new THREE.Mesh(hairgeo);
        hairmesh.name = "hair";

        //material image
        var hairImg = new Image();
        $(hairImg).load(function() {
            hairmesh.material = new THREE.MeshBasicMaterial();
            hairmesh.material.map = getTexture(hairImg);
            hairmesh.material.side = THREE.DoubleSide;
            hairmesh.material.transparent = true;

            hairmesh.material.map.needsUpdate = true;
            hairmesh.geometry.buffersNeedUpdate = true;
            hairmesh.geometry.uvsNeedUpdate = true;
        });
        hairImg.src = Game.model.unit.materials.images.hair;

        return hairmesh;
    }
};
