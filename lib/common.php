<?php

if (!session_id()) {
  session_start();
}

class Paths {
  public $dir_cache = "../cache/";
  public $dir_cache_files = "../cache/files/";
  public $dir_cache_img = "../cache/img/";
  public $dir_cache_account_images = "../cache/img/accounts/";
  public $dir_cache_account_files = "../cache/files/accounts/";
  public $dir_cache_landingpages = "../cache/landingpages/accounts/";
  public $dir_resource = "../resource/";
  public $dir_resource_img = "../resource/img/";
  public $dir_resource_modules = "../resource/modules/";
  public $dir_resource_landingpages = "../resource/landingpages/";
}

$paths = new Paths();

$cache_path = $paths->dir_cache;
if (!file_exists($cache_path)) {
  mkdir($cache_path, 0777, true);
}
$cache_path = $paths->dir_cache_files;
if (!file_exists($cache_path)) {
  mkdir($cache_path, 0777, true);
}
$cache_path = $paths->dir_cache_img;
if (!file_exists($cache_path)) {
  mkdir($cache_path, 0777, true);
}
$cache_path = $paths->dir_cache_account_images;
if (!file_exists($cache_path)) {
  mkdir($cache_path, 0777, true);
}
$cache_path = $paths->dir_cache_account_files;
if (!file_exists($cache_path)) {
  mkdir($cache_path, 0777, true);
}
$cache_path = $paths->dir_cache_landingpages;
if (!file_exists($cache_path)) {
  mkdir($cache_path, 0777, true);
}

class Images {
  public $default_account_thumbnail = "tile-default.png";
}

$images = new Images();

function random_string ($length) {
  $randomString = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, $length);

  return $randomString;
}

function random_paragraph ($length) {
  $paragraph = "";

  for ($i = 0; $i < $length; $i++) {
    if (rand(1, 7) == 10) {
      $paragraph .= random_string(rand(3, 12))."! ";
    } else if (rand(1,4) == 1){
      $paragraph .= random_string(rand(3, 12)).", ";
    } else if (rand(1,2) == 1) {
      $paragraph .= random_string(rand(3, 12)).". ";
    } else {
      $paragraph .= random_string(rand(3, 12))." ";
    }
  }

  return $paragraph;
}

function random_bool () {
  if (rand(1,2) == 1) {
    return true;
  } else {
    return false;
  }
}

function create_session () {
  global $sql;

  $session = random_string(40);

  $client = $_SERVER['REMOTE_ADDR'];
  $session_query = $sql->get_sql_data("sessions", "WHERE ip='".$client."';");

  if (sizeOf($session_query) > 0) {
    $created = $session_query[0]->created;
    if (strtotime(timestamp()) - strtotime($created) > 21600) {
      $sql->insert_sql_data("sessions", array(
        "id" => $session,
        "ip" => $_SERVER['REMOTE_ADDR']
      ));
    } else {
      $session = $session_query[0]->id;
    }
  } else {
    $sql->insert_sql_data("sessions", array(
      "id" => $session,
      "ip" => $_SERVER['REMOTE_ADDR']
    ));
  }

  $_SESSION["ka_session"] = $session;
  $_SESSION["ka_login_count"] = 0;

  return $session;
}

function verify_session ($session) {
  global $sql;

  $session_query = $sql->get_sql_data("sessions", "WHERE id='".$session."';");
  if (sizeOf($session_query) > 0 && $session_query[0]->id != "lock") {
    $_SESSION['ka_login_count'] = 0;
    return true;
  } else {
    return false;
  }
}

function get_session () {
  if (isset($_SESSION["ka_session"])) {
    return $_SESSION["ka_session"];
  } else {
    return false;
  }
}

function check_key ($key) {
  $master_keys = array(
    "list_of_accepted_passwords"
  );

  if (!in_array(trim($key), $master_keys)) {
    return false;
  }

  return true;
}

function create_lock () {
  global $sql;

  $client = $_SERVER['REMOTE_ADDR'];
  $session_query = $sql->get_sql_data("sessions", "WHERE ip='".$client."'");

  if (sizeOf($session_query) > 0) {
    $sql->update_sql_data("sessions", "ip", $client, array(
      "id" => "lock"
    ));
  } else {
    $sql->insert_sql_data("sessions", array(
      "id" => "lock",
      "ip" => $_SERVER['REMOTE_ADDR']
    ));
  }
}

function get_lock () {
  global $sql;

  $client = $_SERVER['REMOTE_ADDR'];

  $session_query = $sql->get_sql_data("sessions", "WHERE ip='".$client."' AND id='lock';");
  if (sizeOf($session_query) > 0) {
    return true;
  } else {
    return false;
  }
}

function lock_on_abuse () {
  if (!isset($_SESSION["ka_login_count"])) {
    $_SESSION["ka_login_count"] = 1;
  } else {
    $_SESSION["ka_login_count"]++;
  }

  if ($_SESSION["ka_login_count"] > 20) {
    send_response("error", "Tried to login too many times. Locked you out, please contact sylf@spreadshirt.net");
    create_lock();
    return true;
  }

  return false;
}

function accept_session_parameter () {
  if (isset($_POST["session"]) && verify_session($_POST["session"])) {
    $_SESSION["ka_session"] = $_POST["session"];
  }

  if (isset($_GET["session"]) && verify_session($_GET["session"])) {
    $_SESSION["ka_session"] = $_GET["session"];
  }
}

function send_response ($type = "error", $text = "Unexpected error.") {
  echo json_encode(array(
    "type" => $type,
    "text" => $text
  ));
}
