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
$description = isset($_POST["description"]) ? $_POST["description"] : null;
$shop = isset($_POST["shop"]) ? $_POST["shop"] : "NONE";
$campaign = isset($_POST["campaign"]) ? $_POST["campaign"] : "NONE";

if (!isset($name)) {
  send_response("error", "No name specified. (string)");
  exit(0);
}

if (!isset($description)) {
  send_response("error", "No description specified. (string)");
  exit(0);
}

if (isset($_POST["unencoded"]) && $_POST["unencoded"]) {
  $name = $name;
  $description = $description;
  $shop = $shop;
  $campaign = $campaign;
} else {
  $name = base64_decode(urldecode($name));
  $description = base64_decode(urldecode($description));
  $shop = base64_decode(urldecode($shop));
  $campaign = base64_decode(urldecode($campaign));
}

function insert_data () {
  global $data, $sql, $name, $description, $errors, $paths, $images, $shop, $campaign;
  
  $name = str_replace(' ', '-', $name);
  $name = preg_replace('/[^A-Za-z0-9\-]/', '', $name);
  $name = str_replace('-', ' ', $name);
  $name = rtrim($name);
  
  $existing_account = $sql->get_sql_data("accounts", "WHERE name='".$name."';");

  if (sizeOf($existing_account) > 0) {
    send_response("path", $name);
  } else {
    $sql->insert_sql_data("accounts", array(
      "name" => $name,
      "description" => $description,
      "shop" => $shop,
      "campaign" => $campaign,
    ));

    $cache_path = $paths->dir_cache_account_images . $name;
    if (!file_exists($cache_path)) {
      mkdir($cache_path, 0777, true);
    }

    copy(
      $paths->dir_resource_img . $images->default_account_thumbnail, 
      $cache_path . "/account.png"
    );

    send_response("path", $name);
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
