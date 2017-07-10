//fill in

var mapOptions = ["mapName", "userName", "mapSize"];

for (var i = 0; i < mapOptions.length; i++) {
    var mapOption = mapOptions[i];
    var option = $("<option>");
    option.text(mapOption);
    option.val(mapOption);
    $("#G_findSelect").append(option);
}

//DOM sizes
if (!user) {
    $(".G_session").css("display", "none");
}

// buttons
$("#G_statsBorder").click(function() {
    $("#G_stats").toggleClass("close");
});

// responsive
$("#map_resize").change(function() {
    resizeMapCreator($("#map_resize").val());
});

// ajax
$("#map_save").click(function() {
    var name = $("#map_name").val();
    var public = $("#map_public").is(":checked");
    if (name) {
        ajax.setMap(name, public);
    } else {
        alert("put some name");
    }
});

$("#map_load").click(function() {
    var map = maps[$("#map_select").val()]
    loadSavedMap(map);
});

function loadSavedMap(map) {
    Game.map.world = map;
    resizeMapCreator(Game.map.world.length);
}

var loadedMaps = [];
getPrivateMaps();
function getPrivateMaps() {
    ajax.getPrivateMaps(function(selectMaps) {
        if (selectMaps) {
            addOptionsMap(selectMaps);
        }
    });
}

function addOptionsMap(selectMaps) {
    $('#map_select').empty();
    for (var i = 0; i < selectMaps.length; i++) {
        var map = selectMaps[i];
        loadedMaps[map.id] = JSON.parse(map.map);

        var option = $("<option>");
        option.val(map.id);
        option.text(map.name);
        $("#map_select").append(option);
    }
}


// FINDER
$("#G_findButton").click(function() {
    var data = {};
    var selections = $(".G_selection");
    for (var i = 0; i < selections.length; i++) {
        var selection = selections[i];
        data[$(selection).find(".G_findSelect").val()] = $(selection).find("input").val();
    }
    ajax.getPublicMaps(data, function(maps) {
        if (maps) {
            $(".map_result").remove();
            showPublicMaps(maps);
        }
    });
});

function showPublicMaps(maps) {
    for (var i = 0; i < maps.length; i++) {
        var map = maps[i];
        loadedMaps[map.id] = map;

        var div = $("<div>");
        div.attr("id", map.id);
        div.addClass("map_result");
        mapResultEvents(div);

        var content = $("<div>");
        content.append(map.name);
        div.append(content);

        var canvas = drawCanvasMap(map.map);
        div.append(canvas);
        $(canvas).addClass("mapCanvas");
        $("#G_findResults").append(div);
    }
}

function mapResultEvents(div) {
    div.click(function() {
        $("#G_finder").css("display", "none");
        var map = loadedMaps[this.id].map;
        loadSavedMap(JSON.parse(map));
    });
}
