<?php

if (!defined('IN_ARGE')) {
    exit;
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=arge', "root", "rojomo123");
} catch (PDOException $e) {
    echo "Error!: " . $e->getMessage() . "<br/>";
    die();
}

function petition($str, $values) {
    try {
        global $pdo;
        $result = $pdo->prepare(sprintf($str));
        $stmt = $result->execute($values);
        if (!$stmt) {
            echo "\n PDO::errorInfo(): \n";
            print_r($result->errorInfo());
            echo " in: " . $str;
            exit;
        }

        $array = array();
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            array_push($array, $row);
        }

        return $array;
    } catch (Exception $e) {
        echo "error";
//        die("ERROR: couldn't connect: " . print_r($e->getMessage()));
    }
}

function response($success, $str) {
    if ($success) {
        return '{"success":"' . $str . '"}';
    } else {
        return '{"error":"' . $str . '"}';
    }
}

// SQL FUNCTIONS
$count = 0;

function addWHERE($name, $value) {
    if (!empty($value)) {
        global $str, $values, $count;
        if ($count > 0) {
            $str .= "AND ";
        }
        $str .= " WHERE " . $name . " = :" . $name;
        $values[$name] = $value;
        $count++;
    }
}

$user_id;
session_start();
if (isset($_SESSION['user'])) { // AT THE END EVER!
    $GLOBALS['user_id'] = $_SESSION['user'];
} else {
    echo "please login.";
    return;
}
