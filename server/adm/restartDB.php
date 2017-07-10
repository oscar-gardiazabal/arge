<?php

define('IN_ARGE', true);
include '../DB/DB.php';
include '../DB/tables.php';

function updateDB() {
    global $sqls;
    for ($i = 0; $i < count($sqls); $i++) {
        $sql = $sqls[$i];

        $str = "CREATE TABLE IF NOT EXISTS $sql->tableName (";
        foreach ($sql->obj as $key => $value) {
            $str .= $key . " " . $value . ", ";
        }
        $str .= " PRIMARY KEY ($sql->primary) )";
        petition($str, array());

        $str = "SHOW COLUMNS FROM $sql->tableName";
        $columns = petition($str, array());

        foreach ($sql->obj as $key => $value) {
            if ($key !== $sql->primary) {

                $str = "SHOW COLUMNS FROM $sql->tableName LIKE :key";
                $exists = petition($str, array('key' => $key));

                $str = "ALTER TABLE $sql->tableName ";
                if (!$exists) {
                    $str .= " ADD ";
                } else {
                    $str .= " MODIFY COLUMN ";
                }

                $str .= "$key $value";
                petition($str, array());
            }
        }

        for ($j = 0; $j < count($columns); $j++) {
            $columnName = $columns[$j]['Field'];
            if (!property_exists($sql->obj, $columnName)) {
                $str = "ALTER TABLE $sql->tableName DROP COLUMN $columnName";
                petition($str, array());
            }
        }
    }
}

if ($_SESSION['username'] === 'admin') {
    updateDB();
}

echo ". Done";
