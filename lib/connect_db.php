<?php

$sql = new Sql();

$sql->host = '127.0.0.1';
$sql->db_name = 'key_accounts';
$sql->username = 'account_name_here';
$sql->pwd = 'password_here';

$sql->db = new mysqli($sql->host, $sql->username, $sql->pwd, $sql->db_name);

if ($sql->db->connect_errno) {
  $errors->add_error("Failed to connect to MySQL: (" . $sql->db->connect_errno . ") " . $sql->db->connect_error);
  echo "Failed to connect to MySQL: (" . $sql->db->connect_errno . ") " . $sql->db->connect_error;
} else {
  $sql->connected = true;
}
