
function camSimulation(callback) {

    //Video Camera
    var VIEW_ANGLE = 45, ASPECT = 640 / 480, NEAR = 0.0001, FAR = 1000000000;
    Game.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    Game.camera.up.set(0, 0, 1);
    Game.camera.position.set(-1, -1, 8);

    Game.controls = new THREE.OrbitControls(Game.camera, Game.renderer.domElement);

    callback();
}

function simUpdate() {
    Game.controls.update();
    Game.renderer.render(Game.scene, Game.camera);
}
