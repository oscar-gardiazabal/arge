
Game.model.map.materials = {
    saved: {},
    images: {
        floor:'img/map/floor.jpg',
        wall:'img/map/wall.jpg'
    },
    shaded: function(material) {
        if (this.saved[material]) {

            if (this.saved["shaded" + material]) {
                return this.saved["shaded" + material];

            } else {
                var mat = this.saved[material].clone();
                for (var i = 0; i < mat.materials.length; i++) {
                    mat.materials[i].opacity = 0.7;
                }
                this.saved["shaded" + material] = mat;
                return mat;
            }

        } else {
            return false;
        }
    },
    wall: function() {

        if (!this.saved["wall"]) {

            var matArray = [];
            var m = [this.images.floor, this.images.wall];
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

            this.saved["wall"] = new THREE.MeshFaceMaterial(matArray);
        }

        return  this.saved.wall;
    }
};
