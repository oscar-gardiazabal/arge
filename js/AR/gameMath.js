
function move(delta) {
    var deltaX = point.x - buffalo.position.x;
    var deltaY = point.y - buffalo.position.y;

    if (Math.abs(deltaX + deltaY) < 20) {
        objetivo = false;
    } else {
        buffalo.rotation.y = (Math.atan2(deltaX, deltaY) * 3 / Math.PI);
        buffalo.translateZ(500 * delta);
    }
}
            