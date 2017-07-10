//units_actions

$(".stats").click(function() {
    var units = Game.model.unit.mapUnits;
    for (var i = 0; i < units.length; i++) {
        units[i].regAtack = 0;
    }
});

Unit.prototype.action = function(delta) {
    this.delta = delta;
    if (this.regAtack < 0.6) {
        this.hit();

    } else {
        if (this.path.length > 0) {
            this.move();

        } else {
            if (this.isEnemyClose()) {
                console.log("isEnemyClose")
                this.atack();

            } else {
                this.idle();
            }
        }
    }
};

Unit.prototype.isEnemyClose = function() {
    var tile = Game.map.tileWorld / Game.map.smallTile;
    var x = Math.round(this.model.position.x / tile), y = Math.round(this.model.position.y / tile);

    var playersId = [];
    for (var i = 0; i < Game.players; i++) {
        if (Game.players[i].id != Game.user.id) {
            playersId.push(Game.players[i].id);
        }
    }
//    var unit = searchCircleInMatrix(Game.map.unitsWorld, {x: x, y: y}, this.visualField, playersId);
    var unit = searchCircleInMatrix(Game.map.gridWorld, {x: x, y: y}, 50, playersId);
//    console.log("unit un unit actions = ")
//    console.log(unit)

    if (unit) {
        console.log("unit target!")
        this.target = unit;
        return true;
    } else {
        return false; //TODO
    }
};

Unit.prototype.idle = function() {
    var angle = this.angle += this.delta * 3;
    this.animationReset();

    this.parts.armR.rotation.z = Math.cos(angle / 2) * 0.1;
    this.parts.armL.rotation.z = Math.cos(Math.PI / 2 + angle / 1.5) * 0.1;
};

Unit.prototype.move = function() {
//    if (!this.status) {
//        this.nextPoint();
//        this.status = 1;
//        this.animationReset();
//        return;
//    }

    var oldX = this.model.position.x;
    var oldY = this.model.position.y;

    var angle = this.angle += this.delta * 10;

    this.parts.body.position.z = 0.15 * Math.cos(angle * 2);
    this.parts.armR.rotation.x = 0.7 * Math.cos(angle + Math.PI);
    this.parts.armL.rotation.x = 0.4 * Math.cos(angle);
    this.parts.legR.rotation.x = 1 * Math.cos(angle);
    this.parts.legL.rotation.x = 1 * Math.cos(angle + Math.PI);
    var rotBody = 0.1;
    this.parts.chest.rotation.z = Math.cos(Math.PI + angle) * rotBody;
    this.parts.headGroup.rotation.z = Math.cos(angle) * rotBody;

    var vel = this.vel * this.delta * 30;
    this.translate(vel);

    if (this.path.length > 0) { //if collision removed path

        var x = this.path[0].x;
        var y = this.path[0].y;

        if (Math.abs(this.model.position.x - this.path[0].x) < Game.map.tileWorld &&
                Math.abs(this.model.position.y - this.path[0].y) < Game.map.tileWorld) { //comprobation to reduce loop operations

            if (Math.abs(oldX - x) + Math.abs(oldY - y) <
                    Math.abs(this.model.position.x - x) + Math.abs(this.model.position.y - y)) {

                this.path.splice(0, 1);
                if (this.path.length > 0) {
                    this.nextPoint();
                }else {
                  this.groupPosition = this.groupGoal;
                }
            }
        }
    }

    this.updatePosition();
};

Unit.prototype.translate = function(vel) { // move forward
    var units = Game.user.units;

    var unit, dX, dY, absX, absY, ux, uy, displ = 0;
    if (this.path.length > 0) {
        displ = vel;
    }
    
    if(!this.parts.helper){
        console.log("!this.parts.helper");
        console.log(this.parts);
        return false;
    }
    this.parts.helper.translateY(displ);

    this.model.updateMatrixWorld();
    var p = new THREE.Vector3();
    p.setFromMatrixPosition(this.parts.helper.matrixWorld);

    //CHECK-Collision
    var collision = false;
    units = unitsClosePosition(p);

    for (var i = 0; i < units.length; i++) {

        unit = units[i]
        var group = Game.map.unitGroups[this.group];
        if (group.indexOf(unit.id) == -1) {
            dX = p.x - unit.model.position.x;
            dY = p.y - unit.model.position.y;
            if (dX == 0 && dY == 0) {
                dX = Math.random() - 0.5;
                dY = Math.random() - 0.5;
            }
            absX = Math.abs(dX);
            absY = Math.abs(dY);
            if (absX + absY < this.width / 2 + unit.width / 2) {

                if (this.path.length > 0) { //collision response, find alternative path
                    var end = this.path[this.path.length - 1];
                    this.collisionPath(p, end);

                    if (this.path.length > 0) { //collisionPath = 0
                        var oldDist = Math.abs(this.model.position.x - end.x) +
                                Math.abs(this.model.position.y - end.y);
                        var newDist = Math.abs(this.path[this.path.length - 1].x - end.x) +
                                Math.abs(this.path[this.path.length - 1].y - end.y);
                        if (newDist + Game.map.tileUnit > oldDist) {
                            this.path = [];
                        }
                    }
                    break;

                } else { //NOT PATH
                    collision = true;
                    ux = dX / (absX + absY);
                    uy = dY / (absX + absY);
                    this.model.position.x += ux * 3;
                    this.model.position.y += uy * 3;
                    break;
                }
            }
        }
    }

    if (this.path.length > 0) {
        this.model.translateY(displ);
    }
    this.parts.helper.position = new THREE.Vector3(0, 0);
};

