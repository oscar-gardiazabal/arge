<?php
session_start();
?>

<!doctype html>
<html lang="en">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">             
        <link rel='stylesheet' href='css/scene.css'>

        <!-- jQuery -->
        <script src="js/libraries/jquery/jquery-1.9.1.js"></script>
        <script src="js/libraries/jquery/jquery-ui.js"></script>
        
        <!-- INTERFACE -->
        

        <!-- THREE -->
        <script src="js/libraries/three/Three.js"></script>

        <!--webGL implementation detector-->
        <script src="js/libraries/three/Detector.js"></script>
        <!--<script src="js/libraries/three/Stats.js"></script>-->
<!--        <script src="js/libraries/three/THREEx.FullScreen.js"></script>
        <script src="js/libraries/three/THREEx.WindowResize.js"></script>-->
        <!--info box framerate-->
        <!--<script src="js/libraries/three/info.js"></script>--> 

        <!--AugmentedReality-->
        <script src="js/AR/jsartoolkit/threex.jsartoolkit_old.js"></script>
        <script src="js/AR/jsartoolkit/threex.jsartoolkit_plugin.js"></script>
        <!--<script src="js/AR/threex.jsartoolkit_mod.js"></script>-->
        <script src="js/AR/board.js"></script>

        <!--custom-->
        <script src="js/AR/getUserMedia.js"></script>
        <script src="js/interface/interface.js"></script>
        <script src="js/interface/ajax.js"></script>

        <script>

            var pages = {
                "": {
                    url: "/menu.html"
                },
                "#AR": {
                    url: "/game/AR/arGame.html",
                    name: "AR demo",
                    desc: ""
                },
                "#PC": {
                    url: "/game/PC/pcGame.html",
                    name: "PC Demo",
                    desc: "for testing"
                },
                "#unit": {
                    url: "/makers/unitMaker/unitMaker.html",
                    name: "Unit creator",
                    desc: ""
                },
                "#build": {
                    url: "/makers/buildingMaker/buildingMaker.html",
                    name: "Building creator",
                    desc: ""
                },
                "#map": {
                    url: "/makers/mapMaker/mapMaker.html",
                    name: "Map creator",
                    desc: ""
                }
            };

            function windowLoad() {
                var url = window.location.href;
                var parts = url.split("/");

                var i = parts.length - 1;
                var last = parts[i];
                var dir = parts.splice(0, i).join("/");

                try {
                    $("#body").load(dir + pages[last].url);
                } catch (e) {
                    window.location.href = dir;
                }
            }

            window.onload = windowLoad;
            window.onhashchange = windowLoad;

        </script>

        <meta http-equiv="cache-control" content="no-cache">
        <meta http-equiv="pragma" content="no-cache">
    </head>

    <body>

        <div id="header">
            <div>
                <a style="float:left" href="./">< back </a>

                <span style="margin-left: 20px;"><b>ARGE</b> (augmented reality game editor)</span>

                <div id="user">
                    <span></span>
                    <a style="padding-left: 10px; font-size: 13px;">

                    </a>
                </div>
            </div>
        </div>

        <div id="body">
        </div>

        <div id="G_finder">
            <div id="G_closeFinder" class="G_letterButton">x</div>
            <div id="G_minFinder" class="G_letterButton">-</div>
            <div id="G_find">
                <span style="font-size: 14px; margin-left: 5px;">find by:</span>  
                <span id="G_selectors">
                    <span class="G_selection">
                        <select class="G_findSelect"></select>
                        <input type="text" placeholder="value"/>
                    </span>
                </span>
                <span id="G_findPlus" class="link">+</span>
                <input id="G_findButton" type="button" value="find"/>
            </div>
            <div id="G_findResults"></div>
        </div>

    </body>

    <script>
        var user =
<?php
if (isset($_SESSION['username'])) {
    echo "'" . $_SESSION['username'] . "';";
} else {
    echo "false;";
}
?>

        function logout() {
            var form = $("<form>");
            form.attr("action", "logout.php");
            form.attr("method", "post");
            var input = $("<input>");
            input.attr("name", "action");
            input.attr("value", "logout");
            form.submit();
        }

        if (user) {
            $("#user span").text(user);
            $("#user a").attr("onclick", "logout()");
            $("#user a").text("logout");
        } else {
            $("#user a").attr("href", "login.php");
            $("#user a").text("login");
        }

        var SCREEN_WIDTH, SCREEN_HEIGHT, BODY_HEIGHT;
        $(document).ready(function() {
            SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
            BODY_HEIGHT = SCREEN_HEIGHT - $("#header").outerHeight();
            $("#body").height(BODY_HEIGHT); // over renderer
            $("#G_finder").css("margin-top", $("#header").outerHeight());
            $("#G_finder").height(BODY_HEIGHT * 0.9);
            
            SCREEN_WIDTH = 640;
            SCREEN_HEIGHT = 480;
        });

    </script>

</html>
