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
$modules= isset($_POST["modules"]) ? $_POST["modules"] : null;
$module_settings = isset($_POST["module_settings"]) ? $_POST["module_settings"] : null;

if (!isset($account)) {
  send_response("error", "No account name specified. (string)");
  exit(0);
}

if (!isset($modules)) {
  send_response("error", "No modules specified. (string)");
  exit(0);
}

if (!isset($module_settings)) {
  send_response("error", "No settings specified. (string)");
  exit(0);
}

if (isset($_POST["unencoded"]) && $_POST["unencoded"]) {
  $account = $account;
} else {
  $account = base64_decode(urldecode($account));
}

function insert_data () {
  global $data, $sql, $account, $modules, $module_settings, $paths, $images;
  
  $existing_account = $sql->get_sql_data("account_settings", "WHERE name='".$account."';");

  if (sizeOf($existing_account) > 0) {
    $sql->update_sql_data("account_settings", "name", $account, array(
      "modules" => $modules,
      "module_settings" => $module_settings
    ));
  } else {
    $sql->insert_sql_data("account_settings", array(
      "name" => $account,
      "modules" => $modules,
      "module_settings" => $module_settings
    ));
  }

  $module_image_cache = $paths->dir_cache_account_images . $account . "/";
  if (is_dir($module_image_cache)) {
    $dir = new DirectoryIterator($module_image_cache);
            
    foreach ($dir as $fileinfo) {
      $fileName = $fileinfo->getFilename();
      if (strpos($fileName, "-cache")) {
        copy($module_image_cache . $fileName, $module_image_cache . str_replace("-cache", "", $fileName));
      }
    }
  }

  $module_file_cache = $paths->dir_cache_account_files . $account . "/";
  if (is_dir($module_file_cache)) {
    $dir = new DirectoryIterator($module_file_cache);
            
    foreach ($dir as $fileinfo) {
      $fileName = $fileinfo->getFilename();
      if (strpos($fileName, "-cache")) {
        copy($module_file_cache . $fileName, $module_file_cache . str_replace("-cache", "", $fileName));
      }
    }
  }

  send_response("success", "updated database with new values for " . $account);
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
