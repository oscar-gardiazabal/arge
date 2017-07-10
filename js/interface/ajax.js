
var ajax = {
    setMap: function(name, public) {
        var dataString =
                "name=" + name
                + "&&map=" + JSON.stringify(Game.map.world)
                + "&&public=" + public;
        $.ajax({
            type: "POST",
            url: "server/setMap.php",
            data: dataString,
            success: function(msg) {
                if (msg) {
                    var obj = JSON.parse(msg);
                    if (obj.success) {
                        ad(obj.success);
                        ajax.getPrivateMaps();
                    } else if (obj.error) {
                        error(obj.error);
                    }
                } else {
                    error("unknown error (no ajax response)");
                }
            }
        });
    },
    getPrivateMaps: function(callback) {
        var data = {action: "private"};
        this.getMaps(data, function(res) {
            callback(res);
        });
    },
    getPublicMaps: function(data, callback) {
        data.action = "public";
        this.getMaps(data, function(res) {
            callback(res);
        });
    },
    getMaps: function(data, callback) {
        $.ajax({
            type: "POST",
            url: "server/getMaps.php",
            data: data,
            success: function(response) {
                var array;
                try {
                    array = JSON.parse(response);
                } catch (e) {
                    alert("can't parse result = " + response);
                }
                callback(array);
            }
        });
    },
    setUnit: function(name, public, json) {
        var dataString =
                "action='setUnit'" +
                "name=" + name
                + "&&json=" + json
                + "&&public=" + public;
        $.ajax({
            type: "POST",
            url: "server/unitAction.php",
            data: dataString,
            success: function(msg) {
                if (msg) {
                    var obj = JSON.parse(msg);
                    if (obj.success) {
                        ad(obj.success);
//                        ajax.getPrivateUnits();
                    } else if (obj.error) {
                        error(obj.error);
                    }
                } else {
                    error("unknown error (no ajax response)");
                }
            }
        });
    },
};
