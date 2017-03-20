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
$image = isset($_POST["image"]) ? $_POST["image"] : null;
$fileName = isset($_POST["fileName"]) ? $_POST["fileName"] : null;

if (!isset($account)) {
  send_response("error", "No account name specified. (string)");
  exit(0);
}

if (!isset($fileName)) {
  send_response("error", "No fileName specified. (string)");
  exit(0);
}

if (!isset($image)) {
  send_response("error", "No image sent. (base64 encoded image)");
  exit(0);
}

if (isset($_POST["unencoded"]) && $_POST["unencoded"]) {
  $account = $account;
  $fileName = $fileName;
  $image = $image ;
} else {
  $account = base64_decode(urldecode($account));
  $fileName = base64_decode(urldecode($fileName));
  $image = base64_decode(urldecode($image));
}

function insert_data () {
  global $data, $account, $image, $fileName, $paths;

  $image = str_replace('data:image/png;base64,', '', $image);
  $image = str_replace('data:image/jpg;base64,', '', $image);
  $image = str_replace('data:image/jpeg;base64,', '', $image);
  $image = str_replace(' ', '+', $image);
  $data = base64_decode($image);
 
  $imagePath = $paths->dir_cache_account_images . $account . "/" . $fileName;
  $result = file_put_contents($imagePath, $data);

  if ($result > 0) {
    send_response("path", $imagePath);
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
