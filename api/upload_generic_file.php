<?php

include("../lib/common.php");
include("../lib/handle_time.php");
include("../lib/handle_errors.php");
include("../lib/sql_wrapper.php");
include("../lib/connect_db.php");

accept_session_parameter();

if (!verify_session(get_session())) {
  send_response("error", "Could not determine a valid session.");
  exit(0);
}

$account = isset($_POST["account"]) ? $_POST["account"] : null;
$file = isset($_POST["file"]) ? $_POST["file"] : null;
$fileName = isset($_POST["fileName"]) ? $_POST["fileName"] : null;

if (!isset($account)) {
  send_response("error", "No account name specified. (string)");
  exit(0);
}

if (!isset($fileName)) {
  send_response("error", "No fileName specified. (string)");
  exit(0);
}

if (!isset($file)) {
  send_response("error", "No file sent. (base64 encoded file)");
  exit(0);
}

if (isset($_POST["unencoded"]) && $_POST["unencoded"]) {
  $account = $account;
  $fileName = $fileName;
  $file = $file;
} else {
  $account = base64_decode(urldecode($account));
  $fileName = base64_decode(urldecode($fileName));
  $file = base64_decode(urldecode($file));
}

function insert_data () {
  global $data, $account, $file, $fileName, $paths;

  $file = str_replace('data:text/css;base64,', '', $file);
  $file = str_replace(' ', '+', $file);
  $data = base64_decode($file);
 
  $filePath = $paths->dir_cache_account_files . $account . "/";
  if (!is_dir($filePath)) {
    mkdir($filePath, 0777, true);;
  }

  $filePath .= $fileName;

  $result = file_put_contents($filePath, $data);

  if ($result > 0) {
    send_response("path", $filePath);
  } else {
    send_response("error", "There was an error saving your file ".$fileName);
  }
}

function init () {
  global $sql;

  if (!isset($sql)) {
    send_response("error", "Not authorized to access database.");
    exit(0);
  }

  if ($sql->connected) {
    insert_data();
  }
}

init();
