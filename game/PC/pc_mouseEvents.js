// game/PC/pc_mouseEvents

Game.events.mouseLeftDown = function (x, y) {
    document.addEventListener('mousemove', selectMove, false);
    document.addEventListener('mouseup', selectUp, false);

    Game.selecion.screenX = x;
    Game.selecion.screenY = y;
    selectDown();
};

Game.events.mouseRightDown = function (x, y) {
    document.addEventListener('mousemove', targetMove, false);
    document.addEventListener('mouseup', targetUp, false);

    Game.selecion.screenX = x;
    Game.selecion.screenY = y;
    targetDown();
};
