CREATE TABLE IF NOT EXISTS users(
    id int(11) unsigned NOT NULL auto_increment,
    name varchar(255) NOT NULL,
    pass varchar(255) NOT NULL,
    PRIMARY KEY (id)
)

