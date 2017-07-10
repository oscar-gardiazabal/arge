
<?php
session_start();
if ($_SESSION['username'] != "admin") {
    header("Location: ./");
}
?>

<!doctype html>
<html lang="en">

    <head>
        <meta charset="utf-8">
        <script src="js/jquery/jquery-1.9.1.js"></script>
    </head>

    <body>
        <a id="restartDB" style="cursor:pointer">restart DB</a>
    </body>

    <script>

    $("#restartDB").click(function() {
        $.ajax({
            type: "POST",
            url: "server/adm/restartDB.php",
            success: function(msg) {
                console.log(msg);
            }
        });
    });

    </script>

</html>


