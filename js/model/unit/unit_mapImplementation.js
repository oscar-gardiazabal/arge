//js/model/unit/unit_mapImplementation

Unit.prototype.avoidUnitCollision = function () {
    var map = Game.map;
    
    var tile = map.tileWorld;
    var smallTile = map.smallTile;
    var x = this.model.position.x, y = this.model.position.y;
    var p = {x: Math.round(x / (tile / smallTile)), y: Math.round(y / (tile / smallTile))};
//    setUnitsWorld(); //to grid-World
//    var unitsWorld = Game.map.unitsWorld;

    var max = map.gridWorld.length;
    var radio = 3, neg = 1;
    var found = false;

    if (!isWalkable(map.gridWorld[p.x][p.y])) {

        find:while (!found) {
            for (var i = 0; i < radio; i++) {
                x = p.x + i - neg;
                if (x >= 0 && x < map.gridWorld.length) {
                    for (var j = 0; j < radio; j++) {
                        y = p.y + j - neg;

                        if (y >= 0 && y < map.gridWorld[0].length) {
                            if (isWalkable(map.gridWorld[x][y])) {
                                this.model.position.x = x * tile / smallTile;
                                this.model.position.y = y * tile / smallTile;

                                break find;
                            }
                        }
                    }
                }
            }

            radio += 2;
            neg++;
            if (radio > max / 2) {
                console.log("no way");
                return false;
            }
        }
    }

    this.updatePosition();
};

Unit.prototype.updatePosition = function () {
    var tile = Game.map.tileWorld / Game.map.smallTile;
    var x = Math.round(this.model.position.x / tile);
    var y = Math.round(this.model.position.y / tile);
    var gridPosition = Game.map.gridWorld[x][y];

    if (this.position) {
        var oldGridPosition = this.position;

        var index = oldGridPosition.indexOf(this);
        oldGridPosition.splice(index, 1);
    }

    gridPosition.push(this);
    this.position = gridPosition;
};

function isWalkable(grid) {
    if (1 == grid || 1 == grid.code && 0 == grid.length) {
        return true;
    } else {
        return false;
    }
}
