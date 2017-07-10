
var clock = new THREE.Clock();
var lookAtPoint = new THREE.Vector3();

var canvas, canvasWidth, canvasHeight;
var skarf, skarfJsArToolKit;

var vfov;
var trackSceneRenderer, trackSceneScene, trackSceneCamera, trackSceneCameraControls;
var trackScenePlaneMesh, trackScenePlaneMesh2, trackScenePlaneMesh3;

var markerImages = [
    THREE.ImageUtils.loadTexture('markers/jsartoolkit/22.jpg')
];

function setupThreejsTrackingScene() {

    //renderer
    trackSceneRenderer = new THREE.WebGLRenderer({
        antialias: true
    });
    trackSceneRenderer.setSize(canvasWidth, canvasHeight);
    trackSceneRenderer.setClearColor('#888888', 1);
    var $threejsTrackSceneContainerElem = $('#mainTracking3dScene div:eq(0)');
    $threejsTrackSceneContainerElem.after(trackSceneRenderer.domElement);

    //scene
    trackSceneScene = new THREE.Scene();

    //camera
    vfov = 40;
    trackSceneCamera = new THREE.PerspectiveCamera(vfov, canvasWidth / canvasHeight, 0.1, 1000);
    trackSceneCamera.position.set(0.25, 0.25, 0.25);
    trackSceneCamera.lookAt(new THREE.Vector3(0, 0, 0));
    trackSceneCameraControls = new THREE.OrbitControls(trackSceneCamera);
    trackSceneCameraControls.modifierKey = 'alt';

    //plane
    trackScenePlaneMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.1, 0.1, 2, 2),
            new THREE.MeshBasicMaterial()
            );
    trackScenePlaneMesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    trackSceneScene.add(trackScenePlaneMesh);

    //marker images
    trackScenePlaneMesh.material.map = markerImages[0];
}

var renderer, scene, cameraJsAruco;
var keyLight;

function setupMainScene() {

    //create renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(640, 360);

    var $threejsContainerElem = $('#threejs-container');
    $threejsContainerElem.append(renderer.domElement);

    //create scene
    scene = new THREE.Scene();

    //create cameras
    cameraJsArToolKit = new THREE.PerspectiveCamera(25, renderer.domElement.width / renderer.domElement.height, 0.1, 1000);
    cameraJsArToolKit.position.set(8, 8, 15);
    cameraJsArToolKit.matrixAutoUpdate = false;

    //setup lights
    keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(-50, 75, 75);
    keyLight.target.position.set(0, 0, 0);
    keyLight.castShadow = true;
    scene.add(keyLight);
}

function setupSkarf() {
    //create Skarf framework
    skarfJsArToolKit = new SKARF.Skarf({
        arLibType: 'jsartoolkit',
        trackingElem: trackSceneRenderer.domElement,
        markerSize: 35, //millimeters
        verticalFov: vfov,
        threshold: 100,
//                    debug: options.displayDebugView,
        canvasContainerElem: $('#canvas-container'),
        renderer: renderer,
        scene: scene,
        camera: cameraJsArToolKit,
        markersJsonFile: 'models/models_jsartoolkit.json'

    });
}

$(document).ready(function() {

    //get canvas
    canvas = $('#mainCanvas')[0];
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    //setup tracking scene
    setupThreejsTrackingScene();
    //setup main scene
    setupMainScene();
    //setup skarf
    setupSkarf();

    //main loop
    function loop() {

        var dt = clock.getDelta();  //have to call this before getElapsedTime()

        //update tracking camera
        trackSceneCameraControls.update();

        //update tracking scene
        trackSceneRenderer.autoClear = false;
        trackSceneRenderer.clear();
        trackSceneRenderer.render(trackSceneScene, trackSceneCamera);

        //update skarf
        skarfJsArToolKit.update(dt);

        requestAnimationFrame(loop);
    }
    loop();
});
