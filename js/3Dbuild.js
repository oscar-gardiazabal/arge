
init();

// FUNCTIONS
function init() {
    if (Detector.webgl) {
        Game.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

    } else {
        Game.renderer = new THREE.CanvasRenderer();
        console.log("renderer = new THREE.CanvasRenderer()");
        alert("your browser not support webGL!");
    }

    $("body > canvas").remove();
    Game.canvas = Game.renderer.domElement;
    $("body").append(Game.canvas);

    Game.math.clock = new THREE.Clock();
    Game.projector = new THREE.Projector();

    // SCENE
    Game.scene = new THREE.Scene();
    Game.sceneGroup = new THREE.Object3D();
    if (window.AR) {
        AR.sceneGroupId = Game.sceneGroup.id;
    }
    Game.sceneGroup.matrixAutoUpdate = false;

    // RENDERER        
//    if (SCREEN_WIDTH > SCREEN_HEIGHT * 1.333) {
//        Game.renderer.setSize(SCREEN_WIDTH, SCREEN_WIDTH / 1.333);
//        $(Game.canvas).css({
//            "margin-top": -(SCREEN_WIDTH / 1.333 - SCREEN_HEIGHT) / 2 + "px"
//        });
//
//    } else {
//        Game.renderer.setSize(SCREEN_HEIGHT * 1.333, SCREEN_HEIGHT);
//        $(Game.canvas).css({
//            "margin-left": -(SCREEN_HEIGHT * 1.333 - SCREEN_WIDTH) / 2 + "px"
//        });
//    }
    Game.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    Game.renderer.shadowMapEnabled = true;
    Game.renderer.shadowMapSoft = true;

    // CAMERA

//    var ASPECT = 640 / 480, NEAR = 0.1, FAR = 10000;
//    Game.camera = new THREE.PerspectiveCamera(vfov, ASPECT, NEAR, FAR);

    Game.camera = new THREE.Camera();

    Game.sceneGroup.add(new THREE.AmbientLight(0xffffff, 0.5));

    // LIGHT
    var light = new THREE.DirectionalLight(0xffffff, 1);
    var target = new THREE.Object3D(); //can't initialize with position
    target.position = new THREE.Vector3(0, 0, 0);
    light.target = target;
    light.position.set(-15000, 15000, 10000);

    var d = 100;
    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.castShadow = true;
    light.shadowMapWidth = 10000;
    light.shadowMapHeight = 10000;
    light.shadowCameraNear = 0.0001;
    light.shadowCameraFar = 3000;

    light.shadowCameraVisible = true;

    Game.addToScene(light);
    Game.addToScene(target);

    loadGame();
}
