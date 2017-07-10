
Game.model.building.materials = {
    saved: {},
    images: {
        castle: 'img/building/castle.jpg',
        roof:'img/building/roof.jpg'
    },
    castle: function() {
        var matArray = [];
        var m = [this.images.roof, this.images.castle];
        for (var i = 0; i < 6; i++) {
            var dir;
            var img = new Image();
            if (i == 2 || i == 3) {
                dir = m[0];
            } else {
                dir = m[1];
            }
            img.src = dir;
            var tex = new THREE.Texture(img);
            img.tex = tex;
            img.onload = function() {
                this.tex.needsUpdate = true;
            };
            var mat = new THREE.MeshPhongMaterial({map: tex, transparent: true});
            matArray.push(mat);
        }

        return new THREE.MeshFaceMaterial(matArray);
    }
};
