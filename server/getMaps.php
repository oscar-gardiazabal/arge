<?php

define('IN_ARGE', true);

$user_id = "NULL";
include 'DB/DB.php';

if (isset($_POST['action']) && !empty($_POST['action'])) { //ACTION SWITCH
    $action = $_POST['action'];
    switch ($action) {
        case 'public' : pub();
            break;
        case 'private' : priv();
            break;
    }
} else {
    echo response(false, "no action found");
    return;
}

$result;
$str;
$values = array();

// ACTION FUNCTIONS
function pub() { //PUBLIC MAPS
    global $result, $pdo, $str, $values;

    $str = "SELECT * FROM maps";

    if (isset($_POST['mapName'])) {
        addWHERE("name", $_POST['mapName']);
    }
    if (isset($_POST['$userName'])) {
        addWHERE("user_id", $_POST['$userName']);
    }
    if (isset($_POST['$mapSize'])) {
        addWHERE("size", $_POST['$mapSize']);
    }

    $result = petition($str, $values);
}

function priv() { //PRIVATE MAPS
    global $result, $pdo, $user_id;
    $result = $pdo->prepare("SELECT * FROM maps WHERE user_id = :user_id");
    $result->execute(array('user_id' => $user_id));
}

echo json_encode($result);
