<?php

define('IN_ARGE', true);

if (isset($_POST['action']) && !empty($_POST['action'])) { //ACTION SWITCH
    $action = $_POST['action'];
    switch ($action) {
        case 'setUnit' : pub();
            break;
    }
} else {
    echo response(false, "no action found");
    return;
}

$user_id = "NULL";
include 'DB/DB.php';

function setUnit() {
    $name = $_POST['name'];
    $map = $_POST['map'];
    $public = $_POST['public'];

    $str = "INSERT INTO units (user_id, name, json) VALUES (:user_id, :name, :json)";
    $values = array('user_id' => $user_id, 'name' => $name, 'json' => $json);
}

$result = petition($str, $values);

if (!$result) {
    echo response(false, "invalid data. map name repeated?");
    return;
}

echo response(true, $echo . "map succesfully saved");
