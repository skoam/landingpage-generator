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

$name = isset($_POST["name"]) ? $_POST["name"] : null;

if (!isset($name)) {
  send_response("error", "No name specified. (string)");
  exit(0);
}

if (isset($_POST["unencoded"]) && $_POST["unencoded"]) {
  $name = $name;
} else {
  $name = base64_decode(urldecode($name));
}

function run () {
  global $sql, $errors, $name, $paths;
  
  $response = $sql->delete_sql_data("accounts", "WHERE name='".$sql->db->real_escape_string($name)."'");

  if ($response == "1") {
    $folder = $paths->dir_cache_account_files . $name;
    if (is_dir($folder)) {
      rename($folder, $folder . "-deleted-" . rand(1000, 9999));
    }

    $folder = $paths->dir_cache_account_images . $name;
    if (is_dir($folder)) {
      rename($folder, $folder . "-deleted-" . rand(1000, 9999));
    }

    $folder = $paths->dir_cache_landingpages . $name;
    if (is_dir($folder)) {
      rename($folder, $folder . "-deleted-" . rand(1000, 9999));
    }

    send_response("success", "Removed account ".$name);
  } else {
    send_response("error", "Error removing an account: ".$errors->get_errors());
  }
}

function init () {
  global $sql;

  if (!isset($sql)) {
    send_response("error", "Not authorized to access database.");
    exit(0);
  }

  if ($sql->connected) {
    run();
  }
}

init();
