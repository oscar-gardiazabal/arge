//fill in

var unitOptions = ["unitName", "userName", "unitSize"];

for (var i = 0; i < unitOptions.length; i++) {
    var unitOption = unitOptions[i];
    var option = $("<option>");
    option.text(unitOption);
    option.val(unitOption);
    $(".G_findSelect").append(option);
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
$("#unit_resize").change(function() {
    resizeUnitCreator($("#unit_resize").val());
});

// ajax
$("#unit_save").click(function() {
    var name = $("#unit_name").val();
    var public = $("#unit_public").is(":checked");
    var obj = {
        metadata: {generator: arge}
    };
    var json = JSON.stringify(obj);

    if (name && json) {
            ajax.setUnit(name, public, json);
    } else {
        alert("put some name");
    }
});

$("#unit_load").click(function() {
    var unit = units[$("#unit_select").val()]
    loadSavedUnit(unit);
});

function loadSavedUnit(unit) {
    Game.unit.world = unit;
    resizeUnitCreator(Game.unit.world.length);
}

var loadedUnits = [];
getPrivateUnits();
function getPrivateUnits() {
//    ajax.getPrivateUnits(function(selectUnits) {
//        if (selectUnits) {
//            addOptionsUnit(selectUnits);
//        }
//    });
}

function addOptionsUnit(selectUnits) {
    $('#unit_select').empty();
    for (var i = 0; i < selectUnits.length; i++) {
        var unit = selectUnits[i];
        loadedUnits[unit.id] = JSON.parse(unit.unit);

        var option = $("<option>");
        option.val(unit.id);
        option.text(unit.name);
        $("#unit_select").append(option);
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
    ajax.getPublicUnits(data, function(units) {
        if (units) {
            $(".unit_result").remove();
            showPublicUnits(units);
        }
    });
});

function showPublicUnits(units) {
    for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        loadedUnits[unit.id] = unit;

        var div = $("<div>");
        div.attr("id", unit.id);
        div.addClass("unit_result");
        unitResultEvents(div);

        var content = $("<div>");
        content.append(unit.name);
        div.append(content);

        $("#G_findResults").append(div);
    }
}

function unitResultEvents(div) {
    div.click(function() {
        $("#G_finder").css("display", "none");
        var unit = loadedUnits[this.id].unit;
        loadSavedUnit(JSON.parse(unit));
    });
}
