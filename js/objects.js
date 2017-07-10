//objects

var Game = {
    class: {},
    counter: {
        player: 0,
        unit: 0,
        group: 0,
        building: 0
    },
    players: [],
    canvas: null,
    scene: null,
    sceneGroup: null,
    camera: null,
    renderer: null,
    projector: null,
    controls: null,
    map: {
        world: [], //world general map 
        inverseWorld: null, //matrix walkable world 
        gridWorld: null, //matrix units SCALE world
        unitsWorld: null, // dynamic units map
        geoMatrix: [], //geometries matrix for mapMaker
        tileWorld: 25,
        smallTile: 2,
        tileCharScale: 0,
        unitGroups: {},
        code: {
            size: 10,
            cliff: 0,
            walkable: 1,
            unit: 2,
            building: 3,
            wall: 4
        }
    },
    model: {
        map: {
            geometries: {},
            materials: {},
            mapElements: []
        },
        unit: {
            geometries: {
                low: {},
                medium: {},
                hight: {}
            },
            materials: {},
            all: []
        },
        building: {
            geometries: {},
            materials: {},
            array: []
        },
        geometries: {},
        materials: {}

    },
    floor: null,
    math: {
        clock: null,
        delta: 0,
        upVector: new THREE.Vector3(0, 0, 1),
        deg45: Math.PI / 2
    },
    temp: {}
};
Game.map.tileUnit = Game.map.tileWorld / Game.map.smallTile;
Game.map.tileCharScale = Game.bbb; // get deprecated

Game.addToScene = function(element) {
//    console.log(12345)
    Game.sceneGroup.add(element);
};