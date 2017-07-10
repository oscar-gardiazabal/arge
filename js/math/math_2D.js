
function getPoint(x, y) {
    return {x: x, y: y};
}

Array.prototype.clone = function() {
    var arr = this.slice(0);
    for (var i = 0; i < this.length; i++) {
        if (this[i].clone) {
            arr[i] = this[i].clone(); //recursion
        }
    }
    return arr;
};

function hypotenuse(a, b) { // calculate real distances
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function drawRectangle(g, p1, p2, p3, p4) {
    g.vertices = [];
    g.vertices.push(p1);
    g.vertices.push(p2);

    g.vertices.push(p2);
    g.vertices.push(p3);

    g.vertices.push(p3);
    g.vertices.push(p4);

    g.vertices.push(p4);
    g.vertices.push(p1);

    g.computeLineDistances();
    g.verticesNeedUpdate = true;

    return g;
}

function getSquareInMatrix(p, width) { //set value on matrix points square
    var array = [], x, y;
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < width; j++) {
            if (i % 2) {
                x = p.x + i;
            } else {
                x = p.x - i;
            }
            if (j % 2) {
                y = p.y + j;
            } else {
                y = p.y - j;
            }
            array.push({x: x, y: y});
            Game.model.geometries.lineDebug(x, y); //vertical debug line
        }
    }
    return array;
}

function searchCircleInMatrix(map, p, rad, values) { //search closest point in matrix in radium by player
    var x, y, result = false, min = rad;
    for (var i = 0; i < rad; i++) {
        for (var j = 0; j < rad; j++) {
            var dist = Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2));
            if (dist < min) {
                if (i % 2) {
                    x = p.x + i;
                } else {
                    x = p.x - i;
                }
                if (j % 2) {
                    y = p.y + j;
                } else {
                    y = p.y - j;
                }
                for (var n = 0; n < values.length; n++) {
                    console.log("aaaaaaaaaaaaaaaaaaa = " + values[n])
                    if (map[x][y].player.id == values[n]) {
                        min = Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2))
                        result = {x: x, y: y};
                    }
                }
            }
        }
    }
    return result;
}
