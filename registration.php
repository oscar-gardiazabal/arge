<?php
define('IN_ARGE', true);

if (strtoupper($_SERVER['REQUEST_METHOD']) == 'POST') {

    include 'server/DB/DB.php';

    $name = $_POST['name'];
    $pass1 = $_POST['pass1'];
    $pass2 = $_POST['pass2'];

    $sql = "SELECT * FROM users WHERE name = :name";
    $result = petition($sql, array('name' => $name));

    if ($result || $name === "admin") {
        echo response(false, "user name in use");
        $str = "user name '$name' already in use";
        header("Location: registration.php?error=$str");
        return;
    }

    if ($pass1 === $pass2) {
        $hash = password_hash($pass1, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (name, pass) VALUES ('" . $name . "','" . $hash . "')";
        petition($sql);

        $_SESSION['user'] = $name;
        header("Location: ./");
    } else {
        $str = "passwords doesn't match";
        header("Location: registration.php?error=$str");
        return;
    }
    
} else {
    if (isset($_SESSION['user'])) {
        $_SESSION['user'] = $name;
        header("Location: ./");
        return;
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
        <div class="error" style="color: red">
            <?php
            if (isset($_GET['error'])) {
                echo $_GET['error'];
            }
            ?>
        </div>

        <form method="post" action="registration.php">
            <!– in this example I link it with login.php to check the password & username–>

            <table>
                <tr>
                    <td>Username:</td><td><input type="text" name="name"></td>
                </tr>
                <tr>
                    <td>Password:</td><td><input type="password" name="pass1"></td>
                </tr>
                <tr>
                    <td>Password:</td><td><input type="password" name="pass2"></td>
                </tr>
                <tr>
                    <td><input type="submit" name="login" value="Registration"></td>
                </tr>
            </table>
        </form>
    </center>

</body>
</html>
