//pc_mouseEvents

function mouseLeftDown(x, y) {

    var p1, p2, p3, p4;
    p1 = getFloorPoint(x, y);
    if (!p1) {
        return;
    }
    
    var selectLine = Game.model.geometries.selectLine;
    Game.scene.remove(Game.selectLine); //hack to avoid permanent selectLines
    Game.selectLine = selectLine(p1);
    Game.scene.add(Game.selectLine);

    document.addEventListener('mousemove', mouseLeftMove, false);

    function mouseLeftMove(e) {
        document.addEventListener('mouseup', mouseLeftUp, false);
        var endX = e.clientX;
        var endY = e.clientY;

        p2 = getFloorPoint(endX, y);
        p3 = getFloorPoint(endX, endY);
        p4 = getFloorPoint(x, endY);
        
        var g = new THREE.Geometry();
        if (p2 && p3 && p4) {
            g = drawRectangle(g, p1, p2, p3, p4);
        }
        g.computeLineDistances();
    }

    function mouseLeftUp(e) {
        document.removeEventListener('mousemove', mouseLeftMove, false);
        document.removeEventListener('mouseup', mouseLeftUp, false);

        Game.user.select = [];
        Game.scene.remove(Game.selectLine);

        var units = Game.user.units;
        for (var i = 0; i < units.length; i++) {
            units[i].model.remove(units[i].selected); //remove from object
            delete units[i].selected; //remove from scene
            if (isPointInPoly([p1, p2, p3, p4], units[i].model.position)) {
                Game.user.selectUnit(units[i]);
            }
        }
    }
}

function isPointInPoly(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                && (c = !c);
    return c;
}

function mouseRightDown(x, y) {
    document.addEventListener('mousemove', onRightMouseMove, false);
    document.addEventListener('mouseup', onRightMouseUp, false);

    function onRightMouseMove(ev) {

        if (Math.abs(ev.screenX - x) + Math.abs(ev.screenY - y) > 100) {
            document.removeEventListener('mousemove', onRightMouseMove, false);
            document.removeEventListener('mouseup', onRightMouseUp, false);
        }
    }
    function onRightMouseUp(e) {
        document.removeEventListener('mouseup', onRightMouseUp, false);

        var selected = Game.user.select;
        if (selected.length > 0) { // IF ARE UNITS SELECTED
            
            var p;
            var building = getSceneBuilding(e.clientX, e.clientY);
            
            if (building) {
                        //.
                p = building.position;

            } else {
                p = getFloorPoint(e.clientX, e.clientY);
            }

            setGroupPath(selected, p); //unit_path
        }
    }
}