function unitsClosePosition(p) {
    var units = [];
    var tile = Game.map.tileWorld / Game.map.smallTile;
    var x = Math.round(p.x / tile) - 1, y = Math.round(p.y / tile) - 1;

    for (var i = x; i < x + 3; i++) {
        for (var j = y; j < y + 3; j++) {

            var grid = Game.map.gridWorld[i][j];
            for (var n = 0; n < grid.length; n++) {
                units.push(grid[n]);
            }
        }
    }

    return units;
}

Unit.prototype.hit = function() {
    var delta = this.regAtack += this.delta;

    if (delta < 0.1) { //atras
        this.parts.armR.rotation.x = delta * 9;
        this.parts.armR.rotation.z = -delta * 2;
        this.parts.chest.rotation.x = +delta * 2;
        return;

    } else if (delta < 0.3) { // empuje
        delta -= 0.1;
        this.parts.armR.rotation.x = 2.9 - delta * 9;
        this.parts.armR.rotation.z = -1 + delta * 2;
        this.parts.chest.rotation.x = 0.3 - delta * 2;
        return;

    } else if (delta < 0.4) { //golpe
        delta -= 0.3;
        this.parts.botArmR.rotation.x = -delta * 16;
        this.parts.weapon.rotation.x = -delta * 16;
        this.parts.armR.rotation.y = delta * 2;
        this.parts.chest.rotation.z = delta * 3;
        return;

    } else if (delta < 0.6) { //retorno
        delta -= 0.4;
        this.parts.botArmR.rotation.x = -1.6 + delta * 8;
        return;
    }


//    //ATACK
////    this.parts.armR.rotation.x = 2 * (Math.cos(regAtack * 1.5 + Math.PI));
//    if (regAtack < 0.3) {
//        this.parts.armR.rotation.x = 9.5 - Math.pow(regAtack, 3) * 100;
//        this.parts.armR.rotation.y = -1 + (regAtack * 4);
//    }
////    this.parts.armR.rotation.z = Math.cos(regAtack * 4 + 15.1);
////this.parts.botArmR.rotation.x = 0.6;
//    var giro = 0.6 - (regAtack - 0.2) * 1000;
//
//    if (regAtack > 0.2 && regAtack < 0.4) {
//        this.parts.botArmR.rotation.x = giro;
//        this.parts.weapon.rotation.x = -regAtack * 2;
//        this.parts.body.rotation.x = 0.3 - regAtack * 2;
//        this.parts.body.rotation.z = -0.3 + regAtack * 2;
//
//    } else {
//        this.parts.botArmR.rotation.x = -0.9;
//        this.parts.weapon.rotation.x = -0.7;
//    }
//    this.parts.legR.rotation.x = 0.3;
//    this.parts.legL.rotation.x = -0.1;
};

Unit.prototype.atack = function() {
    var dist = Math.sqrt(
            Math.pow(this.target.position.x - this.position.x, 2) +
            Math.pow(this.target.position.y - this.position.y, 2)
            );
    if (dist < this.range) {
        this.hit();
    } else {
        this.goal = this.target.position;
        this.move();
    }
};

Unit.prototype.animationReset = function() {
    this.parts.armR.rotation.x = 0;
    this.parts.armR.rotation.z = 0;
    this.parts.armR.rotation.y = 0;
    this.parts.botArmR.rotation.x = 0;
    this.parts.weapon.rotation.x = 0.5;
    this.parts.body.rotation.x = 0;
    this.parts.body.rotation.z = 0;
};

Unit.prototype.formation = function(group) {
    var index = group.indexOf(this.id);

    var rel = 3;
    var rows = Math.ceil((group.length - 1) / rel); //y
    var cols = Math.ceil(group.length / rows); //x
    var neg = (cols - 0.5) / 2;

    var row = Math.floor(index / cols); //y
    var col = index - (row * cols); //x

    var tile = Game.map.tileUnit * 0.9;
    this.path[0].x += ((col - neg) * tile);
    this.path[0].y += (row * tile);

    //if path is illegal
    var x = Math.round(this.path[0].x / Game.map.tileWorld);
    var y = Math.round(this.path[0].y / Game.map.tileWorld);
    if (!isWalkable(Game.map.world[x][y])) {
        console.log("no walkable");
        this.path = findPath(Game.map.world, this.model.position, this.goal); //deprecated!
    }
};

Unit.prototype.track = function() {
    var x = this.model.position.x - this.path[0].x;
    var y = this.model.position.y - this.path[0].y;
    var rotation = Math.atan2(y - 1, x);
    var quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(Game.math.upVector, Game.math.deg45 + rotation);
    this.model.quaternion = quaternion;
};
