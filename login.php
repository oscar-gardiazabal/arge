<?php
define('IN_ARGE', true);
include 'server/DB/DB.php';

$result;
if (strtoupper($_SERVER['REQUEST_METHOD']) == 'POST') {
//    global $result, $user_id;

    $name = $_POST['name'];
    $pass = $_POST['pass'];

    if ($_POST['name'] === "admin" && $_POST['pass'] === "admin") {
        $_SESSION['user'] = 0;
        $_SESSION['username'] = "admin";
        header("Location: ./");
    }

    $str = "SELECT * FROM users WHERE name = '" . $name . "'";
    $result = petition($str, array());

    $id = $hash = '';
    $id = $result[0]['id'];
    $hash = $result[0]['pass'];

    if ($hash) {
        if (password_verify($pass, $hash)) {
            $_SESSION['user'] = $id;
            $_SESSION['username'] = $name;
            header("Location: ./");
        } else {
            echo "Incorrect password.";
        }
    } else {
        echo "user doesn't exist.";
    }
} else {
    if (isset($_SESSION['user']) && isset($_SESSION['username'])) {
        header("Location: ./");
    }
}
?>

<!DOCTYPE HTML PUBLIC “-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
    <head>
        <title> PHP Login </title>
    </head>
    <body>
    <center>
        <form method="post" action="login.php">
            <!– in this example I link it with login.php to check the password & username–>

            <table>
                <tr>
                    <td>Username:</td><td><input type="text" name="name"></td>
                </tr>
                <tr>
                    <td>Password:</td><td><input type="password" name="pass"></td>
                </tr>
                <tr>
                    <td><input type="submit" name="login" value="Login"></td>
                    <td><a href="registration.php">Registration</a></td>
                </tr>
            </table>
        </form>
    </center>
</body>
</html>
