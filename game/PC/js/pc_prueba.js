
var keyboard;

function checkDevice() {
    if (!mobile) {
        alert("!mobile");

        keyboard = new THREEx.KeyboardState();

        SCREEN_WIDTH = $(window).width();
        SCREEN_HEIGHT = $(window).height();

        scene.add(floor);
        scene.add(buffalo);

        // CAMERA
        var VIEW_ANGLE = 45;
        var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
        var NEAR = 0.1;
        var FAR = 20000;
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

//        var axis = new THREE.Vector3(1,0,0);
//        camera.rotateOnAxis( axis, Math.PI/2 );

//        camera.up = new THREE.Vector3(0, 0, 1);
//        camera.rotation.order = 'YXZ';

//        camera.rotation.y = 90 * Math.PI / 180;

        scene.add(camera);
        camera.position.set(1500, 1500, 500);
        camera.lookAt(scene.position);
//        camera.updateProjectionMatrix();

        // EVENTS
        THREEx.WindowResize(renderer, camera);
        THREEx.FullScreen.bindKey({charCode: 'm'.charCodeAt(0)});

        // CONTROLS
        controls = new THREE.OrbitControls(camera, renderer.domElement);
    }
}

var pc = {
    update: function() {
        // move forwards / backwards
        if (keyboard.pressed("down"))
            buffalo.translateZ(-moveDistance);

        if (keyboard.pressed("up"))
            buffalo.translateZ(moveDistance);
        // rotate left/right
        if (keyboard.pressed("left"))
            buffalo.rotation.y += delta * 5;
        if (keyboard.pressed("right"))
            buffalo.rotation.y -= delta * 5;

        var walkingKeys = ["up", "down", "left", "right"];
        for (var i = 0; i < walkingKeys.length; i++) {
            if (keyboard.pressed(walkingKeys[i]))
                walking = true;
        }

        controls.update();
    }
};