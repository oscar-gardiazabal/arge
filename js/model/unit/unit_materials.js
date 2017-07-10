
Game.model.unit.materials = {
    saved: {},
    images: {
        face: "img/face.jpg",
        hair: "img/hair.png",
        armor: "img/armor.jpg",
        legs: "img/legs.png",
        arms: "img/arms.jpg",
        debug: "img/debug.jpg"
    }
    ,
    cache: {}
};

function loadUnitImages(callback) {
    var imagesLoaded = 0;
    var totalImages = 0;
    for (var n in Game.model.unit.materials.images) {
        totalImages++;
    }

    for (var imageName in Game.model.unit.materials.images) {
        save(imageName);
    }

    function save(imageName) {
        var img = new Image();
        $(img).load(function () {
            var material = new THREE.MeshBasicMaterial();
            material.map = getTexture(img); //symetric
            Game.model.unit.materials.cache[imageName] = material;
            imagesLoaded++;
            checkOver();
        });
        img.src = Game.model.unit.materials.images[imageName];
    }

    function checkOver() {
        if (imagesLoaded == totalImages) {
            console.log(Game.model.unit.materials.images)
            callback();
        }
        return false;
    }
}
