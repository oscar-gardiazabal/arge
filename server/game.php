<?php

$ip = $_SERVER['REMOTE_ADDR'];
include_once 'DB.php';

//PING resquest
if (empty(file_get_contents("php://input"))) {
    $res = petition("SELECT reply FROM players WHERE ip = '$ip'");
    if (count($res) > 0) {
        $reply = $res[0]->reply; //if own ip not exists yet
        echo $reply;
        sql("UPDATE players SET reply = '' WHERE ip = '$ip'");
    }
    return;
    //Normal request
} else {
    include_once 'DB_request.php';
    include_once 'DB_response.php';
    include_once 'DB_requestAdmin.php';
    $obj = json_decode(file_get_contents("php://input"));
    if (is_object($obj) && $obj->action) {
        $action = $obj->action;
        $action($obj, $ip);
    }
}
