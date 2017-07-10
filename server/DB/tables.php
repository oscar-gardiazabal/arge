<?php

$sqls = [];

$objArray = (object) array(
            'id' => 'int(11) unsigned NOT NULL auto_increment',
            'name' => 'varchar(255) NOT NULL',
            'pass' => 'varchar(255) NOT NULL'
);

$obj = (object) array('tableName' => 'users', 'obj' => $objArray, 'primary' => 'id');
array_push($sqls, $obj);

$objArray = (object) array(
            'id' => 'int(11) unsigned NOT NULL auto_increment',
            'user_id' => 'int(11)',
            'name' => 'varchar(255) NOT NULL',
            'map' => 'varchar(255) NOT NULL'
);

$obj = (object) array('tableName' => 'maps', 'obj' => $objArray, 'primary' => 'id');
array_push($sqls, $obj);

$objArray = (object) array(
            'id' => 'int(11) unsigned NOT NULL auto_increment',
            'user_id' => 'int(11)',
            'name' => 'varchar(255) NOT NULL',
            'json' => 'longtext NOT NULL'
);

$obj = (object) array('tableName' => 'units', 'obj' => $objArray, 'primary' => 'id');
array_push($sqls, $obj);
