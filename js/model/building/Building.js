
function Building(Player, p) {
    this.type = "building";
    this.Player = Player;
    this.x = p.x, this.y = p.y;

    this.time = 0;
    this.generateTimeout = 10;

    this.model = cubeBuilding();
    this.id = this.model.id;
    var tile = Game.map.tileWorld;
    var odd = this.size % 2 ? 0 : tile / 2; // replace if is par
    this.model.position.x = this.x * tile + odd;
    this.model.position.y = this.y * tile + odd;
    Game.addToScene(this.model);

    this.size = 2;
    this.fillMap(this.id, this.size);

    Game.model.building.array.push(this.model);
    Player.buildings[this.id] = this;

//    updateMaps(); //update units grid, etc
}

Building.prototype.action = function (delta) {
    this.time += delta;

    if (this.time > this.generateTimeout) {
        this.generate();
        this.time -= this.generateTimeout;
    }
};

Building.prototype.generate = function () {
//    var p = worldPosition(this.model.position);
//    new Unit(this.Player, p);
};

Building.prototype.fillMap = function (id, width) {
    var array = getSquareInMatrix({x: this.x, y: this.y}, width); //math_2D    
    var p;
    for (var i = 0; i < array.length; i++) {
        p = array[i];
        var obj = [];
        obj.code = Game.map.code.building;
        obj.id = id;
        Game.map.updateCell([p.x, p.y], obj.code);
    }
};
