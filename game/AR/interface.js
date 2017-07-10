
// MESSAGES
function ad(message) {
    var div = $("<div>");
    div.addClass("ad");
    div.append(message);
    closeMessage(div);
}

function error(message) {
    var div = $("<div>");
    div.addClass("error");
    div.append(message);
    closeMessage(div);
}

function closeMessage(div) {
    div.addClass("message");
    $("body").append(div);

    setTimeout(function() {
        div.addClass("messageClose");
        setTimeout(function() {
//            div.remove();
        }, 2000);
    }, 1500);
}

//FINDER
$("#G_finder").draggable({
    handle: "#G_find"
});

$("#G_finderButton").click(function() {
    $("#G_finder").css("display", "inherit");
});

$("#G_findPlus").click(function() {
    var selection = $("#G_find .G_selection")[0];
    $(selection).clone().appendTo("#G_selectors");
});

$("#G_closeFinder").click(function() {
    $("#G_finder").css("display", "none");
    var select = $($(".G_selecion")[0]).clone();
    $(".G_selecion").remove();
    $("#G_selectors").append(select);
});

$("#G_minFinder").click(function() {
    $("#G_finder").css("display", "none");
});

// FORM GET
function httpGet(url, data){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(data);
    return xmlHttp.responseText;
}

// other functions
function objectsArrayClone(array) {
    return $.map(array, function(obj) {
        return $.extend(true, {}, obj);
    });
}