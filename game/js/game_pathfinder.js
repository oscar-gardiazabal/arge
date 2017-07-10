//game/js/game_pathfinder

//map, start, end, accuracy (angles path)
function findPath(map, unitPosition, p, tile, accuracy) { // world is a 2d array of integers
    if (!tile)
        tile = Game.map.tileWorld;
    if (!accuracy) //1=normal, 0=simple, -1=ortogonal(not implemented)
        accuracy = 1;
    var worldWidth = map.length;
    var worldHeight = map[0].length;
    var pathStart = {x: Math.round(unitPosition.x / tile), y: Math.round(unitPosition.y / tile)};
    p = {x: p.x / tile, y: p.y / tile};
    var pathEnd = {x: Math.round(p.x), y: Math.round(p.y)};

    if (pathStart.x < 0 || pathStart.x >= worldWidth || pathStart.y < 0 || pathStart.y >= worldHeight ||
            pathEnd.x < 0 || pathEnd.x >= worldWidth || pathEnd.y < 0 || pathEnd.y >= worldHeight) {
        console.log("click out of map")
        return [];
    }

    try {
        Game.model.geometries.cubeDebug();
        if (!isWalkable(Game.map.inverseWorld[Math.round(p.x - 0.5)][Math.round(p.y - 0.5)])) { // -0.5
            var mult = tile / Game.map.tileWorld;
            var x = Math.round((p.x) * mult), y = Math.round((p.y) * mult);
            p = pathEnd = openEnd(Game.map.world, {x: x, y: y}); //Game.map.world again
            if (!pathEnd) {
                return [];
            }
        }
    } catch (e) {
        console.log("error in findPath: Game.map.inverseWorld[Math.round(p.x - 0.5)] = " + x);
    }

    var worldSize = worldWidth * worldHeight;

    var res = calculatePath(pathStart, pathEnd);
    return res;

    function Neighbours(x, y) { // used by findNeighbours function to locate adjacent cells that aren't blocked
        var movOptions = [];
        var N = {x: x, y: y + 1};
        var S = {x: x, y: y - 1};
        var E = {x: x + 1, y: y};
        var W = {x: x - 1, y: y};
        var NE = {x: x + 1, y: y + 1};
        var NW = {x: x - 1, y: y + 1};
        var SE = {x: x + 1, y: y - 1};
        var SW = {x: x - 1, y: y - 1};
        var NN, SS, EE, WW, NNE, NEE, SEE, SSE, SSW, SWW, NWW, NNW;
        if (accuracy > 0) {
            NN = {x: x, y: y + 2};
            SS = {x: x, y: y - 2};
            EE = {x: x + 2, y: y};
            WW = {x: x - 2, y: y};
            NNE = {x: x + 1, y: y + 2};
            NEE = {x: x + 2, y: y + 1};
            SEE = {x: x + 2, y: y - 1};
            SSE = {x: x + 1, y: y - 2};
            SSW = {x: x - 1, y: y - 2};
            SWW = {x: x - 2, y: y - 1};
            NWW = {x: x - 2, y: y + 1};
            NNW = {x: x - 1, y: y + 2};
        }

        var n, s, e, w;
        if (n = able(N)) { //equals serve to next if's
            movOptions.push(N);
        }
        if (s = able(S)) {
            movOptions.push(S);
        }
        if (e = able(E)) {
            movOptions.push(E);
        }
        if (w = able(W)) {
            movOptions.push(W);
        }

        var ne, se, sw, nw;
        if (ne = able(NE) && n && e) {
            movOptions.push(NE);
        }
        if (se = able(SE) && s && e) {
            movOptions.push(SE);
        }
        if (sw = able(SW) && s && w) {
            movOptions.push(SW);
        }
        if (nw = able(NW) && n && w) {
            movOptions.push(NW);
        }

        var nn, ss, ee, ww;
        if (accuracy > 0) {
            if (nn = (n && able(NN))) {
                movOptions.push(NN);
            }
            if (ss = (s && able(SS))) {
                movOptions.push(SS);
            }
            if (ee = (e && able(EE))) {
                movOptions.push(EE);
            }
            if (ww = (w && able(WW))) {
                movOptions.push(WW);
            }

            if (nn && ne && able(NNE)) {
                movOptions.push(NNE);
            }
            if (ee && ne && able(NEE)) {
                movOptions.push(NEE);
            }
            if (ee && se && able(SEE)) {
                movOptions.push(SEE);
            }
            if (ss && se && able(SSE)) {
                movOptions.push(SSE);
            }
            if (ss && sw && able(SSW)) {
                movOptions.push(SSW);
            }
            if (ww && sw && able(SWW)) {
                movOptions.push(SWW);
            }
            if (ww && nw && able(NWW)) {
                movOptions.push(NWW);
            }
            if (nn && nw && able(NNW)) {
                movOptions.push(NNW);
            }
        }

        return movOptions;
    }

    function able(card) { // returns boolean value (world cell is available and open)
        var x = card.x, y = card.y;
        if (x < 0 || x >= worldWidth || y < 0 || y >= worldHeight) {
            return false;
        }
        if (isWalkable(map[x][y])) {
            return true;
        } else {
            return false;
        }
    }

    function Node(Parent, Point) { // returns a new object with Node properties.
        var newNode = {
            Parent: Parent, // pointer to another Node object            
            value: Point.x + (Point.y * worldWidth), // array index of this Node in the world linear array            
            x: Point.x, // the location coordinates of this Node
            y: Point.y,
            f: 0, // the heuristic estimated cost of an entire path using this node            
            g: 0 // the distanceFunction cost to get from the starting point to this node                
        };
        return newNode;
    }

    function calculatePath(pathStart, pathEnd) { // Path function, executes AStar algorithm operations

        // create Nodes from the Start and End x,y coordinates
        var mypathStart = Node(null, pathStart);
        var mypathEnd = Node(null, pathEnd);
        var AStar = new Array(worldSize); // create an array that will contain all world cells        
        var Open = [mypathStart]; // list of currently open Nodes        
        var Closed = []; // list of closed Nodes        
        var result = []; // list of the final output array        
        var myNeighbours; // reference to a Node (that is nearby)         
        var myNode; // reference to a Node (that we are considering now)        
        var myPath; // reference to a Node (that starts a path in question)
        var max, min, i, j; // temp integer variables used in the calculations

        var end = false;
        while (!end) { // iterate through the open list until none are left

            max = worldSize;
            min = -1;
            for (i = 0; i < Open.length; i++) {
                if (Open[i].f < max) {
                    max = Open[i].f;
                    min = i;
                }
            }

            myNode = Open.splice(min, 1)[0]; // grab the next node and remove it from Open array

            if (!myNode) { //no way
                console.log("!myNode");
                return false;
            }

            //FINAL PATH
            if (myNode.value === mypathEnd.value) { // is it the destination node?
                end = true;
                Closed.push(myNode);
                myPath = myNode;
                if (myPath.Parent) { //mas de un tramo?

                    while (myPath.Parent) {
                        result.push({x: myPath.x, y: myPath.y});
                        debug({x: myPath.x, y: myPath.y}, tile);
                        myPath = myPath.Parent;
                    }

                    //simplification path (break points)
                    var angle;
                    var temp, dX = result[0].x, dY = result[0].y;
                    var res, arr = [];
                    for (var i = result.length - 2; i >= 0; i--) {
                        res = result[i];
                        temp = ((dX - res.x) / (dY - res.y));
                        dX = res.x, dY = res.y;
                        if (angle === temp) {
                            arr.push(i + 1);
                        } else {
                            angle = temp;
                        }
                    }
                    for (var i = 0; i < arr.length; i++) {
                        result.splice(arr[i], 1);
                    }

                }

                result[0] = p;
                result.reverse(); // we want to return start to finish
                AStar = Closed = Open = []; // clear the working arrays

                //CONSTRUCTION PATH
            } else {
                myNeighbours = Neighbours(myNode.x, myNode.y); // find which nearby nodes are walkable

                for (i = 0, j = myNeighbours.length; i < j; i++) { // test each one that hasn't been tried already

                    myPath = Node(myNode, myNeighbours[i]);
                    if (!AStar[myPath.value]) {

                        myPath.g = myNode.g + hypotenuse(myNeighbours[i], myNode); // estimated cost of this particular route
                        myPath.f = myPath.g + hypotenuse(myNeighbours[i], mypathEnd); // estimated cost of entire guessed route

                        Open.push(myPath); // remember this new path for testing above
                        AStar[myPath.value] = true; // mark this node in the world graph as visited
                    }
                }

                Closed.push(myNode); // remember this route as having no more untested options
            }
        } // keep iterating until the Open list is empty

        for (var i = 0; i < result.length; i++) {
            result[i].x = result[i].x * tile;
            result[i].y = result[i].y * tile;
        }

        return result;
    }
}

function openEnd(map, endPoint) { //get nearest walkable point

    var max = map.length * 2;
    var min = max;
    var radio = 3, neg = 1, x, y, dist, point;
    var found = false;
    while (!found) {
        for (var i = 0; i < radio; i++) {
            x = endPoint.x + i - neg;
            if (x >= 0 && x < map.length) {

                for (var j = 0; j < radio; j++) {
                    y = endPoint.y + j - neg;
                    if (y >= 0 && y < map[0].length) {
                        if (isWalkable(map[x][y])) {
                            dist = Math.sqrt(Math.pow(x - endPoint.x, 2) + Math.pow(y - endPoint.y, 2));
                            if (dist < min) {
                                min = dist;
                                point = getPoint(x, y);
                            }
                            found = true;
                        }
                    }
                }
            }
        }

        radio += 2;
        neg++;
        if (radio > max / 2) {
            found = true;
            console.log("point not found as openEnd = ");
            console.log(endPoint);
            return false;
        }
    }

    return point;
}