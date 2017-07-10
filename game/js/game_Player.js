
function Player(team, name) {
    this.id = counterId("player");
    this.team = team;
    this.name = name;
    this.select = [];
    this.groups = []; //units and path

    this.units = {};
    this.buildings = {};
};

Player.prototype.selectUnit = function(unit) {//draw circle
    this.select.push(unit);
    var circle = Game.model.geometries.circle(6, "green");
    circle.position.z = 0.1;
    unit.selected = circle; //add object
    unit.model.add(circle); //add mesh
};

Player.prototype.selectBuilding = function(id) {//draw circle
    console.log("id = ")
    console.log(id)
    var building = Game.user.buildings[id];
    this.select = [building];    
    var circle = Game.model.geometries.circle(30, "green");
    circle.position.z = 0.1;
    building.selected = circle; //add object
    building.model.add(circle); //add mesh
    building.userSelect();
};

function counterId(element) {
    return Game.counter[element]++;
}
