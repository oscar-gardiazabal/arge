var AR = {
//    arCanvas: $("<canvas id='arCanvas' width='" + 640 + "' height='" + 480 +
//            "' style='width:" + 640 + "px; height:" + 480 + "px'>")[0] //canvas virtual
    arCanvas: $("<canvas id='arCanvas' width='" + SCREEN_WIDTH + "' height='" + SCREEN_HEIGHT +
            "' style='width:" + SCREEN_WIDTH + "px; height:" + SCREEN_HEIGHT + "px'>")[0] //canvas virtual
    ,
//    video: $("<video id='video'>")[0] //video
    video: $("<video id='video' autoplay width='" + (SCREEN_WIDTH) + "' height='" + (SCREEN_HEIGHT) +
            "' style='width:" + SCREEN_WIDTH + "px; height:" + SCREEN_HEIGHT + "px; display:none'>")[0] //video
    ,
    raster: "", param: "", detector: "", resultMat: "" //jsartoolkit
    ,
    videoCam: "", videoScene: "", videoTex: "" //three.js
    ,
    tmp: new Float32Array(16), mediaExists: true //variables
    ,
    board: {
        transform: new THREE.Object3D()
    }
    ,
    sceneGroupId: null
    ,
    copyMatrix: function (mat, cm) { //simetric matrix
        cm[0] = mat.m00;
        cm[1] = -mat.m10;
        cm[2] = mat.m20;
        cm[3] = 0;

        cm[4] = mat.m01;
        cm[5] = -mat.m11;
        cm[6] = mat.m21;
        cm[7] = 0;

        cm[8] = -mat.m02;
        cm[9] = mat.m12;
        cm[10] = -mat.m22;
        cm[11] = 0;

        cm[12] = mat.m03;
        cm[13] = -mat.m13;
        cm[14] = mat.m23;
        cm[15] = 1;
    }
};

function loadAR(animateCallback) {

    $("body").prepend(AR.video);
    $(AR.video).css({
        top: 0,
        left: 0,
        position: "absolute",
        'z-index': 99
    });

    //AR.video.autoplay = true; //!important    
    Game.renderer.autoClear = false;

    AR.raster = new NyARRgbRaster_Canvas2D(AR.arCanvas);

    // Next we need to make the Three.js camera use the FLARParam matrix.  
    AR.param = new FLARParam(SCREEN_WIDTH, SCREEN_HEIGHT);
    AR.detector = new FLARBoardDetector(AR.param); //SCALE MARKER //PLUGIN
    AR.param.copyCameraMatrix(AR.tmp, 0.1, 1000000);

    AR.resultMat = new NyARTransMatResult();
    AR.videoCam = new THREE.Camera();
    AR.videoScene = new THREE.Scene();
    AR.videoScene.add(AR.videoCam);

    getMedia(function (media_sources) {
        console.log("media got");
        video.srcObject = media_sources;
        video.onloadedmetadata = function (e) {
            AR.video.play();
        };

        Game.camera.projectionMatrix.setFromArray(AR.tmp);
        AR.videoTex = new THREE.Texture(AR.video);

        if (!media_sources) {
            console.log("no media loaded"); //not remove
            AR.mediaExists = false; //ambient occlusion js effect
            camSimulation(function () {
                loadScene();
            });
        } else {
            loadScene();
        }

        function loadScene() {
            $("#loading").css("display", "none");

            var plane = new THREE.Mesh(// Create PLANE for the video.
                    new THREE.PlaneGeometry(2, 2, 0),
                    new THREE.MeshBasicMaterial({
                        map: AR.videoTex,
                        depthTest: false, //
                        depthWrite: false //
                    })
                    );
            AR.videoScene.add(plane);

            if (Game.debug) {
                var axisHelper = new THREE.AxisHelper(2);
                AR.videoScene.add(axisHelper);
            }

            //CALLBACK
            animateCallback();
        }
    });
}

function updateAR() {
    Game.renderer.autoClear = false;

    var ctx = AR.arCanvas.getContext('2d');
    ctx.clearRect(0, 0, AR.arCanvas.width, AR.arCanvas.height); //!important, clean canvas

    ctx.drawImage(AR.video, 0, 0, AR.arCanvas.width, AR.arCanvas.height);

    AR.video.changed = true;
    AR.arCanvas.changed = true;
    AR.videoTex.needsUpdate = true;

    if (AR.detector.detectMarkerLite(AR.raster)) {

//        if (AR.detector.getTransformMatrix(AR.resultMat)) { // Get the marker matrix into the result matrix.
//            AR.board.transform = Object.asCopy(AR.resultMat); //m
//        }

        AR.detector.getTransformMatrix(AR.resultMat);

        var error = AR.resultMat.error;
        //console.log("AR.resultMat.error = " + error)
//        if (error < 0.5) {
        AR.board.transform = Object.asCopy(AR.resultMat);
//        }

        AR.board.age = 0;

        if (!Game.scene.getObjectById(AR.sceneGroupId)) {
            Game.scene.add(Game.sceneGroup);
//            AR.sceneGroupId = Game.sceneGroup.id;
//            adapt(Game.sceneGroup);
            console.log("model added");
        }
    }

    if (AR.board.age > 8) {
        if (Game.scene.getObjectById(AR.sceneGroupId)) {
            console.log("model removed");
            Game.scene.remove(Game.sceneGroup);
        }

    } else { //update matrix tranformation

        AR.copyMatrix(AR.board.transform, AR.tmp);
        Game.scene.matrix.setFromArray(AR.tmp);

        //axis invert correction http://cg.skeelogy.com/google-summer-of-code-2013-week-2/
        var m = new THREE.Matrix4();
        m.makeScale(1, 1, -1);
        Game.scene.matrix.multiply(m);

        Game.scene.matrixWorldNeedsUpdate = true;
    }
    AR.board.age++;
}

THREE.Matrix4.prototype.setFromArray = function (m) {
    return this.set(
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
            );
};

function adapt(mesh) {
    mesh.rotation.x = -Math.PI / 2;
    mesh.scale.x *= -1;
}
