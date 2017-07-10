
AR.simImage = new Image();

function camSimulation(callback) {

    //Video Camera
    var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 10000;
    AR.videoCam = new THREE.PerspectiveCamera(45, ASPECT, NEAR, FAR);
    AR.videoCam.up.set(0, 0, 1);
    AR.videoCam.position.set(-1, -1, 8);

    Game.controls = new THREE.OrbitControls(AR.videoCam, Game.renderer.domElement);

    var image = new Image();
    image.onload = function() {
        AR.videoTex = new THREE.Texture(image);
        AR.video = AR.simImage;
        callback();
    };
    image.src = 'img/green.png';
}

function simUpdate() {
    Game.controls.update();    

    Game.renderer.render(AR.videoScene, AR.videoCam);
    AR.simImage.src = Game.renderer.domElement.toDataURL(); //image.onload not work here
}
