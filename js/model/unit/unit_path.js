
Unit.prototype.getPath = function(p) {
    var path = findPath(Game.map.world, this.model.position, p);
    if (!path) {
        path = [];
    }
    return path;
};

Unit.prototype.setPath = function(path) {
    this.status = 0;
    if (path.length > 0) {
        this.goal = path[path.length - 1];
        this.path = path;
        this.nextPoint(path);
    }
};

Unit.prototype.nextPoint = function() {
    var group = Game.map.unitGroups[this.group];
    if (group.length > 1) {
        this.formation(group);
    }
    this.track();
};

Unit.prototype.collisionPath = function(start, end) { // create map whith 
    console.log("collision")

    var tile = Game.map.tileUnit;
    var newEnd = openEnd(Game.map.gridWorld, {
        x: Math.round(end.x / tile),
        y: Math.round(end.y / tile)
    });

    var path = findPath(
            Game.map.gridWorld,
            start,
            {x: newEnd.x * tile, y: newEnd.y * tile},
    tile);

    if (!path) {
        path = [];
    }
    this.setPath(path);

};

function setGroupPath(selected, p) {

    var counterGroup = Game.counter.group++;
    var group = Game.map.unitGroups[counterGroup] = [];
    var path = selected[0].getPath(p);

    // SET GROUP PROPERTIES
    for (var i = 0; i < selected.length; i++) {
        selected[i].removeGroup();
        group.push(selected[i].id);
        selected[i].group = counterGroup;
        selected[i].groupGoal = path[path.length - 1];
    }

    // MANAGE PATHFINDER CALCULATION GROUPS
    var paths = [];

    var obj = {};
    obj.pos = selected[0].groupPosition;
    obj.path = path;
    selected[0].setPath(obj.path);
    paths.push(obj);

    // SET GROUP PATHS
    var newPath, found;
    for (var i = 1; i < selected.length; i++) {

        found = false;
        for (var j = 0; j < paths.length; j++) {
            var obj = paths[j];
            if (obj.pos && obj.pos == selected[i].groupPosition) {
                newPath = objectsArrayClone(obj.path);
                selected[i].setPath(newPath);
                found = true;
            }
        }

        if (!found) { // make new path in group
            var obj = {};
            obj.path = selected[i].getPath(p);
            obj.pos = selected[i].groupPosition;
            paths.push(obj);
            selected[i].setPath(obj.path);
        }
    }
}
