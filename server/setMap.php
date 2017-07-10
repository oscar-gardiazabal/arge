<?php

define('IN_ARGE', true);

$name = $_POST['name'];
$map = $_POST['map'];
$public = $_POST['public'];

$str;
$user_id = "NULL";
include 'DB/DB.php';

if ($public == 'false') {
    $GLOBALS['str'] = "PRIVATE ";
} else {
    $GLOBALS['str'] = "PUBLIC ";
}

try {
    $result = $pdo->prepare("INSERT INTO maps (user_id, name, map) VALUES (:user_id, :name, :map)");
    $result->execute(array('user_id' => $user_id, 'name' => $name, 'map' => $map));
} catch (Exception $e) {
     die("ERROR: couldn't connect: " . print_r($e->getMessage()));
}

if (!$result) {
    echo response(false, "invalid data. map name repeated?");
    return;
}

echo response(true, $str . "map succesfully saved");
