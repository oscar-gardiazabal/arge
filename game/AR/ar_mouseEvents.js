// game/AR/ar_mouseEvents

$(document).on("taphold", function () {
    console.log("taphold");
    $(document).unbind('vmouseup', Game.events.targetUp);
    Game.events.selectDown();
});

$(document).on('vmousedown', function (e) {
    console.log("vmousedown = " + e.pageX + "," + e.pageY);
    Game.events.screenX = e.pageX;
    Game.events.screenY = e.pageY;
    $(document).bind('vmousemove', vmousemove);
    $(document).bind('vmouseup', function () {
        $(document).unbind('vmousemove', vmousemove);
    });
    $(document).bind('vmouseup', vmouseup);
});

function vmousemove(e) {
    if (Math.abs(e.screenX - Game.events.screenX) + Math.abs(e.screenY - Game.events.screenY) > 100) {
        console.log("unbind");
        $(document).unbind('vmousemove', vmousemove);
        $(document).unbind('vmouseup', vmouseup);
        $(document).unbind('vmouseup', Game.events.targetUp);
        Game.events.selectDown();
    }
}

function vmouseup(e) {
    $(document).unbind('vmouseup', vmouseup);
    if (Game.user.select.length) {
        Game.events.targetUp(e);
    } else {
        Game.events.selectUp(e);
    }
}