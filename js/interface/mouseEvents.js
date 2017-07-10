// js/interface/mouseEvents

Game.events = {
    line: null,
    screenX: null,
    screenY: null,
    p1: null,
    p2: null,
    p3: null,
    p4: null,
    moved: false
    ,
    selectDown: function () {
        console.log("selectDown");
        var ev = Game.events;
        $(document).bind('vmousemove', ev.selectMove);
        $(document).bind('vmouseup', ev.selectUp);

        ev.p1 = getFloorPoint(ev.screenX, ev.screenY);
        if (!ev.p1) {
            return;
        }

        if (ev.line) {
            Game.model.geometries.remove(ev.line); //hack to avoid permanent selectLines bugs
        }
        ev.line = new Game.model.geometries.selectLine(ev.p1, ev.p2, ev.p3, ev.p3);

        for (var i = 0; i < Game.user.select.length; i++) {
            var elem = Game.user.select[i];
            elem.model.remove(elem.selected); //remove from scene
            Game.user.select[i].selected = null; //remove object
        }
    }
    ,
    selectMove: function (e) {
        console.log("selectMove");
        var ev = Game.events;
        ev.moved = true;

        var endX = e.clientX;
        var endY = e.clientY;

        ev.p2 = getFloorPoint(endX, ev.screenY);
        ev.p3 = getFloorPoint(endX, endY);
        ev.p4 = getFloorPoint(ev.screenX, endY);

        if (ev.p2 && ev.p3 && ev.p4) {
            ev.line.g = drawRectangle(ev.line.g, ev.p1, ev.p2, ev.p3, ev.p4);
        }
    }
    ,
    selectMovedUp: function (e) {
        $(document).unbind('vmouseup', Game.events.selectMovedUp);
        console.log("selectMovedUp");
        var ev = Game.events;
        Game.user.select = [];
        Game.model.geometries.remove(ev.line);

        var units = Game.user.units;
        var selectedUnit = false;

        for (var id in units) {
            if (ev.isPointInPoly([ev.p1, ev.p2, ev.p3, ev.p4], units[id].model.position)) {
                selectedUnit = true;
                Game.user.selectUnit(units[id]);
            }
        }
        if (!selectedUnit) {
            var buildings = Game.user.buildings;
            for (var id in buildings) {
                if (ev.isPointInPoly([ev.p1, ev.p2, ev.p3, ev.p4], buildings[id].model.position)) {
                    Game.user.selectBuilding(id);
                    break;
                }
            }
        }
    }
    ,
    selectUp: function (e) {
        $(document).unbind('vmousemove', Game.events.selectMove);
        $(document).unbind('vmouseup', Game.events.selectUp);
        console.log("selectUp");
        $("#icons").html("");

        var ev = Game.events;
        if (ev.moved) {
            ev.moved = false;
            ev.selectMovedUp();
        } else {
            var building = getSceneBuilding(e.clientX, e.clientY);
            if (building) {
                Game.user.selectBuilding(building.id);
            }
        }
    }
//    ,
//    targetDown: function () {
//        $(document).on('vmousemove', Game.events.targetMove);
//        $(document).on('vmouseup', Game.events.targetUp);
//        console.log("targetDown");        
//    }
//    ,
//    targetMove: function (e) {
//        console.log("targetMove");
//        var ev = Game.events;
//        ev.moved = true;
//        if (Math.abs(e.screenX - ev.screenX) + Math.abs(e.screenY - ev.screenY) > 100) {
//            console.log("unbind");
//            $(document).unbind('vmousemove', ev.targetMove);
//            $(document).unbind('vmouseup', ev.targetUp);
//        }
//    }
    ,
    targetUp: function (e) {
        $(document).unbind('vmouseup', Game.events.targetUp);
        console.log("targetUp");

        var selected = Game.user.select;
        if (selected.length > 0 && "unit" == selected[0].type) { // IF ARE UNITS SELECTED
            var p;
            var building = getSceneBuilding(e.clientX, e.clientY);

            if (building) {
                p = building.position;
            } else {
                p = getFloorPoint(e.clientX, e.clientY);
            }

            setGroupPath(selected, p); //unit_path
        }
    }
    ,
    isPointInPoly: function (poly, pt) {
        for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                    && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                    && (c = !c);
        return c;
    }
    ,
    mouseLeftDown: function () {

    }
    ,
    mouseRightDown: function () {

    }
};
