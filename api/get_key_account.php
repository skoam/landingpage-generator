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

if (!isset($_POST["name"]) && !isset($_POST["shop"]) && !isset($_POST["campaign"])) {
  send_response("error", "You must specify either a shopID, a campaign (articleID-shopID), or a key account name. (string)");
  exit(0);
}

$name = isset($_POST["name"]) ? $_POST["name"] : "NONE";
$shop = isset($_POST["shop"]) ? $_POST["shop"] : "NONE";
$campaign = isset($_POST["campaign"]) ? $_POST["campaign"] : "NONE";
$full = isset($_POST["full"]) ? $_POST["full"] : "no";

if (isset($_POST["unencoded"]) && $_POST["unencoded"]) {
  $name = $name;
  $shop = $shop;
  $campaign = $campaign;
  $full = $full;
} else {
  $name = base64_decode(urldecode($name));
  $shop = base64_decode(urldecode($shop));
  $campaign = base64_decode(urldecode($campaign));
  $full = base64_decode(urldecode($full));
}

function insert_data () {
  global $data, $sql, $name, $errors, $paths, $images, $shop, $campaign, $full;

  if ($name != "NONE") {
    $existing_account = $sql->get_sql_data("accounts", "WHERE name='".$name."';");
  }

  if ($shop != "NONE") {
    $existing_account = $sql->get_sql_data("accounts", "WHERE shop='".$shop."';");
  }

  if ($campaign != "NONE") {
    $existing_account = $sql->get_sql_data("accounts", "WHERE campaign='".$campaign."';");
  }

  if (sizeOf($existing_account) > 0) {
    if ($full == "no") {
      send_response("name", $existing_account[0]->name);
    } else {
      send_response("name", $existing_account);
    }
  } else {
    send_response("error", "ACCOUNT NOT FOUND");
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
